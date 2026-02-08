import { describe, it, expect } from 'vitest';
import {
  activitySchema,
  activityPriceSchema,
  activityAvailabilitySchema,
  poiSchema,
  poiCategorySchema,
  openingHoursSchema,
  POI_CATEGORIES,
} from '../activity';

describe('Activity & POI Types', () => {
  describe('POI Categories', () => {
    it('should include all expected POI categories', () => {
      expect(POI_CATEGORIES).toContain('cafe');
      expect(POI_CATEGORIES).toContain('restaurant');
      expect(POI_CATEGORIES).toContain('museum');
      expect(POI_CATEGORIES).toContain('gallery');
      expect(POI_CATEGORIES).toContain('landmark');
      expect(POI_CATEGORIES).toContain('bar');
      expect(POI_CATEGORIES).toContain('club');
      expect(POI_CATEGORIES).toContain('spa');
      expect(POI_CATEGORIES).toContain('shopping');
      expect(POI_CATEGORIES).toContain('pharmacy');
      expect(POI_CATEGORIES).toContain('atm');
      expect(POI_CATEGORIES).toContain('transport');
    });

    it('should validate POI category schema', () => {
      expect(poiCategorySchema.safeParse('cafe').success).toBe(true);
      expect(poiCategorySchema.safeParse('restaurant').success).toBe(true);
      expect(poiCategorySchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('Opening Hours Schema', () => {
    it('should validate valid opening hours', () => {
      const validHours = {
        monday: '07:00-18:00',
        tuesday: '07:00-18:00',
        wednesday: '07:00-18:00',
        thursday: '07:00-18:00',
        friday: '08:00-18:00',
        saturday: '08:00-18:00',
        sunday: '08:00-18:00',
      };
      expect(openingHoursSchema.safeParse(validHours).success).toBe(true);
    });

    it('should allow partial opening hours', () => {
      const partialHours = {
        monday: '09:00-17:00',
        wednesday: '09:00-17:00',
        friday: '09:00-17:00',
      };
      expect(openingHoursSchema.safeParse(partialHours).success).toBe(true);
    });

    it('should allow closed days', () => {
      const withClosed = {
        monday: 'closed',
        tuesday: '09:00-17:00',
      };
      expect(openingHoursSchema.safeParse(withClosed).success).toBe(true);
    });

    it('should allow 24/7 hours', () => {
      const twentyFourSeven = {
        monday: '00:00-23:59',
      };
      expect(openingHoursSchema.safeParse(twentyFourSeven).success).toBe(true);
    });
  });

  describe('Activity Price Schema', () => {
    it('should validate valid activity price', () => {
      const price = {
        amount: 75,
        currency: 'USD',
        per: 'person' as const,
      };
      expect(activityPriceSchema.safeParse(price).success).toBe(true);
    });

    it('should allow optional child price', () => {
      const price = {
        amount: 75,
        currency: 'USD',
        per: 'person' as const,
        childPrice: 50,
      };
      const result = activityPriceSchema.safeParse(price);
      expect(result.success).toBe(true);
    });

    it('should allow includes array', () => {
      const price = {
        amount: 75,
        currency: 'USD',
        per: 'person' as const,
        includes: ['transport', 'dinner', 'entertainment'],
      };
      expect(activityPriceSchema.safeParse(price).success).toBe(true);
    });

    it('should validate per values', () => {
      const perPerson = { amount: 50, currency: 'USD', per: 'person' };
      const perGroup = { amount: 200, currency: 'USD', per: 'group' };
      const perVehicle = { amount: 150, currency: 'USD', per: 'vehicle' };

      expect(activityPriceSchema.safeParse(perPerson).success).toBe(true);
      expect(activityPriceSchema.safeParse(perGroup).success).toBe(true);
      expect(activityPriceSchema.safeParse(perVehicle).success).toBe(true);

      const invalid = { amount: 50, currency: 'USD', per: 'invalid' };
      expect(activityPriceSchema.safeParse(invalid).success).toBe(false);
    });

    it('should require positive amount', () => {
      const negative = { amount: -10, currency: 'USD', per: 'person' };
      expect(activityPriceSchema.safeParse(negative).success).toBe(false);
    });
  });

  describe('Activity Availability Schema', () => {
    it('should validate valid availability', () => {
      const availability = {
        days: ['monday', 'tuesday', 'wednesday'],
        times: ['09:00', '14:00'],
        advanceBookingDays: 1,
      };
      expect(activityAvailabilitySchema.safeParse(availability).success).toBe(true);
    });

    it('should allow "daily" as days value', () => {
      const daily = {
        days: ['daily'],
        times: ['10:00'],
      };
      expect(activityAvailabilitySchema.safeParse(daily).success).toBe(true);
    });

    it('should allow seasonal notes', () => {
      const withNotes = {
        days: ['daily'],
        times: ['15:00'],
        seasonalNotes: 'Best October-April',
      };
      expect(activityAvailabilitySchema.safeParse(withNotes).success).toBe(true);
    });

    it('should validate time format', () => {
      const validTimes = { days: ['monday'], times: ['09:00', '14:30'] };
      expect(activityAvailabilitySchema.safeParse(validTimes).success).toBe(true);

      const invalidTimes = { days: ['monday'], times: ['9am', '2pm'] };
      expect(activityAvailabilitySchema.safeParse(invalidTimes).success).toBe(false);
    });
  });

  describe('Activity Schema', () => {
    const mockActivity = {
      objectID: 'act_dubai_001',
      name: 'Desert Safari with BBQ Dinner',
      destinationId: 'dubai-uae',
      category: 'adventure',
      subcategory: 'desert_experience',
      description: 'Experience the magic of the Arabian desert',
      durationHours: 6,
      price: {
        amount: 75,
        currency: 'USD',
        per: 'person' as const,
        includes: ['transport', 'dinner', 'entertainment'],
      },
      availability: {
        days: ['daily'],
        times: ['15:00', '15:30'],
        advanceBookingDays: 1,
      },
      meetingPoint: {
        _geoloc: { lat: 25.2048, lng: 55.2708 },
        address: 'Hotel pickup included',
        pickupAvailable: true,
      },
      suitableFor: ['families', 'couples', 'solo', 'groups'],
      accessibility: 'moderate' as const,
      vibeTags: ['adventure', 'cultural', 'instagram-worthy', 'sunset'],
      rating: 4.7,
      reviewsCount: 2847,
      bookingUrl: 'https://example.com/book',
      photos: ['photo1.jpg', 'photo2.jpg'],
      tips: ['Wear comfortable clothing', 'Bring camera'],
      bestTime: 'October to April',
      weatherDependent: true,
    };

    it('should validate valid activity', () => {
      const result = activitySchema.safeParse(mockActivity);
      expect(result.success).toBe(true);
    });

    it('should require objectID', () => {
      const { objectID, ...withoutId } = mockActivity;
      expect(activitySchema.safeParse(withoutId).success).toBe(false);
    });

    it('should require name', () => {
      const { name, ...withoutName } = mockActivity;
      expect(activitySchema.safeParse(withoutName).success).toBe(false);
    });

    it('should validate duration is positive', () => {
      const invalid = { ...mockActivity, durationHours: 0 };
      expect(activitySchema.safeParse(invalid).success).toBe(false);

      const negative = { ...mockActivity, durationHours: -1 };
      expect(activitySchema.safeParse(negative).success).toBe(false);
    });

    it('should validate rating range (0-5)', () => {
      const valid = { ...mockActivity, rating: 4.5 };
      expect(activitySchema.safeParse(valid).success).toBe(true);

      const tooHigh = { ...mockActivity, rating: 5.5 };
      expect(activitySchema.safeParse(tooHigh).success).toBe(false);

      const tooLow = { ...mockActivity, rating: -0.5 };
      expect(activitySchema.safeParse(tooLow).success).toBe(false);
    });

    it('should validate geo-location in meeting point', () => {
      const invalidLat = {
        ...mockActivity,
        meetingPoint: {
          ...mockActivity.meetingPoint,
          _geoloc: { lat: 100, lng: 55 },
        },
      };
      expect(activitySchema.safeParse(invalidLat).success).toBe(false);
    });

    it('should validate accessibility values', () => {
      const easy = { ...mockActivity, accessibility: 'easy' };
      const moderate = { ...mockActivity, accessibility: 'moderate' };
      const challenging = { ...mockActivity, accessibility: 'challenging' };

      expect(activitySchema.safeParse(easy).success).toBe(true);
      expect(activitySchema.safeParse(moderate).success).toBe(true);
      expect(activitySchema.safeParse(challenging).success).toBe(true);

      const invalid = { ...mockActivity, accessibility: 'impossible' };
      expect(activitySchema.safeParse(invalid).success).toBe(false);
    });

    it('should allow minimal activity', () => {
      const minimal = {
        objectID: 'act_001',
        name: 'Test Activity',
        destinationId: 'test-dest',
        category: 'sightseeing',
        durationHours: 2,
        price: { amount: 0, currency: 'USD', per: 'person' },
      };
      expect(activitySchema.safeParse(minimal).success).toBe(true);
    });
  });

  describe('POI Schema', () => {
    const mockPOI = {
      objectID: 'poi_dubai_cafe_001',
      name: 'Tom & Serg',
      destinationId: 'dubai-uae',
      category: 'cafe' as const,
      subcategory: 'specialty_coffee',
      _geoloc: { lat: 25.1861, lng: 55.2619 },
      address: 'Al Quoz Industrial Area 1, Dubai',
      neighborhood: 'Al Quoz',
      description: 'Industrial-chic specialty coffee roaster',
      priceRange: '$$',
      openingHours: {
        monday: '07:00-18:00',
        tuesday: '07:00-18:00',
      },
      vibeTags: ['hipster', 'instagram-worthy', 'brunch'],
      rating: 4.8,
      reviewsCount: 3421,
      photos: ['photo1.jpg'],
      mustTry: ['Flat White', 'Avocado Toast'],
      goodFor: ['breakfast', 'brunch', 'coffee'],
      accessibility: 'full' as const,
      parking: 'street_parking',
      reservations: 'walk-in' as const,
      website: 'https://tomandserg.com',
      phone: '+971-4-388-5998',
    };

    it('should validate valid POI', () => {
      const result = poiSchema.safeParse(mockPOI);
      expect(result.success).toBe(true);
    });

    it('should validate POI category', () => {
      const validCategories = ['cafe', 'restaurant', 'museum', 'pharmacy'];
      validCategories.forEach((category) => {
        const poi = { ...mockPOI, category };
        expect(poiSchema.safeParse(poi).success).toBe(true);
      });

      const invalid = { ...mockPOI, category: 'invalid_category' };
      expect(poiSchema.safeParse(invalid).success).toBe(false);
    });

    it('should validate geo-location', () => {
      const invalidLat = { ...mockPOI, _geoloc: { lat: 91, lng: 55 } };
      expect(poiSchema.safeParse(invalidLat).success).toBe(false);

      const invalidLng = { ...mockPOI, _geoloc: { lat: 25, lng: 181 } };
      expect(poiSchema.safeParse(invalidLng).success).toBe(false);
    });

    it('should validate price range values', () => {
      const validPrices = ['$', '$$', '$$$', '$$$$'];
      validPrices.forEach((priceRange) => {
        const poi = { ...mockPOI, priceRange };
        expect(poiSchema.safeParse(poi).success).toBe(true);
      });

      const invalid = { ...mockPOI, priceRange: '$$$$$' };
      expect(poiSchema.safeParse(invalid).success).toBe(false);
    });

    it('should validate rating range', () => {
      const valid = { ...mockPOI, rating: 4.5 };
      expect(poiSchema.safeParse(valid).success).toBe(true);

      const tooHigh = { ...mockPOI, rating: 5.1 };
      expect(poiSchema.safeParse(tooHigh).success).toBe(false);
    });

    it('should validate reservations values', () => {
      const walkIn = { ...mockPOI, reservations: 'walk-in' };
      const recommended = { ...mockPOI, reservations: 'recommended' };
      const required = { ...mockPOI, reservations: 'required' };

      expect(poiSchema.safeParse(walkIn).success).toBe(true);
      expect(poiSchema.safeParse(recommended).success).toBe(true);
      expect(poiSchema.safeParse(required).success).toBe(true);
    });

    it('should allow distance field', () => {
      const withDistance = { ...mockPOI, distance: 150 };
      const result = poiSchema.safeParse(withDistance);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.distance).toBe(150);
      }
    });

    it('should allow minimal POI', () => {
      const minimal = {
        objectID: 'poi_001',
        name: 'Test POI',
        destinationId: 'test-dest',
        category: 'cafe' as const,
        _geoloc: { lat: 25.2, lng: 55.3 },
      };
      expect(poiSchema.safeParse(minimal).success).toBe(true);
    });
  });
});
