import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AlgoliaClient,
  createMockAlgoliaClient,
  DEFAULT_INDEX_SETTINGS,
} from '../algolia.client';

vi.mock('algoliasearch', () => ({
  default: vi.fn().mockImplementation(() => ({
    initIndex: vi.fn().mockReturnValue({
      setSettings: vi.fn().mockResolvedValue({ taskID: 1 }),
      waitTask: vi.fn().mockResolvedValue({}),
      saveObjects: vi.fn().mockResolvedValue({
        objectIDs: ['obj1', 'obj2'],
        taskIDs: [1, 2],
      }),
      clearObjects: vi.fn().mockResolvedValue({ taskID: 1 }),
      deleteObjects: vi.fn().mockResolvedValue({ taskIDs: [1] }),
      getObject: vi.fn().mockResolvedValue({ objectID: 'test' }),
      getSettings: vi.fn().mockResolvedValue({}),
    }),
  })),
}));

describe('Algolia Client', () => {
  let client: AlgoliaClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new AlgoliaClient({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      indexName: 'test-index',
    });
  });

  it('should initialize with correct index name', () => {
    expect(client.getIndexName()).toBe('test-index');
  });

  it('should configure index with default settings', async () => {
    await client.configureIndex();
    expect(client.getIndex().setSettings).toHaveBeenCalled();
  });

  it('should configure index with custom settings', async () => {
    const customSettings = {
      searchableAttributes: ['city', 'country'],
      hitsPerPage: 10,
    };

    await client.configureIndex(customSettings);
    expect(client.getIndex().setSettings).toHaveBeenCalledWith(customSettings);
  });

  it('should upload records successfully', async () => {
    const records = [
      { objectID: 'city-1', city: 'Paris' },
      { objectID: 'city-2', city: 'Tokyo' },
    ];

    const result = await client.uploadRecords(records);

    expect(result.success).toBe(true);
    expect(result.objectIDs).toContain('obj1');
    expect(result.objectIDs).toContain('obj2');
  });

  it('should upload records in batches', async () => {
    const records = Array.from({ length: 25 }, (_, i) => ({
      objectID: `city-${i}`,
      city: `City ${i}`,
    }));

    const onProgress = vi.fn();

    await client.uploadRecords(records, {
      batchSize: 10,
      onProgress,
    });

    expect(onProgress).toHaveBeenCalled();
  });

  it('should clear index', async () => {
    await client.clearIndex();
    expect(client.getIndex().clearObjects).toHaveBeenCalled();
  });

  it('should delete specific records', async () => {
    await client.deleteRecords(['city-1', 'city-2']);
    expect(client.getIndex().deleteObjects).toHaveBeenCalledWith([
      'city-1',
      'city-2',
    ]);
  });

  it('should get single record', async () => {
    const record = await client.getRecord('test-id');
    expect(record).toBeDefined();
  });

  it('should check if index exists', async () => {
    const exists = await client.indexExists();
    expect(exists).toBe(true);
  });
});

describe('Default Index Settings', () => {
  it('should have searchableAttributes', () => {
    expect(DEFAULT_INDEX_SETTINGS.searchableAttributes).toBeDefined();
    expect(DEFAULT_INDEX_SETTINGS.searchableAttributes).toContain('city');
    expect(DEFAULT_INDEX_SETTINGS.searchableAttributes).toContain('country');
    expect(DEFAULT_INDEX_SETTINGS.searchableAttributes).toContain('description');
    expect(DEFAULT_INDEX_SETTINGS.searchableAttributes).toContain('vibe_tags');
  });

  it('should have attributesForFaceting', () => {
    expect(DEFAULT_INDEX_SETTINGS.attributesForFaceting).toBeDefined();
    expect(DEFAULT_INDEX_SETTINGS.attributesForFaceting).toContain('filterOnly(continent)');
    expect(DEFAULT_INDEX_SETTINGS.attributesForFaceting).toContain('searchable(climate_type)');
  });

  it('should have customRanking', () => {
    expect(DEFAULT_INDEX_SETTINGS.customRanking).toBeDefined();
    expect(DEFAULT_INDEX_SETTINGS.customRanking!.length).toBeGreaterThan(0);
  });

  it('should have highlight settings', () => {
    expect(DEFAULT_INDEX_SETTINGS.highlightPreTag).toBe('<mark>');
    expect(DEFAULT_INDEX_SETTINGS.highlightPostTag).toBe('</mark>');
  });
});

describe('Mock Algolia Client', () => {
  it('should create working mock client', async () => {
    const mockClient = createMockAlgoliaClient();

    const records = [
      { objectID: 'city-1', city: 'Paris' },
      { objectID: 'city-2', city: 'Tokyo' },
    ];

    const result = await mockClient.uploadRecords(records);

    expect(result.success).toBe(true);
    expect(result.objectIDs).toHaveLength(2);
  });

  it('should store and retrieve records', async () => {
    const mockClient = createMockAlgoliaClient();

    await mockClient.uploadRecords([{ objectID: 'test-1', city: 'Paris' }]);

    const record = await mockClient.getRecord('test-1');
    expect(record).toBeDefined();
    expect(record?.city).toBe('Paris');
  });

  it('should clear all records', async () => {
    const mockClient = createMockAlgoliaClient();

    await mockClient.uploadRecords([
      { objectID: 'city-1', city: 'Paris' },
      { objectID: 'city-2', city: 'Tokyo' },
    ]);

    await mockClient.clearIndex();

    const record = await mockClient.getRecord('city-1');
    expect(record).toBeNull();
  });

  it('should delete specific records', async () => {
    const mockClient = createMockAlgoliaClient();

    await mockClient.uploadRecords([
      { objectID: 'city-1', city: 'Paris' },
      { objectID: 'city-2', city: 'Tokyo' },
    ]);

    await mockClient.deleteRecords(['city-1']);

    const deleted = await mockClient.getRecord('city-1');
    const remaining = await mockClient.getRecord('city-2');

    expect(deleted).toBeNull();
    expect(remaining).toBeDefined();
  });

  it('should configure index settings', async () => {
    const mockClient = createMockAlgoliaClient() as unknown as {
      configureIndex: (settings: typeof DEFAULT_INDEX_SETTINGS) => Promise<void>;
      _getSettings: () => typeof DEFAULT_INDEX_SETTINGS;
    };

    await mockClient.configureIndex(DEFAULT_INDEX_SETTINGS);

    const settings = mockClient._getSettings();
    expect(settings).toEqual(DEFAULT_INDEX_SETTINGS);
  });

  it('should report progress during upload', async () => {
    const mockClient = createMockAlgoliaClient();
    const onProgress = vi.fn();

    const records = Array.from({ length: 25 }, (_, i) => ({
      objectID: `city-${i}`,
      city: `City ${i}`,
    }));

    await mockClient.uploadRecords(records, { onProgress });

    expect(onProgress).toHaveBeenLastCalledWith({ uploaded: 25, total: 25 });
  });

  it('should return correct index stats', async () => {
    const mockClient = createMockAlgoliaClient();

    await mockClient.uploadRecords([
      { objectID: 'city-1', city: 'Paris' },
      { objectID: 'city-2', city: 'Tokyo' },
    ]);

    const stats = await mockClient.getIndexStats();
    expect(stats.entries).toBe(2);
  });
});
