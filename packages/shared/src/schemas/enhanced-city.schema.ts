import { z } from 'zod';
import { CitySchema } from './city.schema';
import { BudgetTierSchema, CostBreakdownSchema } from './budget.schema';
import { MonthSchema, SeasonalEventSchema } from './seasonal.schema';

const EnhancedContinentSchema = z.enum([
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
  'Middle East'
]);

const EnglishProficiencySchema = z.enum(['high', 'medium', 'low']);

const SafetyRatingSchema = z.number().int().min(1).max(10);

export const EnhancedCitySchema = CitySchema.omit({ continent: true }).extend({
  continent: EnhancedContinentSchema,

  budget_tier: BudgetTierSchema,
  avg_daily_cost_usd: z.number().min(0),
  cost_breakdown: CostBreakdownSchema,

  safety_rating: SafetyRatingSchema,
  visa_free_for: z.array(z.string()),
  primary_language: z.string().min(1),
  english_proficiency: EnglishProficiencySchema,
  currency: z.string().min(1),
  currency_symbol: z.string().min(1),

  local_cuisine: z.array(z.string()).min(1),
  cuisine_highlights: z.array(z.string()),
  vegetarian_friendly: z.boolean(),

  best_months: z.array(MonthSchema).min(1),
  avoid_months: z.array(MonthSchema),
  seasonal_events: z.array(SeasonalEventSchema),

  timezone: z.string().min(1),
  flight_hub: z.boolean(),

  similar_cities: z.array(z.string()),
  pairs_well_with: z.array(z.string())
});

export const EnhancedAlgoliaCitySchema = EnhancedCitySchema.extend({
  objectID: z.string().min(1)
});

export type EnhancedCitySchemaType = z.infer<typeof EnhancedCitySchema>;
export type EnhancedAlgoliaCitySchemaType = z.infer<typeof EnhancedAlgoliaCitySchema>;
