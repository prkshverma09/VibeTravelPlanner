import { describe, it, expect } from 'vitest';
import { MonthSchema, SeasonalEventSchema, SeasonalEventTypeSchema } from '../seasonal.schema';

describe('Seasonal Schemas', () => {
  describe('MonthSchema', () => {
    it('should validate all 12 months', () => {
      const months = [
        'january', 'february', 'march', 'april',
        'may', 'june', 'july', 'august',
        'september', 'october', 'november', 'december'
      ];
      months.forEach(month => {
        expect(MonthSchema.safeParse(month).success).toBe(true);
      });
    });

    it('should reject invalid months', () => {
      expect(MonthSchema.safeParse('January').success).toBe(false);
      expect(MonthSchema.safeParse('jan').success).toBe(false);
      expect(MonthSchema.safeParse('').success).toBe(false);
      expect(MonthSchema.safeParse(1).success).toBe(false);
    });
  });

  describe('SeasonalEventTypeSchema', () => {
    it('should validate all event types', () => {
      expect(SeasonalEventTypeSchema.safeParse('festival').success).toBe(true);
      expect(SeasonalEventTypeSchema.safeParse('natural').success).toBe(true);
      expect(SeasonalEventTypeSchema.safeParse('cultural').success).toBe(true);
      expect(SeasonalEventTypeSchema.safeParse('sporting').success).toBe(true);
    });

    it('should reject invalid event types', () => {
      expect(SeasonalEventTypeSchema.safeParse('concert').success).toBe(false);
      expect(SeasonalEventTypeSchema.safeParse('Festival').success).toBe(false);
    });
  });

  describe('SeasonalEventSchema', () => {
    it('should validate valid seasonal event', () => {
      const event = {
        name: 'Cherry Blossom Festival',
        month: 'april',
        description: 'Beautiful cherry blossoms bloom across the city parks',
        type: 'natural'
      };
      expect(SeasonalEventSchema.safeParse(event).success).toBe(true);
    });

    it('should reject event with short description', () => {
      const event = {
        name: 'Festival',
        month: 'april',
        description: 'Short',
        type: 'festival'
      };
      expect(SeasonalEventSchema.safeParse(event).success).toBe(false);
    });

    it('should reject event with empty name', () => {
      const event = {
        name: '',
        month: 'april',
        description: 'A valid description that is long enough',
        type: 'festival'
      };
      expect(SeasonalEventSchema.safeParse(event).success).toBe(false);
    });

    it('should reject event with invalid month', () => {
      const event = {
        name: 'Festival',
        month: 'April',
        description: 'A valid description that is long enough',
        type: 'festival'
      };
      expect(SeasonalEventSchema.safeParse(event).success).toBe(false);
    });

    it('should reject event with invalid type', () => {
      const event = {
        name: 'Festival',
        month: 'april',
        description: 'A valid description that is long enough',
        type: 'invalid'
      };
      expect(SeasonalEventSchema.safeParse(event).success).toBe(false);
    });
  });
});
