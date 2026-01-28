import { describe, it, expect } from 'vitest';
import {
  ExperienceSchema,
  AlgoliaExperienceSchema,
  ExperienceCategorySchema,
  PhysicalLevelSchema
} from '../experience.schema';

describe('Experience Schemas', () => {
  const validExperience = {
    name: 'Street Food Tour',
    category: 'culinary',
    description: 'Explore the vibrant street food scene with a local guide who knows all the best spots',
    vibe_tags: ['foodie', 'local', 'authentic'],
    city_ids: ['bangkok-thailand', 'ho-chi-minh-vietnam'],
    duration_hours: 3,
    price_tier: 'budget',
    best_season: ['november', 'december', 'january'],
    min_travelers: 1,
    max_travelers: 6,
    physical_level: 'easy',
    highlights: ['Hidden gem stalls', 'Local favorites', 'Dessert stop'],
    what_to_bring: ['Empty stomach', 'Water'],
    image_url: 'https://example.com/street-food.jpg'
  };

  describe('ExperienceCategorySchema', () => {
    it('should validate all valid categories', () => {
      const categories = [
        'cultural', 'adventure', 'culinary', 'nature', 'wellness',
        'nightlife', 'romantic', 'family', 'photography', 'spiritual'
      ];
      categories.forEach(cat => {
        expect(ExperienceCategorySchema.safeParse(cat).success).toBe(true);
      });
    });

    it('should reject invalid categories', () => {
      expect(ExperienceCategorySchema.safeParse('invalid').success).toBe(false);
      expect(ExperienceCategorySchema.safeParse('').success).toBe(false);
    });
  });

  describe('PhysicalLevelSchema', () => {
    it('should validate all valid levels', () => {
      const levels = ['easy', 'moderate', 'challenging', 'extreme'];
      levels.forEach(level => {
        expect(PhysicalLevelSchema.safeParse(level).success).toBe(true);
      });
    });

    it('should reject invalid levels', () => {
      expect(PhysicalLevelSchema.safeParse('hard').success).toBe(false);
      expect(PhysicalLevelSchema.safeParse('').success).toBe(false);
    });
  });

  describe('ExperienceSchema', () => {
    it('should validate a correct experience object', () => {
      const result = ExperienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
    });

    it('should reject experience with min > max travelers', () => {
      const invalid = { ...validExperience, min_travelers: 10, max_travelers: 5 };
      const result = ExperienceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const invalid = { ...validExperience, category: 'invalid-category' };
      const result = ExperienceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty city_ids', () => {
      const invalid = { ...validExperience, city_ids: [] };
      const result = ExperienceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty vibe_tags', () => {
      const invalid = { ...validExperience, vibe_tags: [] };
      const result = ExperienceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate duration in fractional hours', () => {
      const halfHour = { ...validExperience, duration_hours: 0.5 };
      expect(ExperienceSchema.safeParse(halfHour).success).toBe(true);

      const tooShort = { ...validExperience, duration_hours: 0.25 };
      expect(ExperienceSchema.safeParse(tooShort).success).toBe(false);
    });

    it('should reject duration over 72 hours', () => {
      const tooLong = { ...validExperience, duration_hours: 100 };
      expect(ExperienceSchema.safeParse(tooLong).success).toBe(false);
    });

    it('should reject invalid URL', () => {
      const invalid = { ...validExperience, image_url: 'not-a-url' };
      expect(ExperienceSchema.safeParse(invalid).success).toBe(false);
    });

    it('should allow empty what_to_bring', () => {
      const valid = { ...validExperience, what_to_bring: [] };
      expect(ExperienceSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe('AlgoliaExperienceSchema', () => {
    it('should require objectID', () => {
      const result = AlgoliaExperienceSchema.safeParse(validExperience);
      expect(result.success).toBe(false);

      const withId = { ...validExperience, objectID: 'street-food-tour-bangkok' };
      const resultWithId = AlgoliaExperienceSchema.safeParse(withId);
      expect(resultWithId.success).toBe(true);
    });

    it('should reject empty objectID', () => {
      const invalid = { ...validExperience, objectID: '' };
      expect(AlgoliaExperienceSchema.safeParse(invalid).success).toBe(false);
    });

    it('should allow optional geolocation', () => {
      const withGeo = {
        ...validExperience,
        objectID: 'test-exp',
        _geoloc: { lat: 13.4125, lng: 103.8670 }
      };
      expect(AlgoliaExperienceSchema.safeParse(withGeo).success).toBe(true);
    });

    it('should validate geolocation bounds', () => {
      const invalidLat = {
        ...validExperience,
        objectID: 'test-exp',
        _geoloc: { lat: 100, lng: 50 }
      };
      expect(AlgoliaExperienceSchema.safeParse(invalidLat).success).toBe(false);

      const invalidLng = {
        ...validExperience,
        objectID: 'test-exp',
        _geoloc: { lat: 50, lng: 200 }
      };
      expect(AlgoliaExperienceSchema.safeParse(invalidLng).success).toBe(false);
    });
  });
});
