
export type RoutePoint = {
  time: string;
  hdg: string;
  twa: string;
  absTwa: number;
  sail: string;
  sog: number;
  tws: number;
  isFoilsActive: boolean;
  isFoils100: boolean;
  distGain: number;
};

export type SailStats = {
  name: string;
  category: string;
  usagePercent: number;
  foilTimePercent: number;
  totalTimeMinutes: number;
};

export type AnalysisStats = {
  totalDuration: string; 
  totalDurationMinutes: number;
  sailChanges: number;
  gybeTackCount: number;
  percentFoils100: number;
  totalFoilTimeSaved: string; // HH:MM
  paidSailStats: SailStats[];
};

export type AnalysisResponse = {
  points: RoutePoint[];
  stats: AnalysisStats;
};
