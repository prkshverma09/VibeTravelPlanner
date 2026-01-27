import { describe, it, expect, expectTypeOf } from 'vitest';
import type { City, AlgoliaCity } from '../city';

describe('City Types', () => {
  it('should have all required City fields', () => {
    const city: City = {
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      description: 'A vibrant metropolis',
      vibe_tags: ['neon', 'modern', 'bustling'],
      culture_score: 9,
      adventure_score: 7,
      nature_score: 5,
      beach_score: 3,
      nightlife_score: 10,
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring',
      image_url: 'https://example.com/tokyo.jpg'
    };
    
    expect(city.city).toBe('Tokyo');
    expect(city.vibe_tags).toHaveLength(3);
  });

  it('should have AlgoliaCity with objectID', () => {
    const algoliaCity: AlgoliaCity = {
      objectID: 'tokyo-japan',
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      description: 'A vibrant metropolis',
      vibe_tags: ['neon'],
      culture_score: 9,
      adventure_score: 7,
      nature_score: 5,
      beach_score: 3,
      nightlife_score: 10,
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring',
      image_url: 'https://example.com/tokyo.jpg'
    };
    
    expect(algoliaCity.objectID).toBe('tokyo-japan');
  });

  it('should enforce score types as numbers', () => {
    expectTypeOf<City['culture_score']>().toBeNumber();
    expectTypeOf<City['adventure_score']>().toBeNumber();
    expectTypeOf<City['nature_score']>().toBeNumber();
    expectTypeOf<City['beach_score']>().toBeNumber();
    expectTypeOf<City['nightlife_score']>().toBeNumber();
  });
});
