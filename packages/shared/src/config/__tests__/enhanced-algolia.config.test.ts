import { describe, it, expect } from 'vitest';
import {
  ENHANCED_SEARCHABLE_ATTRIBUTES,
  ENHANCED_ATTRIBUTES_FOR_FACETING,
  ENHANCED_CUSTOM_RANKING,
  getEnhancedIndexSettings,
  EXPERIENCES_INDEX_NAME,
  EXPERIENCES_SEARCHABLE_ATTRIBUTES,
  EXPERIENCES_ATTRIBUTES_FOR_FACETING,
  getExperiencesIndexSettings
} from '../algolia.config';

describe('Enhanced Algolia Configuration', () => {
  describe('Enhanced City Index', () => {
    it('should include cuisine in searchable attributes', () => {
      expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('local_cuisine');
      expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('cuisine_highlights');
    });

    it('should include seasonal data in searchable attributes', () => {
      expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('seasonal_events.name');
      expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('seasonal_events.description');
    });

    it('should include base searchable attributes', () => {
      expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('city');
      expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('country');
      expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('description');
      expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('vibe_tags');
    });

    it('should include budget_tier for faceting', () => {
      expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('budget_tier');
    });

    it('should include monthly facets', () => {
      expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('searchable(best_months)');
      expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('searchable(avoid_months)');
    });

    it('should include safety and practical attributes for faceting', () => {
      expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('safety_rating');
      expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('filterOnly(visa_free_for)');
      expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('english_proficiency');
    });

    it('should include discovery attributes for faceting', () => {
      expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('flight_hub');
      expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('vegetarian_friendly');
    });

    it('should have numeric filtering for cost', () => {
      const settings = getEnhancedIndexSettings();
      expect(settings.numericAttributesForFiltering).toContain('avg_daily_cost_usd');
      expect(settings.numericAttributesForFiltering).toContain('safety_rating');
    });

    it('should prioritize safety in custom ranking', () => {
      expect(ENHANCED_CUSTOM_RANKING[0]).toBe('desc(safety_rating)');
    });

    it('should generate complete enhanced settings object', () => {
      const settings = getEnhancedIndexSettings();
      expect(settings).toHaveProperty('searchableAttributes');
      expect(settings).toHaveProperty('attributesForFaceting');
      expect(settings).toHaveProperty('customRanking');
      expect(settings).toHaveProperty('ranking');
      expect(settings).toHaveProperty('numericAttributesForFiltering');
    });
  });

  describe('Experiences Index', () => {
    it('should have correct index name', () => {
      expect(EXPERIENCES_INDEX_NAME).toBe('travel_experiences');
    });

    it('should include name and description in searchable attributes', () => {
      expect(EXPERIENCES_SEARCHABLE_ATTRIBUTES).toContain('name');
      expect(EXPERIENCES_SEARCHABLE_ATTRIBUTES).toContain('description');
      expect(EXPERIENCES_SEARCHABLE_ATTRIBUTES).toContain('vibe_tags');
    });

    it('should include category for faceting', () => {
      expect(EXPERIENCES_ATTRIBUTES_FOR_FACETING).toContain('category');
    });

    it('should include city_ids as filterOnly', () => {
      expect(EXPERIENCES_ATTRIBUTES_FOR_FACETING).toContain('filterOnly(city_ids)');
    });

    it('should include price_tier for faceting', () => {
      expect(EXPERIENCES_ATTRIBUTES_FOR_FACETING).toContain('price_tier');
    });

    it('should include physical_level for faceting', () => {
      expect(EXPERIENCES_ATTRIBUTES_FOR_FACETING).toContain('physical_level');
    });

    it('should have numeric filtering for duration', () => {
      const settings = getExperiencesIndexSettings();
      expect(settings.numericAttributesForFiltering).toContain('duration_hours');
    });

    it('should generate complete experiences settings object', () => {
      const settings = getExperiencesIndexSettings();
      expect(settings).toHaveProperty('searchableAttributes');
      expect(settings).toHaveProperty('attributesForFaceting');
      expect(settings).toHaveProperty('customRanking');
      expect(settings).toHaveProperty('numericAttributesForFiltering');
    });
  });
});
