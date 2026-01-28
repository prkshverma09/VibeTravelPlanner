import { describe, it, expect } from 'vitest';
import { EnhancedCitySchema, EnhancedAlgoliaCitySchema } from '../enhanced-city.schema';

describe('Enhanced City Schemas', () => {
  const validEnhancedCity = {
    city: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    description: 'A vibrant metropolis blending ancient traditions with cutting-edge technology',
    vibe_tags: ['modern', 'traditional', 'foodie'],
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
    visa_free_for: ['US', 'GB', 'DE'],
    primary_language: 'Japanese',
    english_proficiency: 'medium',
    currency: 'JPY',
    currency_symbol: '¥',
    local_cuisine: ['sushi', 'ramen', 'tempura'],
    cuisine_highlights: ['Tsukiji Market'],
    vegetarian_friendly: true,
    best_months: ['march', 'april', 'october'],
    avoid_months: ['july', 'august'],
    seasonal_events: [{
      name: 'Cherry Blossom Season',
      month: 'april',
      description: 'Sakura blooms transform the city into pink wonderland',
      type: 'natural'
    }],
    timezone: 'Asia/Tokyo',
    flight_hub: true,
    similar_cities: ['seoul-south-korea'],
    pairs_well_with: ['kyoto-japan']
  };

  describe('EnhancedCitySchema', () => {
    it('should validate a complete enhanced city object', () => {
      const result = EnhancedCitySchema.safeParse(validEnhancedCity);
      expect(result.success).toBe(true);
    });

    it('should reject city with invalid budget tier', () => {
      const invalid = { ...validEnhancedCity, budget_tier: 'cheap' };
      expect(EnhancedCitySchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject city with negative avg_daily_cost_usd', () => {
      const invalid = { ...validEnhancedCity, avg_daily_cost_usd: -50 };
      expect(EnhancedCitySchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject city with safety_rating out of range', () => {
      const invalid1 = { ...validEnhancedCity, safety_rating: 0 };
      const invalid2 = { ...validEnhancedCity, safety_rating: 11 };
      expect(EnhancedCitySchema.safeParse(invalid1).success).toBe(false);
      expect(EnhancedCitySchema.safeParse(invalid2).success).toBe(false);
    });

    it('should reject city with invalid english_proficiency', () => {
      const invalid = { ...validEnhancedCity, english_proficiency: 'excellent' };
      expect(EnhancedCitySchema.safeParse(invalid).success).toBe(false);
    });

    it('should validate city with empty seasonal_events', () => {
      const valid = { ...validEnhancedCity, seasonal_events: [] };
      expect(EnhancedCitySchema.safeParse(valid).success).toBe(true);
    });

    it('should reject city with empty local_cuisine', () => {
      const invalid = { ...validEnhancedCity, local_cuisine: [] };
      expect(EnhancedCitySchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject city with empty best_months', () => {
      const invalid = { ...validEnhancedCity, best_months: [] };
      expect(EnhancedCitySchema.safeParse(invalid).success).toBe(false);
    });

    it('should validate city with Middle East continent', () => {
      const valid = { ...validEnhancedCity, continent: 'Middle East', city: 'Dubai', country: 'UAE' };
      expect(EnhancedCitySchema.safeParse(valid).success).toBe(true);
    });
  });

  describe('EnhancedAlgoliaCitySchema', () => {
    it('should validate enhanced city with objectID', () => {
      const algoliaCity = { ...validEnhancedCity, objectID: 'tokyo-japan' };
      expect(EnhancedAlgoliaCitySchema.safeParse(algoliaCity).success).toBe(true);
    });

    it('should reject enhanced city without objectID', () => {
      expect(EnhancedAlgoliaCitySchema.safeParse(validEnhancedCity).success).toBe(false);
    });

    it('should reject enhanced city with empty objectID', () => {
      const invalid = { ...validEnhancedCity, objectID: '' };
      expect(EnhancedAlgoliaCitySchema.safeParse(invalid).success).toBe(false);
    });
  });
});
