import { describe, it, expect } from 'vitest';
import { BudgetTierSchema, CostBreakdownSchema } from '../budget.schema';

describe('Budget Schemas', () => {
  describe('BudgetTierSchema', () => {
    it('should validate valid budget tiers', () => {
      expect(BudgetTierSchema.safeParse('budget').success).toBe(true);
      expect(BudgetTierSchema.safeParse('mid-range').success).toBe(true);
      expect(BudgetTierSchema.safeParse('luxury').success).toBe(true);
    });

    it('should reject invalid budget tiers', () => {
      expect(BudgetTierSchema.safeParse('cheap').success).toBe(false);
      expect(BudgetTierSchema.safeParse('expensive').success).toBe(false);
      expect(BudgetTierSchema.safeParse('BUDGET').success).toBe(false);
      expect(BudgetTierSchema.safeParse('').success).toBe(false);
      expect(BudgetTierSchema.safeParse(123).success).toBe(false);
    });
  });

  describe('CostBreakdownSchema', () => {
    it('should validate valid cost breakdown', () => {
      const validCost = {
        accommodation_per_night: 100,
        meal_average: 30,
        transportation_daily: 20,
        activities_daily: 50
      };
      expect(CostBreakdownSchema.safeParse(validCost).success).toBe(true);
    });

    it('should validate zero costs', () => {
      const zeroCost = {
        accommodation_per_night: 0,
        meal_average: 0,
        transportation_daily: 0,
        activities_daily: 0
      };
      expect(CostBreakdownSchema.safeParse(zeroCost).success).toBe(true);
    });

    it('should validate decimal costs', () => {
      const decimalCost = {
        accommodation_per_night: 99.99,
        meal_average: 15.50,
        transportation_daily: 10.25,
        activities_daily: 25.75
      };
      expect(CostBreakdownSchema.safeParse(decimalCost).success).toBe(true);
    });

    it('should reject negative costs', () => {
      const invalidCost = {
        accommodation_per_night: -50,
        meal_average: 30,
        transportation_daily: 20,
        activities_daily: 50
      };
      expect(CostBreakdownSchema.safeParse(invalidCost).success).toBe(false);
    });

    it('should reject missing fields', () => {
      const incompleteCost = {
        accommodation_per_night: 100,
        meal_average: 30
      };
      expect(CostBreakdownSchema.safeParse(incompleteCost).success).toBe(false);
    });

    it('should reject string values', () => {
      const invalidCost = {
        accommodation_per_night: '100',
        meal_average: 30,
        transportation_daily: 20,
        activities_daily: 50
      };
      expect(CostBreakdownSchema.safeParse(invalidCost).success).toBe(false);
    });
  });
});
