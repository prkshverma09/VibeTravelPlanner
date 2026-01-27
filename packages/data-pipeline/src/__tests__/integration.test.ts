import { describe, it, expect, beforeAll } from 'vitest';
import { PipelineOrchestrator, PipelineResult } from '../pipeline/orchestrator';
import { AssembledCity, validateAssembledCity } from '../assemblers/city.assembler';
import { generateBaseCities, getContinents, Continent } from '../generators/base-city.generator';

describe('Data Pipeline Integration Test', () => {
  let pipelineResult: PipelineResult;

  beforeAll(async () => {
    const pipeline = PipelineOrchestrator.createForTesting();

    pipelineResult = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
    });
  });

  it('should complete pipeline successfully', () => {
    expect(pipelineResult.success).toBe(true);
  });

  it('should generate 50+ cities', () => {
    expect(pipelineResult.cities?.length).toBeGreaterThanOrEqual(50);
  });

  it('should have all stages completed or skipped', () => {
    expect(pipelineResult.stages.initialization).toBe('completed');
    expect(pipelineResult.stages.dataGeneration).toBe('completed');
    expect(pipelineResult.stages.assembly).toBe('completed');
    expect(['completed', 'skipped']).toContain(pipelineResult.stages.enrichment);
    expect(['completed', 'skipped']).toContain(pipelineResult.stages.upload);
  });

  it('should produce valid AssembledCity records', () => {
    pipelineResult.cities?.forEach((city) => {
      expect(validateAssembledCity(city)).toBe(true);
    });
  });
});

describe('City Data Completeness', () => {
  let cities: AssembledCity[];

  beforeAll(async () => {
    const pipeline = PipelineOrchestrator.createForTesting();
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
    });
    cities = result.cities || [];
  });

  it('should have unique objectIDs', () => {
    const objectIDs = cities.map((c) => c.objectID);
    const uniqueIDs = new Set(objectIDs);
    expect(uniqueIDs.size).toBe(objectIDs.length);
  });

  it('should have required string fields', () => {
    cities.forEach((city) => {
      expect(city.objectID).toBeTruthy();
      expect(typeof city.objectID).toBe('string');
      expect(city.city).toBeTruthy();
      expect(typeof city.city).toBe('string');
      expect(city.country).toBeTruthy();
      expect(typeof city.country).toBe('string');
      expect(city.continent).toBeTruthy();
      expect(typeof city.continent).toBe('string');
      expect(city.description).toBeTruthy();
      expect(typeof city.description).toBe('string');
      expect(city.climate_type).toBeTruthy();
      expect(typeof city.climate_type).toBe('string');
      expect(city.best_time_to_visit).toBeTruthy();
      expect(typeof city.best_time_to_visit).toBe('string');
      expect(city.image_url).toBeTruthy();
      expect(typeof city.image_url).toBe('string');
    });
  });

  it('should have valid vibe_tags', () => {
    cities.forEach((city) => {
      expect(Array.isArray(city.vibe_tags)).toBe(true);
      expect(city.vibe_tags.length).toBeGreaterThan(0);
      city.vibe_tags.forEach((tag) => {
        expect(typeof tag).toBe('string');
        expect(tag.length).toBeGreaterThan(0);
      });
    });
  });

  it('should have valid scores between 1-10', () => {
    cities.forEach((city) => {
      const scores = [
        city.culture_score,
        city.adventure_score,
        city.nature_score,
        city.beach_score,
        city.nightlife_score,
      ];

      scores.forEach((score) => {
        expect(Number.isInteger(score)).toBe(true);
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(10);
      });
    });
  });

  it('should have valid image URLs', () => {
    cities.forEach((city) => {
      expect(city.image_url.startsWith('https://')).toBe(true);
    });
  });
});

describe('Geographic Coverage', () => {
  let cities: AssembledCity[];
  let baseCities: ReturnType<typeof generateBaseCities>;

  beforeAll(async () => {
    baseCities = generateBaseCities();

    const pipeline = PipelineOrchestrator.createForTesting();
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
    });
    cities = result.cities || [];
  });

  it('should cover at least 5 continents', () => {
    const continents = getContinents(baseCities);
    expect(continents.length).toBeGreaterThanOrEqual(5);
  });

  it('should include cities from all expected continents', () => {
    const cityToContinentMap = new Map<string, Continent>();
    baseCities.forEach((bc) => {
      cityToContinentMap.set(bc.city.toLowerCase(), bc.continent as Continent);
    });

    const assembledContinents = new Set<string>();
    cities.forEach((city) => {
      const continent = cityToContinentMap.get(city.city.toLowerCase());
      if (continent) {
        assembledContinents.add(continent);
      }
    });

    expect(assembledContinents.has('Asia')).toBe(true);
    expect(assembledContinents.has('Europe')).toBe(true);
    expect(assembledContinents.has('North America')).toBe(true);
    expect(assembledContinents.has('South America')).toBe(true);
    expect(assembledContinents.has('Africa')).toBe(true);
    expect(assembledContinents.has('Oceania')).toBe(true);
  });

  it('should include major world cities', () => {
    const cityNames = cities.map((c) => c.city.toLowerCase());

    expect(cityNames).toContain('tokyo');
    expect(cityNames).toContain('paris');
    expect(cityNames).toContain('new york');
    expect(cityNames).toContain('london');
    expect(cityNames).toContain('sydney');
  });
});

describe('Score Distribution', () => {
  let cities: AssembledCity[];

  beforeAll(async () => {
    const pipeline = PipelineOrchestrator.createForTesting();
    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
    });
    cities = result.cities || [];
  });

  it('should have varied culture scores', () => {
    const scores = cities.map((c) => c.culture_score);
    const uniqueScores = new Set(scores);
    expect(uniqueScores.size).toBeGreaterThan(3);
  });

  it('should have varied beach scores', () => {
    const scores = cities.map((c) => c.beach_score);
    const uniqueScores = new Set(scores);
    expect(uniqueScores.size).toBeGreaterThan(3);
  });

  it('should have high culture scores for cultural capitals', () => {
    const paris = cities.find((c) => c.city.toLowerCase() === 'paris');
    const rome = cities.find((c) => c.city.toLowerCase() === 'rome');
    const tokyo = cities.find((c) => c.city.toLowerCase() === 'tokyo');

    expect(paris?.culture_score).toBeGreaterThanOrEqual(8);
    expect(rome?.culture_score).toBeGreaterThanOrEqual(8);
    expect(tokyo?.culture_score).toBeGreaterThanOrEqual(8);
  });

  it('should have high beach scores for beach cities', () => {
    const miami = cities.find((c) => c.city.toLowerCase() === 'miami');
    const bali = cities.find((c) => c.city.toLowerCase() === 'bali');

    expect(miami?.beach_score).toBeGreaterThanOrEqual(7);
    expect(bali?.beach_score).toBeGreaterThanOrEqual(7);
  });
});

describe('Pipeline Performance', () => {
  it('should complete within reasonable time', async () => {
    const pipeline = PipelineOrchestrator.createForTesting();
    const startTime = Date.now();

    await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 50,
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000);
  });

  it('should handle large batches', async () => {
    const pipeline = PipelineOrchestrator.createForTesting();

    const result = await pipeline.run({
      dryRun: true,
      skipEnrichment: true,
    });

    expect(result.success).toBe(true);
    expect(result.cities?.length).toBeGreaterThanOrEqual(50);
  });
});

describe('Data Consistency', () => {
  it('should produce deterministic results', async () => {
    const pipeline1 = PipelineOrchestrator.createForTesting();
    const pipeline2 = PipelineOrchestrator.createForTesting();

    const result1 = await pipeline1.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 10,
    });

    const result2 = await pipeline2.run({
      dryRun: true,
      skipEnrichment: true,
      cityCount: 10,
    });

    expect(result1.cities?.length).toBe(result2.cities?.length);

    result1.cities?.forEach((city1, index) => {
      const city2 = result2.cities?.[index];
      expect(city1.objectID).toBe(city2?.objectID);
      expect(city1.city).toBe(city2?.city);
      expect(city1.country).toBe(city2?.country);
      expect(city1.culture_score).toBe(city2?.culture_score);
      expect(city1.beach_score).toBe(city2?.beach_score);
    });
  });
});
