import baseCitiesData from '../data/base-cities.json';
import type { BaseCityData, Continent } from '@vibe-travel/shared';

export type { BaseCityData, Continent };

const VALID_CONTINENTS: Continent[] = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
];

function isValidContinent(value: string): value is Continent {
  return VALID_CONTINENTS.includes(value as Continent);
}

function validateBaseCityData(data: unknown[]): BaseCityData[] {
  return data.filter((item): item is BaseCityData => {
    if (!item || typeof item !== 'object') return false;
    const city = item as Record<string, unknown>;
    return (
      typeof city.city === 'string' &&
      city.city.length > 0 &&
      typeof city.country === 'string' &&
      city.country.length > 0 &&
      typeof city.continent === 'string' &&
      isValidContinent(city.continent) &&
      typeof city.climate_type === 'string' &&
      city.climate_type.length > 0 &&
      typeof city.best_time_to_visit === 'string' &&
      city.best_time_to_visit.length > 0
    );
  });
}

export function generateBaseCities(): BaseCityData[] {
  const validatedCities = validateBaseCityData(baseCitiesData);

  const cityCountryKeys = new Set<string>();
  const uniqueCities: BaseCityData[] = [];

  for (const city of validatedCities) {
    const key = `${city.city.toLowerCase()}-${city.country.toLowerCase()}`;
    if (!cityCountryKeys.has(key)) {
      cityCountryKeys.add(key);
      uniqueCities.push(city);
    }
  }

  return uniqueCities;
}

export function getContinents(cities: BaseCityData[]): Continent[] {
  const continents = new Set<Continent>();
  for (const city of cities) {
    if (isValidContinent(city.continent)) {
      continents.add(city.continent);
    }
  }
  return Array.from(continents);
}

export function getCitiesByContinent(
  cities: BaseCityData[],
  continent: Continent
): BaseCityData[] {
  return cities.filter((city) => city.continent === continent);
}

export function getCityByName(
  cities: BaseCityData[],
  cityName: string
): BaseCityData | undefined {
  return cities.find(
    (city) => city.city.toLowerCase() === cityName.toLowerCase()
  );
}
