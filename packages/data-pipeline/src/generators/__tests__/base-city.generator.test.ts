import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateBaseCities,
  BaseCityData,
  getContinents,
  getCitiesByContinent,
  getCityByName,
  Continent,
} from '../base-city.generator';

describe('Base City Generator', () => {
  let cities: BaseCityData[];

  beforeAll(() => {
    cities = generateBaseCities();
  });

  it('should generate at least 50 cities', () => {
    expect(cities.length).toBeGreaterThanOrEqual(50);
  });

  it('should have required base fields', () => {
    cities.forEach((city) => {
      expect(city.city).toBeTruthy();
      expect(city.country).toBeTruthy();
      expect(city.continent).toBeTruthy();
      expect(city.climate_type).toBeTruthy();
      expect(city.best_time_to_visit).toBeTruthy();
    });
  });

  it('should cover multiple continents', () => {
    const continents = getContinents(cities);
    expect(continents.length).toBeGreaterThanOrEqual(5);
  });

  it('should have unique city-country combinations', () => {
    const keys = cities.map((c) => `${c.city.toLowerCase()}-${c.country.toLowerCase()}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('should have valid continent values', () => {
    const validContinents: Continent[] = [
      'Africa',
      'Asia',
      'Europe',
      'North America',
      'South America',
      'Oceania',
    ];
    cities.forEach((city) => {
      expect(validContinents).toContain(city.continent);
    });
  });

  it('should include major cities', () => {
    const cityNames = cities.map((c) => c.city.toLowerCase());
    expect(cityNames).toContain('tokyo');
    expect(cityNames).toContain('paris');
    expect(cityNames).toContain('new york');
  });

  it('should have cities from Asia', () => {
    const asianCities = getCitiesByContinent(cities, 'Asia');
    expect(asianCities.length).toBeGreaterThan(0);
    expect(asianCities.every((c) => c.continent === 'Asia')).toBe(true);
  });

  it('should have cities from Europe', () => {
    const europeanCities = getCitiesByContinent(cities, 'Europe');
    expect(europeanCities.length).toBeGreaterThan(0);
    expect(europeanCities.every((c) => c.continent === 'Europe')).toBe(true);
  });

  it('should have cities from North America', () => {
    const northAmericanCities = getCitiesByContinent(cities, 'North America');
    expect(northAmericanCities.length).toBeGreaterThan(0);
    expect(northAmericanCities.every((c) => c.continent === 'North America')).toBe(true);
  });

  it('should have cities from South America', () => {
    const southAmericanCities = getCitiesByContinent(cities, 'South America');
    expect(southAmericanCities.length).toBeGreaterThan(0);
    expect(southAmericanCities.every((c) => c.continent === 'South America')).toBe(true);
  });

  it('should have cities from Africa', () => {
    const africanCities = getCitiesByContinent(cities, 'Africa');
    expect(africanCities.length).toBeGreaterThan(0);
    expect(africanCities.every((c) => c.continent === 'Africa')).toBe(true);
  });

  it('should have cities from Oceania', () => {
    const oceaniaCities = getCitiesByContinent(cities, 'Oceania');
    expect(oceaniaCities.length).toBeGreaterThan(0);
    expect(oceaniaCities.every((c) => c.continent === 'Oceania')).toBe(true);
  });

  it('should find city by name', () => {
    const tokyo = getCityByName(cities, 'Tokyo');
    expect(tokyo).toBeDefined();
    expect(tokyo?.country).toBe('Japan');
  });

  it('should find city by name case-insensitively', () => {
    const paris = getCityByName(cities, 'PARIS');
    expect(paris).toBeDefined();
    expect(paris?.country).toBe('France');
  });

  it('should return undefined for non-existent city', () => {
    const nonExistent = getCityByName(cities, 'NonExistentCity');
    expect(nonExistent).toBeUndefined();
  });

  it('should have valid climate types', () => {
    cities.forEach((city) => {
      expect(city.climate_type.length).toBeGreaterThan(0);
      expect(typeof city.climate_type).toBe('string');
    });
  });

  it('should have best time to visit information', () => {
    cities.forEach((city) => {
      expect(city.best_time_to_visit.length).toBeGreaterThan(0);
      expect(typeof city.best_time_to_visit).toBe('string');
    });
  });
});
