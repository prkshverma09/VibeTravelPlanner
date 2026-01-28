import { liteClient as algoliasearch, type LiteClient } from 'algoliasearch/lite';
import { INDEX_NAME, getIndexSettings } from '@vibe-travel/shared';
import type { AlgoliaCity } from '@vibe-travel/shared';

let searchClient: LiteClient | null = null;

export function getSearchClient(): LiteClient {
  if (searchClient) {
    return searchClient;
  }

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

  if (!appId) {
    throw new Error(
      'Missing NEXT_PUBLIC_ALGOLIA_APP_ID environment variable. ' +
      'Please add it to your .env.local file.'
    );
  }

  if (!searchKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_ALGOLIA_SEARCH_KEY environment variable. ' +
      'Please add it to your .env.local file.'
    );
  }

  searchClient = algoliasearch(appId, searchKey);
  return searchClient;
}

export function resetSearchClient(): void {
  searchClient = null;
}

export function getAgentId(): string {
  const agentId = process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID;

  if (!agentId) {
    throw new Error(
      'Missing NEXT_PUBLIC_ALGOLIA_AGENT_ID environment variable. ' +
      'Please add it to your .env.local file.'
    );
  }

  return agentId;
}

export function getIndexName(): string {
  return process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || INDEX_NAME;
}

export async function fetchCityById(id: string): Promise<AlgoliaCity | null> {
  const client = getSearchClient();
  const indexName = getIndexName();

  try {
    const { results } = await client.search<AlgoliaCity>({
      requests: [
        {
          indexName,
          query: '',
          filters: `objectID:${id}`,
          hitsPerPage: 1,
        },
      ],
    });

    const searchResults = results[0];
    if ('hits' in searchResults && searchResults.hits.length > 0) {
      return searchResults.hits[0];
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchCitiesByIds(ids: string[]): Promise<AlgoliaCity[]> {
  const client = getSearchClient();
  const indexName = getIndexName();

  try {
    const filters = ids.map((id) => `objectID:${id}`).join(' OR ');
    const { results } = await client.search<AlgoliaCity>({
      requests: [
        {
          indexName,
          query: '',
          filters,
          hitsPerPage: ids.length,
        },
      ],
    });

    const searchResults = results[0];
    if ('hits' in searchResults) {
      return searchResults.hits;
    }
    return [];
  } catch {
    return [];
  }
}

export interface EnhancedSearchOptions {
  query: string;
  expandedTerms?: string[];
  filters?: Record<string, string>;
  hitsPerPage?: number;
}

export interface EnhancedSearchResult {
  hits: AlgoliaCity[];
  nbHits: number;
  query: string;
  processingTimeMS: number;
}

export async function searchWithEnhancement(
  options: EnhancedSearchOptions
): Promise<EnhancedSearchResult> {
  const client = getSearchClient();
  const indexName = getIndexName();
  const { query, expandedTerms = [], hitsPerPage = 10 } = options;

  const knownVibeTags = [
    'romantic', 'scenic', 'adventurous', 'cultural', 'historic',
    'beach', 'coastal', 'tropical', 'nature', 'urban', 'bustling',
    'relaxing', 'luxury', 'artistic', 'nightlife', 'foodie', 'diverse'
  ];
  
  const matchingTags = expandedTerms.filter(term => 
    knownVibeTags.some(tag => tag.includes(term.toLowerCase()) || term.toLowerCase().includes(tag))
  ).slice(0, 3);
  
  const queryWords = query.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
  const matchingQueryTags = queryWords.filter(word =>
    knownVibeTags.some(tag => tag.includes(word) || word.includes(tag))
  );
  
  const allMatchingTags = [...new Set([...matchingQueryTags, ...matchingTags])].slice(0, 3);
  
  const searchQueries = allMatchingTags.length > 0
    ? [allMatchingTags.join(' '), query]
    : [query];

  console.log('[Enhanced Search] Trying queries:', searchQueries);

  for (const searchQuery of searchQueries) {
    try {
      const { results } = await client.search<AlgoliaCity>({
        requests: [
          {
            indexName,
            query: searchQuery,
            hitsPerPage,
          },
        ],
      });

      const searchResults = results[0];
      if ('hits' in searchResults && searchResults.hits.length > 0) {
        console.log('[Enhanced Search] Found', searchResults.hits.length, 'results for:', searchQuery);
        return {
          hits: searchResults.hits,
          nbHits: searchResults.nbHits || 0,
          query: searchQuery,
          processingTimeMS: searchResults.processingTimeMS || 0,
        };
      }
    } catch (error) {
      console.error('Search attempt failed:', error);
    }
  }
  
  try {
    console.log('[Enhanced Search] Trying empty query for all results');
    const { results } = await client.search<AlgoliaCity>({
      requests: [
        {
          indexName,
          query: '',
          hitsPerPage,
        },
      ],
    });

    const searchResults = results[0];
    if ('hits' in searchResults) {
      return {
        hits: searchResults.hits,
        nbHits: searchResults.nbHits || 0,
        query: '',
        processingTimeMS: searchResults.processingTimeMS || 0,
      };
    }
  } catch (error) {
    console.error('Final fallback search failed:', error);
  }

  return { hits: [], nbHits: 0, query, processingTimeMS: 0 };
}

export { getIndexSettings };
