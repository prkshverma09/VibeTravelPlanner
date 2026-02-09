import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockCities } from '@vibe-travel/shared';
import { createSavePreferenceHandler } from '../savePreference';
import { createCompareCitiesHandler } from '../compareCities';
import { createAddToTripPlanHandler } from '../addToTripPlan';
import { createGenerateItineraryHandler } from '../generateItinerary';
import { createClearPreferencesHandler } from '../clearPreferences';
import { createCheckWeatherHandler } from '../checkWeather';
import type { TripState } from '../../context/TripContext';
import type { WeatherData } from '../../services/weather.service';

const createInitialState = (): TripState => ({
  preferences: [],
  tripPlan: [],
  comparison: { cities: [], focusAttributes: [], isActive: false },
  conversationSummary: [],
});

describe('Client-Side Tools', () => {
  describe('savePreference', () => {
    it('should dispatch ADD_PREFERENCE action with correct payload', () => {
      const dispatch = vi.fn();
      const state = createInitialState();
      const addToolResult = vi.fn();

      const handler = createSavePreferenceHandler(dispatch, state);
      handler({
        input: { category: 'vibe', value: 'romantic', priority: 'must_have' },
        addToolResult,
      });

      expect(dispatch).toHaveBeenCalledWith({
        type: 'ADD_PREFERENCE',
        payload: { category: 'vibe', value: 'romantic', priority: 'must_have' },
      });
    });

    it('should default priority to nice_to_have when null', () => {
      const dispatch = vi.fn();
      const state = createInitialState();
      const addToolResult = vi.fn();

      const handler = createSavePreferenceHandler(dispatch, state);
      handler({
        input: { category: 'geography', value: 'Europe', priority: null },
        addToolResult,
      });

      expect(dispatch).toHaveBeenCalledWith({
        type: 'ADD_PREFERENCE',
        payload: { category: 'geography', value: 'Europe', priority: 'nice_to_have' },
      });
    });

    it('should return success output with current preferences', () => {
      const dispatch = vi.fn();
      const state: TripState = {
        ...createInitialState(),
        preferences: [
          { category: 'vibe', value: 'peaceful', priority: 'must_have', addedAt: Date.now() },
        ],
      };
      const addToolResult = vi.fn();

      const handler = createSavePreferenceHandler(dispatch, state);
      handler({
        input: { category: 'geography', value: 'Asia', priority: 'must_have' },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          success: true,
          message: expect.stringContaining('Asia'),
          currentPreferences: expect.arrayContaining([
            'vibe: peaceful',
            'geography: Asia',
          ]),
        }),
      });
    });
  });

  describe('compareCities', () => {
    it('should fetch cities and dispatch SET_COMPARISON', async () => {
      const dispatch = vi.fn();
      const fetchCities = vi.fn().mockResolvedValue([mockCities[0], mockCities[1]]);
      const addToolResult = vi.fn();

      const handler = createCompareCitiesHandler(dispatch, fetchCities);
      await handler({
        input: { cities: ['tokyo-japan', 'paris-france'], focus_attributes: null },
        addToolResult,
      });

      expect(fetchCities).toHaveBeenCalledWith(['tokyo-japan', 'paris-france']);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_COMPARISON',
        payload: expect.objectContaining({
          isActive: true,
          cities: expect.arrayContaining([
            expect.objectContaining({ objectID: 'tokyo-japan' }),
            expect.objectContaining({ objectID: 'paris-france' }),
          ]),
        }),
      });
    });

    it('should use focus_attributes when provided', async () => {
      const dispatch = vi.fn();
      const fetchCities = vi.fn().mockResolvedValue([mockCities[0], mockCities[1]]);
      const addToolResult = vi.fn();

      const handler = createCompareCitiesHandler(dispatch, fetchCities);
      await handler({
        input: {
          cities: ['tokyo-japan', 'paris-france'],
          focus_attributes: ['culture_score', 'nightlife_score']
        },
        addToolResult,
      });

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_COMPARISON',
        payload: expect.objectContaining({
          focusAttributes: ['culture_score', 'nightlife_score'],
        }),
      });
    });

    it('should return comparison data with recommendation', async () => {
      const dispatch = vi.fn();
      const fetchCities = vi.fn().mockResolvedValue([mockCities[0], mockCities[1]]);
      const addToolResult = vi.fn();

      const handler = createCompareCitiesHandler(dispatch, fetchCities);
      await handler({
        input: { cities: ['tokyo-japan', 'paris-france'], focus_attributes: null },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          cities: expect.any(Array),
          comparison: expect.objectContaining({
            attributes: expect.any(Array),
            data: expect.any(Object),
          }),
        }),
      });
    });

    it('should handle fetch error gracefully', async () => {
      const dispatch = vi.fn();
      const fetchCities = vi.fn().mockRejectedValue(new Error('Network error'));
      const addToolResult = vi.fn();

      const handler = createCompareCitiesHandler(dispatch, fetchCities);
      await handler({
        input: { cities: ['invalid-id'], focus_attributes: null },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          cities: [],
          comparison: expect.objectContaining({
            recommendation: expect.stringContaining('Error'),
          }),
        }),
      });
    });

    it('should handle insufficient cities', async () => {
      const dispatch = vi.fn();
      const fetchCities = vi.fn().mockResolvedValue([mockCities[0]]);
      const addToolResult = vi.fn();

      const handler = createCompareCitiesHandler(dispatch, fetchCities);
      await handler({
        input: { cities: ['tokyo-japan'], focus_attributes: null },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          cities: [],
          comparison: expect.objectContaining({
            recommendation: expect.stringContaining('not find enough'),
          }),
        }),
      });
    });
  });

  describe('addToTripPlan', () => {
    it('should dispatch ADD_TO_TRIP with fetched city', async () => {
      const dispatch = vi.fn();
      const fetchCity = vi.fn().mockResolvedValue(mockCities[0]);
      const state = createInitialState();
      const addToolResult = vi.fn();

      const handler = createAddToTripPlanHandler(dispatch, fetchCity, state);
      await handler({
        input: { city_id: 'tokyo-japan', duration_days: 5, notes: 'Must visit!' },
        addToolResult,
      });

      expect(fetchCity).toHaveBeenCalledWith('tokyo-japan');
      expect(dispatch).toHaveBeenCalledWith({
        type: 'ADD_TO_TRIP',
        payload: {
          city: mockCities[0],
          durationDays: 5,
          notes: 'Must visit!',
        },
      });
    });

    it('should return updated trip plan summary', async () => {
      const dispatch = vi.fn();
      const fetchCity = vi.fn().mockResolvedValue(mockCities[0]);
      const state: TripState = {
        ...createInitialState(),
        tripPlan: [
          { city: mockCities[1], durationDays: 3, notes: null, addedAt: Date.now() },
        ],
      };
      const addToolResult = vi.fn();

      const handler = createAddToTripPlanHandler(dispatch, fetchCity, state);
      await handler({
        input: { city_id: 'tokyo-japan', duration_days: 5, notes: null },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          success: true,
          message: expect.stringContaining('Tokyo'),
          tripPlan: expect.arrayContaining([
            expect.objectContaining({ cityName: 'Paris' }),
            expect.objectContaining({ cityName: 'Tokyo', days: 5 }),
          ]),
        }),
      });
    });

    it('should handle city not found', async () => {
      const dispatch = vi.fn();
      const fetchCity = vi.fn().mockResolvedValue(null);
      const state = createInitialState();
      const addToolResult = vi.fn();

      const handler = createAddToTripPlanHandler(dispatch, fetchCity, state);
      await handler({
        input: { city_id: 'unknown-city', duration_days: 5, notes: null },
        addToolResult,
      });

      expect(dispatch).not.toHaveBeenCalled();
      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          success: false,
          message: expect.stringContaining('not find'),
        }),
      });
    });
  });

  describe('generateItinerary', () => {
    it('should generate itinerary for specified duration', async () => {
      const fetchCity = vi.fn().mockResolvedValue(mockCities[0]);
      const addToolResult = vi.fn();

      const handler = createGenerateItineraryHandler(fetchCity);
      await handler({
        input: {
          city_id: 'tokyo-japan',
          duration_days: 3,
          interests: null,
          travel_style: null,
        },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          cityId: 'tokyo-japan',
          cityName: 'Tokyo',
          days: expect.arrayContaining([
            expect.objectContaining({ day: 1 }),
            expect.objectContaining({ day: 2 }),
            expect.objectContaining({ day: 3 }),
          ]),
        }),
      });
    });

    it('should include activities for each day', async () => {
      const fetchCity = vi.fn().mockResolvedValue(mockCities[0]);
      const addToolResult = vi.fn();

      const handler = createGenerateItineraryHandler(fetchCity);
      await handler({
        input: {
          city_id: 'tokyo-japan',
          duration_days: 2,
          interests: ['food', 'culture'],
          travel_style: 'active',
        },
        addToolResult,
      });

      const output = addToolResult.mock.calls[0][0].output;
      expect(output.days[0].activities.length).toBeGreaterThan(0);
      expect(output.days[0].activities[0]).toHaveProperty('time');
      expect(output.days[0].activities[0]).toHaveProperty('activity');
      expect(output.days[0].activities[0]).toHaveProperty('description');
    });

    it('should include theme for each day', async () => {
      const fetchCity = vi.fn().mockResolvedValue(mockCities[0]);
      const addToolResult = vi.fn();

      const handler = createGenerateItineraryHandler(fetchCity);
      await handler({
        input: {
          city_id: 'tokyo-japan',
          duration_days: 2,
          interests: null,
          travel_style: 'relaxed',
        },
        addToolResult,
      });

      const output = addToolResult.mock.calls[0][0].output;
      expect(output.days[0].theme).toBeTruthy();
      expect(typeof output.days[0].theme).toBe('string');
    });

    it('should handle city not found', async () => {
      const fetchCity = vi.fn().mockResolvedValue(null);
      const addToolResult = vi.fn();

      const handler = createGenerateItineraryHandler(fetchCity);
      await handler({
        input: {
          city_id: 'unknown',
          duration_days: 3,
          interests: null,
          travel_style: null,
        },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          cityId: 'unknown',
          cityName: 'Unknown',
          days: [],
        }),
      });
    });
  });

  describe('clearPreferences', () => {
    it('should dispatch CLEAR_PREFERENCES with specific category', () => {
      const dispatch = vi.fn();
      const state: TripState = {
        ...createInitialState(),
        preferences: [
          { category: 'vibe', value: 'romantic', priority: 'must_have', addedAt: Date.now() },
          { category: 'vibe', value: 'peaceful', priority: 'nice_to_have', addedAt: Date.now() },
          { category: 'geography', value: 'Europe', priority: 'must_have', addedAt: Date.now() },
        ],
      };
      const addToolResult = vi.fn();

      const handler = createClearPreferencesHandler(dispatch, state);
      handler({
        input: { category: 'vibe' },
        addToolResult,
      });

      expect(dispatch).toHaveBeenCalledWith({
        type: 'CLEAR_PREFERENCES',
        payload: { category: 'vibe' },
      });
    });

    it('should dispatch CLEAR_PREFERENCES with all when category is null', () => {
      const dispatch = vi.fn();
      const state: TripState = {
        ...createInitialState(),
        preferences: [
          { category: 'vibe', value: 'romantic', priority: 'must_have', addedAt: Date.now() },
          { category: 'geography', value: 'Europe', priority: 'must_have', addedAt: Date.now() },
        ],
      };
      const addToolResult = vi.fn();

      const handler = createClearPreferencesHandler(dispatch, state);
      handler({
        input: { category: null },
        addToolResult,
      });

      expect(dispatch).toHaveBeenCalledWith({
        type: 'CLEAR_PREFERENCES',
        payload: { category: 'all' },
      });
    });

    it('should return count of cleared preferences', () => {
      const dispatch = vi.fn();
      const state: TripState = {
        ...createInitialState(),
        preferences: [
          { category: 'vibe', value: 'romantic', priority: 'must_have', addedAt: Date.now() },
          { category: 'vibe', value: 'peaceful', priority: 'nice_to_have', addedAt: Date.now() },
          { category: 'geography', value: 'Europe', priority: 'must_have', addedAt: Date.now() },
        ],
      };
      const addToolResult = vi.fn();

      const handler = createClearPreferencesHandler(dispatch, state);
      handler({
        input: { category: 'vibe' },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          success: true,
          clearedCount: 2,
          message: expect.stringContaining('2'),
        }),
      });
    });

    it('should handle clearing all preferences', () => {
      const dispatch = vi.fn();
      const state: TripState = {
        ...createInitialState(),
        preferences: [
          { category: 'vibe', value: 'romantic', priority: 'must_have', addedAt: Date.now() },
          { category: 'geography', value: 'Europe', priority: 'must_have', addedAt: Date.now() },
          { category: 'budget', value: 'luxury', priority: 'nice_to_have', addedAt: Date.now() },
        ],
      };
      const addToolResult = vi.fn();

      const handler = createClearPreferencesHandler(dispatch, state);
      handler({
        input: { category: null },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: expect.objectContaining({
          clearedCount: 3,
          message: expect.stringContaining('all'),
        }),
      });
    });
  });

  describe('checkWeather', () => {
    const mockWeatherData: WeatherData = {
      city: 'Tokyo',
      country: 'Japan',
      current: {
        temperature: 22,
        feelsLike: 21,
        humidity: 65,
        weatherCode: 1,
        weatherDescription: 'Mainly clear',
        weatherIcon: '🌤️',
        windSpeed: 12,
        isDay: true,
      },
      forecast: [
        {
          date: '2026-01-28',
          dayName: 'Today',
          tempMax: 24,
          tempMin: 18,
          weatherCode: 1,
          weatherDescription: 'Mainly clear',
          weatherIcon: '🌤️',
          precipitationProbability: 10,
        },
      ],
      packingRecommendations: ['Pack light clothing'],
      activitySuggestions: ['Great for outdoor activities'],
    };

    it('should return weather data for valid city', async () => {
      const getWeather = vi.fn().mockResolvedValue(mockWeatherData);
      const addToolResult = vi.fn();

      const handler = createCheckWeatherHandler(getWeather);
      await handler.onToolCall({
        input: { city_name: 'Tokyo', country: 'Japan' },
        addToolResult,
      });

      expect(getWeather).toHaveBeenCalledWith('Tokyo', 'Japan');
      expect(addToolResult).toHaveBeenCalledWith({
        output: { weather: mockWeatherData },
      });
    });

    it('should handle city without country', async () => {
      const getWeather = vi.fn().mockResolvedValue(mockWeatherData);
      const addToolResult = vi.fn();

      const handler = createCheckWeatherHandler(getWeather);
      await handler.onToolCall({
        input: { city_name: 'Tokyo', country: null },
        addToolResult,
      });

      expect(getWeather).toHaveBeenCalledWith('Tokyo', undefined);
    });

    it('should return error when city not found', async () => {
      const getWeather = vi.fn().mockResolvedValue(null);
      const addToolResult = vi.fn();

      const handler = createCheckWeatherHandler(getWeather);
      await handler.onToolCall({
        input: { city_name: 'NonexistentCity', country: null },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: {
          weather: null,
          error: expect.stringContaining('NonexistentCity'),
        },
      });
    });

    it('should handle API errors gracefully', async () => {
      const getWeather = vi.fn().mockRejectedValue(new Error('API Error'));
      const addToolResult = vi.fn();

      const handler = createCheckWeatherHandler(getWeather);
      await handler.onToolCall({
        input: { city_name: 'Tokyo', country: 'Japan' },
        addToolResult,
      });

      expect(addToolResult).toHaveBeenCalledWith({
        output: {
          weather: null,
          error: expect.stringContaining('Failed to fetch'),
        },
      });
    });
  });
});
