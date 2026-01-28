import type { AlgoliaCity, EnhancedAlgoliaCity, BudgetTier, CostBreakdown } from '@vibe-travel/shared';

export type TravelStyle = 'budget' | 'mid-range' | 'luxury';

export interface BudgetEstimateInput {
  city: AlgoliaCity | EnhancedAlgoliaCity;
  durationDays: number;
  travelStyle: TravelStyle;
  travelers: number;
}

export interface BudgetBreakdown {
  accommodation: { perNight: number; total: number };
  food: { perDay: number; total: number };
  transportation: { perDay: number; total: number };
  activities: { perDay: number; total: number };
  miscellaneous: { perDay: number; total: number };
}

export interface BudgetEstimate {
  cityName: string;
  durationDays: number;
  travelers: number;
  travelStyle: TravelStyle;
  totalEstimate: {
    low: number;
    mid: number;
    high: number;
  };
  breakdown: BudgetBreakdown;
  perPerson: number;
  perDay: number;
  currency: string;
  budgetTips: string[];
}

const STYLE_MULTIPLIERS: Record<TravelStyle, number> = {
  budget: 0.6,
  'mid-range': 1.0,
  luxury: 2.5,
};

const DEFAULT_DAILY_COSTS: Record<TravelStyle, CostBreakdown> = {
  budget: {
    accommodation_per_night: 40,
    meal_average: 15,
    transportation_daily: 10,
    activities_daily: 15,
  },
  'mid-range': {
    accommodation_per_night: 120,
    meal_average: 25,
    transportation_daily: 20,
    activities_daily: 40,
  },
  luxury: {
    accommodation_per_night: 350,
    meal_average: 60,
    transportation_daily: 50,
    activities_daily: 100,
  },
};

const CONTINENT_COST_MULTIPLIERS: Record<string, number> = {
  'North America': 1.2,
  'Europe': 1.1,
  'Asia': 0.8,
  'South America': 0.7,
  'Africa': 0.6,
  'Oceania': 1.3,
  'Middle East': 0.9,
};

function isEnhancedCity(city: AlgoliaCity | EnhancedAlgoliaCity): city is EnhancedAlgoliaCity {
  return 'cost_breakdown' in city && city.cost_breakdown !== undefined;
}

function generateBudgetTips(travelStyle: TravelStyle, city: AlgoliaCity | EnhancedAlgoliaCity): string[] {
  const tips: string[] = [];

  if (travelStyle === 'budget') {
    tips.push('Consider staying in hostels or budget hotels');
    tips.push('Use public transportation instead of taxis');
    tips.push('Eat at local restaurants and street food stalls');
    tips.push('Look for free walking tours and attractions');
    tips.push('Book accommodations in advance for better rates');
  } else if (travelStyle === 'mid-range') {
    tips.push('Mix budget and splurge activities for balance');
    tips.push('Consider boutique hotels for better value');
    tips.push('Use ride-sharing apps for convenience');
    tips.push('Book popular attractions in advance to avoid queues');
    tips.push('Try a mix of local and tourist restaurants');
  } else {
    tips.push('Consider private tours for personalized experiences');
    tips.push('Book premium hotels in central locations');
    tips.push('Use private transfers for comfort');
    tips.push('Reserve fine dining experiences in advance');
    tips.push('Consider travel insurance for peace of mind');
  }

  if (city.nightlife_score > 7) {
    tips.push('Budget extra for nightlife and entertainment');
  }

  if (city.culture_score > 7) {
    tips.push('Consider museum passes for savings on attractions');
  }

  return tips.slice(0, 5);
}

export class BudgetService {
  calculateEstimate(input: BudgetEstimateInput): BudgetEstimate {
    const { city, durationDays, travelStyle, travelers } = input;
    
    const continentMultiplier = CONTINENT_COST_MULTIPLIERS[city.continent] || 1.0;
    const styleMultiplier = STYLE_MULTIPLIERS[travelStyle];
    
    let accommodationPerNight: number;
    let foodPerDay: number;
    let transportPerDay: number;
    let activitiesPerDay: number;
    
    if (isEnhancedCity(city)) {
      const baseCosts = city.cost_breakdown;
      accommodationPerNight = baseCosts.accommodation_per_night;
      foodPerDay = baseCosts.meal_average * 3;
      transportPerDay = baseCosts.transportation_daily;
      activitiesPerDay = baseCosts.activities_daily;
    } else {
      const baseCosts = DEFAULT_DAILY_COSTS[travelStyle];
      accommodationPerNight = Math.round(baseCosts.accommodation_per_night * continentMultiplier);
      foodPerDay = Math.round(baseCosts.meal_average * 3 * continentMultiplier);
      transportPerDay = Math.round(baseCosts.transportation_daily * continentMultiplier);
      activitiesPerDay = Math.round(baseCosts.activities_daily * continentMultiplier);
    }

    const accommodationTotal = accommodationPerNight * durationDays;
    const foodTotal = foodPerDay * durationDays;
    const transportTotal = transportPerDay * durationDays;
    const activitiesTotal = activitiesPerDay * durationDays;
    
    const subtotal = accommodationTotal + foodTotal + transportTotal + activitiesTotal;
    const miscPerDay = Math.round(subtotal / durationDays * 0.1);
    const miscTotal = Math.round(subtotal * 0.1);

    const baseTotalPerPerson = subtotal + miscTotal;
    const totalForAllTravelers = baseTotalPerPerson * travelers;

    const lowEstimate = Math.round(totalForAllTravelers * 0.85);
    const midEstimate = Math.round(totalForAllTravelers);
    const highEstimate = Math.round(totalForAllTravelers * 1.2);

    return {
      cityName: city.city,
      durationDays,
      travelers,
      travelStyle,
      totalEstimate: {
        low: lowEstimate,
        mid: midEstimate,
        high: highEstimate,
      },
      breakdown: {
        accommodation: { perNight: accommodationPerNight, total: accommodationTotal },
        food: { perDay: foodPerDay, total: foodTotal },
        transportation: { perDay: transportPerDay, total: transportTotal },
        activities: { perDay: activitiesPerDay, total: activitiesTotal },
        miscellaneous: { perDay: miscPerDay, total: miscTotal },
      },
      perPerson: Math.round(midEstimate / travelers),
      perDay: Math.round(midEstimate / durationDays),
      currency: 'USD',
      budgetTips: generateBudgetTips(travelStyle, city),
    };
  }
}

export const budgetService = new BudgetService();
