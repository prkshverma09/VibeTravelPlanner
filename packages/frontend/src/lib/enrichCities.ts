import { mockCities } from '@vibe-travel/shared';
import type { AlgoliaCity } from '@vibe-travel/shared';

const mockCityMap = new Map(mockCities.map(c => [c.objectID, c]));
const mockCityNameMap = new Map(mockCities.map(c => [c.city.toLowerCase(), c]));

export function enrichWithGeoloc(cities: AlgoliaCity[]): AlgoliaCity[] {
  return cities.map(city => {
    if (city._geoloc?.lat != null && city._geoloc?.lng != null) return city;
    const byId = mockCityMap.get(city.objectID);
    if (byId?._geoloc) return { ...city, _geoloc: byId._geoloc };
    const byName = mockCityNameMap.get((city.city || '').toLowerCase());
    if (byName?._geoloc) return { ...city, _geoloc: byName._geoloc };
    return city;
  });
}
