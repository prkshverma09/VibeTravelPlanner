export type Month =
  | 'january' | 'february' | 'march' | 'april'
  | 'may' | 'june' | 'july' | 'august'
  | 'september' | 'october' | 'november' | 'december';

export type SeasonalEventType = 'festival' | 'natural' | 'cultural' | 'sporting';

export interface SeasonalEvent {
  name: string;
  month: Month;
  description: string;
  type: SeasonalEventType;
}

export interface SeasonalInfo {
  best_months: Month[];
  avoid_months: Month[];
  peak_season: Month[];
  shoulder_season: Month[];
  weather_notes: Record<Month, string>;
}
