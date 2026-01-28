import { describe, it, expect, expectTypeOf } from 'vitest';
import type { Month, SeasonalEvent, SeasonalInfo } from '../seasonal';

describe('Seasonal Types', () => {
  describe('Month', () => {
    it('should accept all 12 months', () => {
      const months: Month[] = [
        'january', 'february', 'march', 'april',
        'may', 'june', 'july', 'august',
        'september', 'october', 'november', 'december'
      ];

      expect(months).toHaveLength(12);
      months.forEach(month => {
        expectTypeOf(month).toBeString();
      });
    });

    it('should be lowercase string', () => {
      const month: Month = 'january';
      expect(month).toBe('january');
      expect(month).not.toBe('January');
    });
  });

  describe('SeasonalEvent', () => {
    it('should have required event fields', () => {
      const event: SeasonalEvent = {
        name: 'Cherry Blossom Season',
        month: 'april',
        description: 'Stunning sakura blooms across the city',
        type: 'natural'
      };

      expect(event.name).toBe('Cherry Blossom Season');
      expect(event.month).toBe('april');
      expect(event.description).toContain('sakura');
      expect(event.type).toBe('natural');
    });

    it('should accept all event types', () => {
      const types: SeasonalEvent['type'][] = ['festival', 'natural', 'cultural', 'sporting'];

      types.forEach(type => {
        const event: SeasonalEvent = {
          name: 'Test Event',
          month: 'january',
          description: 'Test description',
          type
        };
        expect(['festival', 'natural', 'cultural', 'sporting']).toContain(event.type);
      });
    });
  });

  describe('SeasonalInfo', () => {
    it('should have best and avoid months arrays', () => {
      const info: SeasonalInfo = {
        best_months: ['march', 'april', 'october', 'november'],
        avoid_months: ['june', 'july', 'august'],
        peak_season: ['april', 'may'],
        shoulder_season: ['march', 'november'],
        weather_notes: {
          january: 'Cold and dry',
          february: 'Cold with occasional snow',
          march: 'Spring begins',
          april: 'Cherry blossom season',
          may: 'Pleasant weather',
          june: 'Rainy season starts',
          july: 'Hot and humid',
          august: 'Peak summer heat',
          september: 'Typhoon season',
          october: 'Autumn foliage',
          november: 'Cool and pleasant',
          december: 'Cold begins'
        }
      };

      expect(info.best_months).toContain('april');
      expect(info.avoid_months).toContain('july');
      expect(info.peak_season).toHaveLength(2);
      expect(Object.keys(info.weather_notes)).toHaveLength(12);
    });
  });
});
