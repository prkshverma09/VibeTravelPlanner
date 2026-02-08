import { z } from 'zod';

export const POI_CATEGORIES = [
  'cafe',
  'restaurant',
  'bar',
  'club',
  'museum',
  'gallery',
  'landmark',
  'park',
  'beach',
  'spa',
  'wellness',
  'shopping',
  'market',
  'pharmacy',
  'atm',
  'transport',
  'hotel',
  'attraction',
  'theater',
  'cinema',
] as const;

export type POICategory = (typeof POI_CATEGORIES)[number];

export const poiCategorySchema = z.enum(POI_CATEGORIES);

export const geoLocationCoordsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type GeoLocationCoords = z.infer<typeof geoLocationCoordsSchema>;

const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const timeOrClosedRegex = /^(closed|([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d))$/;

export const openingHoursSchema = z.record(
  z.enum([...dayNames]),
  z.string().regex(timeOrClosedRegex, 'Must be "closed" or in format "HH:mm-HH:mm"')
).optional();

export type OpeningHours = z.infer<typeof openingHoursSchema>;

export const priceRangeValueSchema = z.enum(['$', '$$', '$$$', '$$$$']);
export type PriceRangeValue = z.infer<typeof priceRangeValueSchema>;

export const reservationTypeSchema = z.enum(['walk-in', 'recommended', 'required']);
export type ReservationType = z.infer<typeof reservationTypeSchema>;

export const accessibilityLevelSchema = z.enum(['full', 'limited', 'wheelchair', 'easy', 'moderate', 'challenging']);
export type AccessibilityLevel = z.infer<typeof accessibilityLevelSchema>;

export const activityPriceSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().min(1),
  per: z.enum(['person', 'group', 'vehicle']),
  childPrice: z.number().min(0).optional(),
  includes: z.array(z.string()).optional(),
});

export type ActivityPrice = z.infer<typeof activityPriceSchema>;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dayOrDailyValues = ['daily', ...dayNames] as const;

export const activityAvailabilitySchema = z.object({
  days: z.array(z.enum(dayOrDailyValues)).min(1),
  times: z.array(z.string().regex(timeRegex, 'Time must be in HH:mm format')).min(1),
  advanceBookingDays: z.number().min(0).optional(),
  seasonalNotes: z.string().optional(),
});

export type ActivityAvailability = z.infer<typeof activityAvailabilitySchema>;

export const meetingPointSchema = z.object({
  _geoloc: geoLocationCoordsSchema,
  address: z.string().optional(),
  pickupAvailable: z.boolean().optional(),
  pickupAreas: z.array(z.string()).optional(),
});

export type MeetingPoint = z.infer<typeof meetingPointSchema>;

export const activityAccessibilitySchema = z.enum(['easy', 'moderate', 'challenging']);
export type ActivityAccessibility = z.infer<typeof activityAccessibilitySchema>;

export const activitySchema = z.object({
  objectID: z.string().min(1),
  name: z.string().min(1),
  destinationId: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  durationHours: z.number().positive('Duration must be positive'),
  price: activityPriceSchema,
  availability: activityAvailabilitySchema.optional(),
  meetingPoint: meetingPointSchema.optional(),
  suitableFor: z.array(z.string()).optional(),
  ageRestriction: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    notes: z.string().optional(),
  }).optional(),
  accessibility: activityAccessibilitySchema.optional(),
  vibeTags: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().min(0).optional(),
  bookingUrl: z.string().url().optional(),
  photos: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  bestTime: z.string().optional(),
  weatherDependent: z.boolean().optional(),
  highlights: z.array(z.string()).optional(),
});

export type Activity = z.infer<typeof activitySchema>;

export const poiSchema = z.object({
  objectID: z.string().min(1),
  name: z.string().min(1),
  destinationId: z.string().min(1),
  category: poiCategorySchema,
  subcategory: z.string().optional(),
  _geoloc: geoLocationCoordsSchema,
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  description: z.string().optional(),
  priceRange: priceRangeValueSchema.optional(),
  openingHours: z.record(z.string(), z.string()).optional(),
  vibeTags: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().min(0).optional(),
  photos: z.array(z.string()).optional(),
  mustTry: z.array(z.string()).optional(),
  goodFor: z.array(z.string()).optional(),
  accessibility: z.enum(['full', 'limited', 'wheelchair']).optional(),
  parking: z.string().optional(),
  reservations: reservationTypeSchema.optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  distance: z.number().min(0).optional(),
});

export type POI = z.infer<typeof poiSchema>;

export interface AlgoliaPOI extends POI {
  _highlightResult?: Record<string, unknown>;
  _snippetResult?: Record<string, unknown>;
  _rankingInfo?: {
    geoDistance: number;
    nbTypos: number;
    words: number;
    filters: number;
    proximity: number;
    attribute: number;
    exact: number;
    custom: number;
  };
}

export interface AlgoliaActivity extends Activity {
  _highlightResult?: Record<string, unknown>;
  _snippetResult?: Record<string, unknown>;
}
