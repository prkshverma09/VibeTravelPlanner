import { describe, it, expect } from 'vitest';
import {
  mockExperiences,
  getMockExperienceById,
  getMockExperiencesByCategory,
  getMockExperiencesByCity,
  getMockExperiencesByPhysicalLevel
} from '../experiences.fixture';
import { AlgoliaExperienceSchema } from '../../schemas';

describe('Experience Fixtures', () => {
  it('should have at least 15 mock experiences', () => {
    expect(mockExperiences.length).toBeGreaterThanOrEqual(15);
  });

  it('should have all fixtures pass schema validation', () => {
    mockExperiences.forEach(exp => {
      const result = AlgoliaExperienceSchema.safeParse(exp);
      expect(result.success, `Experience ${exp.name} failed validation: ${JSON.stringify(result.error?.issues)}`).toBe(true);
    });
  });

  it('should have unique objectIDs', () => {
    const ids = mockExperiences.map(e => e.objectID);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have multiple categories represented', () => {
    const categories = new Set(mockExperiences.map(e => e.category));
    expect(categories.size).toBeGreaterThanOrEqual(5);
  });

  it('should have experiences linked to multiple cities', () => {
    const multiCityExperiences = mockExperiences.filter(e => e.city_ids.length > 1);
    expect(multiCityExperiences.length).toBeGreaterThan(0);
  });

  it('should have all price tiers represented', () => {
    const priceTiers = new Set(mockExperiences.map(e => e.price_tier));
    expect(priceTiers).toContain('budget');
    expect(priceTiers).toContain('mid-range');
    expect(priceTiers).toContain('luxury');
  });

  it('should have all physical levels represented', () => {
    const levels = new Set(mockExperiences.map(e => e.physical_level));
    expect(levels.size).toBeGreaterThanOrEqual(3);
  });

  describe('getMockExperienceById', () => {
    it('should find experience by ID', () => {
      const exp = getMockExperienceById('sunrise-temple-tour');
      expect(exp).toBeDefined();
      expect(exp?.name).toBe('Sunrise Temple Tour');
    });

    it('should return undefined for non-existent ID', () => {
      const notFound = getMockExperienceById('does-not-exist');
      expect(notFound).toBeUndefined();
    });
  });

  describe('getMockExperiencesByCategory', () => {
    it('should filter by category', () => {
      const culinary = getMockExperiencesByCategory('culinary');
      expect(culinary.length).toBeGreaterThan(0);
      culinary.forEach(e => expect(e.category).toBe('culinary'));
    });

    it('should return empty array for categories with no experiences', () => {
      const result = getMockExperiencesByCategory('spiritual');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getMockExperiencesByCity', () => {
    it('should filter by city', () => {
      const bangkokExperiences = getMockExperiencesByCity('bangkok-thailand');
      expect(bangkokExperiences.length).toBeGreaterThan(0);
      bangkokExperiences.forEach(e => {
        expect(e.city_ids).toContain('bangkok-thailand');
      });
    });

    it('should return empty array for cities with no experiences', () => {
      const result = getMockExperiencesByCity('nonexistent-city');
      expect(result).toHaveLength(0);
    });
  });

  describe('getMockExperiencesByPhysicalLevel', () => {
    it('should filter by physical level', () => {
      const easyExps = getMockExperiencesByPhysicalLevel('easy');
      expect(easyExps.length).toBeGreaterThan(0);
      easyExps.forEach(e => expect(e.physical_level).toBe('easy'));
    });
  });

  describe('Data Quality', () => {
    it('should have valid duration hours', () => {
      mockExperiences.forEach(exp => {
        expect(exp.duration_hours).toBeGreaterThanOrEqual(0.5);
        expect(exp.duration_hours).toBeLessThanOrEqual(72);
      });
    });

    it('should have valid traveler counts', () => {
      mockExperiences.forEach(exp => {
        expect(exp.min_travelers).toBeGreaterThanOrEqual(1);
        expect(exp.max_travelers).toBeGreaterThanOrEqual(exp.min_travelers);
      });
    });

    it('should have non-empty highlights', () => {
      mockExperiences.forEach(exp => {
        expect(exp.highlights.length).toBeGreaterThan(0);
      });
    });

    it('should have valid image URLs', () => {
      mockExperiences.forEach(exp => {
        expect(exp.image_url).toMatch(/^https?:\/\//);
      });
    });
  });
});
