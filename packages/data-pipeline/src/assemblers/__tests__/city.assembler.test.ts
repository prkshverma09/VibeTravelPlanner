import { describe, it, expect, vi } from 'vitest';
import {
  CityAssembler,
  AssembledCity,
  slugify,
  generateObjectId,
  validateAssembledCity,
} from '../city.assembler';
import { BaseCityData } from '../../generators/base-city.generator';
import { createMockLLMService } from '../../services/llm.service';
import { ImageService } from '../../services/image.service';

describe('City Assembler', () => {
  const mockLLMService = createMockLLMService();
  const imageService = new ImageService();

  const baseCity: BaseCityData = {
    city: 'Paris',
    country: 'France',
    continent: 'Europe',
    climate_type: 'Oceanic',
    best_time_to_visit: 'Spring',
  };

  it('should assemble all components correctly', async () => {
    const assembler = new CityAssembler({
      llmService: mockLLMService,
      imageService,
    });

    const result = await assembler.assemble(baseCity);

    expect(result.objectID).toBeTruthy();
    expect(result.city).toBe('Paris');
    expect(result.country).toBe('France');
    expect(result.continent).toBe('Europe');
    expect(result.description).toBeTruthy();
    expect(result.vibe_tags.length).toBeGreaterThan(0);
    expect(result.culture_score).toBeGreaterThanOrEqual(1);
    expect(result.culture_score).toBeLessThanOrEqual(10);
    expect(result.image_url).toBeTruthy();
  });

  it('should generate correct objectID from city/country', async () => {
    const assembler = new CityAssembler({
      llmService: mockLLMService,
      imageService,
    });

    const result = await assembler.assemble(baseCity);

    expect(result.objectID).toBe('paris-france');
  });

  it('should include scores from score generator', async () => {
    const assembler = new CityAssembler({
      llmService: mockLLMService,
      imageService,
    });

    const result = await assembler.assemble(baseCity);

    expect(result.culture_score).toBeDefined();
    expect(result.adventure_score).toBeDefined();
    expect(result.nature_score).toBeDefined();
    expect(result.beach_score).toBeDefined();
    expect(result.nightlife_score).toBeDefined();

    [
      result.culture_score,
      result.adventure_score,
      result.nature_score,
      result.beach_score,
      result.nightlife_score,
    ].forEach((score) => {
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  it('should include image URL from image service', async () => {
    const assembler = new CityAssembler({
      llmService: mockLLMService,
      imageService,
    });

    const result = await assembler.assemble(baseCity);

    expect(result.image_url).toContain('picsum.photos');
    expect(result.image_url).toMatch(/\/seed\/\d+\/\d+\/\d+/);
  });

  it('should handle LLM service failure gracefully', async () => {
    const failingLLMService = {
      enrichCity: vi.fn().mockRejectedValue(new Error('API Error')),
    };

    const assembler = new CityAssembler({
      llmService: failingLLMService,
      imageService,
    });

    const result = await assembler.assemble(baseCity);

    expect(result.description).toBeTruthy();
    expect(result.vibe_tags.length).toBeGreaterThan(0);
  });

  it('should skip enrichment when option is set', async () => {
    const trackedLLMService = {
      enrichCity: vi.fn(),
    };

    const assembler = new CityAssembler({
      llmService: trackedLLMService,
      imageService,
    });

    await assembler.assemble(baseCity, { skipEnrichment: true });

    expect(trackedLLMService.enrichCity).not.toHaveBeenCalled();
  });

  it('should assemble batch of cities', async () => {
    const assembler = new CityAssembler({
      llmService: mockLLMService,
      imageService,
    });

    const cities: BaseCityData[] = [
      baseCity,
      {
        city: 'Tokyo',
        country: 'Japan',
        continent: 'Asia',
        climate_type: 'Humid subtropical',
        best_time_to_visit: 'Spring',
      },
    ];

    const results = await assembler.assembleBatch(cities, { skipEnrichment: true });

    expect(results).toHaveLength(2);
    expect(results[0].city).toBe('Paris');
    expect(results[1].city).toBe('Tokyo');
  });

  it('should call progress callback', async () => {
    const assembler = new CityAssembler({
      llmService: mockLLMService,
      imageService,
    });

    const onProgress = vi.fn();

    await assembler.assemble(baseCity, { onProgress });

    expect(onProgress).toHaveBeenCalled();
    expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('Paris'));
  });

  it('should assemble synchronously with provided enrichment', () => {
    const assembler = new CityAssembler({
      llmService: mockLLMService,
      imageService,
    });

    const enrichment = {
      description: 'Custom description',
      vibe_tags: ['custom', 'tags'],
    };

    const result = assembler.assembleSync(baseCity, enrichment);

    expect(result.description).toBe('Custom description');
    expect(result.vibe_tags).toEqual(['custom', 'tags']);
  });
});

describe('Slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Paris')).toBe('paris');
  });

  it('should handle spaces', () => {
    expect(slugify('New York')).toBe('new-york');
  });

  it('should remove special characters', () => {
    expect(slugify('São Paulo')).toBe('sao-paulo');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Los  Angeles')).toBe('los-angeles');
  });
});

describe('Generate Object ID', () => {
  it('should generate slug-based ID', () => {
    const id = generateObjectId('Paris', 'France');
    expect(id).toBe('paris-france');
  });

  it('should generate unique IDs for different cities', () => {
    const id1 = generateObjectId('Paris', 'France');
    const id2 = generateObjectId('London', 'UK');
    expect(id1).not.toBe(id2);
  });

  it('should handle city name collisions with different countries', () => {
    const id1 = generateObjectId('Paris', 'France');
    const id2 = generateObjectId('Paris', 'Texas');
    expect(id1).not.toBe(id2);
  });
});

describe('Validate Assembled City', () => {
  const validCity: AssembledCity = {
    objectID: 'paris-france',
    city: 'Paris',
    country: 'France',
    continent: 'Europe',
    description: 'A beautiful city known for art and culture.',
    vibe_tags: ['romantic', 'artistic', 'historic'],
    culture_score: 9,
    adventure_score: 6,
    nature_score: 5,
    beach_score: 3,
    nightlife_score: 8,
    climate_type: 'Oceanic',
    best_time_to_visit: 'Spring',
    image_url: 'https://example.com/paris.jpg',
  };

  it('should validate valid assembled city', () => {
    expect(validateAssembledCity(validCity)).toBe(true);
  });

  it('should reject null', () => {
    expect(validateAssembledCity(null)).toBe(false);
  });

  it('should reject undefined', () => {
    expect(validateAssembledCity(undefined)).toBe(false);
  });

  it('should reject missing objectID', () => {
    const invalid = { ...validCity, objectID: '' };
    expect(validateAssembledCity(invalid)).toBe(false);
  });

  it('should reject empty vibe_tags', () => {
    const invalid = { ...validCity, vibe_tags: [] };
    expect(validateAssembledCity(invalid)).toBe(false);
  });

  it('should reject invalid score range (too low)', () => {
    const invalid = { ...validCity, culture_score: 0 };
    expect(validateAssembledCity(invalid)).toBe(false);
  });

  it('should reject invalid score range (too high)', () => {
    const invalid = { ...validCity, culture_score: 11 };
    expect(validateAssembledCity(invalid)).toBe(false);
  });

  it('should reject non-integer score', () => {
    const invalid = { ...validCity, culture_score: 7.5 };
    expect(validateAssembledCity(invalid)).toBe(false);
  });

  it('should reject missing description', () => {
    const invalid = { ...validCity, description: '' };
    expect(validateAssembledCity(invalid)).toBe(false);
  });

  it('should reject missing image_url', () => {
    const invalid = { ...validCity, image_url: '' };
    expect(validateAssembledCity(invalid)).toBe(false);
  });
});
