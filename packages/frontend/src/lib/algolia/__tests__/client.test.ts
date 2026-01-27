import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSearchClient, resetSearchClient, getAgentId, getIndexName } from '../client';

vi.mock('algoliasearch/lite', () => ({
  liteClient: vi.fn().mockReturnValue({
    search: vi.fn(),
  }),
}));

describe('Algolia Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetSearchClient();
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getSearchClient', () => {
    it('should create search client with env variables', () => {
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'test-app-id';
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY = 'test-search-key';

      const client = getSearchClient();
      expect(client).toBeDefined();
    });

    it('should throw error if ALGOLIA_APP_ID is missing', () => {
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY = 'test-key';
      delete process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;

      expect(() => getSearchClient()).toThrow('NEXT_PUBLIC_ALGOLIA_APP_ID');
    });

    it('should throw error if ALGOLIA_SEARCH_KEY is missing', () => {
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'test-app';
      delete process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

      expect(() => getSearchClient()).toThrow('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY');
    });

    it('should return singleton instance', () => {
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'test-app';
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY = 'test-key';

      const client1 = getSearchClient();
      const client2 = getSearchClient();

      expect(client1).toBe(client2);
    });
  });

  describe('getAgentId', () => {
    it('should return agent ID from env', () => {
      process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID = 'test-agent-id';

      const agentId = getAgentId();
      expect(agentId).toBe('test-agent-id');
    });

    it('should throw error if agent ID is missing', () => {
      delete process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID;

      expect(() => getAgentId()).toThrow('NEXT_PUBLIC_ALGOLIA_AGENT_ID');
    });
  });

  describe('getIndexName', () => {
    it('should return index name from env if set', () => {
      process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME = 'custom_index';

      const indexName = getIndexName();
      expect(indexName).toBe('custom_index');
    });

    it('should return default index name if env not set', () => {
      delete process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

      const indexName = getIndexName();
      expect(indexName).toBe('travel_destinations');
    });
  });
});
