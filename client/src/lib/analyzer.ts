import { XMLParser } from "fast-xml-parser";
import type { AnalysisStats, RoutePoint } from "@shared/schema";

const PAID_SAILS_MAPPING = [
  { id: "lourd", name: "Spi lourd", category: "Voiles Lourdes" },
  { id: "trinquette", name: "Trinquette", category: "Voiles Lourdes" },
  { id: "leger", name: "Spi leger", category: "Voiles Légères" },
  { id: "genois", name: "Genois leger", category: "Voiles Légères" },
  { id: "code0", name: "Code 0", category: "Code 0" },
];

export interface AnalyzeInput {
  fileName: string;
  fileContent: string;
}

export interface AnalyzeResult {
  points: RoutePoint[];
  stats: AnalysisStats;
}

type GpxWaypoint = {
  time?: string;
  desc?: string;
};

const DESC_REGEX =
  /HDG:([-\d]+)\s+TWA:([-\d]+)\s+(.*?)\s+SOG:([\d,.]+)\s+kt\s+TWS:([\d,.]+)\s+kt/;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function analyzeGPX(input: AnalyzeInput): Promise<AnalyzeResult> {
  const gpxObj = parser.parse(input.fileContent);
  const waypoints = toArray<GpxWaypoint>(gpxObj.gpx?.wpt);

  const points: RoutePoint[] = [];

  let sailChanges = 0;
  let gybeTackCount = 0;
  let totalFoils100Time = 0;
  let totalDistGain = 0;
  let totalFoilTimeSavedMinutes = 0;
  let totalDurationMs = 0;

  let prevSail: string | null = null;
  let prevTwaSign: number | null = null;
  let prevTime: Date | null = null;

  const sailData: Record<string, { totalTime: number; foilTime: number }> = {};
  PAID_SAILS_MAPPING.forEach((sail) => {
    sailData[sail.name] = { totalTime: 0, foilTime: 0 };
  });

  waypoints.forEach((wpt, index) => {
    const currentTime = wpt.time ? new Date(wpt.time) : null;
    let durationMinutes = 0;

    if (prevTime && currentTime) {
      const diffMs = currentTime.getTime() - prevTime.getTime();
      durationMinutes = diffMs / (1000 * 60);
      totalDurationMs += diffMs;
    } else if (index > 0) {
      // Fallback when timestamp is missing; assume 10 minutes between points
      durationMinutes = 10;
      totalDurationMs += 10 * 60 * 1000;
    }

    if (!wpt.desc) return;
    const match = wpt.desc.match(DESC_REGEX);
    if (!match) return;

    const hdg = match[1];
    const twaStr = match[2];
    const twa = parseInt(twaStr, 10);
    const absTwa = Math.abs(twa);
    const sail = match[3].trim();
    const sog = parseFloat(match[4].replace(",", "."));
    const tws = parseFloat(match[5].replace(",", "."));

    const isFoilsActive = tws >= 11.1 && tws <= 39.9 && absTwa >= 71 && absTwa <= 169;
    const isFoils100 = tws >= 16 && tws <= 35 && absTwa >= 80 && absTwa <= 160;

    if (isFoils100) {
      totalFoils100Time += durationMinutes;
      const distGain = sog * 0.04 * (durationMinutes / 60);
      totalDistGain += distGain;

      const distanceInZone = sog * (durationMinutes / 60);
      const timeWithoutFoils = distanceInZone / sog;
      const timeWithFoils = distanceInZone / (sog * 1.04);
      totalFoilTimeSavedMinutes += (timeWithoutFoils - timeWithFoils) * 60;
    }

    PAID_SAILS_MAPPING.forEach((paidSail) => {
      if (sail === paidSail.name) {
        sailData[paidSail.name].totalTime += durationMinutes;
        if (isFoilsActive) {
          sailData[paidSail.name].foilTime += durationMinutes;
        }
      }
    });

    if (prevSail && sail !== prevSail) {
      sailChanges += 1;
    }

    const currentTwaSign = twa === 0 ? 0 : twa > 0 ? 1 : -1;
    if (prevTwaSign !== null && currentTwaSign !== 0 && currentTwaSign !== prevTwaSign) {
      gybeTackCount += 1;
    }

    points.push({
      time: currentTime
        ? currentTime.toISOString()
        : new Date(index * 10 * 60 * 1000).toISOString(),
      hdg,
      twa: twaStr,
      absTwa,
      sail,
      sog,
      tws,
      isFoilsActive,
      isFoils100,
      distGain: isFoils100 ? sog * 0.04 * (durationMinutes / 60) : 0,
    });

    prevSail = sail;
    if (currentTwaSign !== 0) {
      prevTwaSign = currentTwaSign;
    }
    if (currentTime) {
      prevTime = currentTime;
    }
  });

  const totalDurationMinutes = totalDurationMs / (1000 * 60);
  const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));

  const savedH = Math.floor(totalFoilTimeSavedMinutes / 60);
  const savedM = Math.round(totalFoilTimeSavedMinutes % 60);

  const paidSailStats = PAID_SAILS_MAPPING.map((mapping) => ({
    name: mapping.name,
    category: mapping.category,
    usagePercent:
      totalDurationMinutes > 0
        ? Math.round((sailData[mapping.name].totalTime / totalDurationMinutes) * 100)
        : 0,
    foilTimePercent:
      sailData[mapping.name].totalTime > 0
        ? Math.round((sailData[mapping.name].foilTime / sailData[mapping.name].totalTime) * 100)
        : 0,
    totalTimeMinutes: Math.round(sailData[mapping.name].totalTime),
  }));

  const stats: AnalysisStats = {
    totalDuration: `${hours}h ${minutes}m`,
    totalDurationMinutes,
    sailChanges,
    gybeTackCount,
    percentFoils100:
      totalDurationMinutes > 0
        ? Math.round((totalFoils100Time / totalDurationMinutes) * 100)
        : 0,
    totalDistGain: parseFloat(totalDistGain.toFixed(2)),
    totalFoilTimeSaved: `${savedH}h ${savedM}m`,
    paidSailStats,
  };

  return { points, stats };
}
