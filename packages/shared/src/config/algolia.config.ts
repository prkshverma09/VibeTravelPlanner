export const INDEX_NAME = 'travel_destinations';

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

export function getSynonyms(): readonly AlgoliaSynonym[] {
  return SYNONYMS;
}
