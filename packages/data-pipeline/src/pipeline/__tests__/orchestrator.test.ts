import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs/promises';
import { PipelineOrchestrator, PipelineResult, PipelineProgress } from '../orchestrator';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

describe('Pipeline Orchestrator', () => {
  let pipeline: PipelineOrchestrator;

  beforeEach(() => {
    vi.clearAllMocks();
    pipeline = PipelineOrchestrator.createForTesting();
  });

  it('should complete a dry run successfully', async () => {
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 5,
    });

    expect(result.success).toBe(true);
    expect(result.stages.initialization).toBe('completed');
    expect(result.stages.dataGeneration).toBe('completed');
    expect(result.stages.assembly).toBe('completed');
    expect(result.stages.upload).toBe('skipped');
  });

  it('should generate assembled cities', async () => {
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 5,
    });

    expect(result.cities).toBeDefined();
    expect(result.cities?.length).toBe(5);
  });

  it('should limit city count when specified', async () => {
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 3,
    });

    expect(result.cities?.length).toBe(3);
    expect(result.stats.totalCities).toBe(3);
  });

  it('should report progress during execution', async () => {
    const progressEvents: PipelineProgress[] = [];

    await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 3,
      onProgress: (progress) => {
        progressEvents.push(progress);
      },
    });

    expect(progressEvents.length).toBeGreaterThan(0);
    expect(progressEvents.some((p) => p.stage === 'initialization')).toBe(true);
    expect(progressEvents.some((p) => p.stage === 'data-generation')).toBe(true);
  });

  it('should write output file when specified', async () => {
    const outputPath = '/tmp/test-output.json';

    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 2,
      outputFile: outputPath,
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      outputPath,
      expect.any(String),
      'utf-8'
    );
    expect(result.outputFile).toBe(outputPath);
  });

  it('should track processing statistics', async () => {
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 5,
    });

    expect(result.stats.totalCities).toBe(5);
    expect(result.stats.processedCities).toBe(5);
    expect(result.stats.duration).toBeGreaterThanOrEqual(0);
  });

  it('should skip enrichment when option is set', async () => {
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 2,
    });

    expect(result.stages.enrichment).toBe('skipped');
    expect(result.success).toBe(true);
  });

  it('should upload to Algolia when not in dry run mode', async () => {
    const result = await pipeline.run({
      dryRun: false,
      skipEnrichment: true,
      cityCount: 2,
    });

    expect(result.success).toBe(true);
    expect(result.stages.upload).toBe('completed');
  });

  it('should generate valid assembled cities', async () => {
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 3,
    });

    result.cities?.forEach((city) => {
      expect(city.objectID).toBeTruthy();
      expect(city.city).toBeTruthy();
      expect(city.country).toBeTruthy();
      expect(city.continent).toBeTruthy();
      expect(city.description).toBeTruthy();
      expect(city.vibe_tags.length).toBeGreaterThan(0);
      expect(city.culture_score).toBeGreaterThanOrEqual(1);
      expect(city.culture_score).toBeLessThanOrEqual(10);
      expect(city.image_url).toBeTruthy();
    });
  });

  it('should have unique objectIDs for all cities', async () => {
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 10,
    });

    const objectIDs = result.cities?.map((c) => c.objectID) || [];
    const uniqueIDs = new Set(objectIDs);

    expect(uniqueIDs.size).toBe(objectIDs.length);
  });
});

describe('Pipeline Orchestrator Factory', () => {
  it('should create pipeline with config', () => {
    const config = {
      algoliaAppId: 'test-app',
      algoliaApiKey: 'test-key',
      openaiApiKey: 'test-openai',
    };

    const pipeline = PipelineOrchestrator.create(config);

    expect(pipeline).toBeInstanceOf(PipelineOrchestrator);
  });

  it('should create test pipeline', () => {
    const pipeline = PipelineOrchestrator.createForTesting();

    expect(pipeline).toBeInstanceOf(PipelineOrchestrator);
  });
});

describe('Pipeline Error Handling', () => {
  it('should set failed status on error', async () => {
    const failingPipeline = new PipelineOrchestrator(
      {
        algoliaAppId: 'test',
        algoliaApiKey: 'test',
        openaiApiKey: 'test',
      },
      {
        llmService: {
          enrichCity: vi.fn().mockRejectedValue(new Error('LLM Error')),
        } as unknown as Parameters<typeof PipelineOrchestrator.prototype.run>[0] extends infer T
          ? T extends { llmService: infer L }
            ? L
            : never
          : never,
      }
    );

    const result = await failingPipeline.run({
      dryRun: true,
      cityCount: 1,
    });

    expect(result.success).toBe(true);
    expect(result.cities?.[0].description).toBeTruthy();
  });

  it('should include error message in result', async () => {
    const mockAlgoliaClient = {
      configureIndex: vi.fn().mockRejectedValue(new Error('Config failed')),
      uploadRecords: vi.fn(),
    };

    const failingPipeline = new PipelineOrchestrator(
      {
        algoliaAppId: 'test',
        algoliaApiKey: 'test',
        openaiApiKey: 'test',
      },
      {
        algoliaClient: mockAlgoliaClient as unknown as Parameters<
          typeof PipelineOrchestrator.prototype.run
        >[0] extends infer T
          ? T extends { algoliaClient: infer A }
            ? A
            : never
          : never,
      }
    );

    const result = await failingPipeline.run({
      dryRun: false,
      cityCount: 1,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Config failed');
  });
});
