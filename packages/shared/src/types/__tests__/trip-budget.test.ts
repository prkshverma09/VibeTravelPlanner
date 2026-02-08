import { describe, it, expect } from 'vitest';
import {
  tripBudgetSchema,
  costRangeSchema,
  budgetCategorySchema,
  savingsOpportunitySchema,
  budgetStatusSchema,
  BUDGET_CATEGORIES,
  createTripBudget,
  calculateBudgetStatus,
  calculateTotalFromCategories,
} from '../trip-budget';

describe('Trip Budget Types', () => {
  describe('Budget Categories', () => {
    it('should include all expected categories', () => {
      expect(BUDGET_CATEGORIES).toContain('accommodation');
      expect(BUDGET_CATEGORIES).toContain('activities');
      expect(BUDGET_CATEGORIES).toContain('food');
      expect(BUDGET_CATEGORIES).toContain('transport');
      expect(BUDGET_CATEGORIES).toContain('shopping');
      expect(BUDGET_CATEGORIES).toContain('misc');
    });

    it('should validate budget category schema', () => {
      expect(budgetCategorySchema.safeParse('accommodation').success).toBe(true);
      expect(budgetCategorySchema.safeParse('activities').success).toBe(true);
      expect(budgetCategorySchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('Cost Range Schema', () => {
    it('should validate valid cost range', () => {
      const range = { min: 100, max: 200 };
      expect(costRangeSchema.safeParse(range).success).toBe(true);
    });

    it('should require min <= max', () => {
      const invalid = { min: 200, max: 100 };
      expect(costRangeSchema.safeParse(invalid).success).toBe(false);
    });

    it('should allow equal min and max', () => {
      const equal = { min: 100, max: 100 };
      expect(costRangeSchema.safeParse(equal).success).toBe(true);
    });

    it('should require non-negative values', () => {
      const negative = { min: -10, max: 100 };
      expect(costRangeSchema.safeParse(negative).success).toBe(false);
    });
  });

  describe('Budget Status Schema', () => {
    it('should validate valid status values', () => {
      expect(budgetStatusSchema.safeParse('under').success).toBe(true);
      expect(budgetStatusSchema.safeParse('on-track').success).toBe(true);
      expect(budgetStatusSchema.safeParse('over').success).toBe(true);
    });

    it('should reject invalid status', () => {
      expect(budgetStatusSchema.safeParse('unknown').success).toBe(false);
    });
  });

  describe('Savings Opportunity Schema', () => {
    const mockOpportunity = {
      category: 'accommodation' as const,
      currentItem: 'Luxury Hotel',
      alternativeItem: 'Boutique Hotel',
      savings: 50,
      tradeoff: '10 min further from center',
    };

    it('should validate valid savings opportunity', () => {
      expect(savingsOpportunitySchema.safeParse(mockOpportunity).success).toBe(true);
    });

    it('should require positive savings', () => {
      const invalid = { ...mockOpportunity, savings: 0 };
      expect(savingsOpportunitySchema.safeParse(invalid).success).toBe(false);

      const negative = { ...mockOpportunity, savings: -10 };
      expect(savingsOpportunitySchema.safeParse(negative).success).toBe(false);
    });

    it('should require all fields', () => {
      const { tradeoff, ...withoutTradeoff } = mockOpportunity;
      expect(savingsOpportunitySchema.safeParse(withoutTradeoff).success).toBe(false);
    });
  });

  describe('Trip Budget Schema', () => {
    const mockBudget = {
      tripId: 'trip_001',
      currency: 'USD',
      estimated: {
        accommodation: { min: 500, max: 700 },
        activities: { min: 200, max: 400 },
        food: { min: 300, max: 500 },
        transport: { min: 100, max: 150 },
        shopping: { min: 100, max: 200 },
        misc: { min: 50, max: 100 },
        total: { min: 1250, max: 2050 },
      },
      limits: {
        total: 2000,
        daily: 300,
      },
      status: 'on-track' as const,
      savingsOpportunities: [],
    };

    it('should validate valid trip budget', () => {
      const result = tripBudgetSchema.safeParse(mockBudget);
      expect(result.success).toBe(true);
    });

    it('should validate total is consistent with categories', () => {
      const invalidTotal = {
        ...mockBudget,
        estimated: {
          ...mockBudget.estimated,
          total: { min: 100, max: 200 }, // Wrong total
        },
      };
      const result = tripBudgetSchema.safeParse(invalidTotal);
      expect(result.success).toBe(false);
    });

    it('should allow savings opportunities', () => {
      const withSavings = {
        ...mockBudget,
        savingsOpportunities: [
          {
            category: 'accommodation' as const,
            currentItem: 'Luxury Hotel',
            alternativeItem: 'Budget Hotel',
            savings: 100,
            tradeoff: 'Basic amenities',
          },
        ],
      };
      expect(tripBudgetSchema.safeParse(withSavings).success).toBe(true);
    });

    it('should allow optional per-category limits', () => {
      const withCategoryLimits = {
        ...mockBudget,
        limits: {
          ...mockBudget.limits,
          perCategory: {
            accommodation: 800,
            activities: 500,
          },
        },
      };
      expect(tripBudgetSchema.safeParse(withCategoryLimits).success).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    describe('calculateTotalFromCategories', () => {
      it('should calculate correct total from category costs', () => {
        const categories = {
          accommodation: { min: 500, max: 700 },
          activities: { min: 200, max: 400 },
          food: { min: 300, max: 500 },
          transport: { min: 100, max: 150 },
          shopping: { min: 100, max: 200 },
          misc: { min: 50, max: 100 },
        };

        const total = calculateTotalFromCategories(categories);

        expect(total.min).toBe(1250);
        expect(total.max).toBe(2050);
      });

      it('should handle zero values', () => {
        const categories = {
          accommodation: { min: 0, max: 0 },
          activities: { min: 100, max: 200 },
          food: { min: 0, max: 0 },
          transport: { min: 0, max: 0 },
          shopping: { min: 0, max: 0 },
          misc: { min: 0, max: 0 },
        };

        const total = calculateTotalFromCategories(categories);

        expect(total.min).toBe(100);
        expect(total.max).toBe(200);
      });
    });

    describe('calculateBudgetStatus', () => {
      it('should return "under" when max estimate is under limit', () => {
        const status = calculateBudgetStatus(
          { min: 1000, max: 1500 },
          2000
        );
        expect(status).toBe('under');
      });

      it('should return "on-track" when estimate overlaps with limit', () => {
        const status = calculateBudgetStatus(
          { min: 1800, max: 2200 },
          2000
        );
        expect(status).toBe('on-track');
      });

      it('should return "over" when min estimate exceeds limit', () => {
        const status = calculateBudgetStatus(
          { min: 2500, max: 3000 },
          2000
        );
        expect(status).toBe('over');
      });

      it('should return "under" when exactly at limit', () => {
        const status = calculateBudgetStatus(
          { min: 1500, max: 2000 },
          2000
        );
        expect(status).toBe('under');
      });
    });

    describe('createTripBudget', () => {
      it('should create budget with calculated total', () => {
        const categories = {
          accommodation: { min: 500, max: 700 },
          activities: { min: 200, max: 400 },
          food: { min: 300, max: 500 },
          transport: { min: 100, max: 150 },
        };

        const budget = createTripBudget({
          tripId: 'trip_001',
          currency: 'USD',
          categories,
          limit: 2000,
        });

        expect(budget.estimated.total.min).toBe(1100);
        expect(budget.estimated.total.max).toBe(1750);
      });

      it('should determine correct status', () => {
        const categories = {
          accommodation: { min: 1200, max: 1500 },
          activities: { min: 600, max: 800 },
          food: { min: 400, max: 500 },
          transport: { min: 300, max: 400 },
        };

        const budget = createTripBudget({
          tripId: 'trip_001',
          currency: 'USD',
          categories,
          limit: 2000,
        });

        expect(budget.status).toBe('over');
      });

      it('should set default values for missing categories', () => {
        const budget = createTripBudget({
          tripId: 'trip_001',
          currency: 'USD',
          categories: {
            accommodation: { min: 500, max: 700 },
          },
          limit: 2000,
        });

        expect(budget.estimated.activities).toEqual({ min: 0, max: 0 });
        expect(budget.estimated.food).toEqual({ min: 0, max: 0 });
      });

      it('should calculate daily budget from total and days', () => {
        const categories = {
          accommodation: { min: 700, max: 700 },
          activities: { min: 350, max: 350 },
          food: { min: 280, max: 280 },
          transport: { min: 70, max: 70 },
        };

        const budget = createTripBudget({
          tripId: 'trip_001',
          currency: 'USD',
          categories,
          limit: 1400,
          totalDays: 7,
        });

        expect(budget.limits.daily).toBe(200);
      });
    });
  });
});
