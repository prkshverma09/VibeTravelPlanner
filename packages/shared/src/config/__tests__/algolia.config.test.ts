import { describe, it, expect } from 'vitest';
import {
  INDEX_NAME,
  SEARCHABLE_ATTRIBUTES,
  ATTRIBUTES_FOR_FACETING,
  CUSTOM_RANKING,
  getIndexSettings
} from '../algolia.config';

describe('Algolia Configuration', () => {
  it('should have correct index name', () => {
    expect(INDEX_NAME).toBe('travel_destinations');
  });

  it('should include required searchable attributes', () => {
    expect(SEARCHABLE_ATTRIBUTES).toContain('city');
    expect(SEARCHABLE_ATTRIBUTES).toContain('country');
    expect(SEARCHABLE_ATTRIBUTES).toContain('description');
    expect(SEARCHABLE_ATTRIBUTES).toContain('vibe_tags');
  });

  it('should include score attributes for faceting', () => {
    expect(ATTRIBUTES_FOR_FACETING).toContain('culture_score');
    expect(ATTRIBUTES_FOR_FACETING).toContain('adventure_score');
    expect(ATTRIBUTES_FOR_FACETING).toContain('nature_score');
    expect(ATTRIBUTES_FOR_FACETING).toContain('beach_score');
    expect(ATTRIBUTES_FOR_FACETING).toContain('nightlife_score');
  });

  it('should include continent as filterOnly facet', () => {
    expect(ATTRIBUTES_FOR_FACETING).toContain('filterOnly(continent)');
  });

  it('should include climate_type as searchable facet', () => {
    expect(ATTRIBUTES_FOR_FACETING).toContain('searchable(climate_type)');
  });

  it('should have custom ranking defined', () => {
    expect(CUSTOM_RANKING).toContain('desc(culture_score)');
    expect(CUSTOM_RANKING).toContain('desc(nightlife_score)');
  });

  it('should generate complete index settings object', () => {
    const settings = getIndexSettings();
    expect(settings).toHaveProperty('searchableAttributes');
    expect(settings).toHaveProperty('attributesForFaceting');
    expect(settings).toHaveProperty('customRanking');
    expect(settings).toHaveProperty('ranking');
  });

  it('should have standard ranking rules', () => {
    const settings = getIndexSettings();
    expect(settings.ranking).toContain('typo');
    expect(settings.ranking).toContain('words');
    expect(settings.ranking).toContain('proximity');
    expect(settings.ranking).toContain('attribute');
    expect(settings.ranking).toContain('exact');
    expect(settings.ranking).toContain('custom');
  });
});
