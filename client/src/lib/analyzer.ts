import { XMLParser } from "fast-xml-parser";
import type { RoutePoint, AnalysisStats } from "@shared/schema";

const PAID_SAILS_MAPPING = [
  { id: 'lourd', name: 'Spi lourd', category: 'Voiles Lourdes' },
  { id: 'trinquette', name: 'Trinquette', category: 'Voiles Lourdes' },
  { id: 'leger', name: 'Spi leger', category: 'Voiles Légères' },
  { id: 'genois', name: 'Genois leger', category: 'Voiles Légères' },
  { id: 'code0', name: 'Code 0', category: 'Code 0' }
];

export interface AnalyzeInput {
  fileName: string;
  fileContent: string;
}

export interface AnalyzeResult {
  points: RoutePoint[];
  stats: AnalysisStats;
}

export async function analyzeGPX(input: AnalyzeInput): Promise<AnalyzeResult> {
  const parser = new XMLParser({ 
    ignoreAttributes: false, 
    attributeNamePrefix: "@_" 
  });
  const gpxObj = parser.parse(input.fileContent);

  const points: RoutePoint[] = [];
  let sailChanges = 0;
  let gybeTackCount = 0;
  let totalFoils100Time = 0;
  let totalDistGain = 0;
  let totalFoilTimeSavedMinutes = 0;
  
  let wpts = gpxObj.gpx?.wpt;
  if (wpts && !Array.isArray(wpts)) {
    wpts = [wpts];
  }
  
  let prevSail: string | null = null;
  let prevTwaSign: number | null = null;
  let prevTime: Date | null = null;
  let totalDurationMs = 0;

  const sailData: Record<string, { totalTime: number, foilTime: number }> = {};
  PAID_SAILS_MAPPING.forEach(s => sailData[s.name] = { totalTime: 0, foilTime: 0 });

  if (wpts) {
    for (let i = 0; i < wpts.length; i++) {
      const wpt = wpts[i];
      const timeStr = wpt.time;
      const currentTime = timeStr ? new Date(timeStr) : null;
      let durationMinutes = 0;

      if (prevTime && currentTime) {
        const diffMs = currentTime.getTime() - prevTime.getTime();
        durationMinutes = diffMs / (1000 * 60);
        totalDurationMs += diffMs;
      } else if (i > 0) {
        durationMinutes = 10;
        totalDurationMs += 10 * 60 * 1000;
      }

      if (wpt.desc) {
        const desc = wpt.desc;
        const regex = /HDG:([-\d]+)\s+TWA:([-\d]+)\s+(.*?)\s+SOG:([\d,.]+)\s+kt\s+TWS:([\d,.]+)\s+kt/;
        const match = desc.match(regex);
        
        if (match) {
          const hdg = match[1];
          const twaStr = match[2];
          const twa = parseInt(twaStr);
          const absTwa = Math.abs(twa);
          const sail = match[3].trim();
          const sog = parseFloat(match[4].replace(',', '.'));
          const tws = parseFloat(match[5].replace(',', '.'));
          
          const isFoilsActive = tws >= 11.1 && tws <= 39.9 && absTwa >= 71 && absTwa <= 169;
          const isFoils100 = tws >= 16 && tws <= 35 && absTwa >= 80 && absTwa <= 160;

          if (isFoils100) {
            totalFoils100Time += durationMinutes;
            totalDistGain += sog * 0.04 * (durationMinutes / 60);
            
            const distanceInZone = sog * (durationMinutes / 60);
            const timeWithoutFoils = distanceInZone / sog;
            const timeWithFoils = distanceInZone / (sog * 1.04);
            totalFoilTimeSavedMinutes += (timeWithoutFoils - timeWithFoils) * 60;
          }

          // Exact match detection for paid sails
          PAID_SAILS_MAPPING.forEach(paidSail => {
            if (sail === paidSail.name) {
              sailData[paidSail.name].totalTime += durationMinutes;
              if (isFoilsActive) {
                sailData[paidSail.name].foilTime += durationMinutes;
              }
            }
          });

          if (prevSail && sail !== prevSail) sailChanges++;
          const currentTwaSign = twa === 0 ? 0 : (twa > 0 ? 1 : -1);
          if (prevTwaSign !== null && currentTwaSign !== 0 && currentTwaSign !== prevTwaSign) {
            gybeTackCount++;
          }

          points.push({
            time: currentTime ? currentTime.toISOString() : new Date(i * 10 * 60 * 1000).toISOString(),
            hdg,
            twa: twaStr,
            absTwa,
            sail,
            sog,
            tws,
            isFoilsActive,
            isFoils100,
            distGain: isFoils100 ? sog * 0.04 * (durationMinutes / 60) : 0
          });

          prevSail = sail;
          if (currentTwaSign !== 0) prevTwaSign = currentTwaSign;
          if (currentTime) prevTime = currentTime;
        }
      }
    }
  }

  const totalDurationMinutes = totalDurationMs / (1000 * 60);
  const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));

  const savedH = Math.floor(totalFoilTimeSavedMinutes / 60);
  const savedM = Math.round(totalFoilTimeSavedMinutes % 60);

  const paidSailStats = PAID_SAILS_MAPPING.map(mapping => ({
    name: mapping.name,
    category: mapping.category,
    usagePercent: totalDurationMinutes > 0 ? Math.round((sailData[mapping.name].totalTime / totalDurationMinutes) * 100) : 0,
    foilTimePercent: sailData[mapping.name].totalTime > 0 ? Math.round((sailData[mapping.name].foilTime / sailData[mapping.name].totalTime) * 100) : 0,
    totalTimeMinutes: Math.round(sailData[mapping.name].totalTime)
  }));

  const stats: AnalysisStats = {
    totalDuration: `${hours}h ${minutes}m`,
    totalDurationMinutes,
    sailChanges,
    gybeTackCount,
    percentFoils100: totalDurationMinutes > 0 ? Math.round((totalFoils100Time / totalDurationMinutes) * 100) : 0,
    totalDistGain: parseFloat(totalDistGain.toFixed(2)),
    totalFoilTimeSaved: `${savedH}h ${savedM}m`,
    paidSailStats
  };

  return { points, stats };
}
