import { describe, it, expect } from 'vitest';
import {
  calculateBudgetEstimate,
  getBudgetBreakdown,
  getCostCategory,
  type BudgetInput,
  type BudgetEstimate,
} from '../budget.service';
import type { AlgoliaCity } from '@vibe-travel/shared';

const mockCity: AlgoliaCity = {
  objectID: 'tokyo-japan',
  city: 'Tokyo',
  country: 'Japan',
  continent: 'Asia',
  description: 'A vibrant metropolis',
  vibe_tags: ['Cultural', 'Modern'],
  latitude: 35.6762,
  longitude: 139.6503,
  image_url: 'https://example.com/tokyo.jpg',
  rating: 4.8,
  review_count: 1000,
  average_cost_per_day: 150,
  best_months: [3, 4, 10, 11],
  culture_score: 10,
  nightlife_score: 9,
  nature_score: 6,
  beach_score: 3,
  adventure_score: 5,
  relaxation_score: 4,
  cuisine_variety: ['Japanese', 'International'],
  known_for: ['Temples', 'Technology'],
  ideal_trip_length: '5-7 days',
  visa_requirements: 'Visa-free for many countries',
  safety_rating: 5,
  lgbtq_friendly: true,
  family_friendly: true,
  solo_traveler_friendly: true,
  digital_nomad_friendly: true,
  currency: 'JPY',
  language: ['Japanese'],
  timezone: 'UTC+9',
  airport_codes: ['NRT', 'HND'],
};

describe('Budget Service', () => {
  describe('calculateBudgetEstimate', () => {
    it('should calculate basic budget estimate', () => {
      const input: BudgetInput = {
        city: mockCity,
        durationDays: 5,
        travelStyle: 'moderate',
        travelers: 2,
      };

      const estimate = calculateBudgetEstimate(input);

      expect(estimate).toBeDefined();
      expect(estimate.totalEstimate).toBeGreaterThan(0);
      expect(estimate.perPersonPerDay).toBeGreaterThan(0);
    });

    it('should increase budget for luxury travel style', () => {
      const budgetInput: BudgetInput = {
        city: mockCity,
        durationDays: 5,
        travelStyle: 'budget',
        travelers: 1,
      };

      const luxuryInput: BudgetInput = {
        city: mockCity,
        durationDays: 5,
        travelStyle: 'luxury',
        travelers: 1,
      };

      const budgetEstimate = calculateBudgetEstimate(budgetInput);
      const luxuryEstimate = calculateBudgetEstimate(luxuryInput);

      expect(luxuryEstimate.totalEstimate).toBeGreaterThan(budgetEstimate.totalEstimate);
    });

    it('should scale budget with number of travelers', () => {
      const singleInput: BudgetInput = {
        city: mockCity,
        durationDays: 5,
        travelStyle: 'moderate',
        travelers: 1,
      };

      const doubleInput: BudgetInput = {
        city: mockCity,
        durationDays: 5,
        travelStyle: 'moderate',
        travelers: 2,
      };

      const singleEstimate = calculateBudgetEstimate(singleInput);
      const doubleEstimate = calculateBudgetEstimate(doubleInput);

      expect(doubleEstimate.totalEstimate).toBeGreaterThan(singleEstimate.totalEstimate);
    });

    it('should scale budget with duration', () => {
      const shortInput: BudgetInput = {
        city: mockCity,
        durationDays: 3,
        travelStyle: 'moderate',
        travelers: 1,
      };

      const longInput: BudgetInput = {
        city: mockCity,
        durationDays: 7,
        travelStyle: 'moderate',
        travelers: 1,
      };

      const shortEstimate = calculateBudgetEstimate(shortInput);
      const longEstimate = calculateBudgetEstimate(longInput);

      expect(longEstimate.totalEstimate).toBeGreaterThan(shortEstimate.totalEstimate);
    });

    it('should include breakdown by category', () => {
      const input: BudgetInput = {
        city: mockCity,
        durationDays: 5,
        travelStyle: 'moderate',
        travelers: 1,
      };

      const estimate = calculateBudgetEstimate(input);

      expect(estimate.breakdown).toBeDefined();
      expect(estimate.breakdown.accommodation).toBeGreaterThan(0);
      expect(estimate.breakdown.food).toBeGreaterThan(0);
      expect(estimate.breakdown.activities).toBeGreaterThan(0);
      expect(estimate.breakdown.transport).toBeGreaterThan(0);
    });
  });

  describe('getBudgetBreakdown', () => {
    it('should return breakdown percentages', () => {
      const breakdown = getBudgetBreakdown('moderate');

      expect(breakdown.accommodation).toBeDefined();
      expect(breakdown.food).toBeDefined();
      expect(breakdown.activities).toBeDefined();
      expect(breakdown.transport).toBeDefined();
    });

    it('should have higher accommodation percentage for luxury', () => {
      const budgetBreakdown = getBudgetBreakdown('budget');
      const luxuryBreakdown = getBudgetBreakdown('luxury');

      expect(luxuryBreakdown.accommodation).toBeGreaterThanOrEqual(budgetBreakdown.accommodation);
    });
  });

  describe('getCostCategory', () => {
    it('should return "budget" for low cost cities', () => {
      const cheapCity = { ...mockCity, average_cost_per_day: 50 };
      expect(getCostCategory(cheapCity)).toBe('budget');
    });

    it('should return "moderate" for mid-range cost cities', () => {
      const midCity = { ...mockCity, average_cost_per_day: 120 };
      expect(getCostCategory(midCity)).toBe('moderate');
    });

    it('should return "expensive" for high cost cities', () => {
      const expensiveCity = { ...mockCity, average_cost_per_day: 250 };
      expect(getCostCategory(expensiveCity)).toBe('expensive');
    });
  });
});
