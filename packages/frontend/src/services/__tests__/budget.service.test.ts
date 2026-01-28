import { describe, it, expect } from 'vitest';
import { BudgetService, BudgetEstimate } from '../budget.service';
import type { AlgoliaCity, EnhancedAlgoliaCity } from '@vibe-travel/shared';

const mockBasicCity: AlgoliaCity = {
  objectID: 'tokyo-japan',
  city: 'Tokyo',
  country: 'Japan',
  continent: 'Asia',
  description: 'A vibrant metropolis',
  vibe_tags: ['modern', 'bustling'],
  culture_score: 9,
  adventure_score: 7,
  nature_score: 5,
  beach_score: 3,
  nightlife_score: 9,
  climate_type: 'Humid subtropical',
  best_time_to_visit: 'Spring',
  image_url: 'https://example.com/tokyo.jpg',
};

const mockEnhancedCity: EnhancedAlgoliaCity = {
  ...mockBasicCity,
  budget_tier: 'mid-range',
  avg_daily_cost_usd: 150,
  cost_breakdown: {
    accommodation_per_night: 100,
    meal_average: 25,
    transportation_daily: 15,
    activities_daily: 30,
  },
  safety_rating: 9,
  visa_free_for: ['US', 'UK', 'EU'],
  primary_language: 'Japanese',
  english_proficiency: 'medium',
  currency: 'JPY',
  currency_symbol: '¥',
  local_cuisine: ['sushi', 'ramen'],
  cuisine_highlights: ['Tsukiji Market'],
  vegetarian_friendly: true,
  best_months: ['march', 'april', 'may'],
  avoid_months: ['august'],
  seasonal_events: [],
  timezone: 'Asia/Tokyo',
  flight_hub: true,
  similar_cities: ['seoul-south-korea'],
  pairs_well_with: ['kyoto-japan'],
};

describe('BudgetService', () => {
  const service = new BudgetService();

  describe('calculateEstimate with basic city', () => {
    it('should calculate budget estimate for basic city', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate).not.toBeNull();
      expect(estimate.cityName).toBe('Tokyo');
      expect(estimate.durationDays).toBe(5);
      expect(estimate.travelers).toBe(1);
    });

    it('should use default daily cost for basic city', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 3,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate.totalEstimate.mid).toBeGreaterThan(0);
      expect(estimate.perDay).toBeGreaterThan(0);
    });

    it('should scale budget by travel style', () => {
      const budgetEstimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'budget',
        travelers: 1,
      });

      const luxuryEstimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'luxury',
        travelers: 1,
      });

      expect(luxuryEstimate.totalEstimate.mid).toBeGreaterThan(budgetEstimate.totalEstimate.mid);
    });

    it('should scale budget by number of travelers', () => {
      const soloEstimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      const coupleEstimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 2,
      });

      expect(coupleEstimate.totalEstimate.mid).toBeGreaterThan(soloEstimate.totalEstimate.mid);
    });
  });

  describe('calculateEstimate with enhanced city', () => {
    it('should use city cost_breakdown when available', () => {
      const estimate = service.calculateEstimate({
        city: mockEnhancedCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate.breakdown.accommodation.perNight).toBe(100);
      expect(estimate.breakdown.food.perDay).toBe(75);
      expect(estimate.breakdown.transportation.perDay).toBe(15);
      expect(estimate.breakdown.activities.perDay).toBe(30);
    });

    it('should calculate correct total for enhanced city', () => {
      const estimate = service.calculateEstimate({
        city: mockEnhancedCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      const expectedAccommodation = 100 * 5;
      const expectedFood = 75 * 5;
      const expectedTransport = 15 * 5;
      const expectedActivities = 30 * 5;
      const expectedMisc = (expectedAccommodation + expectedFood + expectedTransport + expectedActivities) * 0.1;
      const expectedTotal = expectedAccommodation + expectedFood + expectedTransport + expectedActivities + expectedMisc;

      expect(estimate.totalEstimate.mid).toBeCloseTo(expectedTotal, 0);
    });
  });

  describe('budget breakdown', () => {
    it('should include all breakdown categories', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate.breakdown).toHaveProperty('accommodation');
      expect(estimate.breakdown).toHaveProperty('food');
      expect(estimate.breakdown).toHaveProperty('transportation');
      expect(estimate.breakdown).toHaveProperty('activities');
      expect(estimate.breakdown).toHaveProperty('miscellaneous');
    });

    it('should have perNight and total for accommodation', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate.breakdown.accommodation).toHaveProperty('perNight');
      expect(estimate.breakdown.accommodation).toHaveProperty('total');
      expect(estimate.breakdown.accommodation.total).toBe(
        estimate.breakdown.accommodation.perNight * 5
      );
    });

    it('should have perDay and total for food', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate.breakdown.food).toHaveProperty('perDay');
      expect(estimate.breakdown.food).toHaveProperty('total');
      expect(estimate.breakdown.food.total).toBe(
        estimate.breakdown.food.perDay * 5
      );
    });
  });

  describe('budget tips', () => {
    it('should generate budget tips', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate.budgetTips).toBeInstanceOf(Array);
      expect(estimate.budgetTips.length).toBeGreaterThan(0);
    });

    it('should generate different tips based on travel style', () => {
      const budgetTips = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'budget',
        travelers: 1,
      }).budgetTips;

      const luxuryTips = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'luxury',
        travelers: 1,
      }).budgetTips;

      expect(budgetTips).not.toEqual(luxuryTips);
    });
  });

  describe('estimate ranges', () => {
    it('should provide low, mid, and high estimates', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate.totalEstimate).toHaveProperty('low');
      expect(estimate.totalEstimate).toHaveProperty('mid');
      expect(estimate.totalEstimate).toHaveProperty('high');
      expect(estimate.totalEstimate.low).toBeLessThan(estimate.totalEstimate.mid);
      expect(estimate.totalEstimate.mid).toBeLessThan(estimate.totalEstimate.high);
    });
  });

  describe('per person and per day calculations', () => {
    it('should calculate perPerson correctly', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 2,
      });

      expect(estimate.perPerson).toBeCloseTo(estimate.totalEstimate.mid / 2, 0);
    });

    it('should calculate perDay correctly', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate.perDay).toBeCloseTo(estimate.totalEstimate.mid / 5, 0);
    });
  });

  describe('currency', () => {
    it('should default to USD', () => {
      const estimate = service.calculateEstimate({
        city: mockBasicCity,
        durationDays: 5,
        travelStyle: 'mid-range',
        travelers: 1,
      });

      expect(estimate.currency).toBe('USD');
    });
  });
});
