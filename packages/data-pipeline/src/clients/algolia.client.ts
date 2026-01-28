import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import {
  INDEX_NAME as SHARED_INDEX_NAME,
  EXPERIENCES_INDEX_NAME,
  getIndexSettings as getSharedIndexSettings,
  getEnhancedIndexSettings,
  getExperiencesIndexSettings,
  getSynonyms,
  AlgoliaSynonym,
} from '@vibe-travel/shared';

export interface AlgoliaClientOptions {
  appId: string;
  apiKey: string;
  indexName: string;
}

export interface UploadOptions {
  batchSize?: number;
  onProgress?: (progress: { uploaded: number; total: number }) => void;
  waitForTask?: boolean;
}

export interface UploadResult {
  success: boolean;
  error?: string;
  objectIDs?: string[];
  taskIDs?: number[];
}

export interface IndexSettings {
  searchableAttributes?: readonly string[] | string[];
  attributesForFaceting?: readonly string[] | string[];
  customRanking?: readonly string[] | string[];
  ranking?: readonly string[] | string[];
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
  attributesToSnippet?: string[];
  highlightPreTag?: string;
  highlightPostTag?: string;
  hitsPerPage?: number;
  mode?: 'neuralSearch' | 'keywordSearch';
}

const DEFAULT_BATCH_SIZE = 1000;

const sharedSettings = getSharedIndexSettings();

export const DEFAULT_INDEX_SETTINGS: IndexSettings = {
  searchableAttributes: [...sharedSettings.searchableAttributes],
  attributesForFaceting: [...sharedSettings.attributesForFaceting],
  customRanking: [...sharedSettings.customRanking],
  ranking: [...sharedSettings.ranking],
  attributesToHighlight: ['city', 'country', 'description', 'vibe_tags'],
  attributesToSnippet: ['description:50'],
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
  hitsPerPage: 20,
};

const enhancedSettings = getEnhancedIndexSettings();
export const ENHANCED_INDEX_SETTINGS: IndexSettings = {
  searchableAttributes: [...enhancedSettings.searchableAttributes],
  attributesForFaceting: [...enhancedSettings.attributesForFaceting],
  customRanking: [...enhancedSettings.customRanking],
  ranking: [...enhancedSettings.ranking],
  attributesToHighlight: ['city', 'country', 'description', 'vibe_tags', 'local_cuisine'],
  attributesToSnippet: ['description:50'],
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
  hitsPerPage: 20,
};

const experiencesSettings = getExperiencesIndexSettings();
export const EXPERIENCES_INDEX_SETTINGS: IndexSettings = {
  searchableAttributes: [...experiencesSettings.searchableAttributes],
  attributesForFaceting: [...experiencesSettings.attributesForFaceting],
  customRanking: [...experiencesSettings.customRanking],
  ranking: [...experiencesSettings.ranking],
  attributesToHighlight: ['name', 'description', 'vibe_tags', 'highlights'],
  attributesToSnippet: ['description:50'],
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
  hitsPerPage: 20,
};

export { SHARED_INDEX_NAME, EXPERIENCES_INDEX_NAME };

export class AlgoliaClient {
  private client: SearchClient;
  private index: SearchIndex;
  private indexName: string;

  constructor(options: AlgoliaClientOptions) {
    this.client = algoliasearch(options.appId, options.apiKey);
    this.indexName = options.indexName;
    this.index = this.client.initIndex(options.indexName);
  }

  async configureIndex(settings: IndexSettings = DEFAULT_INDEX_SETTINGS): Promise<void> {
    const response = await this.index.setSettings(settings);
    await this.index.waitTask(response.taskID);
    await this.configureSynonyms();
  }

  async configureSynonyms(): Promise<void> {
    const synonyms = getSynonyms();
    if (synonyms.length > 0 && typeof this.index.saveSynonyms === 'function') {
      try {
        const response = await this.index.saveSynonyms(
          synonyms.map((s: AlgoliaSynonym) => ({
            objectID: s.objectID,
            type: s.type,
            synonyms: [...s.synonyms],
          })),
          { replaceExistingSynonyms: true }
        );
        await this.index.waitTask(response.taskID);
      } catch (error) {
        console.warn('Failed to configure synonyms:', error);
      }
    }
  }

  async uploadRecords(
    records: Record<string, unknown>[],
    options?: UploadOptions
  ): Promise<UploadResult> {
    const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
    const objectIDs: string[] = [];
    const taskIDs: number[] = [];

    try {
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const response = await this.index.saveObjects(batch);

        objectIDs.push(...response.objectIDs);
        taskIDs.push(...response.taskIDs);

        options?.onProgress?.({
          uploaded: Math.min(i + batchSize, records.length),
          total: records.length,
        });
      }

      if (options?.waitForTask && taskIDs.length > 0) {
        for (const taskID of taskIDs) {
          await this.index.waitTask(taskID);
        }
      }

      return {
        success: true,
        objectIDs,
        taskIDs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        objectIDs,
        taskIDs,
      };
    }
  }

  async clearIndex(): Promise<void> {
    const response = await this.index.clearObjects();
    await this.index.waitTask(response.taskID);
  }

  async deleteRecords(objectIDs: string[]): Promise<void> {
    const response = await this.index.deleteObjects(objectIDs);
    await this.index.waitTask(response.taskIDs[0]);
  }

  async getRecord(objectID: string): Promise<Record<string, unknown> | null> {
    try {
      return await this.index.getObject(objectID);
    } catch {
      return null;
    }
  }

  async indexExists(): Promise<boolean> {
    try {
      await this.index.getSettings();
      return true;
    } catch {
      return false;
    }
  }

  async getIndexStats(): Promise<{
    entries: number;
    dataSize: number;
  }> {
    const settings = await this.index.getSettings();
    return {
      entries: 0,
      dataSize: 0,
      ...settings,
    };
  }

  getIndex(): SearchIndex {
    return this.index;
  }

  getClient(): SearchClient {
    return this.client;
  }

  getIndexName(): string {
    return this.indexName;
  }
}

export function createMockAlgoliaClient(): AlgoliaClient {
  const mockRecords = new Map<string, Record<string, unknown>>();
  let settings: IndexSettings = {};

  const mock = {
    configureIndex: async (newSettings: IndexSettings = DEFAULT_INDEX_SETTINGS): Promise<void> => {
      settings = newSettings;
    },
    uploadRecords: async (
      records: Record<string, unknown>[],
      options?: UploadOptions
    ): Promise<UploadResult> => {
      const objectIDs: string[] = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const objectID = (record.objectID as string) || `mock-${i}`;
        mockRecords.set(objectID, record);
        objectIDs.push(objectID);

        if (options?.onProgress && (i + 1) % 10 === 0) {
          options.onProgress({ uploaded: i + 1, total: records.length });
        }
      }

      options?.onProgress?.({ uploaded: records.length, total: records.length });

      return {
        success: true,
        objectIDs,
        taskIDs: [12345],
      };
    },
    clearIndex: async (): Promise<void> => {
      mockRecords.clear();
    },
    deleteRecords: async (objectIDs: string[]): Promise<void> => {
      for (const id of objectIDs) {
        mockRecords.delete(id);
      }
    },
    getRecord: async (objectID: string): Promise<Record<string, unknown> | null> => {
      return mockRecords.get(objectID) || null;
    },
    indexExists: async (): Promise<boolean> => {
      return true;
    },
    getIndexStats: async () => ({
      entries: mockRecords.size,
      dataSize: 0,
    }),
    getIndex: () => ({} as SearchIndex),
    getClient: () => ({} as SearchClient),
    getIndexName: () => 'mock-index',
    _getSettings: () => settings,
    _getRecords: () => mockRecords,
  };

  return mock as unknown as AlgoliaClient;
}
