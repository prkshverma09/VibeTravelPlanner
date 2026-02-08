import { z } from 'zod';

export const TRIP_STYLE_OPTIONS = [
  'Cultural Immersion',
  'Adventure & Outdoors',
  'Food & Culinary',
  'Relaxation & Wellness',
  'Nightlife & Entertainment',
  'Shopping & Markets',
  'Photography & Sightseeing',
  'Family-Friendly',
  'Romantic Getaway',
  'Business + Leisure',
] as const;

export type TripStyleOption = (typeof TRIP_STYLE_OPTIONS)[number];

export const budgetLevelSchema = z.enum(['budget', 'moderate', 'luxury', 'unlimited']);
export type BudgetLevel = z.infer<typeof budgetLevelSchema>;

export const paceSchema = z.enum(['relaxed', 'moderate', 'packed']);
export type Pace = z.infer<typeof paceSchema>;

export const mobilitySchema = z.enum(['full', 'limited', 'wheelchair']);
export type Mobility = z.infer<typeof mobilitySchema>;

export const tripStyleSchema = z.enum(TRIP_STYLE_OPTIONS);

export const travelersSchema = z
  .object({
    adults: z.number().min(1, 'At least one adult is required'),
    children: z.number().min(0).default(0),
    childrenAges: z.array(z.number().min(0).max(17)).optional(),
  })
  .refine(
    (data) => {
      if (data.childrenAges && data.children > 0) {
        return data.childrenAges.every((age) => age >= 0 && age <= 17);
      }
      return true;
    },
    { message: 'Children ages must be between 0 and 17' }
  );

export type Travelers = z.infer<typeof travelersSchema>;

export const tripDatesSchema = z
  .object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  })
  .refine((data) => new Date(data.end) > new Date(data.start), {
    message: 'End date must be after start date',
  });

export type TripDates = z.infer<typeof tripDatesSchema>;

export const tripSetupSchema = z.object({
  destinationId: z.string().min(1, 'Destination is required'),
  dates: tripDatesSchema,
  travelers: travelersSchema,
  budgetLevel: budgetLevelSchema,
  tripStyle: z.array(tripStyleSchema).min(1, 'Select at least one trip style'),
  pace: paceSchema,
  interests: z.array(z.string()).optional(),
  mobility: mobilitySchema.optional().default('full'),
});

export type TripSetup = z.infer<typeof tripSetupSchema>;

export const geoLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type GeoLocationCoords = z.infer<typeof geoLocationSchema>;

export const priceRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
  })
  .refine((data) => data.max >= data.min, {
    message: 'Max price must be greater than or equal to min price',
  });

export type PriceRange = z.infer<typeof priceRangeSchema>;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const scheduledActivitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().optional(),
  startTime: z.string().regex(timeRegex, 'Time must be in HH:mm format'),
  duration: z.number().positive('Duration must be positive'),
  location: geoLocationSchema,
  neighborhood: z.string().optional(),
  priceRange: priceRangeSchema,
  bookingRequired: z.boolean().optional(),
  bookingUrl: z.string().url().optional(),
  description: z.string().optional(),
  tips: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().min(0).optional(),
});

export type ScheduledActivity = z.infer<typeof scheduledActivitySchema>;

export const itineraryDaySchema = z.object({
  dayNumber: z.number().positive('Day number must be positive'),
  date: z.string().datetime(),
  theme: z.string().min(1),
  activities: z.array(scheduledActivitySchema).min(1, 'At least one activity is required'),
  meals: z
    .array(
      z.object({
        type: z.string(),
        name: z.string(),
        location: z.string(),
      })
    )
    .optional(),
  estimatedCost: z.number().min(0),
  walkingDistance: z.number().min(0).optional(),
  alternativeActivities: z.array(scheduledActivitySchema).optional(),
});

export type ItineraryDay = z.infer<typeof itineraryDaySchema>;

export const tripCostBreakdownSchema = z
  .object({
    activities: z.number().min(0),
    accommodation: z.number().min(0),
    food: z.number().min(0),
    transport: z.number().min(0),
    total: z.number().min(0),
  })
  .refine(
    (data) => {
      const calculatedTotal = data.activities + data.accommodation + data.food + data.transport;
      return Math.abs(data.total - calculatedTotal) < 0.01;
    },
    {
      message: 'Total must equal sum of all categories',
    }
  );

export type TripCostBreakdown = z.infer<typeof tripCostBreakdownSchema>;

export const tripDestinationSchema = z.object({
  objectID: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  continent: z.string().optional(),
});

export type TripDestination = z.infer<typeof tripDestinationSchema>;

export const tripItinerarySchema = z.object({
  id: z.string().min(1),
  destination: tripDestinationSchema,
  dates: tripDatesSchema,
  travelers: travelersSchema,
  days: z.array(itineraryDaySchema),
  totalEstimatedCost: tripCostBreakdownSchema,
  accommodations: z.array(z.unknown()).optional(),
  transportPlan: z.unknown().optional(),
});

export type TripItinerary = z.infer<typeof tripItinerarySchema>;

export interface Trip extends TripSetup {
  id: string;
  totalDays: number;
  createdAt: string;
  updatedAt: string;
}

export function calculateTripDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

let tripIdCounter = 0;

export function createTrip(setup: TripSetup): Trip {
  tripIdCounter++;
  const now = new Date().toISOString();

  return {
    ...setup,
    id: `trip_${Date.now()}_${tripIdCounter}`,
    totalDays: calculateTripDuration(setup.dates.start, setup.dates.end),
    createdAt: now,
    updatedAt: now,
  };
}

export function resetTripIdCounter(): void {
  tripIdCounter = 0;
}
