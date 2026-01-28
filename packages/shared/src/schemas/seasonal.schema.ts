import { z } from 'zod';

export const MonthSchema = z.enum([
  'january', 'february', 'march', 'april',
  'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'
]);

export const SeasonalEventTypeSchema = z.enum([
  'festival', 'natural', 'cultural', 'sporting'
]);

export const SeasonalEventSchema = z.object({
  name: z.string().min(1),
  month: MonthSchema,
  description: z.string().min(10),
  type: SeasonalEventTypeSchema
});

export const SeasonalInfoSchema = z.object({
  best_months: z.array(MonthSchema).min(1),
  avoid_months: z.array(MonthSchema),
  peak_season: z.array(MonthSchema),
  shoulder_season: z.array(MonthSchema),
  weather_notes: z.record(MonthSchema, z.string())
});

export type MonthSchemaType = z.infer<typeof MonthSchema>;
export type SeasonalEventSchemaType = z.infer<typeof SeasonalEventSchema>;
export type SeasonalInfoSchemaType = z.infer<typeof SeasonalInfoSchema>;
