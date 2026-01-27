import type { BaseCityData, CityScores } from '@vibe-travel/shared';

export type { CityScores };

const BEACH_CITIES = new Set([
  'miami',
  'cancun',
  'bali',
  'rio de janeiro',
  'barcelona',
  'sydney',
  'cape town',
  'dubai',
  'amalfi',
  'santorini',
  'dubrovnik',
  'lisbon',
  'havana',
  'cartagena',
  'zanzibar',
  'fiji',
  'queenstown',
  'auckland',
]);

const CULTURAL_CAPITALS = new Set([
  'paris',
  'rome',
  'london',
  'tokyo',
  'kyoto',
  'vienna',
  'athens',
  'cairo',
  'beijing',
  'florence',
  'prague',
  'istanbul',
  'barcelona',
  'amsterdam',
  'berlin',
  'new york',
  'buenos aires',
  'mexico city',
  'marrakech',
  'cusco',
  'edinburgh',
]);

const PARTY_CITIES = new Set([
  'tokyo',
  'seoul',
  'bangkok',
  'berlin',
  'amsterdam',
  'barcelona',
  'new york',
  'miami',
  'new orleans',
  'rio de janeiro',
  'buenos aires',
  'ibiza',
  'las vegas',
  'hong kong',
  'singapore',
  'london',
  'los angeles',
  'cancun',
  'havana',
  'medellín',
]);

const ADVENTURE_DESTINATIONS = new Set([
  'queenstown',
  'cape town',
  'cusco',
  'reykjavik',
  'bali',
  'nairobi',
  'vancouver',
  'medellín',
  'zanzibar',
  'fiji',
  'auckland',
  'sydney',
  'dubai',
  'melbourne',
]);

const NATURE_RICH = new Set([
  'reykjavik',
  'queenstown',
  'vancouver',
  'cape town',
  'bali',
  'fiji',
  'nairobi',
  'cusco',
  'auckland',
  'sydney',
  'melbourne',
  'zanzibar',
  'santorini',
  'santiago',
]);

const COASTAL_CLIMATES = new Set([
  'tropical monsoon',
  'tropical marine',
  'mediterranean',
  'tropical wet and dry',
  'tropical savanna',
  'oceanic',
]);

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function deterministicRandom(seed: string, min: number, max: number): number {
  const hash = hashString(seed);
  const range = max - min + 1;
  return min + (hash % range);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function generateScores(baseCity: BaseCityData): CityScores {
  const cityLower = baseCity.city.toLowerCase();
  const climateLower = baseCity.climate_type.toLowerCase();
  const seedBase = `${baseCity.city}-${baseCity.country}`;

  let cultureScore = deterministicRandom(`${seedBase}-culture`, 4, 7);
  if (CULTURAL_CAPITALS.has(cityLower)) {
    cultureScore = deterministicRandom(`${seedBase}-culture-high`, 8, 10);
  }

  let adventureScore = deterministicRandom(`${seedBase}-adventure`, 3, 6);
  if (ADVENTURE_DESTINATIONS.has(cityLower)) {
    adventureScore = deterministicRandom(`${seedBase}-adventure-high`, 7, 10);
  }

  let natureScore = deterministicRandom(`${seedBase}-nature`, 3, 6);
  if (NATURE_RICH.has(cityLower)) {
    natureScore = deterministicRandom(`${seedBase}-nature-high`, 7, 10);
  }

  let beachScore = deterministicRandom(`${seedBase}-beach`, 1, 4);
  if (BEACH_CITIES.has(cityLower)) {
    beachScore = deterministicRandom(`${seedBase}-beach-high`, 7, 10);
  } else if (COASTAL_CLIMATES.has(climateLower)) {
    beachScore = deterministicRandom(`${seedBase}-beach-coastal`, 4, 7);
  }

  let nightlifeScore = deterministicRandom(`${seedBase}-nightlife`, 4, 6);
  if (PARTY_CITIES.has(cityLower)) {
    nightlifeScore = deterministicRandom(`${seedBase}-nightlife-high`, 7, 10);
  }

  return {
    culture_score: clamp(cultureScore, 1, 10),
    adventure_score: clamp(adventureScore, 1, 10),
    nature_score: clamp(natureScore, 1, 10),
    beach_score: clamp(beachScore, 1, 10),
    nightlife_score: clamp(nightlifeScore, 1, 10),
  };
}

export function isValidScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 10;
}

export function validateScores(scores: CityScores): boolean {
  return (
    isValidScore(scores.culture_score) &&
    isValidScore(scores.adventure_score) &&
    isValidScore(scores.nature_score) &&
    isValidScore(scores.beach_score) &&
    isValidScore(scores.nightlife_score)
  );
}
