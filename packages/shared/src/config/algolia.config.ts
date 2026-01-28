export const INDEX_NAME = 'travel_destinations';
export const EXPERIENCES_INDEX_NAME = 'travel_experiences';

export const SEARCHABLE_ATTRIBUTES = [
  'city',
  'country',
  'description',
  'vibe_tags',
  'keywords'
] as const;

export const ATTRIBUTES_FOR_FACETING = [
  'filterOnly(continent)',
  'searchable(climate_type)',
  'searchable(vibe_tags)',
  'culture_score',
  'adventure_score',
  'nature_score',
  'beach_score',
  'nightlife_score'
] as const;

export const CUSTOM_RANKING = [
  'desc(culture_score)',
  'desc(nightlife_score)'
] as const;

export const RANKING = [
  'typo',
  'geo',
  'words',
  'filters',
  'proximity',
  'attribute',
  'exact',
  'custom'
] as const;

export const ENHANCED_SEARCHABLE_ATTRIBUTES = [
  'city',
  'country',
  'description',
  'vibe_tags',
  'keywords',
  'local_cuisine',
  'cuisine_highlights',
  'seasonal_events.name',
  'seasonal_events.description',
  'primary_language'
] as const;

export const ENHANCED_ATTRIBUTES_FOR_FACETING = [
  'filterOnly(continent)',
  'searchable(climate_type)',
  'searchable(vibe_tags)',
  'culture_score',
  'adventure_score',
  'nature_score',
  'beach_score',
  'nightlife_score',
  'budget_tier',
  'avg_daily_cost_usd',
  'safety_rating',
  'filterOnly(visa_free_for)',
  'primary_language',
  'english_proficiency',
  'searchable(best_months)',
  'searchable(avoid_months)',
  'seasonal_events.month',
  'seasonal_events.type',
  'flight_hub',
  'vegetarian_friendly'
] as const;

export const ENHANCED_CUSTOM_RANKING = [
  'desc(safety_rating)',
  'desc(culture_score)',
  'asc(avg_daily_cost_usd)'
] as const;

export const EXPERIENCES_SEARCHABLE_ATTRIBUTES = [
  'name',
  'description',
  'vibe_tags',
  'highlights',
  'category'
] as const;

export const EXPERIENCES_ATTRIBUTES_FOR_FACETING = [
  'category',
  'price_tier',
  'physical_level',
  'filterOnly(city_ids)',
  'searchable(best_season)',
  'duration_hours',
  'min_travelers'
] as const;

export const EXPERIENCES_CUSTOM_RANKING = [
  'desc(city_ids)'
] as const;

export const SYNONYMS = [
  {
    objectID: 'romantic-synonyms',
    type: 'synonym' as const,
    synonyms: ['romantic', 'honeymoon', 'couples', 'love', 'wedding destination', 'anniversary']
  },
  {
    objectID: 'beach-synonyms',
    type: 'synonym' as const,
    synonyms: ['beach', 'coastal', 'seaside', 'ocean', 'tropical', 'island']
  },
  {
    objectID: 'temples-synonyms',
    type: 'synonym' as const,
    synonyms: ['temples', 'spiritual', 'religious', 'shrines', 'sacred', 'ancient']
  },
  {
    objectID: 'nightlife-synonyms',
    type: 'synonym' as const,
    synonyms: ['nightlife', 'party', 'clubs', 'bars', 'entertainment', 'vibrant']
  },
  {
    objectID: 'cultural-synonyms',
    type: 'synonym' as const,
    synonyms: ['cultural', 'historic', 'heritage', 'museums', 'art', 'history']
  },
  {
    objectID: 'adventure-synonyms',
    type: 'synonym' as const,
    synonyms: ['adventure', 'hiking', 'outdoor', 'active', 'extreme', 'exploration']
  },
  {
    objectID: 'relaxing-synonyms',
    type: 'synonym' as const,
    synonyms: ['relaxing', 'peaceful', 'tranquil', 'spa', 'wellness', 'retreat']
  },
  {
    objectID: 'family-synonyms',
    type: 'synonym' as const,
    synonyms: ['family-friendly', 'kids', 'children', 'family vacation', 'family trip']
  }
] as const;

export interface AlgoliaIndexSettings {
  searchableAttributes: readonly string[];
  attributesForFaceting: readonly string[];
  customRanking: readonly string[];
  ranking: readonly string[];
}

export interface AlgoliaSynonym {
  objectID: string;
  type: 'synonym' | 'oneWaySynonym';
  synonyms: readonly string[];
}

export function getIndexSettings(): AlgoliaIndexSettings {
  return {
    searchableAttributes: SEARCHABLE_ATTRIBUTES,
    attributesForFaceting: ATTRIBUTES_FOR_FACETING,
    customRanking: CUSTOM_RANKING,
    ranking: RANKING
  };
}

export interface EnhancedAlgoliaIndexSettings extends AlgoliaIndexSettings {
  numericAttributesForFiltering: readonly string[];
}

export function getEnhancedIndexSettings(): EnhancedAlgoliaIndexSettings {
  return {
    searchableAttributes: ENHANCED_SEARCHABLE_ATTRIBUTES,
    attributesForFaceting: ENHANCED_ATTRIBUTES_FOR_FACETING,
    customRanking: ENHANCED_CUSTOM_RANKING,
    ranking: RANKING,
    numericAttributesForFiltering: [
      'avg_daily_cost_usd',
      'safety_rating'
    ]
  };
}

export function getExperiencesIndexSettings(): EnhancedAlgoliaIndexSettings {
  return {
    searchableAttributes: EXPERIENCES_SEARCHABLE_ATTRIBUTES,
    attributesForFaceting: EXPERIENCES_ATTRIBUTES_FOR_FACETING,
    customRanking: EXPERIENCES_CUSTOM_RANKING,
    ranking: RANKING,
    numericAttributesForFiltering: [
      'duration_hours',
      'min_travelers',
      'max_travelers'
    ]
  };
}

export function getSynonyms(): readonly AlgoliaSynonym[] {
  return SYNONYMS;
}
