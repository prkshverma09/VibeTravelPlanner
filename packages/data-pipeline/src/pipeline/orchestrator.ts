import * as fs from 'fs/promises';
import { generateBaseCities } from '../generators/base-city.generator';
import { LLMService, createMockLLMService } from '../services/llm.service';
import { ImageService } from '../services/image.service';
import { CityAssembler, AssembledCity } from '../assemblers/city.assembler';
import {
  AlgoliaClient,
  createMockAlgoliaClient,
  DEFAULT_INDEX_SETTINGS,
} from '../clients/algolia.client';

export interface PipelineConfig {
  algoliaAppId: string;
  algoliaApiKey: string;
  algoliaIndexName?: string;
  openaiApiKey: string;
  openaiModel?: string;
}

export interface PipelineRunOptions {
  dryRun?: boolean;
  skipEnrichment?: boolean;
  cityCount?: number;
  outputFile?: string;
  onProgress?: (progress: PipelineProgress) => void;
}

export interface PipelineProgress {
  stage: PipelineStage;
  message: string;
  progress: number;
  total?: number;
}

export type PipelineStage =
  | 'initialization'
  | 'data-generation'
  | 'enrichment'
  | 'assembly'
  | 'upload'
  | 'complete';

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface PipelineResult {
  success: boolean;
  error?: string;
  stages: {
    initialization: StageStatus;
    dataGeneration: StageStatus;
    enrichment: StageStatus;
    assembly: StageStatus;
    upload: StageStatus;
  };
  cities?: AssembledCity[];
  outputFile?: string;
  stats: {
    totalCities: number;
    processedCities: number;
    duration: number;
  };
}

const DEFAULT_INDEX_NAME = 'travel_destinations';

function emitProgress(
  callback: PipelineRunOptions['onProgress'],
  stage: PipelineStage,
  message: string,
  progress: number,
  total?: number
): void {
  callback?.({ stage, message, progress, total });
}

export class PipelineOrchestrator {
  private llmService: LLMService;
  private imageService: ImageService;
  private assembler: CityAssembler;
  private algoliaClient: AlgoliaClient;

  constructor(
    config: PipelineConfig,
    dependencies?: {
      llmService?: LLMService;
      imageService?: ImageService;
      algoliaClient?: AlgoliaClient;
    }
  ) {
    this.llmService =
      dependencies?.llmService ||
      new LLMService({
        apiKey: config.openaiApiKey,
        model: config.openaiModel,
      });

    this.imageService = dependencies?.imageService || new ImageService();

    this.algoliaClient =
      dependencies?.algoliaClient ||
      new AlgoliaClient({
        appId: config.algoliaAppId,
        apiKey: config.algoliaApiKey,
        indexName: config.algoliaIndexName || DEFAULT_INDEX_NAME,
      });

    this.assembler = new CityAssembler({
      llmService: this.llmService,
      imageService: this.imageService,
    });
  }

  async run(options?: PipelineRunOptions): Promise<PipelineResult> {
    const startTime = Date.now();

    const result: PipelineResult = {
      success: false,
      stages: {
        initialization: 'pending',
        dataGeneration: 'pending',
        enrichment: 'pending',
        assembly: 'pending',
        upload: 'pending',
      },
      stats: {
        totalCities: 0,
        processedCities: 0,
        duration: 0,
      },
    };

    try {
      emitProgress(options?.onProgress, 'initialization', 'Initializing pipeline...', 0);
      result.stages.initialization = 'in_progress';

      if (!options?.dryRun) {
        await this.algoliaClient.configureIndex(DEFAULT_INDEX_SETTINGS);
      }
      result.stages.initialization = 'completed';

      emitProgress(
        options?.onProgress,
        'data-generation',
        'Generating base city data...',
        0
      );
      result.stages.dataGeneration = 'in_progress';

      let baseCities = generateBaseCities();

      if (options?.cityCount && options.cityCount < baseCities.length) {
        baseCities = baseCities.slice(0, options.cityCount);
      }

      result.stats.totalCities = baseCities.length;
      result.stages.dataGeneration = 'completed';

      emitProgress(
        options?.onProgress,
        'data-generation',
        `Generated ${baseCities.length} cities`,
        100,
        baseCities.length
      );

      result.stages.enrichment = options?.skipEnrichment ? 'skipped' : 'in_progress';
      result.stages.assembly = 'in_progress';

      const assembledCities: AssembledCity[] = [];

      for (let i = 0; i < baseCities.length; i++) {
        const baseCity = baseCities[i];

        emitProgress(
          options?.onProgress,
          options?.skipEnrichment ? 'assembly' : 'enrichment',
          `Processing ${baseCity.city} (${i + 1}/${baseCities.length})`,
          Math.round(((i + 1) / baseCities.length) * 100),
          baseCities.length
        );

        const assembled = await this.assembler.assemble(baseCity, {
          skipEnrichment: options?.skipEnrichment,
        });

        assembledCities.push(assembled);
        result.stats.processedCities = i + 1;
      }

      if (!options?.skipEnrichment) {
        result.stages.enrichment = 'completed';
      }
      result.stages.assembly = 'completed';

      result.cities = assembledCities;

      if (options?.outputFile) {
        await fs.writeFile(
          options.outputFile,
          JSON.stringify(assembledCities, null, 2),
          'utf-8'
        );
        result.outputFile = options.outputFile;
      }

      if (options?.dryRun) {
        result.stages.upload = 'skipped';
        emitProgress(
          options?.onProgress,
          'complete',
          'Dry run complete - no data uploaded',
          100
        );
      } else {
        result.stages.upload = 'in_progress';
        emitProgress(options?.onProgress, 'upload', 'Uploading to Algolia...', 0);

        const uploadResult = await this.algoliaClient.uploadRecords(
          assembledCities as unknown as Record<string, unknown>[],
          {
            waitForTask: true,
            onProgress: ({ uploaded, total }) => {
              emitProgress(
                options?.onProgress,
                'upload',
                `Uploaded ${uploaded}/${total} records`,
                Math.round((uploaded / total) * 100),
                total
              );
            },
          }
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        result.stages.upload = 'completed';
        emitProgress(
          options?.onProgress,
          'complete',
          `Successfully uploaded ${assembledCities.length} cities`,
          100
        );
      }

      result.success = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      result.success = false;

      if (result.stages.initialization === 'in_progress') {
        result.stages.initialization = 'failed';
      }
      if (result.stages.dataGeneration === 'in_progress') {
        result.stages.dataGeneration = 'failed';
      }
      if (result.stages.enrichment === 'in_progress') {
        result.stages.enrichment = 'failed';
      }
      if (result.stages.assembly === 'in_progress') {
        result.stages.assembly = 'failed';
      }
      if (result.stages.upload === 'in_progress') {
        result.stages.upload = 'failed';
      }
    }

    result.stats.duration = Date.now() - startTime;
    return result;
  }

  static create(config: PipelineConfig): PipelineOrchestrator {
    return new PipelineOrchestrator(config);
  }

  static createForTesting(): PipelineOrchestrator {
    return new PipelineOrchestrator(
      {
        algoliaAppId: 'mock-app',
        algoliaApiKey: 'mock-key',
        openaiApiKey: 'mock-openai-key',
      },
      {
        llmService: createMockLLMService(),
        algoliaClient: createMockAlgoliaClient(),
      }
    );
  }
}
