import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentMonth,
  getMonthNumber,
  isGoodTimeToVisit,
  getUpcomingEvents,
  getSeasonForMonth,
  formatMonthRange,
  MONTH_ORDER
} from '../seasonal.utils';
import type { SeasonalEvent } from '../../types';

describe('Seasonal Utilities', () => {
  describe('MONTH_ORDER', () => {
    it('should have 12 months in correct order', () => {
      expect(MONTH_ORDER).toHaveLength(12);
      expect(MONTH_ORDER[0]).toBe('january');
      expect(MONTH_ORDER[11]).toBe('december');
    });
  });

  describe('getMonthNumber', () => {
    it('should return correct month number', () => {
      expect(getMonthNumber('january')).toBe(1);
      expect(getMonthNumber('june')).toBe(6);
      expect(getMonthNumber('december')).toBe(12);
    });
  });

  describe('getCurrentMonth', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return current month name', () => {
      vi.setSystemTime(new Date(2026, 0, 15));
      expect(getCurrentMonth()).toBe('january');

      vi.setSystemTime(new Date(2026, 5, 15));
      expect(getCurrentMonth()).toBe('june');
    });
  });

  describe('isGoodTimeToVisit', () => {
    it('should return true for best months', () => {
      expect(isGoodTimeToVisit(['march', 'april'], ['july'], 'march')).toBe(true);
    });

    it('should return false for avoid months', () => {
      expect(isGoodTimeToVisit(['march', 'april'], ['july'], 'july')).toBe(false);
    });

    it('should return false if not in best months', () => {
      expect(isGoodTimeToVisit(['march', 'april'], ['july'], 'january')).toBe(false);
    });

    it('should use current month if none specified', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 3, 15));
      expect(isGoodTimeToVisit(['april', 'may'], ['december'])).toBe(true);
      vi.useRealTimers();
    });
  });

  describe('getUpcomingEvents', () => {
    const events: SeasonalEvent[] = [
      { name: 'Event 1', month: 'january', description: 'Test event 1', type: 'festival' },
      { name: 'Event 2', month: 'march', description: 'Test event 2', type: 'cultural' },
      { name: 'Event 3', month: 'july', description: 'Test event 3', type: 'natural' },
      { name: 'Event 4', month: 'december', description: 'Test event 4', type: 'sporting' }
    ];

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return events within specified months', () => {
      vi.setSystemTime(new Date(2026, 0, 15));
      const upcoming = getUpcomingEvents(events, 3);
      expect(upcoming).toHaveLength(2);
      expect(upcoming.map(e => e.name)).toContain('Event 1');
      expect(upcoming.map(e => e.name)).toContain('Event 2');
    });

    it('should handle year wrap-around', () => {
      vi.setSystemTime(new Date(2026, 10, 15));
      const upcoming = getUpcomingEvents(events, 3);
      expect(upcoming.map(e => e.name)).toContain('Event 4');
      expect(upcoming.map(e => e.name)).toContain('Event 1');
    });
  });

  describe('getSeasonForMonth', () => {
    it('should return correct northern hemisphere season', () => {
      expect(getSeasonForMonth('january', 'northern')).toBe('winter');
      expect(getSeasonForMonth('april', 'northern')).toBe('spring');
      expect(getSeasonForMonth('july', 'northern')).toBe('summer');
      expect(getSeasonForMonth('october', 'northern')).toBe('fall');
    });

    it('should return correct southern hemisphere season', () => {
      expect(getSeasonForMonth('january', 'southern')).toBe('summer');
      expect(getSeasonForMonth('july', 'southern')).toBe('winter');
      expect(getSeasonForMonth('april', 'southern')).toBe('fall');
      expect(getSeasonForMonth('october', 'southern')).toBe('spring');
    });
  });

  describe('formatMonthRange', () => {
    it('should format single month', () => {
      expect(formatMonthRange(['march'])).toBe('March');
    });

    it('should format two months', () => {
      expect(formatMonthRange(['march', 'april'])).toBe('March & April');
    });

    it('should format consecutive months as range', () => {
      expect(formatMonthRange(['march', 'april', 'may'])).toBe('March-May');
    });

    it('should return year-round for empty array', () => {
      expect(formatMonthRange([])).toBe('Year-round');
    });

    it('should return year-round for all 12 months', () => {
      const allMonths = MONTH_ORDER;
      expect(formatMonthRange([...allMonths])).toBe('Year-round');
    });

    it('should handle non-consecutive months', () => {
      expect(formatMonthRange(['march', 'july', 'december'])).toBe('March, July, December');
    });
  });
});
