import { describe, it, expect } from 'vitest';
import {
  enhancedMockCities,
  getEnhancedMockCityByName,
  getEnhancedCitiesByBudget,
  getEnhancedCitiesByMonth,
  getEnhancedCitiesByContinent
} from '../enhanced-cities.fixture';
import { EnhancedAlgoliaCitySchema } from '../../schemas';

describe('Enhanced City Fixtures', () => {
  it('should have at least 20 mock cities', () => {
    expect(enhancedMockCities.length).toBeGreaterThanOrEqual(20);
  });

  it('should have all fixtures pass enhanced schema validation', () => {
    enhancedMockCities.forEach(city => {
      const result = EnhancedAlgoliaCitySchema.safeParse(city);
      expect(result.success, `City ${city.city} failed validation: ${JSON.stringify(result.error?.issues)}`).toBe(true);
    });
  });

  it('should have all budget tiers represented', () => {
    const budgetTiers = new Set(enhancedMockCities.map(c => c.budget_tier));
    expect(budgetTiers).toContain('budget');
    expect(budgetTiers).toContain('mid-range');
    expect(budgetTiers).toContain('luxury');
  });

  it('should have multiple continents represented', () => {
    const continents = new Set(enhancedMockCities.map(c => c.continent));
    expect(continents.size).toBeGreaterThanOrEqual(4);
  });

  it('should have cities with seasonal events', () => {
    const citiesWithEvents = enhancedMockCities.filter(c => c.seasonal_events.length > 0);
    expect(citiesWithEvents.length).toBeGreaterThanOrEqual(5);
  });

  it('should have unique objectIDs', () => {
    const ids = enhancedMockCities.map(c => c.objectID);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  describe('getEnhancedMockCityByName', () => {
    it('should find city by name (case insensitive)', () => {
      const tokyo = getEnhancedMockCityByName('tokyo');
      expect(tokyo).toBeDefined();
      expect(tokyo?.city).toBe('Tokyo');
    });

    it('should return undefined for non-existent city', () => {
      const notFound = getEnhancedMockCityByName('atlantis');
      expect(notFound).toBeUndefined();
    });
  });

  describe('getEnhancedCitiesByBudget', () => {
    it('should filter cities by budget tier', () => {
      const budgetCities = getEnhancedCitiesByBudget('budget');
      expect(budgetCities.length).toBeGreaterThan(0);
      budgetCities.forEach(city => {
        expect(city.budget_tier).toBe('budget');
      });
    });

    it('should return mid-range cities', () => {
      const midRangeCities = getEnhancedCitiesByBudget('mid-range');
      expect(midRangeCities.length).toBeGreaterThan(0);
    });

    it('should return luxury cities', () => {
      const luxuryCities = getEnhancedCitiesByBudget('luxury');
      expect(luxuryCities.length).toBeGreaterThan(0);
    });
  });

  describe('getEnhancedCitiesByMonth', () => {
    it('should filter cities by best month', () => {
      const marchCities = getEnhancedCitiesByMonth('march');
      expect(marchCities.length).toBeGreaterThan(0);
      marchCities.forEach(city => {
        expect(city.best_months).toContain('march');
      });
    });

    it('should work for different months', () => {
      const octoberCities = getEnhancedCitiesByMonth('october');
      expect(octoberCities.length).toBeGreaterThan(0);
    });
  });

  describe('getEnhancedCitiesByContinent', () => {
    it('should filter cities by continent', () => {
      const asiaCities = getEnhancedCitiesByContinent('Asia');
      expect(asiaCities.length).toBeGreaterThan(0);
      asiaCities.forEach(city => {
        expect(city.continent).toBe('Asia');
      });
    });

    it('should filter European cities', () => {
      const europeCities = getEnhancedCitiesByContinent('Europe');
      expect(europeCities.length).toBeGreaterThan(0);
    });
  });

  describe('Data Quality', () => {
    it('should have valid cost breakdowns', () => {
      enhancedMockCities.forEach(city => {
        expect(city.cost_breakdown.accommodation_per_night).toBeGreaterThanOrEqual(0);
        expect(city.cost_breakdown.meal_average).toBeGreaterThanOrEqual(0);
        expect(city.cost_breakdown.transportation_daily).toBeGreaterThanOrEqual(0);
        expect(city.cost_breakdown.activities_daily).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have safety ratings in valid range', () => {
      enhancedMockCities.forEach(city => {
        expect(city.safety_rating).toBeGreaterThanOrEqual(1);
        expect(city.safety_rating).toBeLessThanOrEqual(10);
      });
    });

    it('should have non-empty local_cuisine arrays', () => {
      enhancedMockCities.forEach(city => {
        expect(city.local_cuisine.length).toBeGreaterThan(0);
      });
    });

    it('should have valid image URLs', () => {
      enhancedMockCities.forEach(city => {
        expect(city.image_url).toMatch(/^https?:\/\//);
      });
    });
  });
});
