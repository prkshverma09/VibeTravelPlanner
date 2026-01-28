# Implementation Plan: Client-Side Tools (Improvement #5)

## Executive Summary

This plan details the implementation of enhanced client-side tools for the Vibe-Check Travel Assistant using Algolia Agent Studio. The goal is to leverage the `tools` prop of the Chat widget to create rich, interactive experiences that differentiate the application in the Algolia Agent Studio Challenge.

**Key Deliverables:**
1. **Weather Tool** - Real-time weather lookup for destinations
2. **Budget Estimator Tool** - Interactive trip cost calculator
3. **Enhanced Itinerary Generator** - Sophisticated day-by-day trip planning
4. **Wishlist/Favorites Tool** - Save destinations for later
5. **Agent Studio Configuration** - Server-side tool definitions

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Algolia Agent Studio                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Agent Configuration                               │   │
│  │  - System Prompt (with tool usage instructions)                     │   │
│  │  - Server-side Tools (Algolia Search, Recommendations)              │   │
│  │  - Tool Definitions (schemas for client-side tools)                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Chat Widget (Frontend)                              │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────────┐  │
│  │   tools prop      │  │  layoutComponent  │  │    onToolCall         │  │
│  │   {               │  │                   │  │                       │  │
│  │     checkWeather  │──│  <WeatherCard/>   │──│  fetchWeatherAPI()   │  │
│  │     estimateBudget│──│  <BudgetCalc/>    │──│  calculateBudget()   │  │
│  │     generateItin  │──│  <ItineraryView/> │──│  buildItinerary()    │  │
│  │     addToWishlist │──│  <WishlistCard/>  │──│  updateWishlist()    │  │
│  │   }               │  │                   │  │                       │  │
│  └───────────────────┘  └───────────────────┘  └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         External APIs & State                               │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────────┐  │
│  │   Weather API     │  │   TripContext     │  │   LocalStorage        │  │
│  │  (Open-Meteo)     │  │   (React State)   │  │   (Persistence)       │  │
│  └───────────────────┘  └───────────────────┘  └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Weather Tool Implementation

### 1.1 Weather Service

**File:** `packages/frontend/src/services/weather.service.ts`

Create a service to fetch weather data using [Open-Meteo API](https://open-meteo.com/) (free, no API key required).

```typescript
export interface WeatherData {
  city: string;
  country: string;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    weatherCode: number;
    weatherDescription: string;
    windSpeed: number;
    isDay: boolean;
  };
  forecast: {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    weatherDescription: string;
    precipitationProbability: number;
  }[];
  recommendation: string;
}

export interface WeatherServiceConfig {
  geocodingUrl?: string;
  weatherUrl?: string;
}
```

**Implementation Steps:**
1. Create geocoding function to convert city name to coordinates
2. Fetch current weather and 7-day forecast
3. Map WMO weather codes to descriptions and icons
4. Generate packing/travel recommendations based on weather

**API Endpoints:**
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1`
- Weather: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`

### 1.2 Weather Card Component

**File:** `packages/frontend/src/components/WeatherCard/WeatherCard.tsx`

```typescript
interface WeatherCardProps {
  weather: WeatherData;
  onClose?: () => void;
}
```

**Design Requirements:**
- Current temperature with weather icon
- 5-day forecast strip
- Packing recommendations
- Best activities based on weather
- Travel advisory (if extreme weather)

### 1.3 Weather Tool Definition

**File:** `packages/frontend/src/tools/checkWeather.ts`

```typescript
export interface CheckWeatherInput {
  city_name: string;
  country: string;
  travel_dates?: {
    start: string;
    end: string;
  };
}

export interface CheckWeatherOutput {
  weather: WeatherData;
  travelAdvice: string;
  suggestedActivities: string[];
}
```

### 1.4 Agent Studio Configuration (Weather)

Add to Agent Studio dashboard tool definitions:

```json
{
  "name": "check_weather",
  "description": "Get current weather and forecast for a destination city. Use when user asks about weather, what to pack, or best time to visit.",
  "parameters": {
    "type": "object",
    "properties": {
      "city_name": {
        "type": "string",
        "description": "Name of the city"
      },
      "country": {
        "type": "string", 
        "description": "Country where the city is located"
      },
      "travel_dates": {
        "type": "object",
        "description": "Optional travel dates for forecast",
        "properties": {
          "start": { "type": "string", "format": "date" },
          "end": { "type": "string", "format": "date" }
        }
      }
    },
    "required": ["city_name", "country"]
  }
}
```

---

## Phase 2: Budget Estimator Tool

### 2.1 Budget Calculator Service

**File:** `packages/frontend/src/services/budget.service.ts`

```typescript
export interface BudgetEstimateInput {
  cityId: string;
  durationDays: number;
  travelStyle: 'budget' | 'mid-range' | 'luxury';
  travelers: number;
  includeFlights?: boolean;
  departureCity?: string;
}

export interface BudgetEstimate {
  cityName: string;
  totalEstimate: {
    low: number;
    mid: number;
    high: number;
  };
  breakdown: {
    accommodation: { perNight: number; total: number };
    food: { perDay: number; total: number };
    transportation: { perDay: number; total: number };
    activities: { perDay: number; total: number };
    miscellaneous: { perDay: number; total: number };
  };
  perPerson: number;
  perDay: number;
  currency: string;
  budgetTips: string[];
  savingsOpportunities: string[];
}
```

**Implementation:**
1. Use existing `EnhancedCity` data with `cost_breakdown` field
2. Calculate based on travel style multipliers
3. Generate budget-saving tips based on city characteristics
4. Support multiple currencies with conversion

### 2.2 Budget Estimator Component

**File:** `packages/frontend/src/components/BudgetEstimator/BudgetEstimator.tsx`

**Features:**
- Interactive sliders for duration and travelers
- Travel style selector (Budget/Mid-Range/Luxury)
- Visual cost breakdown chart (pie or bar)
- Per-day and per-person calculations
- Comparison mode (compare budgets across cities)
- Export/share budget estimate

```typescript
interface BudgetEstimatorProps {
  cityId: string;
  cityName: string;
  initialDays?: number;
  initialStyle?: 'budget' | 'mid-range' | 'luxury';
  onAddToTrip?: (estimate: BudgetEstimate) => void;
}
```

### 2.3 Budget Tool Definition

**File:** `packages/frontend/src/tools/estimateBudget.ts`

```typescript
export interface EstimateBudgetInput {
  city_id: string;
  duration_days: number;
  travel_style: 'budget' | 'mid-range' | 'luxury';
  travelers: number;
}

export interface EstimateBudgetOutput {
  estimate: BudgetEstimate;
  formattedSummary: string;
}
```

### 2.4 Agent Studio Configuration (Budget)

```json
{
  "name": "estimate_budget",
  "description": "Calculate estimated trip costs for a destination. Use when user asks about costs, budget, how much a trip will cost, or affordable options.",
  "parameters": {
    "type": "object",
    "properties": {
      "city_id": {
        "type": "string",
        "description": "Algolia objectID of the city"
      },
      "duration_days": {
        "type": "integer",
        "description": "Number of days for the trip",
        "minimum": 1,
        "maximum": 30
      },
      "travel_style": {
        "type": "string",
        "enum": ["budget", "mid-range", "luxury"],
        "description": "Travel style affecting accommodation and activities"
      },
      "travelers": {
        "type": "integer",
        "description": "Number of travelers",
        "minimum": 1,
        "default": 1
      }
    },
    "required": ["city_id", "duration_days", "travel_style"]
  }
}
```

---

## Phase 3: Enhanced Itinerary Generator

### 3.1 Itinerary Generation Service

**File:** `packages/frontend/src/services/itinerary.service.ts`

The current implementation generates placeholder itineraries. Enhance with:

```typescript
export interface EnhancedItineraryInput {
  city: AlgoliaCity | EnhancedAlgoliaCity;
  durationDays: number;
  interests: string[];
  travelStyle: 'relaxed' | 'active' | 'balanced';
  preferredPace: 'early_bird' | 'night_owl' | 'flexible';
  mustSeeAttractions?: string[];
  dietaryRestrictions?: string[];
}

export interface EnhancedItineraryDay {
  day: number;
  date?: string;
  theme: string;
  weatherNote?: string;
  activities: EnhancedActivity[];
  meals: MealSuggestion[];
  transportationTips: string[];
  estimatedCost: number;
}

export interface EnhancedActivity {
  time: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  activity: string;
  description: string;
  location?: string;
  duration: string;
  vibeMatch: string[];
  cost: 'free' | 'budget' | 'moderate' | 'expensive';
  reservationRequired: boolean;
  bookingUrl?: string;
}

export interface MealSuggestion {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  suggestion: string;
  cuisineType: string;
  priceRange: string;
}
```

### 3.2 Itinerary Generation Logic

**Enhanced Generation Algorithm:**

1. **Day Theming** - Assign themes based on city's top attributes:
   - High culture_score → "Museums & History Day"
   - High beach_score → "Beach & Relaxation Day"
   - High nightlife_score → "Evening & Entertainment Focus"

2. **Time Slot Optimization:**
   - Morning: Outdoor activities, markets, temples
   - Midday: Indoor activities (museums, galleries)
   - Afternoon: Exploration, neighborhoods
   - Evening: Dining, entertainment, nightlife

3. **Interest Matching:**
   - Map user interests to activity categories
   - Prioritize vibe_tags alignment

4. **Pacing Logic:**
   - Relaxed: 2-3 activities/day
   - Balanced: 3-4 activities/day
   - Active: 5-6 activities/day

### 3.3 Enhanced Itinerary Component

**File:** `packages/frontend/src/components/ItineraryBuilder/ItineraryBuilder.tsx`

**New Features:**
- Drag-and-drop activity reordering
- Add/remove activities
- Time adjustment
- Cost tracking per day
- Print/export to PDF
- Share via link
- Calendar integration (ICS export)

### 3.4 Agent Studio Configuration (Itinerary)

```json
{
  "name": "generate_itinerary",
  "description": "Create a detailed day-by-day itinerary for a destination. Use when user wants a trip plan, asks for an itinerary, or wants to know what to do during their visit.",
  "parameters": {
    "type": "object",
    "properties": {
      "city_id": {
        "type": "string",
        "description": "Algolia objectID of the city"
      },
      "duration_days": {
        "type": "integer",
        "description": "Number of days for the itinerary",
        "minimum": 1,
        "maximum": 14
      },
      "interests": {
        "type": "array",
        "items": { "type": "string" },
        "description": "User interests like 'food', 'history', 'adventure', 'art'"
      },
      "travel_style": {
        "type": "string",
        "enum": ["relaxed", "active", "balanced"],
        "description": "Pace preference for the trip"
      }
    },
    "required": ["city_id", "duration_days"]
  }
}
```

---

## Phase 4: Wishlist/Favorites Tool

### 4.1 Wishlist State Management

Extend `TripContext` to include wishlist functionality:

**File:** `packages/frontend/src/context/TripContext.tsx` (modifications)

```typescript
export interface WishlistItem {
  city: AlgoliaCity;
  addedAt: number;
  notes?: string;
  plannedTravelDate?: string;
}

// Add to TripState
export interface TripState {
  // ... existing
  wishlist: WishlistItem[];
}

// Add actions
type TripAction =
  // ... existing
  | { type: 'ADD_TO_WISHLIST'; payload: Omit<WishlistItem, 'addedAt'> }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: { cityId: string } }
  | { type: 'CLEAR_WISHLIST' };
```

### 4.2 Wishlist Persistence

**File:** `packages/frontend/src/hooks/useWishlistPersistence.ts`

```typescript
export function useWishlistPersistence() {
  // Persist wishlist to localStorage
  // Sync across tabs using BroadcastChannel
  // Optional: Sync to backend if user is authenticated
}
```

### 4.3 Wishlist Components

**Files:**
- `packages/frontend/src/components/WishlistCard/WishlistCard.tsx`
- `packages/frontend/src/components/WishlistDrawer/WishlistDrawer.tsx`

**Features:**
- Heart icon on CityCard for quick add
- Slide-out drawer showing saved destinations
- Share wishlist via unique link
- Export to various formats

### 4.4 Agent Studio Configuration (Wishlist)

```json
{
  "name": "add_to_wishlist",
  "description": "Save a destination to the user's wishlist for later. Use when user says 'save this', 'bookmark', 'add to favorites', or 'remember this place'.",
  "parameters": {
    "type": "object",
    "properties": {
      "city_id": {
        "type": "string",
        "description": "Algolia objectID of the city to save"
      },
      "notes": {
        "type": "string",
        "description": "Optional note about why they're interested"
      }
    },
    "required": ["city_id"]
  }
}
```

---

## Phase 5: Integration & Tool Registration

### 5.1 Updated TravelChat Tools Configuration

**File:** `packages/frontend/src/components/TravelChat/TravelChat.tsx`

```typescript
const tools = {
  // Existing tools
  save_preference: { /* ... */ },
  compare_cities: { /* ... */ },
  add_to_trip_plan: { /* ... */ },
  clear_preferences: { /* ... */ },
  
  // New/Enhanced tools
  check_weather: {
    onToolCall: async ({ addToolResult, input }: ToolCallParams<CheckWeatherInput>) => {
      try {
        const weather = await weatherService.getWeather(input.city_name, input.country);
        const travelAdvice = weatherService.generateTravelAdvice(weather);
        addToolResult({
          output: {
            weather,
            travelAdvice,
            suggestedActivities: weatherService.suggestActivities(weather),
          },
        });
      } catch (error) {
        addToolResult({
          output: { error: 'Unable to fetch weather data', weather: null },
        });
      }
    },
    layoutComponent: ({ message }: { message: ToolMessage<CheckWeatherOutput> }) => {
      if (!message.output?.weather) {
        return <div className={styles.toolError}>Weather data unavailable</div>;
      }
      return <WeatherCard weather={message.output.weather} />;
    },
  },
  
  estimate_budget: {
    onToolCall: async ({ addToolResult, input }: ToolCallParams<EstimateBudgetInput>) => {
      const city = await fetchCityById(input.city_id);
      if (city) {
        const estimate = budgetService.calculateEstimate({
          city,
          durationDays: input.duration_days,
          travelStyle: input.travel_style,
          travelers: input.travelers,
        });
        addToolResult({ output: { estimate, city } });
      } else {
        addToolResult({ output: { error: 'City not found', estimate: null } });
      }
    },
    layoutComponent: ({ message }: { message: ToolMessage<EstimateBudgetOutput> }) => {
      if (!message.output?.estimate) {
        return <div className={styles.toolLoading}>Calculating budget...</div>;
      }
      return (
        <BudgetEstimator
          estimate={message.output.estimate}
          cityName={message.output.city?.city || 'Destination'}
          onAddToTrip={() => { /* ... */ }}
        />
      );
    },
  },
  
  generate_itinerary: {
    // Enhanced version with better generation logic
    onToolCall: async ({ addToolResult, input }: ToolCallParams<EnhancedItineraryInput>) => {
      const city = await fetchCityById(input.city_id);
      if (city) {
        const itinerary = itineraryService.generateEnhancedItinerary({
          city,
          durationDays: input.duration_days,
          interests: input.interests || [],
          travelStyle: input.travel_style || 'balanced',
        });
        addToolResult({ output: { itinerary, city } });
      } else {
        addToolResult({ output: { error: 'City not found' } });
      }
    },
    layoutComponent: ({ message }: { message: ToolMessage<GenerateItineraryOutput> }) => {
      if (!message.output?.itinerary) {
        return <div className={styles.toolLoading}>Generating itinerary...</div>;
      }
      return (
        <ItineraryBuilder
          itinerary={message.output.itinerary}
          city={message.output.city}
          onSave={() => { /* ... */ }}
          onExport={() => { /* ... */ }}
        />
      );
    },
  },
  
  add_to_wishlist: {
    onToolCall: async ({ addToolResult, input }: ToolCallParams<AddToWishlistInput>) => {
      const city = await fetchCityById(input.city_id);
      if (city) {
        dispatch({
          type: 'ADD_TO_WISHLIST',
          payload: { city, notes: input.notes },
        });
        addToolResult({
          output: {
            success: true,
            message: `Added ${city.city} to your wishlist`,
            wishlistCount: state.wishlist.length + 1,
          },
        });
      } else {
        addToolResult({ output: { success: false, message: 'City not found' } });
      }
    },
    layoutComponent: ({ message }: { message: ToolMessage<AddToWishlistOutput> }) => (
      <div className={styles.toolConfirmation} data-testid="tool-wishlist">
        ❤️ {message.output?.message || 'Added to wishlist'}
      </div>
    ),
  },
};
```

---

## Phase 6: Agent Studio Dashboard Configuration

### 6.1 System Prompt Update

Update the Agent Studio system prompt to include tool usage instructions:

```
You are a travel concierge specializing in "vibe-based" destination discovery.

## Available Tools

You have access to these tools to help users:

1. **check_weather** - Get current weather and forecasts for any destination
   - Use when: User asks about weather, what to pack, best time to visit
   - Example triggers: "What's the weather like?", "Should I bring a jacket?", "Is it rainy season?"

2. **estimate_budget** - Calculate trip costs based on travel style
   - Use when: User asks about costs, budget, affordability
   - Example triggers: "How much will it cost?", "Is it expensive?", "Budget for 7 days?"

3. **generate_itinerary** - Create detailed day-by-day trip plans
   - Use when: User wants a trip plan or schedule
   - Example triggers: "Plan my trip", "What should I do for 5 days?", "Create an itinerary"

4. **compare_cities** - Side-by-side destination comparison
   - Use when: User is choosing between destinations
   - Example triggers: "Compare X and Y", "Which is better?", "Difference between"

5. **add_to_wishlist** - Save destinations for later
   - Use when: User wants to save or bookmark
   - Example triggers: "Save this", "Bookmark", "Remember this place"

6. **save_preference** - Remember user preferences
   - Use when: User expresses preferences
   - Example triggers: "I prefer...", "I need...", "Must have..."

## Tool Usage Guidelines

- Always use the most appropriate tool for the user's request
- Combine tools when helpful (e.g., weather + budget for trip planning)
- After showing search results, offer relevant tools (weather, budget, itinerary)
- Proactively suggest tools based on conversation context
```

### 6.2 Tool Schemas in Agent Studio

Add these tool definitions in the Agent Studio dashboard under "Client-side Tools":

| Tool Name | Description | Trigger Patterns |
|-----------|-------------|-----------------|
| `check_weather` | Weather lookup | weather, pack, forecast, temperature |
| `estimate_budget` | Cost calculator | cost, budget, price, expensive, afford |
| `generate_itinerary` | Trip planner | itinerary, plan, schedule, activities |
| `add_to_wishlist` | Save destination | save, bookmark, favorite, remember |
| `compare_cities` | Comparison | compare, versus, vs, difference, better |

---

## Phase 7: Testing Strategy

### 7.1 Unit Tests

**Weather Service Tests:**
```typescript
// packages/frontend/src/services/__tests__/weather.service.test.ts
describe('WeatherService', () => {
  it('should geocode city name to coordinates');
  it('should fetch current weather');
  it('should fetch 7-day forecast');
  it('should handle API errors gracefully');
  it('should generate appropriate travel advice');
  it('should suggest activities based on weather');
});
```

**Budget Service Tests:**
```typescript
// packages/frontend/src/services/__tests__/budget.service.test.ts
describe('BudgetService', () => {
  it('should calculate budget for different travel styles');
  it('should scale costs for multiple travelers');
  it('should provide accurate breakdown by category');
  it('should generate relevant budget tips');
});
```

**Itinerary Service Tests:**
```typescript
// packages/frontend/src/services/__tests__/itinerary.service.test.ts
describe('ItineraryService', () => {
  it('should generate correct number of days');
  it('should match activities to user interests');
  it('should respect travel style pacing');
  it('should assign appropriate day themes');
});
```

### 7.2 Component Tests

```typescript
// packages/frontend/src/components/WeatherCard/__tests__/WeatherCard.test.tsx
describe('WeatherCard', () => {
  it('should display current temperature');
  it('should show 5-day forecast');
  it('should display weather icon');
  it('should show packing recommendations');
});

// packages/frontend/src/components/BudgetEstimator/__tests__/BudgetEstimator.test.tsx
describe('BudgetEstimator', () => {
  it('should display total estimate');
  it('should show breakdown chart');
  it('should update on slider change');
  it('should recalculate for different travel styles');
});
```

### 7.3 E2E Tests

```typescript
// e2e/tests/client-tools.spec.ts
test.describe('Client-Side Tools', () => {
  test('Weather tool shows forecast when user asks about weather', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="chat-input"]', 'What is the weather like in Tokyo?');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await expect(page.locator('[data-testid="weather-card"]')).toBeVisible();
  });

  test('Budget tool calculates costs', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="chat-input"]', 'How much does a 5-day trip to Paris cost?');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await expect(page.locator('[data-testid="budget-estimator"]')).toBeVisible();
  });

  test('Itinerary tool generates day-by-day plan', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="chat-input"]', 'Create a 3-day itinerary for Barcelona');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await expect(page.locator('[data-testid="itinerary-builder"]')).toBeVisible();
  });
});
```

---

## Phase 8: File Structure

```
packages/frontend/src/
├── services/
│   ├── weather.service.ts          # NEW
│   ├── budget.service.ts           # NEW
│   ├── itinerary.service.ts        # NEW (enhanced)
│   ├── __tests__/
│   │   ├── weather.service.test.ts
│   │   ├── budget.service.test.ts
│   │   └── itinerary.service.test.ts
│   └── index.ts
├── components/
│   ├── WeatherCard/                 # NEW
│   │   ├── WeatherCard.tsx
│   │   ├── WeatherCard.module.css
│   │   ├── WeatherIcon.tsx
│   │   ├── ForecastStrip.tsx
│   │   ├── __tests__/
│   │   │   └── WeatherCard.test.tsx
│   │   └── index.ts
│   ├── BudgetEstimator/             # NEW
│   │   ├── BudgetEstimator.tsx
│   │   ├── BudgetEstimator.module.css
│   │   ├── CostBreakdownChart.tsx
│   │   ├── BudgetSliders.tsx
│   │   ├── BudgetTips.tsx
│   │   ├── __tests__/
│   │   │   └── BudgetEstimator.test.tsx
│   │   └── index.ts
│   ├── ItineraryBuilder/            # NEW (enhanced)
│   │   ├── ItineraryBuilder.tsx
│   │   ├── ItineraryBuilder.module.css
│   │   ├── DayCard.tsx
│   │   ├── ActivityCard.tsx
│   │   ├── MealSuggestion.tsx
│   │   ├── ExportOptions.tsx
│   │   ├── __tests__/
│   │   │   └── ItineraryBuilder.test.tsx
│   │   └── index.ts
│   ├── WishlistDrawer/              # NEW
│   │   ├── WishlistDrawer.tsx
│   │   ├── WishlistDrawer.module.css
│   │   ├── WishlistItem.tsx
│   │   ├── __tests__/
│   │   │   └── WishlistDrawer.test.tsx
│   │   └── index.ts
│   └── ... (existing components)
├── tools/
│   ├── checkWeather.ts              # NEW
│   ├── estimateBudget.ts            # NEW
│   ├── addToWishlist.ts             # NEW
│   ├── generateItinerary.ts         # ENHANCED
│   └── ... (existing tools)
├── hooks/
│   ├── useWishlistPersistence.ts    # NEW
│   └── ... (existing hooks)
└── context/
    └── TripContext.tsx              # MODIFIED (add wishlist)
```

---

## Phase 9: Implementation Tasks

### Task Breakdown

| # | Task | Priority | Effort | Dependencies |
|---|------|----------|--------|--------------|
| 1 | Create WeatherService | High | Medium | None |
| 2 | Create WeatherCard component | High | Medium | Task 1 |
| 3 | Integrate weather tool | High | Low | Tasks 1, 2 |
| 4 | Create BudgetService | High | Medium | None |
| 5 | Create BudgetEstimator component | High | High | Task 4 |
| 6 | Integrate budget tool | High | Low | Tasks 4, 5 |
| 7 | Enhance ItineraryService | Medium | High | None |
| 8 | Create ItineraryBuilder component | Medium | High | Task 7 |
| 9 | Integrate enhanced itinerary tool | Medium | Low | Tasks 7, 8 |
| 10 | Add wishlist to TripContext | Medium | Low | None |
| 11 | Create WishlistDrawer component | Medium | Medium | Task 10 |
| 12 | Integrate wishlist tool | Medium | Low | Tasks 10, 11 |
| 13 | Update Agent Studio configuration | High | Low | All tools |
| 14 | Write unit tests | Medium | Medium | All tasks |
| 15 | Write E2E tests | Medium | Medium | All tasks |
| 16 | Update documentation | Low | Low | All tasks |

### Estimated Timeline

- **Phase 1 (Weather):** Tasks 1-3
- **Phase 2 (Budget):** Tasks 4-6
- **Phase 3 (Itinerary):** Tasks 7-9
- **Phase 4 (Wishlist):** Tasks 10-12
- **Phase 5 (Integration):** Tasks 13-16

---

## Phase 10: Demo Scenarios

### Demo Flow 1: Complete Trip Planning

```
User: "I want a romantic European city"
Agent: [Shows Paris, Barcelona, Prague]

User: "What's the weather like in Paris right now?"
Agent: [Shows WeatherCard for Paris with current conditions and forecast]

User: "How much would a 5-day trip cost?"
Agent: [Shows BudgetEstimator with breakdown]

User: "Create an itinerary for 5 days"
Agent: [Shows ItineraryBuilder with day-by-day plan]

User: "Save Barcelona for later too"
Agent: [Adds to wishlist, shows confirmation]
```

### Demo Flow 2: Budget-Conscious Planning

```
User: "Affordable beach destinations in Asia"
Agent: [Shows Bali, Phuket, Goa]

User: "Compare Bali and Phuket budgets"
Agent: [Shows ComparisonTable with budget data]

User: "Estimate 7 days in Bali, budget style"
Agent: [Shows BudgetEstimator with ~$50/day breakdown]
```

### Demo Flow 3: Weather-Informed Decisions

```
User: "Where should I go in March?"
Agent: [Shows destinations with good March weather]

User: "What's the weather in Tokyo in March?"
Agent: [Shows cherry blossom season forecast]

User: "Perfect! Plan my trip"
Agent: [Generates itinerary with weather-appropriate activities]
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tool trigger accuracy | >90% | Agent correctly identifies tool from user intent |
| Tool completion rate | >95% | Tools execute without errors |
| User engagement | +30% | Session duration after tool implementation |
| Demo impressions | Positive | Judge feedback during demo |
| Code coverage | >80% | Unit and integration tests |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Weather API rate limits | Medium | Cache responses, use fallback data |
| Budget data outdated | Low | Update data pipeline, show "estimates" disclaimer |
| Complex tool interactions | Medium | Thorough E2E testing, error boundaries |
| Agent Studio beta limitations | High | Have fallback UI for manual tool access |

---

## References

- [Algolia Chat Widget API](https://www.algolia.com/doc/api-reference/widgets/chat/react)
- [Agent Studio Dashboard Guide](https://www.algolia.com/doc/guides/algolia-ai/agent-studio/how-to/dashboard)
- [Open-Meteo Weather API](https://open-meteo.com/en/docs)
- [React InstantSearch Hooks](https://www.algolia.com/doc/api-reference/widgets/react)

---

*Last Updated: January 2026*
