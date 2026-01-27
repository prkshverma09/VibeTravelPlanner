import { z } from 'zod';

const ContinentSchema = z.enum([
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania'
]);

const ScoreSchema = z.number().int().min(1).max(10);

export const CitySchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  continent: ContinentSchema,
  description: z.string().min(1),
  vibe_tags: z.array(z.string()).min(1),
  culture_score: ScoreSchema,
  adventure_score: ScoreSchema,
  nature_score: ScoreSchema,
  beach_score: ScoreSchema,
  nightlife_score: ScoreSchema,
  climate_type: z.string().min(1),
  best_time_to_visit: z.string().min(1),
  image_url: z.string().url()
});

export const AlgoliaCitySchema = CitySchema.extend({
  objectID: z.string().min(1)
});

export const BaseCityDataSchema = CitySchema.pick({
  city: true,
  country: true,
  continent: true,
  climate_type: true,
  best_time_to_visit: true
});

export const CityScoresSchema = CitySchema.pick({
  culture_score: true,
  adventure_score: true,
  nature_score: true,
  beach_score: true,
  nightlife_score: true
});

export type CitySchemaType = z.infer<typeof CitySchema>;
export type AlgoliaCitySchemaType = z.infer<typeof AlgoliaCitySchema>;
export type BaseCityDataSchemaType = z.infer<typeof BaseCityDataSchema>;
export type CityScoresSchemaType = z.infer<typeof CityScoresSchema>;
