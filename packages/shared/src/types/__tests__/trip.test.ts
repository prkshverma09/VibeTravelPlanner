import { describe, it, expect } from 'vitest';
import {
  tripSetupSchema,
  travelersSchema,
  itineraryDaySchema,
  scheduledActivitySchema,
  tripItinerarySchema,
  budgetLevelSchema,
  paceSchema,
  mobilitySchema,
  TRIP_STYLE_OPTIONS,
  createTrip,
  calculateTripDuration,
} from '../trip';

describe('Trip Types & Schemas', () => {
  const mockTripSetup = {
    destinationId: 'dubai-uae',
    dates: {
      start: '2026-03-15T00:00:00.000Z',
      end: '2026-03-22T00:00:00.000Z',
    },
    travelers: { adults: 2, children: 0 },
    budgetLevel: 'moderate' as const,
    tripStyle: ['Cultural Immersion', 'Food & Culinary'],
    pace: 'moderate' as const,
    interests: ['architecture', 'food', 'history'],
    mobility: 'full' as const,
  };

  describe('BudgetLevel Schema', () => {
    it('should accept valid budget levels', () => {
      expect(budgetLevelSchema.safeParse('budget').success).toBe(true);
      expect(budgetLevelSchema.safeParse('moderate').success).toBe(true);
      expect(budgetLevelSchema.safeParse('luxury').success).toBe(true);
      expect(budgetLevelSchema.safeParse('unlimited').success).toBe(true);
    });

    it('should reject invalid budget levels', () => {
      expect(budgetLevelSchema.safeParse('cheap').success).toBe(false);
      expect(budgetLevelSchema.safeParse('').success).toBe(false);
      expect(budgetLevelSchema.safeParse(123).success).toBe(false);
    });
  });

  describe('Pace Schema', () => {
    it('should accept valid pace values', () => {
      expect(paceSchema.safeParse('relaxed').success).toBe(true);
      expect(paceSchema.safeParse('moderate').success).toBe(true);
      expect(paceSchema.safeParse('packed').success).toBe(true);
    });

    it('should reject invalid pace values', () => {
      expect(paceSchema.safeParse('fast').success).toBe(false);
      expect(paceSchema.safeParse('slow').success).toBe(false);
    });
  });

  describe('Mobility Schema', () => {
    it('should accept valid mobility values', () => {
      expect(mobilitySchema.safeParse('full').success).toBe(true);
      expect(mobilitySchema.safeParse('limited').success).toBe(true);
      expect(mobilitySchema.safeParse('wheelchair').success).toBe(true);
    });

    it('should reject invalid mobility values', () => {
      expect(mobilitySchema.safeParse('none').success).toBe(false);
    });
  });

  describe('Travelers Schema', () => {
    it('should validate valid travelers', () => {
      const result = travelersSchema.safeParse({ adults: 2, children: 1 });
      expect(result.success).toBe(true);
    });

    it('should require at least one adult', () => {
      const result = travelersSchema.safeParse({ adults: 0, children: 2 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('adult');
      }
    });

    it('should allow optional children ages', () => {
      const result = travelersSchema.safeParse({
        adults: 2,
        children: 2,
        childrenAges: [5, 10],
      });
      expect(result.success).toBe(true);
    });

    it('should validate children ages are between 0-17', () => {
      const result = travelersSchema.safeParse({
        adults: 2,
        children: 1,
        childrenAges: [18],
      });
      expect(result.success).toBe(false);
    });

    it('should default children to 0', () => {
      const result = travelersSchema.safeParse({ adults: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.children).toBe(0);
      }
    });
  });

  describe('TripSetup Schema', () => {
    it('should validate valid trip setup', () => {
      const result = tripSetupSchema.safeParse(mockTripSetup);
      expect(result.success).toBe(true);
    });

    it('should reject trip with end date before start date', () => {
      const invalid = {
        ...mockTripSetup,
        dates: {
          start: '2026-03-22T00:00:00.000Z',
          end: '2026-03-15T00:00:00.000Z',
        },
      };
      const result = tripSetupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should require at least one adult traveler', () => {
      const invalid = {
        ...mockTripSetup,
        travelers: { adults: 0, children: 2 },
      };
      const result = tripSetupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate budget level enum', () => {
      const invalid = { ...mockTripSetup, budgetLevel: 'invalid' };
      const result = tripSetupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should require at least one trip style', () => {
      const invalid = { ...mockTripSetup, tripStyle: [] };
      const result = tripSetupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate trip style values', () => {
      const valid = { ...mockTripSetup, tripStyle: ['Cultural Immersion'] };
      expect(tripSetupSchema.safeParse(valid).success).toBe(true);

      const invalid = { ...mockTripSetup, tripStyle: ['Invalid Style'] };
      expect(tripSetupSchema.safeParse(invalid).success).toBe(false);
    });

    it('should allow optional mobility field with default', () => {
      const { mobility, ...withoutMobility } = mockTripSetup;
      const result = tripSetupSchema.safeParse(withoutMobility);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mobility).toBe('full');
      }
    });

    it('should allow optional interests field', () => {
      const { interests, ...withoutInterests } = mockTripSetup;
      const result = tripSetupSchema.safeParse(withoutInterests);
      expect(result.success).toBe(true);
    });
  });

  describe('ScheduledActivity Schema', () => {
    const mockActivity = {
      id: 'act-001',
      name: 'Desert Safari',
      type: 'adventure',
      startTime: '15:00',
      duration: 360,
      location: { lat: 25.2048, lng: 55.2708 },
      neighborhood: 'Desert',
      priceRange: { min: 75, max: 100 },
      bookingRequired: true,
      description: 'Experience the Arabian desert',
      rating: 4.7,
      reviews: 2847,
    };

    it('should validate valid activity', () => {
      const result = scheduledActivitySchema.safeParse(mockActivity);
      expect(result.success).toBe(true);
    });

    it('should validate start time format (HH:mm)', () => {
      const valid = { ...mockActivity, startTime: '14:30' };
      expect(scheduledActivitySchema.safeParse(valid).success).toBe(true);

      const invalid1 = { ...mockActivity, startTime: '2:30 PM' };
      expect(scheduledActivitySchema.safeParse(invalid1).success).toBe(false);

      const invalid2 = { ...mockActivity, startTime: '25:00' };
      expect(scheduledActivitySchema.safeParse(invalid2).success).toBe(false);
    });

    it('should validate duration is positive', () => {
      const invalid = { ...mockActivity, duration: -1 };
      expect(scheduledActivitySchema.safeParse(invalid).success).toBe(false);

      const zero = { ...mockActivity, duration: 0 };
      expect(scheduledActivitySchema.safeParse(zero).success).toBe(false);
    });

    it('should validate geo-location bounds', () => {
      const invalidLat = { ...mockActivity, location: { lat: 91, lng: 55 } };
      expect(scheduledActivitySchema.safeParse(invalidLat).success).toBe(false);

      const invalidLng = { ...mockActivity, location: { lat: 25, lng: 181 } };
      expect(scheduledActivitySchema.safeParse(invalidLng).success).toBe(false);
    });

    it('should validate price range min <= max', () => {
      const invalid = { ...mockActivity, priceRange: { min: 100, max: 50 } };
      expect(scheduledActivitySchema.safeParse(invalid).success).toBe(false);
    });

    it('should allow optional fields', () => {
      const minimal = {
        id: 'act-001',
        name: 'Test Activity',
        startTime: '10:00',
        duration: 60,
        location: { lat: 25, lng: 55 },
        priceRange: { min: 0, max: 0 },
      };
      expect(scheduledActivitySchema.safeParse(minimal).success).toBe(true);
    });
  });

  describe('ItineraryDay Schema', () => {
    const mockDay = {
      dayNumber: 1,
      date: '2026-03-15T00:00:00.000Z',
      theme: 'Old Dubai & Cultural Heritage',
      activities: [
        {
          id: 'act-001',
          name: 'Al Fahidi',
          startTime: '14:00',
          duration: 120,
          location: { lat: 25.2, lng: 55.3 },
          priceRange: { min: 0, max: 0 },
        },
      ],
      estimatedCost: 50,
    };

    it('should validate valid itinerary day', () => {
      const result = itineraryDaySchema.safeParse(mockDay);
      expect(result.success).toBe(true);
    });

    it('should require dayNumber to be positive', () => {
      const invalid = { ...mockDay, dayNumber: 0 };
      expect(itineraryDaySchema.safeParse(invalid).success).toBe(false);
    });

    it('should require at least one activity', () => {
      const invalid = { ...mockDay, activities: [] };
      expect(itineraryDaySchema.safeParse(invalid).success).toBe(false);
    });

    it('should validate all activities', () => {
      const invalid = {
        ...mockDay,
        activities: [
          { ...mockDay.activities[0], startTime: 'invalid' },
        ],
      };
      expect(itineraryDaySchema.safeParse(invalid).success).toBe(false);
    });

    it('should allow optional alternativeActivities', () => {
      const withAlternatives = {
        ...mockDay,
        alternativeActivities: [mockDay.activities[0]],
      };
      expect(itineraryDaySchema.safeParse(withAlternatives).success).toBe(true);
    });
  });

  describe('TripItinerary Schema', () => {
    const mockItinerary = {
      id: 'trip-001',
      destination: {
        objectID: 'dubai-uae',
        city: 'Dubai',
        country: 'United Arab Emirates',
      },
      dates: {
        start: '2026-03-15T00:00:00.000Z',
        end: '2026-03-22T00:00:00.000Z',
      },
      travelers: { adults: 2, children: 0 },
      days: [
        {
          dayNumber: 1,
          date: '2026-03-15T00:00:00.000Z',
          theme: 'Day 1',
          activities: [
            {
              id: 'act-001',
              name: 'Activity 1',
              startTime: '10:00',
              duration: 60,
              location: { lat: 25, lng: 55 },
              priceRange: { min: 0, max: 50 },
            },
          ],
          estimatedCost: 50,
        },
      ],
      totalEstimatedCost: {
        activities: 500,
        accommodation: 1000,
        food: 400,
        transport: 100,
        total: 2000,
      },
    };

    it('should validate valid itinerary', () => {
      const result = tripItinerarySchema.safeParse(mockItinerary);
      expect(result.success).toBe(true);
    });

    it('should validate total cost equals sum of categories', () => {
      const invalid = {
        ...mockItinerary,
        totalEstimatedCost: {
          ...mockItinerary.totalEstimatedCost,
          total: 1000, // Wrong sum
        },
      };
      const result = tripItinerarySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Trip Style Options', () => {
    it('should include all expected trip styles', () => {
      expect(TRIP_STYLE_OPTIONS).toContain('Cultural Immersion');
      expect(TRIP_STYLE_OPTIONS).toContain('Adventure & Outdoors');
      expect(TRIP_STYLE_OPTIONS).toContain('Food & Culinary');
      expect(TRIP_STYLE_OPTIONS).toContain('Relaxation & Wellness');
      expect(TRIP_STYLE_OPTIONS).toContain('Nightlife & Entertainment');
      expect(TRIP_STYLE_OPTIONS).toContain('Shopping & Markets');
      expect(TRIP_STYLE_OPTIONS).toContain('Photography & Sightseeing');
      expect(TRIP_STYLE_OPTIONS).toContain('Family-Friendly');
      expect(TRIP_STYLE_OPTIONS).toContain('Romantic Getaway');
      expect(TRIP_STYLE_OPTIONS).toContain('Business + Leisure');
    });

    it('should have exactly 10 trip styles', () => {
      expect(TRIP_STYLE_OPTIONS).toHaveLength(10);
    });
  });

  describe('Utility Functions', () => {
    describe('createTrip', () => {
      it('should create trip with generated ID', () => {
        const trip = createTrip(mockTripSetup);
        expect(trip.id).toBeDefined();
        expect(trip.id).toMatch(/^trip_/);
      });

      it('should generate unique IDs', () => {
        const trip1 = createTrip(mockTripSetup);
        const trip2 = createTrip(mockTripSetup);
        expect(trip1.id).not.toBe(trip2.id);
      });

      it('should calculate totalDays from dates', () => {
        const trip = createTrip(mockTripSetup);
        expect(trip.totalDays).toBe(7);
      });

      it('should preserve setup properties', () => {
        const trip = createTrip(mockTripSetup);
        expect(trip.destinationId).toBe(mockTripSetup.destinationId);
        expect(trip.budgetLevel).toBe(mockTripSetup.budgetLevel);
        expect(trip.tripStyle).toEqual(mockTripSetup.tripStyle);
      });
    });

    describe('calculateTripDuration', () => {
      it('should calculate correct duration in days', () => {
        const days = calculateTripDuration(
          '2026-03-15T00:00:00.000Z',
          '2026-03-22T00:00:00.000Z'
        );
        expect(days).toBe(7);
      });

      it('should handle same day trips', () => {
        const days = calculateTripDuration(
          '2026-03-15T00:00:00.000Z',
          '2026-03-15T00:00:00.000Z'
        );
        expect(days).toBe(0);
      });

      it('should return 1 for next day', () => {
        const days = calculateTripDuration(
          '2026-03-15T00:00:00.000Z',
          '2026-03-16T00:00:00.000Z'
        );
        expect(days).toBe(1);
      });
    });
  });
});
