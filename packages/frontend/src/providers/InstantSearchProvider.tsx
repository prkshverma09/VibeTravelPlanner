'use client';

import { InstantSearch } from 'react-instantsearch';
import { getSearchClient, getIndexName } from '@/lib/algolia';
import aa from 'search-insights';
import { useEffect, useState, type ReactNode } from 'react';

interface InstantSearchProviderProps {
  children: ReactNode;
}

export function InstantSearchProvider({ children }: InstantSearchProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchClient, setSearchClient] = useState<ReturnType<typeof getSearchClient> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const client = getSearchClient();
      setSearchClient(client);

      const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
      const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

      if (appId && apiKey) {
        aa('init', {
          appId,
          apiKey,
          useCookie: true,
        });
      }

      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize search');
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg" data-testid="search-error">
        <p className="font-semibold">Search Configuration Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!isInitialized || !searchClient) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="search-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={getIndexName()}
      insights={true}
    >
      {children}
    </InstantSearch>
  );
}
