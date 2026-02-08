/**
 * Client-Side Tool Schemas for Algolia Agent Studio
 * 
 * These schemas define the input/output structure for each tool
 * that can be invoked from the chat interface.
 */

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required: string[];
  };
  triggerPatterns: string[];
}

export const checkWeatherSchema: ToolSchema = {
  name: 'check_weather',
  description: 'Get current weather conditions and forecast for a destination city',
  parameters: {
    type: 'object',
    properties: {
      city_name: {
        type: 'string',
        description: 'The name of the city to check weather for',
      },
      country: {
        type: 'string',
        description: 'The country of the city (optional, helps with disambiguation)',
      },
    },
    required: ['city_name'],
  },
  triggerPatterns: [
    'weather',
    'temperature',
    'forecast',
    'pack',
    'what to wear',
    'rainy',
    'sunny',
    'climate',
    'hot',
    'cold',
    'best time to visit',
  ],
};

export const estimateBudgetSchema: ToolSchema = {
  name: 'estimate_budget',
  description: 'Calculate estimated trip costs based on destination, duration, and travel style',
  parameters: {
    type: 'object',
    properties: {
      city_id: {
        type: 'string',
        description: 'The Algolia objectID of the destination city',
      },
      duration_days: {
        type: 'number',
        description: 'Number of days for the trip',
      },
      travel_style: {
        type: 'string',
        description: 'The travel style/budget level',
        enum: ['budget', 'moderate', 'luxury'],
      },
      travelers: {
        type: 'number',
        description: 'Number of travelers',
      },
    },
    required: ['city_id', 'duration_days'],
  },
  triggerPatterns: [
    'budget',
    'cost',
    'expensive',
    'affordable',
    'price',
    'how much',
    'spend',
    'money',
    'cheap',
    'luxury',
    'per day',
  ],
};

export const generateItinerarySchema: ToolSchema = {
  name: 'generate_itinerary',
  description: 'Create a detailed day-by-day trip itinerary for a destination',
  parameters: {
    type: 'object',
    properties: {
      city_id: {
        type: 'string',
        description: 'The Algolia objectID of the destination city',
      },
      duration_days: {
        type: 'number',
        description: 'Number of days for the itinerary',
      },
      interests: {
        type: 'array',
        description: 'List of user interests to focus on',
        items: { type: 'string' },
      },
      travel_style: {
        type: 'string',
        description: 'Pacing preference for the itinerary',
        enum: ['relaxed', 'balanced', 'active'],
      },
    },
    required: ['city_id', 'duration_days'],
  },
  triggerPatterns: [
    'itinerary',
    'plan',
    'schedule',
    'what to do',
    'activities',
    'day by day',
    'trip plan',
    'agenda',
    'things to do',
  ],
};

export const compareCitiesSchema: ToolSchema = {
  name: 'compare_cities',
  description: 'Compare two or more destinations side by side',
  parameters: {
    type: 'object',
    properties: {
      cities: {
        type: 'array',
        description: 'Array of city objectIDs to compare',
        items: { type: 'string' },
      },
      focus_attributes: {
        type: 'array',
        description: 'Specific attributes to focus the comparison on',
        items: { type: 'string' },
      },
    },
    required: ['cities'],
  },
  triggerPatterns: [
    'compare',
    'versus',
    'vs',
    'difference',
    'better',
    'or',
    'which one',
    'choose between',
    'deciding',
  ],
};

export const addToWishlistSchema: ToolSchema = {
  name: 'add_to_wishlist',
  description: 'Save a destination to the user\'s wishlist for later',
  parameters: {
    type: 'object',
    properties: {
      city_id: {
        type: 'string',
        description: 'The Algolia objectID of the city to save',
      },
      notes: {
        type: 'string',
        description: 'Optional notes about why the user is saving this destination',
      },
    },
    required: ['city_id'],
  },
  triggerPatterns: [
    'save',
    'bookmark',
    'favorite',
    'remember',
    'wishlist',
    'for later',
    'add to list',
    'keep',
  ],
};

export const savePreferenceSchema: ToolSchema = {
  name: 'save_preference',
  description: 'Save a user travel preference for personalized recommendations',
  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'The category of preference',
        enum: ['vibe', 'budget', 'duration', 'climate', 'activity', 'accommodation'],
      },
      value: {
        type: 'string',
        description: 'The preference value',
      },
      priority: {
        type: 'string',
        description: 'How important this preference is',
        enum: ['must_have', 'nice_to_have', 'avoid'],
      },
    },
    required: ['category', 'value'],
  },
  triggerPatterns: [
    'prefer',
    'like',
    'love',
    'need',
    'must have',
    'want',
    'looking for',
    'avoid',
    'hate',
    'don\'t like',
  ],
};

export const addToTripPlanSchema: ToolSchema = {
  name: 'add_to_trip_plan',
  description: 'Add a destination to the user\'s active trip plan',
  parameters: {
    type: 'object',
    properties: {
      city_id: {
        type: 'string',
        description: 'The Algolia objectID of the city to add',
      },
      duration_days: {
        type: 'number',
        description: 'Number of days to spend at this destination',
      },
      notes: {
        type: 'string',
        description: 'Notes about this stop in the trip',
      },
    },
    required: ['city_id'],
  },
  triggerPatterns: [
    'add to trip',
    'include',
    'visit',
    'go to',
    'stop at',
    'trip plan',
    'itinerary',
  ],
};

export const clearPreferencesSchema: ToolSchema = {
  name: 'clear_preferences',
  description: 'Clear saved user preferences',
  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Specific category to clear, or "all" for everything',
        enum: ['all', 'vibe', 'budget', 'duration', 'climate', 'activity', 'accommodation'],
      },
    },
    required: [],
  },
  triggerPatterns: [
    'clear',
    'reset',
    'start over',
    'remove preferences',
    'forget',
  ],
};

export const ALL_TOOL_SCHEMAS: ToolSchema[] = [
  checkWeatherSchema,
  estimateBudgetSchema,
  generateItinerarySchema,
  compareCitiesSchema,
  addToWishlistSchema,
  savePreferenceSchema,
  addToTripPlanSchema,
  clearPreferencesSchema,
];

/**
 * Export schemas in Algolia Agent Studio format
 * Use this to configure tools in the Agent Studio dashboard
 */
export function getAgentStudioToolConfigs() {
  return ALL_TOOL_SCHEMAS.map((schema) => ({
    name: schema.name,
    description: schema.description,
    parameters: schema.parameters,
  }));
}
