import { test, expect } from '@playwright/test';
import algoliasearch from 'algoliasearch';

test.describe('Data Pipeline Integration', () => {
  const appId = process.env.ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  const indexName = process.env.ALGOLIA_INDEX_NAME || 'travel_destinations';

  test.skip(!appId || !adminKey, 'Skipping: Algolia credentials not configured');

  test.beforeAll(async () => {
    if (!appId || !adminKey) {
      console.log('Skipping data pipeline tests - Algolia credentials not set');
    }
  });

  test('should have populated index with cities', async () => {
    if (!appId || !adminKey) return;

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    const { nbHits } = await index.search('');
    expect(nbHits).toBeGreaterThan(0);
  });

  test('should have correct index settings', async () => {
    if (!appId || !adminKey) return;

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    const settings = await index.getSettings();
    expect(settings.searchableAttributes).toBeDefined();
    expect(settings.searchableAttributes).toContain('city');
    expect(settings.searchableAttributes).toContain('description');
  });

  test('should return results for city search', async () => {
    if (!appId || !adminKey) return;

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    const { hits } = await index.search('Paris');
    expect(hits.length).toBeGreaterThan(0);

    const parisHit = hits.find((hit: any) => hit.city === 'Paris');
    expect(parisHit).toBeDefined();
  });

  test('should return results for semantic/vibe query', async () => {
    if (!appId || !adminKey) return;

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    const { hits } = await index.search('romantic city');
    expect(hits.length).toBeGreaterThan(0);
  });

  test('should support faceting on scores', async () => {
    if (!appId || !adminKey) return;

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    const { facets } = await index.search('', {
      facets: ['culture_score', 'nightlife_score', 'continent']
    });

    expect(facets).toBeDefined();
  });

  test('should have cities with all required fields', async () => {
    if (!appId || !adminKey) return;

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    const { hits } = await index.search('', { hitsPerPage: 10 });

    const requiredFields = [
      'objectID', 'city', 'country', 'continent', 'description',
      'vibe_tags', 'culture_score', 'adventure_score', 'nature_score',
      'beach_score', 'nightlife_score', 'climate_type', 'best_time_to_visit',
      'image_url'
    ];

    hits.forEach((hit: any) => {
      requiredFields.forEach(field => {
        expect(hit[field], `Missing field: ${field}`).toBeDefined();
      });
    });
  });

  test('should have valid score ranges', async () => {
    if (!appId || !adminKey) return;

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    const { hits } = await index.search('', { hitsPerPage: 50 });

    const scoreFields = ['culture_score', 'adventure_score', 'nature_score', 'beach_score', 'nightlife_score'];

    hits.forEach((hit: any) => {
      scoreFields.forEach(field => {
        const score = hit[field];
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(10);
      });
    });
  });

  test('should have unique objectIDs', async () => {
    if (!appId || !adminKey) return;

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    const { hits } = await index.search('', { hitsPerPage: 100 });

    const objectIDs = hits.map((hit: any) => hit.objectID);
    const uniqueIDs = new Set(objectIDs);

    expect(uniqueIDs.size).toBe(objectIDs.length);
  });
});
