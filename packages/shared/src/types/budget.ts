export type BudgetTier = 'budget' | 'mid-range' | 'luxury';

export interface CostBreakdown {
  accommodation_per_night: number;
  meal_average: number;
  transportation_daily: number;
  activities_daily: number;
}
