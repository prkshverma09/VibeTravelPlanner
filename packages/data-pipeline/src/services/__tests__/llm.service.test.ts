import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMService, EnrichmentResult, createMockLLMService } from '../llm.service';
import { BaseCityData } from '../../generators/base-city.generator';

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  description:
                    'A vibrant city known for its culture and cuisine. The streets pulse with energy and the architecture tells stories of centuries past.',
                  vibe_tags: ['artistic', 'romantic', 'historic', 'culinary', 'fashionable'],
                }),
              },
            },
          ],
        }),
      },
    },
  })),
}));

describe('LLM Service', () => {
  let service: LLMService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LLMService({ apiKey: 'test-key' });
  });

  it('should enrich city with description and vibe_tags', async () => {
    const baseCity: BaseCityData = {
      city: 'Paris',
      country: 'France',
      continent: 'Europe',
      climate_type: 'Oceanic',
      best_time_to_visit: 'Spring',
    };

    const result = await service.enrichCity(baseCity);

    expect(result.description).toBeTruthy();
    expect(result.description.length).toBeGreaterThan(50);
    expect(result.vibe_tags).toBeInstanceOf(Array);
    expect(result.vibe_tags.length).toBeGreaterThanOrEqual(3);
  });

  it('should generate array of string vibe_tags', async () => {
    const baseCity: BaseCityData = {
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring',
    };

    const result = await service.enrichCity(baseCity);

    result.vibe_tags.forEach((tag) => {
      expect(typeof tag).toBe('string');
      expect(tag.length).toBeGreaterThan(0);
    });
  });

  it('should handle batch enrichment', async () => {
    const cities: BaseCityData[] = [
      {
        city: 'Paris',
        country: 'France',
        continent: 'Europe',
        climate_type: 'Oceanic',
        best_time_to_visit: 'Spring',
      },
      {
        city: 'Tokyo',
        country: 'Japan',
        continent: 'Asia',
        climate_type: 'Humid subtropical',
        best_time_to_visit: 'Spring',
      },
    ];

    const results = await service.enrichCities(cities, { concurrency: 2 });

    expect(results).toHaveLength(2);
    results.forEach((result) => {
      expect(result.description).toBeTruthy();
      expect(result.vibe_tags.length).toBeGreaterThan(0);
    });
  });

  it('should validate LLM output format', () => {
    const validOutput = {
      description: 'A beautiful city',
      vibe_tags: ['modern', 'scenic'],
    };

    const isValid = service.validateEnrichmentOutput(validOutput);
    expect(isValid).toBe(true);
  });

  it('should reject invalid LLM output with empty description', () => {
    const invalidOutput = {
      description: '',
      vibe_tags: ['tag1'],
    };

    const isValid = service.validateEnrichmentOutput(invalidOutput);
    expect(isValid).toBe(false);
  });

  it('should reject invalid LLM output with empty tags', () => {
    const invalidOutput = {
      description: 'Some description',
      vibe_tags: [],
    };

    const isValid = service.validateEnrichmentOutput(invalidOutput);
    expect(isValid).toBe(false);
  });

  it('should reject null output', () => {
    const isValid = service.validateEnrichmentOutput(null);
    expect(isValid).toBe(false);
  });

  it('should reject undefined output', () => {
    const isValid = service.validateEnrichmentOutput(undefined);
    expect(isValid).toBe(false);
  });

  it('should reject output missing description', () => {
    const invalidOutput = {
      vibe_tags: ['tag1', 'tag2'],
    };

    const isValid = service.validateEnrichmentOutput(invalidOutput);
    expect(isValid).toBe(false);
  });

  it('should reject output missing vibe_tags', () => {
    const invalidOutput = {
      description: 'Some description',
    };

    const isValid = service.validateEnrichmentOutput(invalidOutput);
    expect(isValid).toBe(false);
  });

  it('should call progress callback during batch enrichment', async () => {
    const cities: BaseCityData[] = [
      {
        city: 'Paris',
        country: 'France',
        continent: 'Europe',
        climate_type: 'Oceanic',
        best_time_to_visit: 'Spring',
      },
      {
        city: 'Tokyo',
        country: 'Japan',
        continent: 'Asia',
        climate_type: 'Humid subtropical',
        best_time_to_visit: 'Spring',
      },
    ];

    const progressCallback = vi.fn();

    await service.enrichCities(cities, {
      concurrency: 1,
      onProgress: progressCallback,
    });

    expect(progressCallback).toHaveBeenCalledTimes(2);
    expect(progressCallback).toHaveBeenNthCalledWith(1, 1, 2);
    expect(progressCallback).toHaveBeenNthCalledWith(2, 2, 2);
  });
});

describe('Mock LLM Service', () => {
  it('should create a working mock service', async () => {
    const mockService = createMockLLMService();
    const baseCity: BaseCityData = {
      city: 'Paris',
      country: 'France',
      continent: 'Europe',
      climate_type: 'Oceanic',
      best_time_to_visit: 'Spring',
    };

    const result = await mockService.enrichCity(baseCity);

    expect(result.description).toContain('Paris');
    expect(result.description).toContain('France');
    expect(result.vibe_tags.length).toBeGreaterThan(0);
  });

  it('should handle batch enrichment with mock', async () => {
    const mockService = createMockLLMService();
    const cities: BaseCityData[] = [
      {
        city: 'Paris',
        country: 'France',
        continent: 'Europe',
        climate_type: 'Oceanic',
        best_time_to_visit: 'Spring',
      },
      {
        city: 'Tokyo',
        country: 'Japan',
        continent: 'Asia',
        climate_type: 'Humid subtropical',
        best_time_to_visit: 'Spring',
      },
    ];

    const results = await mockService.enrichCities(cities);

    expect(results).toHaveLength(2);
    expect(results[0].description).toContain('Paris');
    expect(results[1].description).toContain('Tokyo');
  });

  it('should validate output correctly', () => {
    const mockService = createMockLLMService();

    expect(
      mockService.validateEnrichmentOutput({
        description: 'Test',
        vibe_tags: ['tag'],
      })
    ).toBe(true);

    expect(mockService.validateEnrichmentOutput(null)).toBe(false);
    expect(
      mockService.validateEnrichmentOutput({ description: '', vibe_tags: [] })
    ).toBe(false);
  });
});
