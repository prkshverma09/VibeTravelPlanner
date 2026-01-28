import type { BudgetTier, CostBreakdown } from '../types';

export function formatCurrency(amount: number, _currency: string, symbol: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  });
  return `${symbol}${formatted}`;
}

export function calculateTripCost(dailyCost: number, days: number): number {
  return dailyCost * days;
}

export function getBudgetTierFromCost(avgDailyCost: number): BudgetTier {
  if (avgDailyCost < 75) return 'budget';
  if (avgDailyCost < 200) return 'mid-range';
  return 'luxury';
}

export function formatBudgetRange(tier: BudgetTier): string {
  switch (tier) {
    case 'budget':
      return 'Under $75/day';
    case 'mid-range':
      return '$75-200/day';
    case 'luxury':
      return '$200+/day';
  }
}

export function getTotalDailyCost(breakdown: CostBreakdown): number {
  return breakdown.accommodation_per_night +
         breakdown.meal_average +
         breakdown.transportation_daily +
         breakdown.activities_daily;
}

export function compareCosts(cityA: CostBreakdown, cityB: CostBreakdown): {
  accommodation: number;
  meals: number;
  overall: number;
} {
  return {
    accommodation: cityA.accommodation_per_night - cityB.accommodation_per_night,
    meals: cityA.meal_average - cityB.meal_average,
    overall: getTotalDailyCost(cityA) - getTotalDailyCost(cityB)
  };
}
