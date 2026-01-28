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
  const { query, expandedTerms = [], filters = {}, hitsPerPage = 10 } = options;

  const enhancedQuery = expandedTerms.length > 0
    ? `${query} ${expandedTerms.join(' ')}`
    : query;

  const numericFilters: string[] = [];
  for (const [attr, condition] of Object.entries(filters)) {
    if (condition.startsWith('>')) {
      const value = condition.slice(1);
      numericFilters.push(`${attr} > ${value}`);
    } else if (condition.startsWith('<')) {
      const value = condition.slice(1);
      numericFilters.push(`${attr} < ${value}`);
    }
  }

  try {
    const { results } = await client.search<AlgoliaCity>({
      requests: [
        {
          indexName,
          query: enhancedQuery,
          hitsPerPage,
          ...(numericFilters.length > 0 && { numericFilters }),
        },
      ],
    });

    const searchResults = results[0];
    if ('hits' in searchResults) {
      return {
        hits: searchResults.hits,
        nbHits: searchResults.nbHits || 0,
        query: enhancedQuery,
        processingTimeMS: searchResults.processingTimeMS || 0,
      };
    }
    return { hits: [], nbHits: 0, query: enhancedQuery, processingTimeMS: 0 };
  } catch (error) {
    console.error('Enhanced search error:', error);
    return { hits: [], nbHits: 0, query: enhancedQuery, processingTimeMS: 0 };
  }
}

export { getIndexSettings };
