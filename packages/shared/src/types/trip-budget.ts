import { z } from 'zod';

export const BUDGET_CATEGORIES = [
  'accommodation',
  'activities',
  'food',
  'transport',
  'shopping',
  'misc',
] as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const budgetCategorySchema = z.enum(BUDGET_CATEGORIES);

export const costRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
  })
  .refine((data) => data.max >= data.min, {
    message: 'Max must be greater than or equal to min',
  });

export type CostRange = z.infer<typeof costRangeSchema>;

export const budgetStatusSchema = z.enum(['under', 'on-track', 'over']);
export type BudgetStatus = z.infer<typeof budgetStatusSchema>;

export const savingsOpportunitySchema = z.object({
  category: budgetCategorySchema,
  currentItem: z.string().min(1),
  alternativeItem: z.string().min(1),
  savings: z.number().positive('Savings must be positive'),
  tradeoff: z.string().min(1),
});

export type SavingsOpportunity = z.infer<typeof savingsOpportunitySchema>;

export const budgetLimitsSchema = z.object({
  total: z.number().min(0),
  daily: z.number().min(0).optional(),
  perCategory: z.record(budgetCategorySchema, z.number().min(0)).optional(),
});

export type BudgetLimits = z.infer<typeof budgetLimitsSchema>;

export const estimatedCostsSchema = z.object({
  accommodation: costRangeSchema,
  activities: costRangeSchema,
  food: costRangeSchema,
  transport: costRangeSchema,
  shopping: costRangeSchema,
  misc: costRangeSchema,
  total: costRangeSchema,
});

export type EstimatedCosts = z.infer<typeof estimatedCostsSchema>;

export const tripBudgetSchema = z
  .object({
    tripId: z.string().min(1),
    currency: z.string().min(1),
    estimated: estimatedCostsSchema,
    limits: budgetLimitsSchema,
    status: budgetStatusSchema,
    savingsOpportunities: z.array(savingsOpportunitySchema),
  })
  .refine(
    (data) => {
      const categories = ['accommodation', 'activities', 'food', 'transport', 'shopping', 'misc'] as const;
      const calculatedMin = categories.reduce(
        (sum, cat) => sum + data.estimated[cat].min,
        0
      );
      const calculatedMax = categories.reduce(
        (sum, cat) => sum + data.estimated[cat].max,
        0
      );
      return (
        Math.abs(data.estimated.total.min - calculatedMin) < 0.01 &&
        Math.abs(data.estimated.total.max - calculatedMax) < 0.01
      );
    },
    {
      message: 'Total must equal sum of all categories',
    }
  );

export type TripBudget = z.infer<typeof tripBudgetSchema>;

export function calculateTotalFromCategories(
  categories: Partial<Record<BudgetCategory, CostRange>>
): CostRange {
  const allCategories: BudgetCategory[] = [
    'accommodation',
    'activities',
    'food',
    'transport',
    'shopping',
    'misc',
  ];

  let minTotal = 0;
  let maxTotal = 0;

  for (const cat of allCategories) {
    const range = categories[cat];
    if (range) {
      minTotal += range.min;
      maxTotal += range.max;
    }
  }

  return { min: minTotal, max: maxTotal };
}

export function calculateBudgetStatus(
  estimated: CostRange,
  limit: number
): BudgetStatus {
  if (estimated.min > limit) {
    return 'over';
  }
  if (estimated.max <= limit) {
    return 'under';
  }
  return 'on-track';
}

interface CreateTripBudgetParams {
  tripId: string;
  currency: string;
  categories: Partial<Record<BudgetCategory, CostRange>>;
  limit: number;
  dailyLimit?: number;
  totalDays?: number;
}

export function createTripBudget(params: CreateTripBudgetParams): TripBudget {
  const { tripId, currency, categories, limit, dailyLimit, totalDays } = params;

  const defaultRange: CostRange = { min: 0, max: 0 };

  const estimated: EstimatedCosts = {
    accommodation: categories.accommodation || defaultRange,
    activities: categories.activities || defaultRange,
    food: categories.food || defaultRange,
    transport: categories.transport || defaultRange,
    shopping: categories.shopping || defaultRange,
    misc: categories.misc || defaultRange,
    total: calculateTotalFromCategories(categories),
  };

  const status = calculateBudgetStatus(estimated.total, limit);

  let daily = dailyLimit;
  if (!daily && totalDays && totalDays > 0) {
    daily = Math.floor(limit / totalDays);
  }

  return {
    tripId,
    currency,
    estimated,
    limits: {
      total: limit,
      daily,
    },
    status,
    savingsOpportunities: [],
  };
}

export interface BudgetSummary {
  totalEstimated: CostRange;
  limit: number;
  status: BudgetStatus;
  percentUsed: number;
  remaining: number;
  perDay: number;
}

export function calculateBudgetSummary(
  budget: TripBudget,
  totalDays: number
): BudgetSummary {
  const midEstimate = (budget.estimated.total.min + budget.estimated.total.max) / 2;
  const percentUsed = (midEstimate / budget.limits.total) * 100;
  const remaining = budget.limits.total - midEstimate;
  const perDay = totalDays > 0 ? midEstimate / totalDays : 0;

  return {
    totalEstimated: budget.estimated.total,
    limit: budget.limits.total,
    status: budget.status,
    percentUsed: Math.round(percentUsed),
    remaining: Math.round(remaining),
    perDay: Math.round(perDay),
  };
}
