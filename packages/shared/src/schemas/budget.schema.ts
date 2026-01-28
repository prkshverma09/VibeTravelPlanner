import { z } from 'zod';

export const BudgetTierSchema = z.enum(['budget', 'mid-range', 'luxury']);

export const CostBreakdownSchema = z.object({
  accommodation_per_night: z.number().min(0),
  meal_average: z.number().min(0),
  transportation_daily: z.number().min(0),
  activities_daily: z.number().min(0)
});

export type BudgetTierSchemaType = z.infer<typeof BudgetTierSchema>;
export type CostBreakdownSchemaType = z.infer<typeof CostBreakdownSchema>;
