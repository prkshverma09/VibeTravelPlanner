import { describe, it, expect, expectTypeOf } from 'vitest';
import type { BudgetTier, CostBreakdown } from '../budget';

describe('Budget Types', () => {
  describe('BudgetTier', () => {
    it('should accept valid budget tier values', () => {
      const budget: BudgetTier = 'budget';
      const midRange: BudgetTier = 'mid-range';
      const luxury: BudgetTier = 'luxury';

      expect(['budget', 'mid-range', 'luxury']).toContain(budget);
      expect(['budget', 'mid-range', 'luxury']).toContain(midRange);
      expect(['budget', 'mid-range', 'luxury']).toContain(luxury);
    });

    it('should be a string type', () => {
      const tier: BudgetTier = 'mid-range';
      expectTypeOf(tier).toBeString();
    });
  });

  describe('CostBreakdown', () => {
    it('should have all required cost fields', () => {
      const breakdown: CostBreakdown = {
        accommodation_per_night: 100,
        meal_average: 30,
        transportation_daily: 20,
        activities_daily: 50
      };

      expect(breakdown.accommodation_per_night).toBe(100);
      expect(breakdown.meal_average).toBe(30);
      expect(breakdown.transportation_daily).toBe(20);
      expect(breakdown.activities_daily).toBe(50);
    });

    it('should allow zero values for costs', () => {
      const breakdown: CostBreakdown = {
        accommodation_per_night: 0,
        meal_average: 0,
        transportation_daily: 0,
        activities_daily: 0
      };

      expect(breakdown.accommodation_per_night).toBe(0);
    });

    it('should support decimal values', () => {
      const breakdown: CostBreakdown = {
        accommodation_per_night: 99.99,
        meal_average: 15.50,
        transportation_daily: 10.25,
        activities_daily: 25.75
      };

      expect(breakdown.accommodation_per_night).toBe(99.99);
    });
  });
});
