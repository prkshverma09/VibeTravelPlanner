export type Continent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania';

export type ScoreValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface City {
  city: string;
  country: string;
  continent: Continent;
  description: string;
  vibe_tags: string[];
  keywords?: string[];
  culture_score: number;
  adventure_score: number;
  nature_score: number;
  beach_score: number;
  nightlife_score: number;
  climate_type: string;
  best_time_to_visit: string;
  image_url: string;
}

export interface AlgoliaCity extends City {
  objectID: string;
}

export type CityScores = Pick<
  City,
  | 'culture_score'
  | 'adventure_score'
  | 'nature_score'
  | 'beach_score'
  | 'nightlife_score'
>;

export type ScoreType = keyof CityScores;

export type BaseCityData = Pick<
  City,
  'city' | 'country' | 'continent' | 'climate_type' | 'best_time_to_visit'
>;
