import type { Month, BudgetTier } from './index';

export type ExperienceCategory =
  | 'cultural'
  | 'adventure'
  | 'culinary'
  | 'nature'
  | 'wellness'
  | 'nightlife'
  | 'romantic'
  | 'family'
  | 'photography'
  | 'spiritual';

export type PhysicalLevel = 'easy' | 'moderate' | 'challenging' | 'extreme';

export interface Experience {
  name: string;
  category: ExperienceCategory;
  description: string;
  vibe_tags: string[];
  city_ids: string[];
  duration_hours: number;
  price_tier: BudgetTier;
  best_season: Month[];
  min_travelers: number;
  max_travelers: number;
  physical_level: PhysicalLevel;
  highlights: string[];
  what_to_bring: string[];
  image_url: string;
}

export interface AlgoliaExperience extends Experience {
  objectID: string;
  _geoloc?: {
    lat: number;
    lng: number;
  };
}

export interface CityExperienceLink {
  city_id: string;
  experience_id: string;
  local_name?: string;
  local_price_usd: number;
  booking_required: boolean;
  advance_booking_days?: number;
}
