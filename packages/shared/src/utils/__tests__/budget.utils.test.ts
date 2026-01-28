import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateTripCost,
  getBudgetTierFromCost,
  formatBudgetRange,
  getTotalDailyCost
} from '../budget.utils';

describe('Budget Utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(1500, 'USD', '$')).toBe('$1,500');
    });

    it('should format JPY correctly', () => {
      expect(formatCurrency(15000, 'JPY', '¥')).toBe('¥15,000');
    });

    it('should format EUR correctly', () => {
      expect(formatCurrency(250, 'EUR', '€')).toBe('€250');
    });

    it('should handle zero values', () => {
      expect(formatCurrency(0, 'USD', '$')).toBe('$0');
    });

    it('should handle decimal values', () => {
      expect(formatCurrency(99.99, 'USD', '$')).toBe('$99.99');
    });
  });

  describe('calculateTripCost', () => {
    it('should calculate cost for given days', () => {
      expect(calculateTripCost(100, 7)).toBe(700);
      expect(calculateTripCost(150, 14)).toBe(2100);
    });

    it('should handle single day', () => {
      expect(calculateTripCost(200, 1)).toBe(200);
    });

    it('should handle zero days', () => {
      expect(calculateTripCost(100, 0)).toBe(0);
    });
  });

  describe('getBudgetTierFromCost', () => {
    it('should return budget for low costs', () => {
      expect(getBudgetTierFromCost(50)).toBe('budget');
      expect(getBudgetTierFromCost(74)).toBe('budget');
    });

    it('should return mid-range for medium costs', () => {
      expect(getBudgetTierFromCost(75)).toBe('mid-range');
      expect(getBudgetTierFromCost(100)).toBe('mid-range');
      expect(getBudgetTierFromCost(199)).toBe('mid-range');
    });

    it('should return luxury for high costs', () => {
      expect(getBudgetTierFromCost(200)).toBe('luxury');
      expect(getBudgetTierFromCost(500)).toBe('luxury');
    });
  });

  describe('formatBudgetRange', () => {
    it('should format budget tier range', () => {
      expect(formatBudgetRange('budget')).toBe('Under $75/day');
    });

    it('should format mid-range tier', () => {
      expect(formatBudgetRange('mid-range')).toBe('$75-200/day');
    });

    it('should format luxury tier', () => {
      expect(formatBudgetRange('luxury')).toBe('$200+/day');
    });
  });

  describe('getTotalDailyCost', () => {
    it('should calculate total from cost breakdown', () => {
      const breakdown = {
        accommodation_per_night: 100,
        meal_average: 30,
        transportation_daily: 20,
        activities_daily: 50
      };
      expect(getTotalDailyCost(breakdown)).toBe(200);
    });

    it('should handle zero values', () => {
      const breakdown = {
        accommodation_per_night: 0,
        meal_average: 0,
        transportation_daily: 0,
        activities_daily: 0
      };
      expect(getTotalDailyCost(breakdown)).toBe(0);
    });
  });
});
