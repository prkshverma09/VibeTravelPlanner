import { z } from 'zod';
import { BudgetTierSchema } from './budget.schema';
import { MonthSchema } from './seasonal.schema';

export const ExperienceCategorySchema = z.enum([
  'cultural',
  'adventure',
  'culinary',
  'nature',
  'wellness',
  'nightlife',
  'romantic',
  'family',
  'photography',
  'spiritual'
]);

export const PhysicalLevelSchema = z.enum([
  'easy',
  'moderate',
  'challenging',
  'extreme'
]);

const BaseExperienceSchema = z.object({
  name: z.string().min(3).max(100),
  category: ExperienceCategorySchema,
  description: z.string().min(20).max(500),
  vibe_tags: z.array(z.string()).min(1).max(10),
  city_ids: z.array(z.string()).min(1),
  duration_hours: z.number().min(0.5).max(72),
  price_tier: BudgetTierSchema,
  best_season: z.array(MonthSchema).min(1),
  min_travelers: z.number().int().min(1),
  max_travelers: z.number().int().min(1),
  physical_level: PhysicalLevelSchema,
  highlights: z.array(z.string()).min(1).max(10),
  what_to_bring: z.array(z.string()).max(10),
  image_url: z.string().url()
});

export const ExperienceSchema = BaseExperienceSchema.refine(
  (data) => data.max_travelers >= data.min_travelers,
  {
    message: 'max_travelers must be >= min_travelers',
    path: ['max_travelers']
  }
);

const BaseAlgoliaExperienceSchema = BaseExperienceSchema.extend({
  objectID: z.string().min(1),
  _geoloc: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
});

export const AlgoliaExperienceSchema = BaseAlgoliaExperienceSchema.refine(
  (data) => data.max_travelers >= data.min_travelers,
  {
    message: 'max_travelers must be >= min_travelers',
    path: ['max_travelers']
  }
);

export const CityExperienceLinkSchema = z.object({
  city_id: z.string().min(1),
  experience_id: z.string().min(1),
  local_name: z.string().optional(),
  local_price_usd: z.number().min(0),
  booking_required: z.boolean(),
  advance_booking_days: z.number().int().min(0).optional()
});

export type ExperienceSchemaType = z.infer<typeof ExperienceSchema>;
export type AlgoliaExperienceSchemaType = z.infer<typeof AlgoliaExperienceSchema>;
export type CityExperienceLinkSchemaType = z.infer<typeof CityExperienceLinkSchema>;
