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

export { getIndexSettings };
