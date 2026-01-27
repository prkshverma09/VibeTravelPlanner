import { describe, it, expect } from 'vitest';
import {
  generateScores,
  CityScores,
  isValidScore,
  validateScores,
} from '../score.generator';
import { BaseCityData } from '../base-city.generator';

describe('Score Generator', () => {
  it('should generate all required scores', () => {
    const baseCity: BaseCityData = {
      city: 'Barcelona',
      country: 'Spain',
      continent: 'Europe',
      climate_type: 'Mediterranean',
      best_time_to_visit: 'Spring',
    };

    const scores = generateScores(baseCity);

    expect(scores.culture_score).toBeGreaterThanOrEqual(1);
    expect(scores.culture_score).toBeLessThanOrEqual(10);
    expect(scores.adventure_score).toBeGreaterThanOrEqual(1);
    expect(scores.adventure_score).toBeLessThanOrEqual(10);
    expect(scores.nature_score).toBeGreaterThanOrEqual(1);
    expect(scores.nature_score).toBeLessThanOrEqual(10);
    expect(scores.beach_score).toBeGreaterThanOrEqual(1);
    expect(scores.beach_score).toBeLessThanOrEqual(10);
    expect(scores.nightlife_score).toBeGreaterThanOrEqual(1);
    expect(scores.nightlife_score).toBeLessThanOrEqual(10);
  });

  it('should give beach cities higher beach scores', () => {
    const beachCity: BaseCityData = {
      city: 'Miami',
      country: 'United States',
      continent: 'North America',
      climate_type: 'Tropical',
      best_time_to_visit: 'Winter',
    };

    const landlockedCity: BaseCityData = {
      city: 'Vienna',
      country: 'Austria',
      continent: 'Europe',
      climate_type: 'Continental',
      best_time_to_visit: 'Spring',
    };

    const beachScores = generateScores(beachCity);
    const landlockedScores = generateScores(landlockedCity);

    expect(beachScores.beach_score).toBeGreaterThan(landlockedScores.beach_score);
  });

  it('should give cultural capitals higher culture scores', () => {
    const culturalCity: BaseCityData = {
      city: 'Paris',
      country: 'France',
      continent: 'Europe',
      climate_type: 'Oceanic',
      best_time_to_visit: 'Spring',
    };

    const lessculturalCity: BaseCityData = {
      city: 'Fiji',
      country: 'Fiji',
      continent: 'Oceania',
      climate_type: 'Tropical marine',
      best_time_to_visit: 'May to October',
    };

    const culturalScores = generateScores(culturalCity);
    const lessCulturalScores = generateScores(lessculturalCity);

    expect(culturalScores.culture_score).toBeGreaterThanOrEqual(8);
    expect(lessCulturalScores.culture_score).toBeLessThan(culturalScores.culture_score);
  });

  it('should give party cities higher nightlife scores', () => {
    const partyCity: BaseCityData = {
      city: 'Berlin',
      country: 'Germany',
      continent: 'Europe',
      climate_type: 'Oceanic',
      best_time_to_visit: 'Summer',
    };

    const quietCity: BaseCityData = {
      city: 'Kyoto',
      country: 'Japan',
      continent: 'Asia',
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring',
    };

    const partyScores = generateScores(partyCity);
    const quietScores = generateScores(quietCity);

    expect(partyScores.nightlife_score).toBeGreaterThanOrEqual(7);
    expect(partyScores.nightlife_score).toBeGreaterThan(quietScores.nightlife_score);
  });

  it('should be deterministic', () => {
    const city: BaseCityData = {
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring',
    };

    const scores1 = generateScores(city);
    const scores2 = generateScores(city);

    expect(scores1).toEqual(scores2);
  });

  it('should return integer scores', () => {
    const city: BaseCityData = {
      city: 'Paris',
      country: 'France',
      continent: 'Europe',
      climate_type: 'Oceanic',
      best_time_to_visit: 'Spring',
    };

    const scores = generateScores(city);

    Object.values(scores).forEach((score) => {
      expect(Number.isInteger(score)).toBe(true);
    });
  });

  it('should give adventure destinations higher adventure scores', () => {
    const adventureCity: BaseCityData = {
      city: 'Queenstown',
      country: 'New Zealand',
      continent: 'Oceania',
      climate_type: 'Oceanic',
      best_time_to_visit: 'Summer',
    };

    const urbanCity: BaseCityData = {
      city: 'London',
      country: 'United Kingdom',
      continent: 'Europe',
      climate_type: 'Oceanic',
      best_time_to_visit: 'Summer',
    };

    const adventureScores = generateScores(adventureCity);
    const urbanScores = generateScores(urbanCity);

    expect(adventureScores.adventure_score).toBeGreaterThanOrEqual(7);
    expect(adventureScores.adventure_score).toBeGreaterThan(urbanScores.adventure_score);
  });

  it('should give nature-rich destinations higher nature scores', () => {
    const natureCity: BaseCityData = {
      city: 'Reykjavik',
      country: 'Iceland',
      continent: 'Europe',
      climate_type: 'Subpolar oceanic',
      best_time_to_visit: 'Summer',
    };

    const urbanCity: BaseCityData = {
      city: 'Shanghai',
      country: 'China',
      continent: 'Asia',
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Fall',
    };

    const natureScores = generateScores(natureCity);
    const urbanScores = generateScores(urbanCity);

    expect(natureScores.nature_score).toBeGreaterThanOrEqual(7);
    expect(natureScores.nature_score).toBeGreaterThan(urbanScores.nature_score);
  });
});

describe('Score Validation', () => {
  it('should validate valid scores', () => {
    expect(isValidScore(1)).toBe(true);
    expect(isValidScore(5)).toBe(true);
    expect(isValidScore(10)).toBe(true);
  });

  it('should reject scores below 1', () => {
    expect(isValidScore(0)).toBe(false);
    expect(isValidScore(-1)).toBe(false);
  });

  it('should reject scores above 10', () => {
    expect(isValidScore(11)).toBe(false);
    expect(isValidScore(100)).toBe(false);
  });

  it('should reject non-integer scores', () => {
    expect(isValidScore(5.5)).toBe(false);
    expect(isValidScore(7.1)).toBe(false);
  });

  it('should validate complete score objects', () => {
    const validScores: CityScores = {
      culture_score: 8,
      adventure_score: 6,
      nature_score: 7,
      beach_score: 9,
      nightlife_score: 10,
    };
    expect(validateScores(validScores)).toBe(true);
  });

  it('should reject score objects with invalid values', () => {
    const invalidScores: CityScores = {
      culture_score: 11,
      adventure_score: 6,
      nature_score: 7,
      beach_score: 9,
      nightlife_score: 10,
    };
    expect(validateScores(invalidScores)).toBe(false);
  });
});
