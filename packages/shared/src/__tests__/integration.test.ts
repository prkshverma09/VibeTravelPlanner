import { describe, it, expect } from 'vitest';
import {
  type City,
  type AlgoliaCity,
  type ClickEvent,
  type ConversionEvent,
  CitySchema,
  AlgoliaCitySchema,
  INDEX_NAME,
  SEARCHABLE_ATTRIBUTES,
  ATTRIBUTES_FOR_FACETING,
  getIndexSettings,
  mockCities,
  getMockCityByName,
  generateObjectId,
  slugify,
  normalizeScore,
  truncateDescription
} from '../index';

describe('Shared Package Integration', () => {
  it('should export all types', () => {
    const city: City = mockCities[0];
    expect(city).toBeDefined();
    expect(city.city).toBeDefined();
    expect(city.country).toBeDefined();
  });

  it('should export all event types', () => {
    const clickEvent: ClickEvent = {
      eventType: 'click',
      eventName: 'Test Click',
      index: INDEX_NAME,
      objectIDs: ['test-id'],
      userToken: 'user-123'
    };

    const conversionEvent: ConversionEvent = {
      eventType: 'conversion',
      eventName: 'Test Conversion',
      index: INDEX_NAME,
      objectIDs: ['test-id'],
      userToken: 'user-123'
    };

    expect(clickEvent.eventType).toBe('click');
    expect(conversionEvent.eventType).toBe('conversion');
  });

  it('should validate fixtures with schemas', () => {
    mockCities.forEach(city => {
      const result = AlgoliaCitySchema.safeParse(city);
      expect(result.success, `Validation failed for ${city.city}`).toBe(true);
    });
  });

  it('should have consistent config', () => {
    expect(INDEX_NAME).toBe('travel_destinations');
    const settings = getIndexSettings();
    expect(settings.searchableAttributes).toEqual(SEARCHABLE_ATTRIBUTES);
    expect(settings.attributesForFaceting).toEqual(ATTRIBUTES_FOR_FACETING);
  });

  it('should have working utilities', () => {
    const city = getMockCityByName('Tokyo');
    if (city) {
      const id = generateObjectId(city.city, city.country);
      expect(id).toBe('tokyo-japan');
    }
  });

  it('should build settings matching PRD requirements', () => {
    const settings = getIndexSettings();
    expect(settings.searchableAttributes).toContain('description');
    expect(settings.searchableAttributes).toContain('vibe_tags');
    expect(settings.attributesForFaceting).toContain('culture_score');
    expect(settings.attributesForFaceting).toContain('filterOnly(continent)');
  });

  it('should have all utilities working together', () => {
    const rawCity = 'São Paulo';
    const rawCountry = 'Brazil';
    
    const slug = slugify(rawCity);
    expect(slug).toBe('sao-paulo');
    
    const objectId = generateObjectId(rawCity, rawCountry);
    expect(objectId).toBe('sao-paulo-brazil');
    
    const score = normalizeScore(7.8, 1, 10);
    expect(score).toBe(8);
    
    const desc = truncateDescription('A beautiful city in South America', 20);
    expect(desc).toBe('A beautiful city in...');
  });

  it('should validate a manually created city object', () => {
    const newCity: AlgoliaCity = {
      objectID: generateObjectId('Test City', 'Test Country'),
      city: 'Test City',
      country: 'Test Country',
      continent: 'Europe',
      description: 'A test description for integration testing purposes.',
      vibe_tags: ['test', 'integration', 'validation'],
      culture_score: normalizeScore(7.5, 1, 10),
      adventure_score: normalizeScore(6, 1, 10),
      nature_score: normalizeScore(8.2, 1, 10),
      beach_score: normalizeScore(3, 1, 10),
      nightlife_score: normalizeScore(9.9, 1, 10),
      climate_type: 'Temperate',
      best_time_to_visit: 'Spring',
      image_url: 'https://example.com/test-city.jpg'
    };

    const result = AlgoliaCitySchema.safeParse(newCity);
    expect(result.success).toBe(true);
    expect(newCity.objectID).toBe('test-city-test-country');
    expect(newCity.culture_score).toBe(8);
    expect(newCity.nightlife_score).toBe(10);
  });

  it('should export city schema for base city validation', () => {
    const validCity = {
      city: 'Amsterdam',
      country: 'Netherlands',
      continent: 'Europe',
      description: 'A city of canals and culture',
      vibe_tags: ['liberal', 'artistic'],
      culture_score: 9,
      adventure_score: 6,
      nature_score: 4,
      beach_score: 3,
      nightlife_score: 9,
      climate_type: 'Oceanic',
      best_time_to_visit: 'Spring',
      image_url: 'https://example.com/amsterdam.jpg'
    };

    const cityResult = CitySchema.safeParse(validCity);
    expect(cityResult.success).toBe(true);

    const algoliaResult = AlgoliaCitySchema.safeParse(validCity);
    expect(algoliaResult.success).toBe(false);

    const algoliaCity = { ...validCity, objectID: 'amsterdam-netherlands' };
    const finalResult = AlgoliaCitySchema.safeParse(algoliaCity);
    expect(finalResult.success).toBe(true);
  });

  it('should have all mock cities with valid object IDs', () => {
    mockCities.forEach(city => {
      const expectedId = generateObjectId(city.city, city.country);
      expect(city.objectID).toBe(expectedId);
    });
  });
});
