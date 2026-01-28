import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  Experience,
  AlgoliaExperience,
  ExperienceCategory,
  PhysicalLevel
} from '../experience';

describe('Experience Types', () => {
  describe('ExperienceCategory', () => {
    it('should have valid experience categories', () => {
      const validCategories: ExperienceCategory[] = [
        'cultural', 'adventure', 'culinary', 'nature', 'wellness',
        'nightlife', 'romantic', 'family', 'photography', 'spiritual'
      ];

      validCategories.forEach(cat => {
        expect(typeof cat).toBe('string');
      });
    });
  });

  describe('PhysicalLevel', () => {
    it('should have valid physical levels', () => {
      const levels: PhysicalLevel[] = ['easy', 'moderate', 'challenging', 'extreme'];
      levels.forEach(level => {
        expect(['easy', 'moderate', 'challenging', 'extreme']).toContain(level);
      });
    });
  });

  describe('Experience', () => {
    it('should have valid experience structure', () => {
      const experience: Experience = {
        name: 'Sunrise Temple Tour',
        category: 'cultural',
        description: 'Watch the sunrise over ancient temples with a local guide who shares hidden history and photography spots',
        vibe_tags: ['spiritual', 'peaceful', 'photogenic'],
        city_ids: ['siem-reap-cambodia', 'bagan-myanmar'],
        duration_hours: 4,
        price_tier: 'mid-range',
        best_season: ['november', 'december', 'january', 'february'],
        min_travelers: 1,
        max_travelers: 8,
        physical_level: 'moderate',
        highlights: ['Angkor Wat sunrise', 'Hidden temples', 'Local breakfast'],
        what_to_bring: ['Camera', 'Sun hat', 'Water'],
        image_url: 'https://example.com/sunrise-temple.jpg'
      };

      expect(experience.category).toBe('cultural');
      expect(experience.city_ids).toHaveLength(2);
      expect(experience.duration_hours).toBe(4);
      expect(experience.physical_level).toBe('moderate');
    });

    it('should support all experience categories', () => {
      const categories: ExperienceCategory[] = [
        'cultural', 'adventure', 'culinary', 'nature', 'wellness',
        'nightlife', 'romantic', 'family', 'photography', 'spiritual'
      ];

      categories.forEach(category => {
        const exp: Experience = {
          name: 'Test Experience',
          category,
          description: 'A test experience description that is long enough',
          vibe_tags: ['test'],
          city_ids: ['test-city'],
          duration_hours: 2,
          price_tier: 'budget',
          best_season: ['january'],
          min_travelers: 1,
          max_travelers: 10,
          physical_level: 'easy',
          highlights: ['Test highlight'],
          what_to_bring: [],
          image_url: 'https://example.com/test.jpg'
        };
        expect(exp.category).toBe(category);
      });
    });
  });

  describe('AlgoliaExperience', () => {
    it('should have objectID in addition to Experience fields', () => {
      const algoliaExp: AlgoliaExperience = {
        objectID: 'sunrise-temple-tour',
        name: 'Sunrise Temple Tour',
        category: 'cultural',
        description: 'Watch the sunrise over ancient temples',
        vibe_tags: ['spiritual'],
        city_ids: ['siem-reap-cambodia'],
        duration_hours: 4,
        price_tier: 'mid-range',
        best_season: ['november'],
        min_travelers: 1,
        max_travelers: 8,
        physical_level: 'moderate',
        highlights: ['Sunrise view'],
        what_to_bring: ['Camera'],
        image_url: 'https://example.com/temple.jpg'
      };

      expect(algoliaExp.objectID).toBe('sunrise-temple-tour');
      expectTypeOf(algoliaExp.objectID).toBeString();
    });

    it('should support optional geolocation', () => {
      const expWithGeo: AlgoliaExperience = {
        objectID: 'test-exp',
        name: 'Test',
        category: 'adventure',
        description: 'A test experience with geolocation',
        vibe_tags: ['test'],
        city_ids: ['test-city'],
        duration_hours: 2,
        price_tier: 'budget',
        best_season: ['january'],
        min_travelers: 1,
        max_travelers: 5,
        physical_level: 'easy',
        highlights: ['Test'],
        what_to_bring: [],
        image_url: 'https://example.com/test.jpg',
        _geoloc: {
          lat: 13.4125,
          lng: 103.8670
        }
      };

      expect(expWithGeo._geoloc?.lat).toBe(13.4125);
      expect(expWithGeo._geoloc?.lng).toBe(103.8670);
    });
  });
});
