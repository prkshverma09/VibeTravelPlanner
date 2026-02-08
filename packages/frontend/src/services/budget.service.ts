import type { AlgoliaCity } from '@vibe-travel/shared';

export type TravelStyle = 'budget' | 'moderate' | 'luxury';
export type CostCategory = 'budget' | 'moderate' | 'expensive';

export interface BudgetInput {
  city: AlgoliaCity;
  durationDays: number;
  travelStyle: TravelStyle;
  travelers: number;
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  miscellaneous: number;
}

export interface BudgetEstimate {
  totalEstimate: number;
  perPersonPerDay: number;
  perPersonTotal: number;
  breakdown: BudgetBreakdown;
  currency: string;
  travelStyle: TravelStyle;
  durationDays: number;
  travelers: number;
  cityName: string;
  confidence: 'low' | 'medium' | 'high';
  tips: string[];
}

const STYLE_MULTIPLIERS: Record<TravelStyle, number> = {
  budget: 0.6,
  moderate: 1.0,
  luxury: 2.2,
};

const BREAKDOWN_PERCENTAGES: Record<TravelStyle, BudgetBreakdown> = {
  budget: {
    accommodation: 30,
    food: 35,
    activities: 15,
    transport: 15,
    miscellaneous: 5,
  },
  moderate: {
    accommodation: 35,
    food: 30,
    activities: 20,
    transport: 10,
    miscellaneous: 5,
  },
  luxury: {
    accommodation: 45,
    food: 25,
    activities: 18,
    transport: 7,
    miscellaneous: 5,
  },
};

export function calculateBudgetEstimate(input: BudgetInput): BudgetEstimate {
  const { city, durationDays, travelStyle, travelers } = input;

  const baseDailyCost = city.average_cost_per_day || 100;
  const styleMultiplier = STYLE_MULTIPLIERS[travelStyle];
  const adjustedDailyCost = baseDailyCost * styleMultiplier;

  const perPersonPerDay = Math.round(adjustedDailyCost);
  const perPersonTotal = perPersonPerDay * durationDays;
  const totalEstimate = perPersonTotal * travelers;

  const breakdownPercentages = BREAKDOWN_PERCENTAGES[travelStyle];
  const breakdown: BudgetBreakdown = {
    accommodation: Math.round((totalEstimate * breakdownPercentages.accommodation) / 100),
    food: Math.round((totalEstimate * breakdownPercentages.food) / 100),
    activities: Math.round((totalEstimate * breakdownPercentages.activities) / 100),
    transport: Math.round((totalEstimate * breakdownPercentages.transport) / 100),
    miscellaneous: Math.round((totalEstimate * breakdownPercentages.miscellaneous) / 100),
  };

  const tips = generateBudgetTips(city, travelStyle, durationDays);

  const confidence = getConfidenceLevel(city);

  return {
    totalEstimate,
    perPersonPerDay,
    perPersonTotal,
    breakdown,
    currency: city.currency || 'USD',
    travelStyle,
    durationDays,
    travelers,
    cityName: city.city,
    confidence,
    tips,
  };
}

export function getBudgetBreakdown(travelStyle: TravelStyle): BudgetBreakdown {
  return BREAKDOWN_PERCENTAGES[travelStyle];
}

export function getCostCategory(city: AlgoliaCity): CostCategory {
  const dailyCost = city.average_cost_per_day || 100;

  if (dailyCost < 80) {
    return 'budget';
  } else if (dailyCost < 180) {
    return 'moderate';
  } else {
    return 'expensive';
  }
}

function getConfidenceLevel(city: AlgoliaCity): 'low' | 'medium' | 'high' {
  if (city.review_count && city.review_count > 500) {
    return 'high';
  } else if (city.review_count && city.review_count > 100) {
    return 'medium';
  }
  return 'low';
}

function generateBudgetTips(
  city: AlgoliaCity,
  travelStyle: TravelStyle,
  durationDays: number
): string[] {
  const tips: string[] = [];
  const costCategory = getCostCategory(city);

  if (travelStyle === 'budget') {
    tips.push('Consider staying in hostels or budget hotels');
    tips.push('Use public transportation to save money');
    tips.push('Eat at local markets and street food stalls');
    if (costCategory === 'expensive') {
      tips.push('This is a pricier destination - book accommodations in advance');
    }
  } else if (travelStyle === 'moderate') {
    tips.push('Mix dining experiences between local spots and restaurants');
    tips.push('Book tours in advance for better rates');
  } else {
    tips.push('Consider hiring private guides for exclusive experiences');
    tips.push('Book premium hotels early for best selection');
  }

  if (durationDays >= 7) {
    tips.push('Consider weekly accommodation rates for savings');
  }

  if (city.best_months && city.best_months.length > 0) {
    tips.push(`Best months to visit for weather and value: Month ${city.best_months.join(', ')}`);
  }

  return tips.slice(0, 4);
}

export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    THB: '฿',
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toLocaleString()}`;
}

export const budgetService = {
  calculateEstimate: calculateBudgetEstimate,
  getBudgetBreakdown,
  getCostCategory,
  formatCurrency,
};
