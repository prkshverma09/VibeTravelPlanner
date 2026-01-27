import type { AlgoliaCity } from '@vibe-travel/shared';

export interface SavePreferenceInput {
  category: 'vibe' | 'geography' | 'budget' | 'activity' | 'travel_style' | 'constraint';
  value: string;
  priority: 'must_have' | 'nice_to_have' | null;
}

export interface SavePreferenceOutput {
  success: boolean;
  message: string;
  currentPreferences: string[];
}

export interface CompareCitiesInput {
  cities: string[];
  focus_attributes: string[] | null;
}

export interface CityComparison {
  attributes: string[];
  data: Record<string, Record<string, number | string>>;
  recommendation: string | null;
}

export interface CompareCitiesOutput {
  cities: AlgoliaCity[];
  comparison: CityComparison;
}

export interface AddToTripPlanInput {
  city_id: string;
  duration_days: number | null;
  notes: string | null;
}

export interface AddToTripPlanOutput {
  success: boolean;
  message: string;
  tripPlan: { cityId: string; cityName: string; days: number | null }[];
}

export interface GenerateItineraryInput {
  city_id: string;
  duration_days: number;
  interests: string[] | null;
  travel_style: 'relaxed' | 'active' | 'balanced' | null;
}

export interface ItineraryActivity {
  time: string;
  activity: string;
  description: string;
  vibeMatch: string[];
}

export interface ItineraryDay {
  day: number;
  theme: string;
  activities: ItineraryActivity[];
}

export interface GenerateItineraryOutput {
  cityId: string;
  cityName: string;
  days: ItineraryDay[];
}

export interface ClearPreferencesInput {
  category: string | null;
}

export interface ClearPreferencesOutput {
  success: boolean;
  message: string;
  clearedCount: number;
}

export interface ToolCallParams<TInput> {
  input: TInput;
  addToolResult: (result: { output: unknown }) => void | Promise<void>;
}

export type ToolHandler<TInput, TOutput> = (
  params: ToolCallParams<TInput>
) => void | Promise<void>;
