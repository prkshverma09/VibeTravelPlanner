import { describe, it, expect } from 'vitest';
import {
  generateItinerary,
  getDayTheme,
  getActivitiesForTimeSlot,
  calculateDayCost,
  type ItineraryInput,
  type GeneratedItinerary,
  type ItineraryDay,
} from '../itinerary.service';

const mockCity = {
  objectID: 'tokyo-japan',
  city: 'Tokyo',
  country: 'Japan',
  continent: 'Asia',
  description: 'A vibrant metropolis blending tradition with futurism',
  vibe_tags: ['Cultural', 'Modern', 'Food Paradise', 'Technology Hub'],
  culture_score: 95,
  adventure_score: 70,
  nature_score: 60,
  beach_score: 30,
  nightlife_score: 85,
  climate_type: 'Temperate',
  best_time_to_visit: 'March to May, September to November',
};

describe('Itinerary Generation Service', () => {
  describe('generateItinerary', () => {
    it('should generate itinerary with correct number of days', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 3,
        interests: ['culture', 'food'],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const result = generateItinerary(input);

      expect(result.days).toHaveLength(3);
      expect(result.destination.city).toBe('Tokyo');
    });

    it('should generate itinerary with day numbers starting at 1', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 2,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const result = generateItinerary(input);

      expect(result.days[0].dayNumber).toBe(1);
      expect(result.days[1].dayNumber).toBe(2);
    });

    it('should include activities for each day', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 1,
        interests: ['culture'],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const result = generateItinerary(input);

      expect(result.days[0].activities.length).toBeGreaterThan(0);
    });

    it('should generate more activities for active pace', () => {
      const relaxedInput: ItineraryInput = {
        city: mockCity,
        durationDays: 1,
        interests: [],
        travelStyle: 'balanced',
        pace: 'relaxed',
      };

      const packedInput: ItineraryInput = {
        city: mockCity,
        durationDays: 1,
        interests: [],
        travelStyle: 'balanced',
        pace: 'packed',
      };

      const relaxedResult = generateItinerary(relaxedInput);
      const packedResult = generateItinerary(packedInput);

      expect(packedResult.days[0].activities.length).toBeGreaterThan(
        relaxedResult.days[0].activities.length
      );
    });

    it('should include metadata about the trip', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 3,
        interests: ['culture', 'food'],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const result = generateItinerary(input);

      expect(result.totalDays).toBe(3);
      expect(result.interests).toEqual(['culture', 'food']);
      expect(result.travelStyle).toBe('balanced');
    });

    it('should calculate total estimated cost', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 2,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const result = generateItinerary(input);

      expect(result.estimatedTotalCost).toBeGreaterThan(0);
      expect(typeof result.estimatedTotalCost).toBe('number');
    });
  });

  describe('getDayTheme', () => {
    it('should return culture theme for high culture score city', () => {
      const theme = getDayTheme(mockCity, 1, ['culture']);
      expect(theme.toLowerCase()).toContain('cultur');
    });

    it('should vary themes across days', () => {
      const theme1 = getDayTheme(mockCity, 1, []);
      const theme2 = getDayTheme(mockCity, 2, []);
      const theme3 = getDayTheme(mockCity, 3, []);

      const themes = [theme1, theme2, theme3];
      const uniqueThemes = new Set(themes);

      expect(uniqueThemes.size).toBeGreaterThanOrEqual(2);
    });

    it('should prioritize user interests in themes', () => {
      const theme = getDayTheme(mockCity, 1, ['food']);
      expect(theme.toLowerCase()).toMatch(/food|culinary|dining/);
    });
  });

  describe('getActivitiesForTimeSlot', () => {
    it('should return activities for morning slot', () => {
      const activities = getActivitiesForTimeSlot(mockCity, 'morning', ['culture']);

      expect(activities.length).toBeGreaterThan(0);
      activities.forEach((activity) => {
        expect(activity.timeSlot).toBe('morning');
      });
    });

    it('should return activities for afternoon slot', () => {
      const activities = getActivitiesForTimeSlot(mockCity, 'afternoon', []);

      expect(activities.length).toBeGreaterThan(0);
      activities.forEach((activity) => {
        expect(activity.timeSlot).toBe('afternoon');
      });
    });

    it('should return activities for evening slot', () => {
      const activities = getActivitiesForTimeSlot(mockCity, 'evening', ['nightlife']);

      expect(activities.length).toBeGreaterThan(0);
      activities.forEach((activity) => {
        expect(activity.timeSlot).toBe('evening');
      });
    });

    it('should match activities to city vibe tags', () => {
      const activities = getActivitiesForTimeSlot(mockCity, 'morning', []);

      const hasMatchingVibes = activities.some(
        (activity) =>
          activity.vibeTags &&
          activity.vibeTags.some((tag) =>
            mockCity.vibe_tags.some(
              (cityTag) =>
                cityTag.toLowerCase().includes(tag.toLowerCase()) ||
                tag.toLowerCase().includes(cityTag.toLowerCase())
            )
          )
      );

      expect(hasMatchingVibes).toBe(true);
    });
  });

  describe('calculateDayCost', () => {
    it('should calculate cost for a day with activities', () => {
      const mockDay: ItineraryDay = {
        dayNumber: 1,
        theme: 'Cultural Exploration',
        activities: [
          {
            id: '1',
            name: 'Temple Visit',
            description: 'Visit ancient temple',
            timeSlot: 'morning',
            startTime: '09:00',
            duration: 120,
            cost: 'budget',
            category: 'culture',
          },
          {
            id: '2',
            name: 'Museum Tour',
            description: 'Art museum visit',
            timeSlot: 'afternoon',
            startTime: '14:00',
            duration: 180,
            cost: 'moderate',
            category: 'culture',
          },
        ],
        meals: [],
        transportTips: [],
        estimatedCost: 0,
      };

      const cost = calculateDayCost(mockDay);

      expect(cost).toBeGreaterThan(0);
    });

    it('should return higher cost for luxury activities', () => {
      const budgetDay: ItineraryDay = {
        dayNumber: 1,
        theme: 'Budget Day',
        activities: [
          {
            id: '1',
            name: 'Free Park',
            description: 'Public park',
            timeSlot: 'morning',
            startTime: '09:00',
            duration: 120,
            cost: 'free',
            category: 'nature',
          },
        ],
        meals: [],
        transportTips: [],
        estimatedCost: 0,
      };

      const luxuryDay: ItineraryDay = {
        dayNumber: 1,
        theme: 'Luxury Day',
        activities: [
          {
            id: '1',
            name: 'Fine Dining',
            description: 'Michelin restaurant',
            timeSlot: 'evening',
            startTime: '19:00',
            duration: 180,
            cost: 'expensive',
            category: 'food',
          },
        ],
        meals: [],
        transportTips: [],
        estimatedCost: 0,
      };

      const budgetCost = calculateDayCost(budgetDay);
      const luxuryCost = calculateDayCost(luxuryDay);

      expect(luxuryCost).toBeGreaterThan(budgetCost);
    });
  });

  describe('Itinerary Structure', () => {
    it('should have properly structured activities', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 1,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const result = generateItinerary(input);
      const activity = result.days[0].activities[0];

      expect(activity).toHaveProperty('id');
      expect(activity).toHaveProperty('name');
      expect(activity).toHaveProperty('description');
      expect(activity).toHaveProperty('timeSlot');
      expect(activity).toHaveProperty('duration');
      expect(activity).toHaveProperty('cost');
    });

    it('should have transport tips for each day', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 1,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const result = generateItinerary(input);

      expect(result.days[0].transportTips).toBeDefined();
      expect(Array.isArray(result.days[0].transportTips)).toBe(true);
    });
  });
});
