import type { AlgoliaCity } from '@vibe-travel/shared';
import type { TripAction } from '../context/TripContext';
import type {
  CompareCitiesInput,
  CompareCitiesOutput,
  CityComparison,
  ToolHandler,
} from './types';

const DEFAULT_COMPARISON_ATTRIBUTES = [
  'culture_score',
  'adventure_score',
  'nature_score',
  'beach_score',
  'nightlife_score',
  'climate_type',
  'best_time_to_visit',
];

const SCORE_ATTRIBUTES = [
  'culture_score',
  'adventure_score',
  'nature_score',
  'beach_score',
  'nightlife_score',
];

export function createCompareCitiesHandler(
  dispatch: React.Dispatch<TripAction>,
  fetchCities: (ids: string[]) => Promise<AlgoliaCity[]>
): ToolHandler<CompareCitiesInput, CompareCitiesOutput> {
  return async ({ input, addToolResult }) => {
    const { cities: cityIds, focus_attributes } = input;

    try {
      const cities = await fetchCities(cityIds);

      if (cities.length < 2) {
        addToolResult({
          output: {
            cities: [],
            comparison: {
              attributes: [],
              data: {},
              recommendation: 'Could not find enough cities to compare.',
            },
          },
        });
        return;
      }

      const attributesToCompare =
        focus_attributes && focus_attributes.length > 0
          ? focus_attributes
          : DEFAULT_COMPARISON_ATTRIBUTES;

      const comparisonData: Record<string, Record<string, number | string>> = {};

      attributesToCompare.forEach((attr) => {
        comparisonData[attr] = {};
        cities.forEach((city) => {
          const value = city[attr as keyof AlgoliaCity];
          comparisonData[attr][city.objectID] = value as number | string;
        });
      });

      const recommendation = generateRecommendation(cities, attributesToCompare);

      dispatch({
        type: 'SET_COMPARISON',
        payload: {
          cities,
          focusAttributes: attributesToCompare,
          isActive: true,
        },
      });

      addToolResult({
        output: {
          cities,
          comparison: {
            attributes: attributesToCompare,
            data: comparisonData,
            recommendation,
          },
        },
      });
    } catch (error) {
      addToolResult({
        output: {
          cities: [],
          comparison: {
            attributes: [],
            data: {},
            recommendation: 'Error fetching city data for comparison.',
          },
        },
      });
    }
  };
}

function generateRecommendation(
  cities: AlgoliaCity[],
  attributes: string[]
): string | null {
  if (cities.length !== 2) return null;

  const [city1, city2] = cities;
  const advantages: { city: string; attrs: string[] }[] = [
    { city: city1.city, attrs: [] },
    { city: city2.city, attrs: [] },
  ];

  attributes.forEach((attr) => {
    if (SCORE_ATTRIBUTES.includes(attr)) {
      const score1 = city1[attr as keyof AlgoliaCity] as number;
      const score2 = city2[attr as keyof AlgoliaCity] as number;

      if (score1 > score2) {
        advantages[0].attrs.push(attr.replace('_score', ''));
      } else if (score2 > score1) {
        advantages[1].attrs.push(attr.replace('_score', ''));
      }
    }
  });

  const summaries = advantages
    .filter((a) => a.attrs.length > 0)
    .map((a) => `${a.city} excels in ${a.attrs.join(', ')}`);

  return summaries.length > 0 ? summaries.join('. ') + '.' : null;
}
