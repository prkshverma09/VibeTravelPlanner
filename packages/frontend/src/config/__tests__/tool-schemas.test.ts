import { describe, it, expect } from 'vitest';
import {
  ALL_TOOL_SCHEMAS,
  checkWeatherSchema,
  estimateBudgetSchema,
  generateItinerarySchema,
  compareCitiesSchema,
  addToWishlistSchema,
  savePreferenceSchema,
  addToTripPlanSchema,
  clearPreferencesSchema,
  getAgentStudioToolConfigs,
} from '../tool-schemas';

describe('Tool Schemas', () => {
  describe('Schema Structure', () => {
    it('should have all required tool schemas', () => {
      expect(ALL_TOOL_SCHEMAS).toHaveLength(8);
    });

    it('should have unique tool names', () => {
      const names = ALL_TOOL_SCHEMAS.map(s => s.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('each schema should have required fields', () => {
      ALL_TOOL_SCHEMAS.forEach(schema => {
        expect(schema).toHaveProperty('name');
        expect(schema).toHaveProperty('description');
        expect(schema).toHaveProperty('parameters');
        expect(schema).toHaveProperty('triggerPatterns');
        expect(schema.parameters).toHaveProperty('type', 'object');
        expect(schema.parameters).toHaveProperty('properties');
        expect(schema.parameters).toHaveProperty('required');
      });
    });
  });

  describe('Individual Schemas', () => {
    it('check_weather schema should require city_name', () => {
      expect(checkWeatherSchema.name).toBe('check_weather');
      expect(checkWeatherSchema.parameters.required).toContain('city_name');
      expect(checkWeatherSchema.triggerPatterns).toContain('weather');
    });

    it('estimate_budget schema should require city_id and duration_days', () => {
      expect(estimateBudgetSchema.name).toBe('estimate_budget');
      expect(estimateBudgetSchema.parameters.required).toContain('city_id');
      expect(estimateBudgetSchema.parameters.required).toContain('duration_days');
      expect(estimateBudgetSchema.triggerPatterns).toContain('budget');
    });

    it('generate_itinerary schema should require city_id and duration_days', () => {
      expect(generateItinerarySchema.name).toBe('generate_itinerary');
      expect(generateItinerarySchema.parameters.required).toContain('city_id');
      expect(generateItinerarySchema.parameters.required).toContain('duration_days');
      expect(generateItinerarySchema.triggerPatterns).toContain('itinerary');
    });

    it('compare_cities schema should require cities array', () => {
      expect(compareCitiesSchema.name).toBe('compare_cities');
      expect(compareCitiesSchema.parameters.required).toContain('cities');
      expect(compareCitiesSchema.triggerPatterns).toContain('compare');
    });

    it('add_to_wishlist schema should require city_id', () => {
      expect(addToWishlistSchema.name).toBe('add_to_wishlist');
      expect(addToWishlistSchema.parameters.required).toContain('city_id');
      expect(addToWishlistSchema.triggerPatterns).toContain('wishlist');
    });

    it('save_preference schema should require category and value', () => {
      expect(savePreferenceSchema.name).toBe('save_preference');
      expect(savePreferenceSchema.parameters.required).toContain('category');
      expect(savePreferenceSchema.parameters.required).toContain('value');
      expect(savePreferenceSchema.triggerPatterns).toContain('prefer');
    });

    it('add_to_trip_plan schema should require city_id', () => {
      expect(addToTripPlanSchema.name).toBe('add_to_trip_plan');
      expect(addToTripPlanSchema.parameters.required).toContain('city_id');
    });

    it('clear_preferences schema should have no required fields', () => {
      expect(clearPreferencesSchema.name).toBe('clear_preferences');
      expect(clearPreferencesSchema.parameters.required).toHaveLength(0);
      expect(clearPreferencesSchema.triggerPatterns).toContain('clear');
    });
  });

  describe('getAgentStudioToolConfigs', () => {
    it('should return configs for all tools', () => {
      const configs = getAgentStudioToolConfigs();
      expect(configs).toHaveLength(8);
    });

    it('should return configs without triggerPatterns', () => {
      const configs = getAgentStudioToolConfigs();
      configs.forEach(config => {
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('parameters');
        expect(config).not.toHaveProperty('triggerPatterns');
      });
    });
  });

  describe('Trigger Patterns', () => {
    it('weather schema should have weather-related triggers', () => {
      const triggers = checkWeatherSchema.triggerPatterns;
      expect(triggers).toContain('weather');
      expect(triggers).toContain('forecast');
      expect(triggers).toContain('temperature');
    });

    it('budget schema should have cost-related triggers', () => {
      const triggers = estimateBudgetSchema.triggerPatterns;
      expect(triggers).toContain('budget');
      expect(triggers).toContain('cost');
      expect(triggers).toContain('expensive');
      expect(triggers).toContain('affordable');
    });

    it('itinerary schema should have planning-related triggers', () => {
      const triggers = generateItinerarySchema.triggerPatterns;
      expect(triggers).toContain('itinerary');
      expect(triggers).toContain('plan');
      expect(triggers).toContain('schedule');
    });

    it('compare schema should have comparison-related triggers', () => {
      const triggers = compareCitiesSchema.triggerPatterns;
      expect(triggers).toContain('compare');
      expect(triggers).toContain('versus');
      expect(triggers).toContain('better');
    });
  });
});
