import { describe, it, expect, expectTypeOf } from 'vitest';
import type { EnhancedCity, EnhancedAlgoliaCity } from '../city';
import type { BudgetTier } from '../budget';
import type { Month } from '../seasonal';

describe('Enhanced City Types', () => {
  it('should have budget tier as enum type', () => {
    const tier: BudgetTier = 'mid-range';
    expect(['budget', 'mid-range', 'luxury']).toContain(tier);
  });

  it('should have valid month types', () => {
    const month: Month = 'january';
    expectTypeOf(month).toBeString();
  });

  it('should extend base City type with enhanced attributes', () => {
    const city: EnhancedCity = {
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      description: 'A vibrant metropolis blending ancient traditions with cutting-edge technology',
      vibe_tags: ['modern', 'traditional', 'foodie', 'anime', 'neon'],
      culture_score: 10,
      adventure_score: 7,
      nature_score: 6,
      beach_score: 4,
      nightlife_score: 9,
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'March-May, October-November',
      image_url: 'https://example.com/tokyo.jpg',

      budget_tier: 'mid-range',
      avg_daily_cost_usd: 150,
      cost_breakdown: {
        accommodation_per_night: 80,
        meal_average: 25,
        transportation_daily: 15,
        activities_daily: 30
      },
      safety_rating: 9,
      visa_free_for: ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
      primary_language: 'Japanese',
      english_proficiency: 'medium',
      currency: 'JPY',
      currency_symbol: '¥',
      local_cuisine: ['sushi', 'ramen', 'tempura', 'wagyu', 'izakaya'],
      cuisine_highlights: ['Tsukiji Market', 'Michelin-starred ramen', 'Depachika food halls'],
      vegetarian_friendly: true,
      best_months: ['march', 'april', 'may', 'october', 'november'],
      avoid_months: ['june', 'july', 'august'],
      seasonal_events: [{
        name: 'Cherry Blossom Season',
        month: 'april',
        description: 'Sakura blooms transform the city into pink wonderland',
        type: 'natural'
      }],
      timezone: 'Asia/Tokyo',
      flight_hub: true,
      similar_cities: ['seoul-south-korea', 'osaka-japan'],
      pairs_well_with: ['kyoto-japan', 'osaka-japan', 'hakone-japan']
    };

    expect(city.budget_tier).toBe('mid-range');
    expect(city.avg_daily_cost_usd).toBe(150);
    expect(city.best_months).toContain('april');
    expect(city.safety_rating).toBe(9);
    expect(city.local_cuisine).toContain('sushi');
    expect(city.seasonal_events[0].name).toBe('Cherry Blossom Season');
  });

  it('should have EnhancedAlgoliaCity with objectID', () => {
    const algoliaCity: EnhancedAlgoliaCity = {
      objectID: 'tokyo-japan',
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      description: 'A vibrant metropolis',
      vibe_tags: ['modern'],
      culture_score: 10,
      adventure_score: 7,
      nature_score: 6,
      beach_score: 4,
      nightlife_score: 9,
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring',
      image_url: 'https://example.com/tokyo.jpg',
      budget_tier: 'mid-range',
      avg_daily_cost_usd: 150,
      cost_breakdown: {
        accommodation_per_night: 80,
        meal_average: 25,
        transportation_daily: 15,
        activities_daily: 30
      },
      safety_rating: 9,
      visa_free_for: ['US', 'GB'],
      primary_language: 'Japanese',
      english_proficiency: 'medium',
      currency: 'JPY',
      currency_symbol: '¥',
      local_cuisine: ['sushi', 'ramen'],
      cuisine_highlights: ['Tsukiji Market'],
      vegetarian_friendly: true,
      best_months: ['march', 'april'],
      avoid_months: ['july', 'august'],
      seasonal_events: [],
      timezone: 'Asia/Tokyo',
      flight_hub: true,
      similar_cities: [],
      pairs_well_with: []
    };

    expect(algoliaCity.objectID).toBe('tokyo-japan');
    expect(algoliaCity.city).toBe('Tokyo');
  });

  it('should have all score fields with valid ranges', () => {
    const city: Partial<EnhancedCity> = {
      culture_score: 10,
      adventure_score: 7,
      nature_score: 6,
      beach_score: 4,
      nightlife_score: 9,
      safety_rating: 9
    };

    expect(city.culture_score).toBeGreaterThanOrEqual(1);
    expect(city.culture_score).toBeLessThanOrEqual(10);
    expect(city.safety_rating).toBeGreaterThanOrEqual(1);
    expect(city.safety_rating).toBeLessThanOrEqual(10);
  });

  it('should have english_proficiency as valid enum', () => {
    const levels: EnhancedCity['english_proficiency'][] = ['high', 'medium', 'low'];

    levels.forEach(level => {
      expect(['high', 'medium', 'low']).toContain(level);
    });
  });
});
