# Algolia Agent Studio Configuration Guide

This guide explains how to configure the Algolia Agent Studio dashboard for the Vibe Travel Planner application.

## Prerequisites

1. An Algolia account with Agent Studio enabled
2. Your Algolia Application ID and Search API Key
3. The `travel_destinations` index populated with city data

## Step 1: Create a New Agent

1. Log in to the [Algolia Dashboard](https://dashboard.algolia.com)
2. Navigate to **Agent Studio** in the left sidebar
3. Click **Create Agent**
4. Enter the following details:
   - **Name**: Vibe Travel Assistant
   - **Description**: AI-powered travel concierge for vibe-based destination discovery

## Step 2: Configure Index Settings

1. In the Agent configuration, go to **Index Settings**
2. Select your `travel_destinations` index
3. Configure searchable attributes:
   ```
   city
   country
   continent
   description
   vibe_tags
   known_for
   cuisine_variety
   ```
4. Configure attributes for faceting:
   ```
   continent
   vibe_tags
   primary_vibe
   climate_type
   ```

## Step 3: Set Up System Instructions

1. Go to **System Instructions** in the Agent settings
2. Copy the system prompt from `specs/AGENT_STUDIO_SYSTEM_PROMPT.md`
3. Paste into the System Instructions field
4. Click **Save**

## Step 4: Configure Client-Side Tools

Add the following tools under **Client-Side Tools**:

### 4.1 check_weather

```json
{
  "name": "check_weather",
  "description": "Get current weather conditions and forecast for a destination city",
  "parameters": {
    "type": "object",
    "properties": {
      "city_name": {
        "type": "string",
        "description": "The name of the city to check weather for"
      },
      "country": {
        "type": "string",
        "description": "The country of the city (optional)"
      }
    },
    "required": ["city_name"]
  }
}
```

### 4.2 estimate_budget

```json
{
  "name": "estimate_budget",
  "description": "Calculate estimated trip costs based on destination, duration, and travel style",
  "parameters": {
    "type": "object",
    "properties": {
      "city_id": {
        "type": "string",
        "description": "The Algolia objectID of the destination city"
      },
      "duration_days": {
        "type": "number",
        "description": "Number of days for the trip"
      },
      "travel_style": {
        "type": "string",
        "description": "The travel style/budget level",
        "enum": ["budget", "moderate", "luxury"]
      },
      "travelers": {
        "type": "number",
        "description": "Number of travelers"
      }
    },
    "required": ["city_id", "duration_days"]
  }
}
```

### 4.3 generate_itinerary

```json
{
  "name": "generate_itinerary",
  "description": "Create a detailed day-by-day trip itinerary for a destination",
  "parameters": {
    "type": "object",
    "properties": {
      "city_id": {
        "type": "string",
        "description": "The Algolia objectID of the destination city"
      },
      "duration_days": {
        "type": "number",
        "description": "Number of days for the itinerary"
      },
      "interests": {
        "type": "array",
        "description": "List of user interests to focus on",
        "items": { "type": "string" }
      },
      "travel_style": {
        "type": "string",
        "description": "Pacing preference",
        "enum": ["relaxed", "balanced", "active"]
      }
    },
    "required": ["city_id", "duration_days"]
  }
}
```

### 4.4 compare_cities

```json
{
  "name": "compare_cities",
  "description": "Compare two or more destinations side by side",
  "parameters": {
    "type": "object",
    "properties": {
      "cities": {
        "type": "array",
        "description": "Array of city objectIDs to compare",
        "items": { "type": "string" }
      },
      "focus_attributes": {
        "type": "array",
        "description": "Specific attributes to focus the comparison on",
        "items": { "type": "string" }
      }
    },
    "required": ["cities"]
  }
}
```

### 4.5 add_to_wishlist

```json
{
  "name": "add_to_wishlist",
  "description": "Save a destination to the user's wishlist",
  "parameters": {
    "type": "object",
    "properties": {
      "city_id": {
        "type": "string",
        "description": "The Algolia objectID of the city to save"
      },
      "notes": {
        "type": "string",
        "description": "Optional notes about the destination"
      }
    },
    "required": ["city_id"]
  }
}
```

### 4.6 save_preference

```json
{
  "name": "save_preference",
  "description": "Save a user travel preference",
  "parameters": {
    "type": "object",
    "properties": {
      "category": {
        "type": "string",
        "description": "The category of preference",
        "enum": ["vibe", "budget", "duration", "climate", "activity", "accommodation"]
      },
      "value": {
        "type": "string",
        "description": "The preference value"
      },
      "priority": {
        "type": "string",
        "description": "Importance level",
        "enum": ["must_have", "nice_to_have", "avoid"]
      }
    },
    "required": ["category", "value"]
  }
}
```

### 4.7 add_to_trip_plan

```json
{
  "name": "add_to_trip_plan",
  "description": "Add a destination to the user's trip plan",
  "parameters": {
    "type": "object",
    "properties": {
      "city_id": {
        "type": "string",
        "description": "The Algolia objectID of the city"
      },
      "duration_days": {
        "type": "number",
        "description": "Number of days at this destination"
      },
      "notes": {
        "type": "string",
        "description": "Notes about this stop"
      }
    },
    "required": ["city_id"]
  }
}
```

### 4.8 clear_preferences

```json
{
  "name": "clear_preferences",
  "description": "Clear saved user preferences",
  "parameters": {
    "type": "object",
    "properties": {
      "category": {
        "type": "string",
        "description": "Category to clear, or 'all'",
        "enum": ["all", "vibe", "budget", "duration", "climate", "activity", "accommodation"]
      }
    },
    "required": []
  }
}
```

## Step 5: Configure UI Settings

1. Go to **UI Settings**
2. Configure the following:

### Welcome Message
```
Hi! I'm your travel concierge. Tell me about your ideal vacation vibe, and I'll help you find the perfect destination. Are you looking for adventure, relaxation, culture, or something else entirely?
```

### Input Placeholder
```
Describe your ideal travel vibe...
```

### Disclaimer Text
```
Your preferences are remembered during this session.
```

### Suggested Queries
Add these as suggestion chips:
- "Romantic European city"
- "Beach vibes with nightlife"
- "Ancient culture and temples"
- "Adventure trip on a budget"

## Step 6: Get Your Agent ID

1. After saving all configurations, go to the **Overview** tab
2. Copy the **Agent ID** (it looks like: `abc123def456...`)
3. Add this to your `.env.local` file:
   ```
   NEXT_PUBLIC_ALGOLIA_AGENT_ID=your_agent_id_here
   ```

## Step 7: Test the Configuration

1. Use the **Preview** feature in Agent Studio to test queries
2. Test each tool by asking relevant questions:
   - "What's the weather like in Tokyo?" → Should trigger `check_weather`
   - "How much does a trip to Paris cost?" → Should trigger `estimate_budget`
   - "Create a 3-day itinerary for Barcelona" → Should trigger `generate_itinerary`
   - "Compare Tokyo and Seoul" → Should trigger `compare_cities`

## Troubleshooting

### Tools Not Triggering

1. Check that tool names match exactly in Agent Studio and your code
2. Verify the system prompt includes tool descriptions
3. Test with explicit trigger phrases

### Results Not Showing

1. Verify the index contains data
2. Check searchable attributes configuration
3. Ensure API keys have correct permissions

### UI Components Not Rendering

1. Check browser console for errors
2. Verify component imports in TravelChat.tsx
3. Ensure tool layoutComponent is properly defined

## Environment Variables Reference

```bash
# Required for Algolia connection
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
NEXT_PUBLIC_ALGOLIA_AGENT_ID=your_agent_id

# Optional: for weather API (if using real weather data)
NEXT_PUBLIC_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
WEATHER_API_KEY=your_weather_api_key

# Optional: for Mapbox (map visualization)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Related Documentation

- [Algolia Agent Studio Docs](https://www.algolia.com/doc/guides/building-search-ui/ui-and-ux-patterns/ai-chat/react/)
- [System Prompt Reference](./AGENT_STUDIO_SYSTEM_PROMPT.md)
- [Implementation Plan](./IMPROVEMENT_5_IMPLEMENTATION_PLAN.md)
