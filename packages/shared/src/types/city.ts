import type { BudgetTier, CostBreakdown } from './budget';
import type { Month, SeasonalEvent } from './seasonal';

export type Continent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania'
  | 'Middle East';

export type ScoreValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type EnglishProficiency = 'high' | 'medium' | 'low';

export type VibeCategory =
  | 'adventure'
  | 'romantic'
  | 'cultural'
  | 'beach'
  | 'nightlife'
  | 'nature';

export interface GeoLocation {
  lat: number;
  lng: number;
}

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
  _geoloc?: GeoLocation;
  primary_vibe?: VibeCategory;
}

export interface AlgoliaCity extends City {
  objectID: string;
  average_cost_per_day?: number;
  currency?: string;
  review_count?: number;
  rating?: number;
  best_months?: number[];
  latitude?: number;
  longitude?: number;
  known_for?: string[];
  cuisine_variety?: string[];
  ideal_trip_length?: string;
  visa_requirements?: string;
  safety_rating?: number;
  lgbtq_friendly?: boolean;
  family_friendly?: boolean;
  solo_traveler_friendly?: boolean;
  digital_nomad_friendly?: boolean;
  language?: string[];
  timezone?: string;
  airport_codes?: string[];
  relaxation_score?: number;
}

export interface EnhancedCity extends City {
  budget_tier: BudgetTier;
  avg_daily_cost_usd: number;
  cost_breakdown: CostBreakdown;

  safety_rating: number;
  visa_free_for: string[];
  primary_language: string;
  english_proficiency: EnglishProficiency;
  currency: string;
  currency_symbol: string;

  local_cuisine: string[];
  cuisine_highlights: string[];
  vegetarian_friendly: boolean;

  best_months: Month[];
  avoid_months: Month[];
  seasonal_events: SeasonalEvent[];

  timezone: string;
  flight_hub: boolean;

  similar_cities: string[];
  pairs_well_with: string[];
}

export interface EnhancedAlgoliaCity extends EnhancedCity {
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
