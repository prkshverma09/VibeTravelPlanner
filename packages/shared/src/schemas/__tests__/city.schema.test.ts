import { describe, it, expect } from 'vitest';
import { CitySchema, AlgoliaCitySchema } from '../city.schema';

describe('CitySchema', () => {
  const validCity = {
    city: 'Paris',
    country: 'France',
    continent: 'Europe',
    description: 'The city of lights and love',
    vibe_tags: ['romantic', 'artistic', 'historic'],
    culture_score: 10,
    adventure_score: 6,
    nature_score: 5,
    beach_score: 2,
    nightlife_score: 8,
    climate_type: 'Oceanic',
    best_time_to_visit: 'Spring or Fall',
    image_url: 'https://example.com/paris.jpg'
  };

  it('should validate a correct city object', () => {
    const result = CitySchema.safeParse(validCity);
    expect(result.success).toBe(true);
  });

  it('should reject scores outside 1-10 range', () => {
    const invalidCity = { ...validCity, culture_score: 15 };
    const result = CitySchema.safeParse(invalidCity);
    expect(result.success).toBe(false);
  });

  it('should reject scores below 1', () => {
    const invalidCity = { ...validCity, nightlife_score: 0 };
    const result = CitySchema.safeParse(invalidCity);
    expect(result.success).toBe(false);
  });

  it('should reject empty vibe_tags array', () => {
    const invalidCity = { ...validCity, vibe_tags: [] };
    const result = CitySchema.safeParse(invalidCity);
    expect(result.success).toBe(false);
  });

  it('should reject invalid image_url', () => {
    const invalidCity = { ...validCity, image_url: 'not-a-url' };
    const result = CitySchema.safeParse(invalidCity);
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const { city, ...missingCity } = validCity;
    const result = CitySchema.safeParse(missingCity);
    expect(result.success).toBe(false);
  });

  it('should reject invalid continent', () => {
    const invalidCity = { ...validCity, continent: 'Antarctica' };
    const result = CitySchema.safeParse(invalidCity);
    expect(result.success).toBe(false);
  });

  it('should accept all valid continents', () => {
    const continents = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
    continents.forEach(continent => {
      const city = { ...validCity, continent };
      const result = CitySchema.safeParse(city);
      expect(result.success, `Failed for continent: ${continent}`).toBe(true);
    });
  });
});

describe('AlgoliaCitySchema', () => {
  it('should require objectID field', () => {
    const cityWithoutId = {
      city: 'Berlin',
      country: 'Germany',
      continent: 'Europe',
      description: 'A creative hub',
      vibe_tags: ['artsy'],
      culture_score: 9,
      adventure_score: 7,
      nature_score: 6,
      beach_score: 1,
      nightlife_score: 10,
      climate_type: 'Oceanic',
      best_time_to_visit: 'Summer',
      image_url: 'https://example.com/berlin.jpg'
    };
    
    const result = AlgoliaCitySchema.safeParse(cityWithoutId);
    expect(result.success).toBe(false);
  });

  it('should validate AlgoliaCity with objectID', () => {
    const algoliaCity = {
      objectID: 'berlin-germany',
      city: 'Berlin',
      country: 'Germany',
      continent: 'Europe',
      description: 'A creative hub',
      vibe_tags: ['artsy'],
      culture_score: 9,
      adventure_score: 7,
      nature_score: 6,
      beach_score: 1,
      nightlife_score: 10,
      climate_type: 'Oceanic',
      best_time_to_visit: 'Summer',
      image_url: 'https://example.com/berlin.jpg'
    };
    
    const result = AlgoliaCitySchema.safeParse(algoliaCity);
    expect(result.success).toBe(true);
  });
});
