import { describe, it, expect } from 'vitest';
import { mockCities, getMockCityByName, getRandomMockCities } from '../cities.fixture';
import { AlgoliaCitySchema } from '../../schemas/city.schema';

describe('City Fixtures', () => {
  it('should have at least 10 mock cities', () => {
    expect(mockCities.length).toBeGreaterThanOrEqual(10);
  });

  it('should have all fixtures pass schema validation', () => {
    mockCities.forEach((city) => {
      const result = AlgoliaCitySchema.safeParse(city);
      expect(result.success, `City ${city.city} failed validation`).toBe(true);
    });
  });

  it('should cover multiple continents', () => {
    const continents = new Set(mockCities.map(c => c.continent));
    expect(continents.size).toBeGreaterThanOrEqual(4);
  });

  it('should have unique objectIDs', () => {
    const ids = mockCities.map(c => c.objectID);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should find city by name', () => {
    const tokyo = getMockCityByName('Tokyo');
    expect(tokyo).toBeDefined();
    expect(tokyo?.country).toBe('Japan');
  });

  it('should return undefined for non-existent city', () => {
    const nonExistent = getMockCityByName('NonExistentCity');
    expect(nonExistent).toBeUndefined();
  });

  it('should return random cities subset', () => {
    const randomCities = getRandomMockCities(3);
    expect(randomCities).toHaveLength(3);
  });

  it('should return all cities if count exceeds available', () => {
    const allCities = getRandomMockCities(100);
    expect(allCities.length).toBe(mockCities.length);
  });

  it('should have varied vibe_tags across fixtures', () => {
    const allTags = mockCities.flatMap(c => c.vibe_tags);
    const uniqueTags = new Set(allTags);
    expect(uniqueTags.size).toBeGreaterThanOrEqual(15);
  });

  it('should have varied score distributions', () => {
    const cultureScores = mockCities.map(c => c.culture_score);
    const uniqueCultureScores = new Set(cultureScores);
    expect(uniqueCultureScores.size).toBeGreaterThanOrEqual(5);
  });
});
