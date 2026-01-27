# Implementation Plan: Richer Data & Retrieval

## Overview

This implementation plan details the first improvement suggestion from `IMPROVEMENT_SUGGESTIONS.md`: **Richer Data & Retrieval**. The goal is to demonstrate Algolia's search and retrieval strengths with comprehensive, queryable data.

### Objectives

1. **Expand Dataset**: Scale from ~50 to 200+ destinations with richer attributes
2. **Add Experiences Index**: Create a secondary index for activities/experiences linked to cities
3. **Implement Seasonal Intelligence**: Make "best time to visit" queryable with temporal awareness

---

## Architecture Changes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Enhanced Data Model                                  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      travel_destinations (Enhanced)                    │  │
│  │  + budget_tier         + safety_rating      + visa_free_for           │  │
│  │  + local_cuisine[]     + primary_language   + currency                │  │
│  │  + avg_daily_cost_usd  + best_months[]      + avoid_months[]          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    │ (linked by city_id)                    │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      travel_experiences (New Index)                    │  │
│  │  objectID      | experience_name    | city_ids[]        | duration   │  │
│  │  category      | vibe_tags[]        | description       | price_tier │  │
│  │  best_season   | min_travelers      | physical_level    | image_url  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Sub-Plan A: Enhanced City Data Schema

**Folder:** `/packages/shared` (Modifications)
**Estimated Tasks:** 6

### Task A.1: Extend City Type Definitions

**Description:** Add new attributes to the City type to support budget, safety, visa, cuisine, and cost information.

**Files to Modify:**
- `packages/shared/src/types/city.ts`

**Files to Create:**
- `packages/shared/src/types/budget.ts`
- `packages/shared/src/types/seasonal.ts`

**New Type Definitions:**

```typescript
// packages/shared/src/types/budget.ts
export type BudgetTier = 'budget' | 'mid-range' | 'luxury';

export interface CostBreakdown {
  accommodation_per_night: number;
  meal_average: number;
  transportation_daily: number;
  activities_daily: number;
}

// packages/shared/src/types/seasonal.ts
export type Month = 
  | 'january' | 'february' | 'march' | 'april' 
  | 'may' | 'june' | 'july' | 'august'
  | 'september' | 'october' | 'november' | 'december';

export interface SeasonalInfo {
  best_months: Month[];
  avoid_months: Month[];
  peak_season: Month[];
  shoulder_season: Month[];
  weather_notes: Record<Month, string>;
}
```

**Enhanced City Type:**

```typescript
// packages/shared/src/types/city.ts (Extended)
export interface EnhancedCity extends City {
  // Budget & Cost
  budget_tier: BudgetTier;
  avg_daily_cost_usd: number;
  cost_breakdown: CostBreakdown;
  
  // Safety & Practical
  safety_rating: number; // 1-10
  visa_free_for: string[]; // ISO country codes
  primary_language: string;
  english_proficiency: 'high' | 'medium' | 'low';
  currency: string;
  currency_symbol: string;
  
  // Food & Culture
  local_cuisine: string[]; // e.g., ["sushi", "ramen", "tempura"]
  cuisine_highlights: string[];
  vegetarian_friendly: boolean;
  
  // Seasonal
  best_months: Month[];
  avoid_months: Month[];
  seasonal_events: SeasonalEvent[];
  
  // Connectivity
  timezone: string;
  flight_hub: boolean; // Major international airport
  
  // Enhanced Discovery
  similar_cities: string[]; // objectIDs of similar destinations
  pairs_well_with: string[]; // Good for multi-city trips
}

export interface SeasonalEvent {
  name: string;
  month: Month;
  description: string;
  type: 'festival' | 'natural' | 'cultural' | 'sporting';
}
```

**Success Criteria:**
- [ ] All new types are defined and exported
- [ ] Types maintain backward compatibility with existing City type
- [ ] Documentation comments explain each new field
- [ ] Types pass TypeScript compilation

**Test File:** `packages/shared/src/types/__tests__/enhanced-city.test.ts`

```typescript
import { describe, it, expect, expectTypeOf } from 'vitest';
import type { EnhancedCity, BudgetTier, Month } from '../index';

describe('Enhanced City Types', () => {
  it('should have budget tier as enum type', () => {
    const tier: BudgetTier = 'mid-range';
    expect(['budget', 'mid-range', 'luxury']).toContain(tier);
  });

  it('should have valid month types', () => {
    const month: Month = 'january';
    expectTypeOf(month).toBeString();
  });

  it('should extend base City type', () => {
    const city: EnhancedCity = {
      // Base City fields
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      description: 'A vibrant metropolis',
      vibe_tags: ['modern', 'traditional'],
      culture_score: 10,
      adventure_score: 7,
      nature_score: 6,
      beach_score: 4,
      nightlife_score: 9,
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring',
      image_url: 'https://example.com/tokyo.jpg',
      
      // Enhanced fields
      budget_tier: 'mid-range',
      avg_daily_cost_usd: 150,
      cost_breakdown: {
        accommodation_per_night: 80,
        meal_average: 25,
        transportation_daily: 15,
        activities_daily: 30
      },
      safety_rating: 9,
      visa_free_for: ['US', 'GB', 'DE', 'FR'],
      primary_language: 'Japanese',
      english_proficiency: 'medium',
      currency: 'JPY',
      currency_symbol: '¥',
      local_cuisine: ['sushi', 'ramen', 'tempura'],
      cuisine_highlights: ['Tsukiji Market', 'Michelin-starred restaurants'],
      vegetarian_friendly: true,
      best_months: ['march', 'april', 'october', 'november'],
      avoid_months: ['june', 'july', 'august'],
      seasonal_events: [{
        name: 'Cherry Blossom Season',
        month: 'april',
        description: 'Stunning sakura blooms across the city',
        type: 'natural'
      }],
      timezone: 'Asia/Tokyo',
      flight_hub: true,
      similar_cities: ['seoul-korea', 'osaka-japan'],
      pairs_well_with: ['kyoto-japan', 'osaka-japan']
    };

    expect(city.budget_tier).toBe('mid-range');
    expect(city.best_months).toContain('april');
  });
});
```

---

### Task A.2: Extend Zod Validation Schemas

**Description:** Create Zod schemas for validating the new enhanced city attributes.

**Files to Modify:**
- `packages/shared/src/schemas/city.schema.ts`

**Files to Create:**
- `packages/shared/src/schemas/budget.schema.ts`
- `packages/shared/src/schemas/seasonal.schema.ts`

**Schema Definitions:**

```typescript
// packages/shared/src/schemas/budget.schema.ts
import { z } from 'zod';

export const BudgetTierSchema = z.enum(['budget', 'mid-range', 'luxury']);

export const CostBreakdownSchema = z.object({
  accommodation_per_night: z.number().min(0),
  meal_average: z.number().min(0),
  transportation_daily: z.number().min(0),
  activities_daily: z.number().min(0)
});

// packages/shared/src/schemas/seasonal.schema.ts
import { z } from 'zod';

export const MonthSchema = z.enum([
  'january', 'february', 'march', 'april',
  'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'
]);

export const SeasonalEventSchema = z.object({
  name: z.string().min(1),
  month: MonthSchema,
  description: z.string().min(10),
  type: z.enum(['festival', 'natural', 'cultural', 'sporting'])
});
```

**Success Criteria:**
- [ ] All new schemas validate correctly
- [ ] Schemas reject invalid data appropriately
- [ ] Budget tier enforces valid enum values
- [ ] Cost values are non-negative numbers
- [ ] Month enum validates all 12 months

**Test File:** `packages/shared/src/schemas/__tests__/enhanced-city.schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { 
  BudgetTierSchema, 
  CostBreakdownSchema, 
  MonthSchema,
  SeasonalEventSchema,
  EnhancedCitySchema 
} from '../index';

describe('Budget Schemas', () => {
  it('should validate valid budget tiers', () => {
    expect(BudgetTierSchema.safeParse('budget').success).toBe(true);
    expect(BudgetTierSchema.safeParse('mid-range').success).toBe(true);
    expect(BudgetTierSchema.safeParse('luxury').success).toBe(true);
  });

  it('should reject invalid budget tiers', () => {
    expect(BudgetTierSchema.safeParse('cheap').success).toBe(false);
    expect(BudgetTierSchema.safeParse('expensive').success).toBe(false);
  });

  it('should validate cost breakdown', () => {
    const validCost = {
      accommodation_per_night: 100,
      meal_average: 30,
      transportation_daily: 20,
      activities_daily: 50
    };
    expect(CostBreakdownSchema.safeParse(validCost).success).toBe(true);
  });

  it('should reject negative costs', () => {
    const invalidCost = {
      accommodation_per_night: -50,
      meal_average: 30,
      transportation_daily: 20,
      activities_daily: 50
    };
    expect(CostBreakdownSchema.safeParse(invalidCost).success).toBe(false);
  });
});

describe('Seasonal Schemas', () => {
  it('should validate all months', () => {
    const months = [
      'january', 'february', 'march', 'april',
      'may', 'june', 'july', 'august',
      'september', 'october', 'november', 'december'
    ];
    months.forEach(month => {
      expect(MonthSchema.safeParse(month).success).toBe(true);
    });
  });

  it('should validate seasonal event', () => {
    const event = {
      name: 'Cherry Blossom Festival',
      month: 'april',
      description: 'Beautiful cherry blossoms bloom across the city parks',
      type: 'natural'
    };
    expect(SeasonalEventSchema.safeParse(event).success).toBe(true);
  });
});
```

---

### Task A.3: Update Algolia Index Configuration

**Description:** Update the Algolia configuration to include new searchable and facetable attributes.

**Files to Modify:**
- `packages/shared/src/config/algolia.config.ts`

**Updated Configuration:**

```typescript
// packages/shared/src/config/algolia.config.ts

export const ENHANCED_SEARCHABLE_ATTRIBUTES = [
  'city',
  'country',
  'description',
  'vibe_tags',
  'local_cuisine',
  'cuisine_highlights',
  'seasonal_events.name',
  'seasonal_events.description'
];

export const ENHANCED_ATTRIBUTES_FOR_FACETING = [
  // Existing
  'filterOnly(continent)',
  'searchable(climate_type)',
  'culture_score',
  'adventure_score',
  'nature_score',
  'beach_score',
  'nightlife_score',
  
  // New Budget & Cost
  'budget_tier',
  'avg_daily_cost_usd',
  
  // New Safety & Practical
  'safety_rating',
  'filterOnly(visa_free_for)',
  'primary_language',
  'english_proficiency',
  
  // New Seasonal
  'searchable(best_months)',
  'searchable(avoid_months)',
  'seasonal_events.month',
  'seasonal_events.type',
  
  // New Discovery
  'flight_hub',
  'vegetarian_friendly'
];

export const ENHANCED_CUSTOM_RANKING = [
  'desc(safety_rating)',
  'desc(culture_score)',
  'asc(avg_daily_cost_usd)'
];

export function getEnhancedIndexSettings() {
  return {
    searchableAttributes: ENHANCED_SEARCHABLE_ATTRIBUTES,
    attributesForFaceting: ENHANCED_ATTRIBUTES_FOR_FACETING,
    customRanking: ENHANCED_CUSTOM_RANKING,
    ranking: [
      'typo',
      'geo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom'
    ],
    numericAttributesForFiltering: [
      'avg_daily_cost_usd',
      'safety_rating'
    ]
  };
}
```

**Success Criteria:**
- [ ] New searchable attributes include cuisine and seasonal data
- [ ] Budget tier is facetable for filtering
- [ ] Monthly filters work for seasonal queries
- [ ] Safety rating is included in custom ranking
- [ ] Numeric filtering enabled for cost-based queries

**Test File:** `packages/shared/src/config/__tests__/enhanced-algolia.config.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  ENHANCED_SEARCHABLE_ATTRIBUTES,
  ENHANCED_ATTRIBUTES_FOR_FACETING,
  getEnhancedIndexSettings
} from '../algolia.config';

describe('Enhanced Algolia Configuration', () => {
  it('should include cuisine in searchable attributes', () => {
    expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('local_cuisine');
    expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('cuisine_highlights');
  });

  it('should include seasonal data in searchable attributes', () => {
    expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('seasonal_events.name');
    expect(ENHANCED_SEARCHABLE_ATTRIBUTES).toContain('seasonal_events.description');
  });

  it('should include budget_tier for faceting', () => {
    expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('budget_tier');
  });

  it('should include monthly facets', () => {
    expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('searchable(best_months)');
    expect(ENHANCED_ATTRIBUTES_FOR_FACETING).toContain('searchable(avoid_months)');
  });

  it('should have numeric filtering for cost', () => {
    const settings = getEnhancedIndexSettings();
    expect(settings.numericAttributesForFiltering).toContain('avg_daily_cost_usd');
    expect(settings.numericAttributesForFiltering).toContain('safety_rating');
  });

  it('should prioritize safety in custom ranking', () => {
    const settings = getEnhancedIndexSettings();
    expect(settings.customRanking[0]).toBe('desc(safety_rating)');
  });
});
```

---

### Task A.4: Create Enhanced Test Fixtures

**Description:** Expand test fixtures to include 20+ diverse cities with all new attributes.

**Files to Modify:**
- `packages/shared/src/fixtures/cities.fixture.ts`

**Files to Create:**
- `packages/shared/src/fixtures/enhanced-cities.fixture.ts`
- `packages/shared/src/fixtures/city-data/asia.ts`
- `packages/shared/src/fixtures/city-data/europe.ts`
- `packages/shared/src/fixtures/city-data/americas.ts`
- `packages/shared/src/fixtures/city-data/africa-oceania.ts`

**Sample Enhanced Fixture:**

```typescript
// packages/shared/src/fixtures/enhanced-cities.fixture.ts
import type { EnhancedAlgoliaCity } from '../types';

export const enhancedMockCities: EnhancedAlgoliaCity[] = [
  {
    objectID: 'tokyo-japan',
    city: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    description: 'A mesmerizing blend of ultra-modern and traditional...',
    vibe_tags: ['neon', 'futuristic', 'traditional', 'foodie', 'anime'],
    culture_score: 10,
    adventure_score: 7,
    nature_score: 6,
    beach_score: 4,
    nightlife_score: 9,
    climate_type: 'Humid subtropical',
    best_time_to_visit: 'March-May, September-November',
    image_url: 'https://source.unsplash.com/featured/?tokyo,japan,city',
    
    // Enhanced attributes
    budget_tier: 'mid-range',
    avg_daily_cost_usd: 150,
    cost_breakdown: {
      accommodation_per_night: 80,
      meal_average: 25,
      transportation_daily: 15,
      activities_daily: 30
    },
    safety_rating: 9,
    visa_free_for: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES'],
    primary_language: 'Japanese',
    english_proficiency: 'medium',
    currency: 'JPY',
    currency_symbol: '¥',
    local_cuisine: ['sushi', 'ramen', 'tempura', 'wagyu', 'izakaya'],
    cuisine_highlights: ['Tsukiji Outer Market', 'Michelin-starred ramen', 'Depachika food halls'],
    vegetarian_friendly: true,
    best_months: ['march', 'april', 'may', 'october', 'november'],
    avoid_months: ['june', 'july', 'august'],
    seasonal_events: [
      {
        name: 'Cherry Blossom Season',
        month: 'april',
        description: 'Sakura blooms transform the city into pink wonderland',
        type: 'natural'
      },
      {
        name: 'Autumn Foliage',
        month: 'november',
        description: 'Stunning red and gold maple leaves in temple gardens',
        type: 'natural'
      }
    ],
    timezone: 'Asia/Tokyo',
    flight_hub: true,
    similar_cities: ['seoul-south-korea', 'osaka-japan', 'taipei-taiwan'],
    pairs_well_with: ['kyoto-japan', 'osaka-japan', 'hakone-japan']
  },
  // ... 19+ more cities
];

export function getEnhancedMockCityByName(name: string): EnhancedAlgoliaCity | undefined {
  return enhancedMockCities.find(c => c.city.toLowerCase() === name.toLowerCase());
}

export function getEnhancedCitiesByBudget(tier: BudgetTier): EnhancedAlgoliaCity[] {
  return enhancedMockCities.filter(c => c.budget_tier === tier);
}

export function getEnhancedCitiesByMonth(month: Month): EnhancedAlgoliaCity[] {
  return enhancedMockCities.filter(c => c.best_months.includes(month));
}
```

**Success Criteria:**
- [ ] At least 20 diverse cities with full enhanced attributes
- [ ] Cities span all budget tiers (budget, mid-range, luxury)
- [ ] All continents represented
- [ ] Variety in seasonal recommendations
- [ ] Helper functions for filtering by budget and month

**Test File:** `packages/shared/src/fixtures/__tests__/enhanced-cities.fixture.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { 
  enhancedMockCities, 
  getEnhancedMockCityByName,
  getEnhancedCitiesByBudget,
  getEnhancedCitiesByMonth 
} from '../enhanced-cities.fixture';
import { EnhancedAlgoliaCitySchema } from '../../schemas';

describe('Enhanced City Fixtures', () => {
  it('should have at least 20 mock cities', () => {
    expect(enhancedMockCities.length).toBeGreaterThanOrEqual(20);
  });

  it('should have all fixtures pass enhanced schema validation', () => {
    enhancedMockCities.forEach(city => {
      const result = EnhancedAlgoliaCitySchema.safeParse(city);
      expect(result.success, `City ${city.city} failed validation: ${JSON.stringify(result.error)}`).toBe(true);
    });
  });

  it('should have all budget tiers represented', () => {
    const budgetTiers = new Set(enhancedMockCities.map(c => c.budget_tier));
    expect(budgetTiers).toContain('budget');
    expect(budgetTiers).toContain('mid-range');
    expect(budgetTiers).toContain('luxury');
  });

  it('should have cities with seasonal events', () => {
    const citiesWithEvents = enhancedMockCities.filter(c => c.seasonal_events.length > 0);
    expect(citiesWithEvents.length).toBeGreaterThanOrEqual(10);
  });

  it('should filter cities by budget tier', () => {
    const budgetCities = getEnhancedCitiesByBudget('budget');
    expect(budgetCities.length).toBeGreaterThan(0);
    budgetCities.forEach(city => {
      expect(city.budget_tier).toBe('budget');
    });
  });

  it('should filter cities by best month', () => {
    const marchCities = getEnhancedCitiesByMonth('march');
    expect(marchCities.length).toBeGreaterThan(0);
    marchCities.forEach(city => {
      expect(city.best_months).toContain('march');
    });
  });

  it('should have valid cost breakdowns', () => {
    enhancedMockCities.forEach(city => {
      const { cost_breakdown, avg_daily_cost_usd } = city;
      const calculatedDaily = 
        cost_breakdown.accommodation_per_night + 
        cost_breakdown.meal_average * 3 + 
        cost_breakdown.transportation_daily + 
        cost_breakdown.activities_daily;
      
      // Allow 20% variance
      expect(avg_daily_cost_usd).toBeGreaterThan(calculatedDaily * 0.5);
      expect(avg_daily_cost_usd).toBeLessThan(calculatedDaily * 1.5);
    });
  });
});
```

---

### Task A.5: Create Utility Functions for Enhanced Data

**Description:** Add utility functions for budget calculations, seasonal recommendations, and cost formatting.

**Files to Create:**
- `packages/shared/src/utils/budget.utils.ts`
- `packages/shared/src/utils/seasonal.utils.ts`

**Utility Functions:**

```typescript
// packages/shared/src/utils/budget.utils.ts
import type { BudgetTier, CostBreakdown } from '../types';

export function formatCurrency(amount: number, currency: string, symbol: string): string {
  return `${symbol}${amount.toLocaleString()}`;
}

export function calculateTripCost(dailyCost: number, days: number): number {
  return dailyCost * days;
}

export function getBudgetTierFromCost(avgDailyCost: number): BudgetTier {
  if (avgDailyCost < 75) return 'budget';
  if (avgDailyCost < 200) return 'mid-range';
  return 'luxury';
}

export function formatBudgetRange(tier: BudgetTier): string {
  switch (tier) {
    case 'budget': return '$50-75/day';
    case 'mid-range': return '$100-200/day';
    case 'luxury': return '$250+/day';
  }
}

export function compareCosts(cityA: CostBreakdown, cityB: CostBreakdown): {
  accommodation: number;
  meals: number;
  overall: number;
} {
  return {
    accommodation: cityA.accommodation_per_night - cityB.accommodation_per_night,
    meals: cityA.meal_average - cityB.meal_average,
    overall: getTotalDailyCost(cityA) - getTotalDailyCost(cityB)
  };
}

function getTotalDailyCost(breakdown: CostBreakdown): number {
  return breakdown.accommodation_per_night + 
         breakdown.meal_average * 3 + 
         breakdown.transportation_daily + 
         breakdown.activities_daily;
}

// packages/shared/src/utils/seasonal.utils.ts
import type { Month, SeasonalEvent } from '../types';

const MONTH_ORDER: Month[] = [
  'january', 'february', 'march', 'april',
  'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'
];

export function getCurrentMonth(): Month {
  return MONTH_ORDER[new Date().getMonth()];
}

export function getMonthNumber(month: Month): number {
  return MONTH_ORDER.indexOf(month) + 1;
}

export function isGoodTimeToVisit(bestMonths: Month[], avoidMonths: Month[], targetMonth?: Month): boolean {
  const month = targetMonth || getCurrentMonth();
  if (avoidMonths.includes(month)) return false;
  return bestMonths.includes(month);
}

export function getUpcomingEvents(events: SeasonalEvent[], withinMonths: number = 3): SeasonalEvent[] {
  const currentMonthIndex = MONTH_ORDER.indexOf(getCurrentMonth());
  const upcomingMonths: Month[] = [];
  
  for (let i = 0; i < withinMonths; i++) {
    upcomingMonths.push(MONTH_ORDER[(currentMonthIndex + i) % 12]);
  }
  
  return events.filter(event => upcomingMonths.includes(event.month));
}

export function getSeasonForMonth(month: Month, hemisphere: 'northern' | 'southern'): string {
  const monthIndex = MONTH_ORDER.indexOf(month);
  
  const northernSeasons: Record<number, string> = {
    0: 'winter', 1: 'winter', 2: 'spring',
    3: 'spring', 4: 'spring', 5: 'summer',
    6: 'summer', 7: 'summer', 8: 'fall',
    9: 'fall', 10: 'fall', 11: 'winter'
  };
  
  if (hemisphere === 'northern') {
    return northernSeasons[monthIndex];
  }
  
  // Flip for southern hemisphere
  const southernMapping: Record<string, string> = {
    'winter': 'summer', 'summer': 'winter',
    'spring': 'fall', 'fall': 'spring'
  };
  return southernMapping[northernSeasons[monthIndex]];
}

export function formatMonthRange(months: Month[]): string {
  if (months.length === 0) return 'Year-round';
  if (months.length === 12) return 'Year-round';
  
  // Sort months by calendar order
  const sorted = [...months].sort((a, b) => 
    MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)
  );
  
  // Capitalize first letter
  const capitalize = (m: Month) => m.charAt(0).toUpperCase() + m.slice(1);
  
  if (sorted.length <= 2) {
    return sorted.map(capitalize).join(' & ');
  }
  
  // Check for consecutive months
  const ranges: string[] = [];
  let rangeStart = sorted[0];
  let prev = MONTH_ORDER.indexOf(sorted[0]);
  
  for (let i = 1; i <= sorted.length; i++) {
    const curr = i < sorted.length ? MONTH_ORDER.indexOf(sorted[i]) : -1;
    
    if (curr !== prev + 1 || i === sorted.length) {
      const rangeEnd = sorted[i - 1];
      if (rangeStart === rangeEnd) {
        ranges.push(capitalize(rangeStart));
      } else {
        ranges.push(`${capitalize(rangeStart)}-${capitalize(rangeEnd)}`);
      }
      if (i < sorted.length) {
        rangeStart = sorted[i];
      }
    }
    prev = curr;
  }
  
  return ranges.join(', ');
}
```

**Success Criteria:**
- [ ] Budget utilities format currency correctly
- [ ] Trip cost calculator works for any duration
- [ ] Seasonal utilities identify good travel times
- [ ] Month range formatting handles edge cases
- [ ] Hemisphere-aware season detection works

**Test File:** `packages/shared/src/utils/__tests__/budget-seasonal.utils.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatCurrency,
  calculateTripCost,
  getBudgetTierFromCost,
  formatBudgetRange
} from '../budget.utils';
import {
  getCurrentMonth,
  isGoodTimeToVisit,
  getUpcomingEvents,
  formatMonthRange,
  getSeasonForMonth
} from '../seasonal.utils';

describe('Budget Utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(1500, 'USD', '$')).toBe('$1,500');
    });

    it('should format JPY correctly', () => {
      expect(formatCurrency(15000, 'JPY', '¥')).toBe('¥15,000');
    });
  });

  describe('calculateTripCost', () => {
    it('should calculate cost for given days', () => {
      expect(calculateTripCost(100, 7)).toBe(700);
      expect(calculateTripCost(150, 14)).toBe(2100);
    });
  });

  describe('getBudgetTierFromCost', () => {
    it('should return budget for low costs', () => {
      expect(getBudgetTierFromCost(50)).toBe('budget');
      expect(getBudgetTierFromCost(74)).toBe('budget');
    });

    it('should return mid-range for medium costs', () => {
      expect(getBudgetTierFromCost(100)).toBe('mid-range');
      expect(getBudgetTierFromCost(150)).toBe('mid-range');
    });

    it('should return luxury for high costs', () => {
      expect(getBudgetTierFromCost(250)).toBe('luxury');
      expect(getBudgetTierFromCost(500)).toBe('luxury');
    });
  });
});

describe('Seasonal Utilities', () => {
  describe('isGoodTimeToVisit', () => {
    it('should return true for best months', () => {
      expect(isGoodTimeToVisit(['march', 'april'], ['july'], 'march')).toBe(true);
    });

    it('should return false for avoid months', () => {
      expect(isGoodTimeToVisit(['march', 'april'], ['july'], 'july')).toBe(false);
    });

    it('should return false if not in best months', () => {
      expect(isGoodTimeToVisit(['march', 'april'], ['july'], 'january')).toBe(false);
    });
  });

  describe('formatMonthRange', () => {
    it('should format single month', () => {
      expect(formatMonthRange(['march'])).toBe('March');
    });

    it('should format two months', () => {
      expect(formatMonthRange(['march', 'april'])).toBe('March & April');
    });

    it('should format consecutive months as range', () => {
      expect(formatMonthRange(['march', 'april', 'may'])).toBe('March-May');
    });

    it('should return year-round for empty array', () => {
      expect(formatMonthRange([])).toBe('Year-round');
    });
  });

  describe('getSeasonForMonth', () => {
    it('should return correct northern hemisphere season', () => {
      expect(getSeasonForMonth('january', 'northern')).toBe('winter');
      expect(getSeasonForMonth('april', 'northern')).toBe('spring');
      expect(getSeasonForMonth('july', 'northern')).toBe('summer');
      expect(getSeasonForMonth('october', 'northern')).toBe('fall');
    });

    it('should return correct southern hemisphere season', () => {
      expect(getSeasonForMonth('january', 'southern')).toBe('summer');
      expect(getSeasonForMonth('july', 'southern')).toBe('winter');
    });
  });
});
```

---

### Task A.6: Update Main Package Exports

**Description:** Export all new types, schemas, utilities, and fixtures from the shared package entry point.

**Files to Modify:**
- `packages/shared/src/index.ts`

**Updated Exports:**

```typescript
// packages/shared/src/index.ts

// Types
export type {
  City,
  AlgoliaCity,
  EnhancedCity,
  EnhancedAlgoliaCity,
  BudgetTier,
  CostBreakdown,
  Month,
  SeasonalEvent,
  SeasonalInfo
} from './types';

// Schemas
export {
  CitySchema,
  AlgoliaCitySchema,
  EnhancedCitySchema,
  EnhancedAlgoliaCitySchema,
  BudgetTierSchema,
  CostBreakdownSchema,
  MonthSchema,
  SeasonalEventSchema
} from './schemas';

// Config
export {
  INDEX_NAME,
  SEARCHABLE_ATTRIBUTES,
  ENHANCED_SEARCHABLE_ATTRIBUTES,
  ATTRIBUTES_FOR_FACETING,
  ENHANCED_ATTRIBUTES_FOR_FACETING,
  CUSTOM_RANKING,
  ENHANCED_CUSTOM_RANKING,
  getIndexSettings,
  getEnhancedIndexSettings
} from './config';

// Fixtures
export {
  mockCities,
  getMockCityByName,
  getRandomMockCities,
  enhancedMockCities,
  getEnhancedMockCityByName,
  getEnhancedCitiesByBudget,
  getEnhancedCitiesByMonth
} from './fixtures';

// Utils
export {
  generateObjectId,
  slugify,
  normalizeScore,
  truncateDescription,
  formatCurrency,
  calculateTripCost,
  getBudgetTierFromCost,
  formatBudgetRange,
  compareCosts,
  getCurrentMonth,
  getMonthNumber,
  isGoodTimeToVisit,
  getUpcomingEvents,
  getSeasonForMonth,
  formatMonthRange
} from './utils';
```

**Success Criteria:**
- [ ] All new types exportable from package
- [ ] All new schemas exportable
- [ ] All new utilities exportable
- [ ] Package compiles without errors
- [ ] No circular dependencies

---

## Sub-Plan B: Experiences Index

**Folder:** `/packages/shared` (New types) + `/packages/data-pipeline` (Modifications)
**Estimated Tasks:** 8

### Task B.1: Define Experience Types

**Description:** Create TypeScript interfaces for the experiences data model.

**Files to Create:**
- `packages/shared/src/types/experience.ts`

**Type Definitions:**

```typescript
// packages/shared/src/types/experience.ts
import type { Month, BudgetTier } from './index';

export type ExperienceCategory = 
  | 'cultural'
  | 'adventure'
  | 'culinary'
  | 'nature'
  | 'wellness'
  | 'nightlife'
  | 'romantic'
  | 'family'
  | 'photography'
  | 'spiritual';

export type PhysicalLevel = 'easy' | 'moderate' | 'challenging' | 'extreme';

export interface Experience {
  name: string;
  category: ExperienceCategory;
  description: string;
  vibe_tags: string[];
  city_ids: string[]; // objectIDs of cities where available
  duration_hours: number;
  price_tier: BudgetTier;
  best_season: Month[];
  min_travelers: number;
  max_travelers: number;
  physical_level: PhysicalLevel;
  highlights: string[];
  what_to_bring: string[];
  image_url: string;
}

export interface AlgoliaExperience extends Experience {
  objectID: string;
  _geoloc?: {
    lat: number;
    lng: number;
  };
}

// Linking type for city-experience relationships
export interface CityExperienceLink {
  city_id: string;
  experience_id: string;
  local_name?: string;
  local_price_usd: number;
  booking_required: boolean;
  advance_booking_days?: number;
}
```

**Success Criteria:**
- [ ] Experience type covers all required fields
- [ ] Category enum includes diverse experience types
- [ ] Physical level supports accessibility filtering
- [ ] City linkage supports multiple cities per experience

**Test File:** `packages/shared/src/types/__tests__/experience.test.ts`

```typescript
import { describe, it, expect, expectTypeOf } from 'vitest';
import type { Experience, AlgoliaExperience, ExperienceCategory, PhysicalLevel } from '../experience';

describe('Experience Types', () => {
  it('should have valid experience structure', () => {
    const experience: Experience = {
      name: 'Sunrise Temple Tour',
      category: 'cultural',
      description: 'Watch the sunrise over ancient temples with a local guide',
      vibe_tags: ['spiritual', 'peaceful', 'photogenic'],
      city_ids: ['siem-reap-cambodia', 'bagan-myanmar'],
      duration_hours: 4,
      price_tier: 'mid-range',
      best_season: ['november', 'december', 'january', 'february'],
      min_travelers: 1,
      max_travelers: 8,
      physical_level: 'moderate',
      highlights: ['Angkor Wat sunrise', 'Hidden temples', 'Local breakfast'],
      what_to_bring: ['Camera', 'Sun hat', 'Water'],
      image_url: 'https://example.com/sunrise-temple.jpg'
    };

    expect(experience.category).toBe('cultural');
    expect(experience.city_ids).toHaveLength(2);
  });

  it('should have valid AlgoliaExperience with objectID', () => {
    const algoliaExp: AlgoliaExperience = {
      objectID: 'sunrise-temple-tour',
      name: 'Sunrise Temple Tour',
      category: 'cultural',
      description: 'Watch the sunrise over ancient temples',
      vibe_tags: ['spiritual'],
      city_ids: ['siem-reap-cambodia'],
      duration_hours: 4,
      price_tier: 'mid-range',
      best_season: ['november'],
      min_travelers: 1,
      max_travelers: 8,
      physical_level: 'moderate',
      highlights: ['Sunrise view'],
      what_to_bring: ['Camera'],
      image_url: 'https://example.com/temple.jpg'
    };

    expect(algoliaExp.objectID).toBe('sunrise-temple-tour');
  });

  it('should enforce category as valid enum', () => {
    const validCategories: ExperienceCategory[] = [
      'cultural', 'adventure', 'culinary', 'nature', 'wellness',
      'nightlife', 'romantic', 'family', 'photography', 'spiritual'
    ];
    
    validCategories.forEach(cat => {
      expect(typeof cat).toBe('string');
    });
  });

  it('should enforce physical level as valid enum', () => {
    const levels: PhysicalLevel[] = ['easy', 'moderate', 'challenging', 'extreme'];
    levels.forEach(level => {
      expect(['easy', 'moderate', 'challenging', 'extreme']).toContain(level);
    });
  });
});
```

---

### Task B.2: Create Experience Zod Schemas

**Description:** Implement Zod schemas for validating experience data.

**Files to Create:**
- `packages/shared/src/schemas/experience.schema.ts`

**Schema Definitions:**

```typescript
// packages/shared/src/schemas/experience.schema.ts
import { z } from 'zod';
import { BudgetTierSchema, MonthSchema } from './index';

export const ExperienceCategorySchema = z.enum([
  'cultural',
  'adventure',
  'culinary',
  'nature',
  'wellness',
  'nightlife',
  'romantic',
  'family',
  'photography',
  'spiritual'
]);

export const PhysicalLevelSchema = z.enum([
  'easy',
  'moderate',
  'challenging',
  'extreme'
]);

export const ExperienceSchema = z.object({
  name: z.string().min(3).max(100),
  category: ExperienceCategorySchema,
  description: z.string().min(20).max(500),
  vibe_tags: z.array(z.string()).min(1).max(10),
  city_ids: z.array(z.string()).min(1),
  duration_hours: z.number().min(0.5).max(72),
  price_tier: BudgetTierSchema,
  best_season: z.array(MonthSchema).min(1),
  min_travelers: z.number().int().min(1),
  max_travelers: z.number().int().min(1),
  physical_level: PhysicalLevelSchema,
  highlights: z.array(z.string()).min(1).max(10),
  what_to_bring: z.array(z.string()).max(10),
  image_url: z.string().url()
}).refine(data => data.max_travelers >= data.min_travelers, {
  message: 'max_travelers must be >= min_travelers',
  path: ['max_travelers']
});

export const AlgoliaExperienceSchema = ExperienceSchema.extend({
  objectID: z.string().min(1),
  _geoloc: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
});

export const CityExperienceLinkSchema = z.object({
  city_id: z.string().min(1),
  experience_id: z.string().min(1),
  local_name: z.string().optional(),
  local_price_usd: z.number().min(0),
  booking_required: z.boolean(),
  advance_booking_days: z.number().int().min(0).optional()
});
```

**Success Criteria:**
- [ ] Schema validates all required fields
- [ ] Schema enforces min/max travelers relationship
- [ ] Schema validates URL format for images
- [ ] Duration supports fractional hours
- [ ] Category enum validation works

**Test File:** `packages/shared/src/schemas/__tests__/experience.schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { 
  ExperienceSchema, 
  AlgoliaExperienceSchema,
  ExperienceCategorySchema,
  PhysicalLevelSchema 
} from '../experience.schema';

describe('Experience Schema', () => {
  const validExperience = {
    name: 'Street Food Tour',
    category: 'culinary',
    description: 'Explore the vibrant street food scene with a local guide who knows all the best spots',
    vibe_tags: ['foodie', 'local', 'authentic'],
    city_ids: ['bangkok-thailand', 'ho-chi-minh-vietnam'],
    duration_hours: 3,
    price_tier: 'budget',
    best_season: ['november', 'december', 'january'],
    min_travelers: 1,
    max_travelers: 6,
    physical_level: 'easy',
    highlights: ['Hidden gem stalls', 'Local favorites', 'Dessert stop'],
    what_to_bring: ['Empty stomach', 'Water'],
    image_url: 'https://example.com/street-food.jpg'
  };

  it('should validate a correct experience object', () => {
    const result = ExperienceSchema.safeParse(validExperience);
    expect(result.success).toBe(true);
  });

  it('should reject experience with min > max travelers', () => {
    const invalid = { ...validExperience, min_travelers: 10, max_travelers: 5 };
    const result = ExperienceSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject invalid category', () => {
    const invalid = { ...validExperience, category: 'invalid-category' };
    const result = ExperienceSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject empty city_ids', () => {
    const invalid = { ...validExperience, city_ids: [] };
    const result = ExperienceSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate duration in fractional hours', () => {
    const halfHour = { ...validExperience, duration_hours: 0.5 };
    expect(ExperienceSchema.safeParse(halfHour).success).toBe(true);
    
    const tooShort = { ...validExperience, duration_hours: 0.25 };
    expect(ExperienceSchema.safeParse(tooShort).success).toBe(false);
  });

  it('should require objectID for AlgoliaExperience', () => {
    const withoutId = validExperience;
    const result = AlgoliaExperienceSchema.safeParse(withoutId);
    expect(result.success).toBe(false);

    const withId = { ...validExperience, objectID: 'street-food-tour-bangkok' };
    const resultWithId = AlgoliaExperienceSchema.safeParse(withId);
    expect(resultWithId.success).toBe(true);
  });
});
```

---

### Task B.3: Configure Experiences Index Settings

**Description:** Create Algolia configuration for the experiences index.

**Files to Create:**
- `packages/shared/src/config/experiences.config.ts`

**Configuration:**

```typescript
// packages/shared/src/config/experiences.config.ts

export const EXPERIENCES_INDEX_NAME = 'travel_experiences';

export const EXPERIENCES_SEARCHABLE_ATTRIBUTES = [
  'name',
  'description',
  'vibe_tags',
  'highlights',
  'category'
];

export const EXPERIENCES_ATTRIBUTES_FOR_FACETING = [
  'category',
  'price_tier',
  'physical_level',
  'filterOnly(city_ids)',
  'searchable(best_season)',
  'duration_hours',
  'min_travelers'
];

export const EXPERIENCES_CUSTOM_RANKING = [
  'desc(city_ids)', // Experiences available in more cities rank higher
];

export function getExperiencesIndexSettings() {
  return {
    searchableAttributes: EXPERIENCES_SEARCHABLE_ATTRIBUTES,
    attributesForFaceting: EXPERIENCES_ATTRIBUTES_FOR_FACETING,
    customRanking: EXPERIENCES_CUSTOM_RANKING,
    ranking: [
      'typo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom'
    ],
    numericAttributesForFiltering: [
      'duration_hours',
      'min_travelers',
      'max_travelers'
    ]
  };
}
```

**Success Criteria:**
- [ ] Index name follows naming convention
- [ ] Category is searchable facet
- [ ] Duration supports numeric filtering
- [ ] City linkage supports filtering

**Test File:** `packages/shared/src/config/__tests__/experiences.config.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  EXPERIENCES_INDEX_NAME,
  EXPERIENCES_SEARCHABLE_ATTRIBUTES,
  EXPERIENCES_ATTRIBUTES_FOR_FACETING,
  getExperiencesIndexSettings
} from '../experiences.config';

describe('Experiences Index Configuration', () => {
  it('should have correct index name', () => {
    expect(EXPERIENCES_INDEX_NAME).toBe('travel_experiences');
  });

  it('should include name and description in searchable attributes', () => {
    expect(EXPERIENCES_SEARCHABLE_ATTRIBUTES).toContain('name');
    expect(EXPERIENCES_SEARCHABLE_ATTRIBUTES).toContain('description');
  });

  it('should include category for faceting', () => {
    expect(EXPERIENCES_ATTRIBUTES_FOR_FACETING).toContain('category');
  });

  it('should include city_ids as filterOnly', () => {
    expect(EXPERIENCES_ATTRIBUTES_FOR_FACETING).toContain('filterOnly(city_ids)');
  });

  it('should have numeric filtering for duration', () => {
    const settings = getExperiencesIndexSettings();
    expect(settings.numericAttributesForFiltering).toContain('duration_hours');
  });
});
```

---

### Task B.4: Create Experience Fixtures

**Description:** Generate mock experience data for testing.

**Files to Create:**
- `packages/shared/src/fixtures/experiences.fixture.ts`

**Sample Fixtures:**

```typescript
// packages/shared/src/fixtures/experiences.fixture.ts
import type { AlgoliaExperience } from '../types';

export const mockExperiences: AlgoliaExperience[] = [
  {
    objectID: 'sunrise-temple-tour',
    name: 'Sunrise Temple Tour',
    category: 'cultural',
    description: 'Watch the sun rise over ancient temples with an expert local guide who shares hidden history and photography spots',
    vibe_tags: ['spiritual', 'photogenic', 'peaceful', 'early-bird', 'bucket-list'],
    city_ids: ['siem-reap-cambodia', 'bagan-myanmar', 'borobudur-indonesia'],
    duration_hours: 4,
    price_tier: 'mid-range',
    best_season: ['november', 'december', 'january', 'february'],
    min_travelers: 1,
    max_travelers: 8,
    physical_level: 'moderate',
    highlights: ['Sunrise photography', 'Hidden temples', 'Local breakfast', 'Historical insights'],
    what_to_bring: ['Camera', 'Sun hat', 'Water', 'Comfortable shoes'],
    image_url: 'https://source.unsplash.com/featured/?angkor,sunrise,temple'
  },
  {
    objectID: 'street-food-crawl',
    name: 'Night Street Food Crawl',
    category: 'culinary',
    description: 'Discover the best street food vendors with a local foodie guide who knows every hidden stall and secret recipe',
    vibe_tags: ['foodie', 'local', 'authentic', 'night-owl', 'budget-friendly'],
    city_ids: ['bangkok-thailand', 'ho-chi-minh-vietnam', 'taipei-taiwan', 'mexico-city-mexico', 'marrakech-morocco'],
    duration_hours: 3,
    price_tier: 'budget',
    best_season: ['january', 'february', 'march', 'october', 'november', 'december'],
    min_travelers: 2,
    max_travelers: 10,
    physical_level: 'easy',
    highlights: ['5+ food stops', 'Secret menu items', 'Local drink pairings', 'Night market vibes'],
    what_to_bring: ['Empty stomach', 'Cash for extra snacks'],
    image_url: 'https://source.unsplash.com/featured/?street,food,night,market'
  },
  {
    objectID: 'volcano-hiking',
    name: 'Active Volcano Hiking Adventure',
    category: 'adventure',
    description: 'Trek to the edge of an active volcano crater with experienced guides, witnessing incredible geological forces up close',
    vibe_tags: ['adrenaline', 'nature', 'bucket-list', 'geological', 'extreme'],
    city_ids: ['reykjavik-iceland', 'hawaii-usa', 'la-fortuna-costa-rica', 'bali-indonesia', 'sicily-italy'],
    duration_hours: 6,
    price_tier: 'mid-range',
    best_season: ['may', 'june', 'july', 'august', 'september'],
    min_travelers: 4,
    max_travelers: 12,
    physical_level: 'challenging',
    highlights: ['Crater views', 'Lava formations', 'Geological education', 'Summit achievement'],
    what_to_bring: ['Hiking boots', 'Warm layers', 'Rain gear', 'Energy snacks', 'Camera'],
    image_url: 'https://source.unsplash.com/featured/?volcano,hiking,crater'
  },
  {
    objectID: 'wine-tasting-tour',
    name: 'Premium Wine Tasting & Vineyard Tour',
    category: 'culinary',
    description: 'Visit prestigious wineries with a sommelier guide, learning about terroir, viticulture, and wine pairing over a gourmet lunch',
    vibe_tags: ['sophisticated', 'romantic', 'gourmet', 'scenic', 'relaxing'],
    city_ids: ['bordeaux-france', 'napa-valley-usa', 'mendoza-argentina', 'tuscany-italy', 'cape-town-south-africa', 'barossa-australia'],
    duration_hours: 8,
    price_tier: 'luxury',
    best_season: ['september', 'october', 'march', 'april'],
    min_travelers: 2,
    max_travelers: 8,
    physical_level: 'easy',
    highlights: ['3-4 winery visits', 'Sommelier-led tastings', 'Gourmet lunch pairing', 'Cellar tours'],
    what_to_bring: ['Sunglasses', 'Comfortable shoes', 'Light jacket'],
    image_url: 'https://source.unsplash.com/featured/?vineyard,wine,tasting'
  },
  // ... More experiences
];

export function getMockExperienceById(id: string): AlgoliaExperience | undefined {
  return mockExperiences.find(e => e.objectID === id);
}

export function getMockExperiencesByCategory(category: string): AlgoliaExperience[] {
  return mockExperiences.filter(e => e.category === category);
}

export function getMockExperiencesByCity(cityId: string): AlgoliaExperience[] {
  return mockExperiences.filter(e => e.city_ids.includes(cityId));
}
```

**Success Criteria:**
- [ ] At least 15 diverse experiences
- [ ] All categories represented
- [ ] Experiences linked to multiple cities
- [ ] Variety in price tiers and physical levels
- [ ] Helper functions for filtering

**Test File:** `packages/shared/src/fixtures/__tests__/experiences.fixture.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { 
  mockExperiences, 
  getMockExperienceById,
  getMockExperiencesByCategory,
  getMockExperiencesByCity 
} from '../experiences.fixture';
import { AlgoliaExperienceSchema } from '../../schemas';

describe('Experience Fixtures', () => {
  it('should have at least 15 mock experiences', () => {
    expect(mockExperiences.length).toBeGreaterThanOrEqual(15);
  });

  it('should have all fixtures pass schema validation', () => {
    mockExperiences.forEach(exp => {
      const result = AlgoliaExperienceSchema.safeParse(exp);
      expect(result.success, `Experience ${exp.name} failed validation`).toBe(true);
    });
  });

  it('should have multiple categories represented', () => {
    const categories = new Set(mockExperiences.map(e => e.category));
    expect(categories.size).toBeGreaterThanOrEqual(5);
  });

  it('should have experiences linked to multiple cities', () => {
    const multiCityExperiences = mockExperiences.filter(e => e.city_ids.length > 1);
    expect(multiCityExperiences.length).toBeGreaterThan(0);
  });

  it('should find experience by ID', () => {
    const exp = getMockExperienceById('sunrise-temple-tour');
    expect(exp).toBeDefined();
    expect(exp?.name).toBe('Sunrise Temple Tour');
  });

  it('should filter by category', () => {
    const culinary = getMockExperiencesByCategory('culinary');
    expect(culinary.length).toBeGreaterThan(0);
    culinary.forEach(e => expect(e.category).toBe('culinary'));
  });

  it('should filter by city', () => {
    const bangkokExperiences = getMockExperiencesByCity('bangkok-thailand');
    expect(bangkokExperiences.length).toBeGreaterThan(0);
    bangkokExperiences.forEach(e => {
      expect(e.city_ids).toContain('bangkok-thailand');
    });
  });
});
```

---

### Task B.5: Create Experience Data Generator

**Description:** Implement generator for creating experience records with LLM enrichment.

**Files to Create:**
- `packages/data-pipeline/src/generators/experience.generator.ts`

**Generator Implementation:**

```typescript
// packages/data-pipeline/src/generators/experience.generator.ts
import type { Experience, ExperienceCategory, PhysicalLevel, BudgetTier, Month } from '@vibe-travel/shared';

interface BaseExperience {
  name: string;
  category: ExperienceCategory;
  city_ids: string[];
  duration_hours: number;
  price_tier: BudgetTier;
  physical_level: PhysicalLevel;
}

// Curated base experiences that will be enriched with LLM
export const BASE_EXPERIENCES: BaseExperience[] = [
  // Cultural
  { name: 'Sunrise Temple Tour', category: 'cultural', city_ids: ['siem-reap-cambodia', 'bagan-myanmar'], duration_hours: 4, price_tier: 'mid-range', physical_level: 'moderate' },
  { name: 'Ancient Ruins Walking Tour', category: 'cultural', city_ids: ['rome-italy', 'athens-greece', 'cusco-peru'], duration_hours: 3, price_tier: 'budget', physical_level: 'easy' },
  { name: 'Traditional Tea Ceremony', category: 'cultural', city_ids: ['kyoto-japan', 'taipei-taiwan', 'marrakech-morocco'], duration_hours: 2, price_tier: 'mid-range', physical_level: 'easy' },
  
  // Culinary
  { name: 'Street Food Night Crawl', category: 'culinary', city_ids: ['bangkok-thailand', 'mexico-city-mexico', 'ho-chi-minh-vietnam'], duration_hours: 3, price_tier: 'budget', physical_level: 'easy' },
  { name: 'Wine Tasting & Vineyard Tour', category: 'culinary', city_ids: ['bordeaux-france', 'napa-valley-usa', 'mendoza-argentina'], duration_hours: 6, price_tier: 'luxury', physical_level: 'easy' },
  { name: 'Cooking Class with Local Chef', category: 'culinary', city_ids: ['florence-italy', 'oaxaca-mexico', 'chiang-mai-thailand'], duration_hours: 4, price_tier: 'mid-range', physical_level: 'easy' },
  
  // Adventure
  { name: 'Volcano Hiking Adventure', category: 'adventure', city_ids: ['reykjavik-iceland', 'hawaii-usa', 'bali-indonesia'], duration_hours: 6, price_tier: 'mid-range', physical_level: 'challenging' },
  { name: 'Scuba Diving Certification', category: 'adventure', city_ids: ['cairns-australia', 'phuket-thailand', 'cancun-mexico'], duration_hours: 8, price_tier: 'mid-range', physical_level: 'moderate' },
  { name: 'Bungee Jumping Experience', category: 'adventure', city_ids: ['queenstown-new-zealand', 'interlaken-switzerland', 'victoria-falls-zimbabwe'], duration_hours: 2, price_tier: 'mid-range', physical_level: 'extreme' },
  
  // Nature
  { name: 'Safari Game Drive', category: 'nature', city_ids: ['nairobi-kenya', 'cape-town-south-africa', 'dar-es-salaam-tanzania'], duration_hours: 8, price_tier: 'luxury', physical_level: 'easy' },
  { name: 'Northern Lights Chase', category: 'nature', city_ids: ['tromso-norway', 'reykjavik-iceland', 'fairbanks-usa'], duration_hours: 5, price_tier: 'mid-range', physical_level: 'easy' },
  { name: 'Rainforest Canopy Walk', category: 'nature', city_ids: ['monteverde-costa-rica', 'kuala-lumpur-malaysia', 'amazon-brazil'], duration_hours: 3, price_tier: 'budget', physical_level: 'moderate' },
  
  // Romantic
  { name: 'Sunset Sailing Cruise', category: 'romantic', city_ids: ['santorini-greece', 'dubrovnik-croatia', 'sydney-australia'], duration_hours: 3, price_tier: 'luxury', physical_level: 'easy' },
  { name: 'Private Hot Air Balloon Ride', category: 'romantic', city_ids: ['cappadocia-turkey', 'napa-valley-usa', 'bagan-myanmar'], duration_hours: 2, price_tier: 'luxury', physical_level: 'easy' },
  
  // Wellness
  { name: 'Traditional Spa Day', category: 'wellness', city_ids: ['bali-indonesia', 'budapest-hungary', 'marrakech-morocco'], duration_hours: 4, price_tier: 'mid-range', physical_level: 'easy' },
  { name: 'Yoga Retreat Day', category: 'wellness', city_ids: ['rishikesh-india', 'ubud-indonesia', 'koh-samui-thailand'], duration_hours: 6, price_tier: 'budget', physical_level: 'moderate' },
  
  // ... More base experiences
];

export function generateBaseExperiences(): BaseExperience[] {
  return BASE_EXPERIENCES;
}

export function getExperiencesByCityId(cityId: string): BaseExperience[] {
  return BASE_EXPERIENCES.filter(exp => exp.city_ids.includes(cityId));
}
```

**Success Criteria:**
- [ ] At least 30 base experiences defined
- [ ] All categories covered
- [ ] Experiences linked to real city objectIDs
- [ ] Realistic durations and price tiers

---

### Task B.6: Create Experience LLM Enrichment

**Description:** Extend LLM service to enrich experience data with descriptions, vibe tags, and details.

**Files to Modify:**
- `packages/data-pipeline/src/services/llm.service.ts`

**LLM Enrichment Extension:**

```typescript
// Add to llm.service.ts

interface ExperienceEnrichmentInput {
  name: string;
  category: string;
  city_ids: string[];
  duration_hours: number;
  price_tier: string;
  physical_level: string;
}

interface ExperienceEnrichmentOutput {
  description: string;
  vibe_tags: string[];
  highlights: string[];
  what_to_bring: string[];
  best_season: string[];
  min_travelers: number;
  max_travelers: number;
}

const EXPERIENCE_ENRICHMENT_PROMPT = `You are an expert travel experience curator. Given the following experience details, generate rich content:

Experience: {name}
Category: {category}
Available in cities: {cities}
Duration: {duration} hours
Price tier: {price_tier}
Physical level: {physical_level}

Generate a JSON response with:
1. "description": A compelling 50-100 word description that captures the essence of this experience
2. "vibe_tags": 5-8 atmospheric/mood tags (e.g., "adrenaline", "peaceful", "romantic", "bucket-list")
3. "highlights": 4-6 specific highlights or included activities
4. "what_to_bring": 3-5 recommended items to bring
5. "best_season": Array of best months (lowercase) for this experience
6. "min_travelers": Minimum recommended group size
7. "max_travelers": Maximum recommended group size

Response must be valid JSON only, no markdown.`;

export async function enrichExperience(
  input: ExperienceEnrichmentInput
): Promise<ExperienceEnrichmentOutput> {
  const prompt = EXPERIENCE_ENRICHMENT_PROMPT
    .replace('{name}', input.name)
    .replace('{category}', input.category)
    .replace('{cities}', input.city_ids.join(', '))
    .replace('{duration}', String(input.duration_hours))
    .replace('{price_tier}', input.price_tier)
    .replace('{physical_level}', input.physical_level);

  // Call LLM and parse response
  const response = await this.callLLM(prompt);
  return JSON.parse(response) as ExperienceEnrichmentOutput;
}
```

**Success Criteria:**
- [ ] LLM generates compelling descriptions
- [ ] Vibe tags are relevant and diverse
- [ ] Highlights are specific and useful
- [ ] Seasonal recommendations make sense
- [ ] Group sizes are realistic

---

### Task B.7: Create Experience Algolia Client

**Description:** Extend Algolia client to support experiences index operations.

**Files to Modify:**
- `packages/data-pipeline/src/clients/algolia.client.ts`

**Client Extension:**

```typescript
// Add to algolia.client.ts

import { 
  EXPERIENCES_INDEX_NAME, 
  getExperiencesIndexSettings 
} from '@vibe-travel/shared';

export class AlgoliaClient {
  private experiencesIndex: SearchIndex;

  constructor(config: AlgoliaClientConfig) {
    // ... existing constructor
    this.experiencesIndex = this.client.initIndex(EXPERIENCES_INDEX_NAME);
  }

  async configureExperiencesIndex(): Promise<void> {
    const settings = getExperiencesIndexSettings();
    await this.experiencesIndex.setSettings(settings);
  }

  async uploadExperiences(
    experiences: AlgoliaExperience[],
    options?: UploadOptions
  ): Promise<UploadResult> {
    return this.uploadRecords(experiences, {
      ...options,
      index: this.experiencesIndex
    });
  }

  async clearExperiencesIndex(): Promise<void> {
    await this.experiencesIndex.clearObjects();
  }

  async getExperiencesForCity(cityId: string): Promise<AlgoliaExperience[]> {
    const { hits } = await this.experiencesIndex.search('', {
      filters: `city_ids:${cityId}`,
      hitsPerPage: 50
    });
    return hits as AlgoliaExperience[];
  }
}
```

**Success Criteria:**
- [ ] Experiences index configurable
- [ ] Batch upload supported
- [ ] City-based filtering works
- [ ] Index clearing supported

---

### Task B.8: Experience Pipeline Integration Test

**Description:** Integration test for the complete experience data pipeline.

**Files to Create:**
- `packages/data-pipeline/src/__tests__/experiences-integration.test.ts`

```typescript
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { AlgoliaExperienceSchema } from '@vibe-travel/shared';

describe('Experience Pipeline Integration', () => {
  let generatedExperiences: any[];

  beforeAll(async () => {
    // Mock LLM for consistent tests
    const mockLLMResponse = {
      description: 'An amazing experience awaits',
      vibe_tags: ['exciting', 'unique', 'memorable'],
      highlights: ['Activity 1', 'Activity 2', 'Activity 3'],
      what_to_bring: ['Camera', 'Sunscreen'],
      best_season: ['march', 'april', 'may'],
      min_travelers: 2,
      max_travelers: 8
    };

    // Generate experiences with mock
    generatedExperiences = await generateAndEnrichExperiences(mockLLMResponse);
  });

  it('should generate at least 20 experiences', () => {
    expect(generatedExperiences.length).toBeGreaterThanOrEqual(20);
  });

  it('should produce valid Algolia records', () => {
    generatedExperiences.forEach(exp => {
      const result = AlgoliaExperienceSchema.safeParse(exp);
      expect(result.success, `Invalid experience: ${exp.name}`).toBe(true);
    });
  });

  it('should have unique objectIDs', () => {
    const ids = generatedExperiences.map(e => e.objectID);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid city linkages', () => {
    generatedExperiences.forEach(exp => {
      expect(exp.city_ids.length).toBeGreaterThan(0);
      exp.city_ids.forEach((id: string) => {
        expect(id).toMatch(/^[a-z-]+-[a-z-]+$/);
      });
    });
  });

  it('should cover multiple categories', () => {
    const categories = new Set(generatedExperiences.map(e => e.category));
    expect(categories.size).toBeGreaterThanOrEqual(5);
  });
});
```

---

## Sub-Plan C: Seasonal Intelligence & Data Expansion

**Folder:** `/packages/data-pipeline` (Modifications)
**Estimated Tasks:** 6

### Task C.1: Create Expanded City Data Source

**Description:** Create comprehensive city dataset with 200+ destinations including all enhanced attributes.

**Files to Create:**
- `packages/data-pipeline/src/data/expanded-cities.json`
- `packages/data-pipeline/src/generators/expanded-city.generator.ts`

**Data Structure:**

```typescript
// packages/data-pipeline/src/generators/expanded-city.generator.ts

interface ExpandedCitySource {
  city: string;
  country: string;
  continent: string;
  coordinates: { lat: number; lng: number };
  population_tier: 'small' | 'medium' | 'large' | 'mega';
  tourism_rank: number; // 1-100
  
  // Pre-filled data (not requiring LLM)
  climate_type: string;
  timezone: string;
  currency: string;
  currency_symbol: string;
  primary_language: string;
  flight_hub: boolean;
  visa_free_for: string[];
  
  // Score hints for LLM
  known_for: string[]; // e.g., ["beaches", "nightlife", "temples"]
}

// Source data for 200+ cities
export const EXPANDED_CITY_SOURCES: ExpandedCitySource[] = [
  // Asia - 50+ cities
  { city: 'Tokyo', country: 'Japan', continent: 'Asia', coordinates: { lat: 35.6762, lng: 139.6503 }, population_tier: 'mega', tourism_rank: 5, climate_type: 'Humid subtropical', timezone: 'Asia/Tokyo', currency: 'JPY', currency_symbol: '¥', primary_language: 'Japanese', flight_hub: true, visa_free_for: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'], known_for: ['technology', 'temples', 'food', 'anime'] },
  { city: 'Bangkok', country: 'Thailand', continent: 'Asia', coordinates: { lat: 13.7563, lng: 100.5018 }, population_tier: 'mega', tourism_rank: 1, climate_type: 'Tropical savanna', timezone: 'Asia/Bangkok', currency: 'THB', currency_symbol: '฿', primary_language: 'Thai', flight_hub: true, visa_free_for: ['US', 'GB', 'CA', 'AU', 'DE'], known_for: ['temples', 'street-food', 'nightlife', 'shopping'] },
  // ... 48 more Asian cities
  
  // Europe - 50+ cities
  { city: 'Paris', country: 'France', continent: 'Europe', coordinates: { lat: 48.8566, lng: 2.3522 }, population_tier: 'large', tourism_rank: 2, climate_type: 'Oceanic', timezone: 'Europe/Paris', currency: 'EUR', currency_symbol: '€', primary_language: 'French', flight_hub: true, visa_free_for: ['US', 'GB', 'CA', 'AU', 'JP'], known_for: ['romance', 'art', 'food', 'fashion'] },
  // ... 49 more European cities
  
  // Americas - 40+ cities
  // Africa - 25+ cities
  // Oceania - 20+ cities
  // Middle East - 15+ cities
];

export function generateExpandedBaseCities(): ExpandedCitySource[] {
  return EXPANDED_CITY_SOURCES;
}
```

**Success Criteria:**
- [ ] 200+ city sources defined
- [ ] All continents well-represented
- [ ] Factual data pre-filled (no hallucination risk)
- [ ] LLM hints provided for enrichment

---

### Task C.2: Implement Seasonal Query Support

**Description:** Create utility functions and Agent Studio prompt enhancements for seasonal queries.

**Files to Create:**
- `packages/shared/src/utils/seasonal-query.utils.ts`
- `packages/data-pipeline/src/prompts/seasonal.prompts.ts`

**Seasonal Query Utilities:**

```typescript
// packages/shared/src/utils/seasonal-query.utils.ts
import type { Month, EnhancedAlgoliaCity } from '../types';

export interface SeasonalQuery {
  targetMonth?: Month;
  avoidConditions?: ('monsoon' | 'extreme-heat' | 'extreme-cold' | 'hurricane')[];
  preferConditions?: ('warm' | 'cool' | 'dry' | 'snow')[];
}

export function buildSeasonalFilters(query: SeasonalQuery): string {
  const filters: string[] = [];
  
  if (query.targetMonth) {
    filters.push(`best_months:${query.targetMonth}`);
    filters.push(`NOT avoid_months:${query.targetMonth}`);
  }
  
  return filters.join(' AND ');
}

export function parseSeasonalIntent(userQuery: string): SeasonalQuery {
  const months: Record<string, Month> = {
    'january': 'january', 'jan': 'january',
    'february': 'february', 'feb': 'february',
    'march': 'march', 'mar': 'march',
    'april': 'april', 'apr': 'april',
    'may': 'may',
    'june': 'june', 'jun': 'june',
    'july': 'july', 'jul': 'july',
    'august': 'august', 'aug': 'august',
    'september': 'september', 'sep': 'september', 'sept': 'september',
    'october': 'october', 'oct': 'october',
    'november': 'november', 'nov': 'november',
    'december': 'december', 'dec': 'december'
  };

  const query = userQuery.toLowerCase();
  const result: SeasonalQuery = {};

  // Detect month mentions
  for (const [key, month] of Object.entries(months)) {
    if (query.includes(key)) {
      result.targetMonth = month;
      break;
    }
  }

  // Detect seasonal patterns
  if (query.includes('winter sun') || query.includes('escape cold')) {
    result.preferConditions = ['warm'];
  }
  if (query.includes('avoid monsoon') || query.includes('dry season')) {
    result.avoidConditions = ['monsoon'];
    result.preferConditions = ['dry'];
  }
  if (query.includes('cherry blossom') || query.includes('sakura')) {
    result.targetMonth = 'april';
  }
  if (query.includes('autumn') || query.includes('fall foliage')) {
    result.targetMonth = 'october';
  }

  return result;
}

export function getSeasonalRecommendationText(city: EnhancedAlgoliaCity, targetMonth: Month): string {
  const isGoodTime = city.best_months.includes(targetMonth);
  const isBadTime = city.avoid_months.includes(targetMonth);
  
  if (isBadTime) {
    return `⚠️ ${targetMonth.charAt(0).toUpperCase() + targetMonth.slice(1)} is not ideal for ${city.city} due to ${getAvoidReason(city, targetMonth)}`;
  }
  
  if (isGoodTime) {
    const event = city.seasonal_events.find(e => e.month === targetMonth);
    if (event) {
      return `✨ Great choice! ${event.name} happens in ${targetMonth}`;
    }
    return `✓ ${targetMonth.charAt(0).toUpperCase() + targetMonth.slice(1)} is a great time to visit ${city.city}`;
  }
  
  return `${city.city} is suitable year-round`;
}

function getAvoidReason(city: EnhancedAlgoliaCity, month: Month): string {
  // Logic to determine why a month should be avoided
  const monthIndex = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'].indexOf(month);
  
  if (city.climate_type.includes('Monsoon') && monthIndex >= 5 && monthIndex <= 8) {
    return 'monsoon season';
  }
  if (city.climate_type.includes('Tropical') && monthIndex >= 5 && monthIndex <= 8) {
    return 'high humidity and heat';
  }
  return 'weather conditions';
}
```

**Success Criteria:**
- [ ] Month extraction from natural language
- [ ] Seasonal filter generation for Algolia
- [ ] Recommendation text generation
- [ ] Avoid reason detection

---

### Task C.3: Update Agent System Prompt for Seasonal Queries

**Description:** Enhance Agent Studio system prompt to handle seasonal intelligence queries.

**Files to Create:**
- `packages/data-pipeline/src/prompts/agent-system.prompt.ts`

**Enhanced System Prompt:**

```typescript
// packages/data-pipeline/src/prompts/agent-system.prompt.ts

export const ENHANCED_AGENT_SYSTEM_PROMPT = `You are a travel concierge specializing in "vibe-based" destination discovery with deep knowledge of seasonal travel.

## Your Capabilities

1. **Vibe Matching**: Understand emotional and aesthetic preferences
2. **Seasonal Intelligence**: Know the best times to visit each destination
3. **Budget Awareness**: Match recommendations to budget constraints
4. **Experience Linking**: Suggest activities available at destinations

## Handling Seasonal Queries

When users mention timing:
- "Where should I go in March?" → Filter by best_months:march, avoid monsoon regions
- "Winter sun destinations" → Tropical/Southern Hemisphere in Dec-Feb
- "Cherry blossom season" → Japan, March-April
- "Avoid crowds" → Suggest shoulder seasons

Always include:
1. Why the timing is good/bad for that destination
2. Any special events happening during that period
3. Weather expectations

## Handling Budget Queries

When users mention budget:
- "cheap" / "budget" / "affordable" → budget_tier:budget, avg_daily_cost_usd < 75
- "mid-range" / "moderate" → budget_tier:mid-range
- "luxury" / "splurge" / "honeymoon" → budget_tier:luxury

Include estimated daily costs and what that covers.

## Conversation Flow

1. Extract explicit constraints (continent, climate, budget, month)
2. Identify semantic keywords capturing mood
3. Execute hybrid search with filters + semantic query
4. Present results with:
   - Vibe match explanation
   - Seasonal suitability
   - Budget fit
   - Linked experiences available
5. Offer refinement: "Want more beach options?" or "Looking for something more adventurous?"

## Example Interactions

User: "I want a romantic beach getaway in February"
→ Search: romantic + beach, filter budget_tier, best_months contains february
→ Present: Maldives (luxury), Zanzibar (mid-range), Goa (budget) with seasonal notes

User: "Somewhere in Asia for food lovers, not too expensive"
→ Search: foodie + culinary, filter continent:Asia, budget_tier IN [budget, mid-range]
→ Present: Bangkok, Hanoi, Taipei with cuisine highlights

Maintain context across conversation turns to refine recommendations.`;
```

---

### Task C.4: Create Budget-Based Search Utilities

**Description:** Implement utilities for budget-aware search and filtering.

**Files to Create:**
- `packages/shared/src/utils/budget-query.utils.ts`

```typescript
// packages/shared/src/utils/budget-query.utils.ts
import type { BudgetTier } from '../types';

export interface BudgetQuery {
  tier?: BudgetTier;
  maxDailyCost?: number;
  minDailyCost?: number;
  tripDays?: number;
  totalBudget?: number;
}

export function parseBudgetIntent(userQuery: string): BudgetQuery {
  const query = userQuery.toLowerCase();
  const result: BudgetQuery = {};

  // Detect budget tier keywords
  if (query.includes('cheap') || query.includes('budget') || query.includes('affordable') || query.includes('backpack')) {
    result.tier = 'budget';
    result.maxDailyCost = 75;
  } else if (query.includes('luxury') || query.includes('splurge') || query.includes('honeymoon') || query.includes('premium')) {
    result.tier = 'luxury';
    result.minDailyCost = 200;
  } else if (query.includes('mid-range') || query.includes('moderate')) {
    result.tier = 'mid-range';
    result.minDailyCost = 75;
    result.maxDailyCost = 200;
  }

  // Detect specific budget amounts
  const budgetMatch = query.match(/\$(\d+(?:,\d{3})*)/);
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1].replace(',', ''));
    result.totalBudget = amount;
  }

  // Detect trip duration
  const daysMatch = query.match(/(\d+)\s*(?:day|night|week)/);
  if (daysMatch) {
    let days = parseInt(daysMatch[1]);
    if (query.includes('week')) days *= 7;
    result.tripDays = days;
  }

  // Calculate max daily if total budget and days are known
  if (result.totalBudget && result.tripDays) {
    result.maxDailyCost = Math.floor(result.totalBudget / result.tripDays);
    result.tier = getBudgetTierFromCost(result.maxDailyCost);
  }

  return result;
}

export function buildBudgetFilters(query: BudgetQuery): string {
  const filters: string[] = [];

  if (query.tier) {
    filters.push(`budget_tier:${query.tier}`);
  }

  if (query.maxDailyCost) {
    filters.push(`avg_daily_cost_usd <= ${query.maxDailyCost}`);
  }

  if (query.minDailyCost) {
    filters.push(`avg_daily_cost_usd >= ${query.minDailyCost}`);
  }

  return filters.join(' AND ');
}

function getBudgetTierFromCost(dailyCost: number): BudgetTier {
  if (dailyCost < 75) return 'budget';
  if (dailyCost < 200) return 'mid-range';
  return 'luxury';
}

export function formatBudgetSummary(
  dailyCost: number,
  days: number,
  currency: string = 'USD'
): string {
  const total = dailyCost * days;
  return `Estimated ${days}-day trip: $${total.toLocaleString()} (${currency} ~$${dailyCost}/day)`;
}
```

**Success Criteria:**
- [ ] Budget tier extraction from natural language
- [ ] Specific dollar amount parsing
- [ ] Trip duration detection
- [ ] Budget filter generation for Algolia

---

### Task C.5: Create Data Pipeline CLI Commands for Enhanced Data

**Description:** Add CLI commands for generating and uploading enhanced city and experience data.

**Files to Modify:**
- `packages/data-pipeline/src/cli/index.ts`

**New Commands:**

```typescript
// packages/data-pipeline/src/cli/commands/generate-enhanced.ts
import { Command } from 'commander';

export const generateEnhancedCommand = new Command('generate-enhanced')
  .description('Generate enhanced city data with budget, seasonal, and practical info')
  .option('-c, --count <number>', 'Number of cities to generate', '200')
  .option('-o, --output <path>', 'Output file path', './output/enhanced-cities.json')
  .option('--include-experiences', 'Also generate linked experiences')
  .option('--dry-run', 'Generate without uploading to Algolia')
  .action(async (options) => {
    console.log(`Generating ${options.count} enhanced cities...`);
    // Implementation
  });

// packages/data-pipeline/src/cli/commands/upload-experiences.ts
export const uploadExperiencesCommand = new Command('upload-experiences')
  .description('Upload experiences to Algolia travel_experiences index')
  .option('-f, --file <path>', 'JSON file with experience data')
  .option('--clear', 'Clear existing index before upload')
  .action(async (options) => {
    console.log('Uploading experiences to Algolia...');
    // Implementation
  });

// packages/data-pipeline/src/cli/commands/sync-indexes.ts
export const syncIndexesCommand = new Command('sync-indexes')
  .description('Ensure city-experience linkages are consistent')
  .action(async () => {
    console.log('Validating index consistency...');
    // Verify all city_ids in experiences exist in cities index
    // Verify all similar_cities references are valid
  });
```

**Success Criteria:**
- [ ] Generate-enhanced command creates full dataset
- [ ] Upload-experiences command populates experiences index
- [ ] Sync-indexes validates cross-index references
- [ ] Dry-run mode works for all commands

---

### Task C.6: Enhanced Data Pipeline Integration Test

**Description:** End-to-end test for the complete enhanced data pipeline.

**Files to Create:**
- `e2e/tests/enhanced-data-pipeline.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import algoliasearch from 'algoliasearch';

test.describe('Enhanced Data Pipeline Integration', () => {
  const client = algoliasearch(
    process.env.ALGOLIA_APP_ID!,
    process.env.ALGOLIA_ADMIN_KEY!
  );
  
  const citiesIndex = client.initIndex('travel_destinations');
  const experiencesIndex = client.initIndex('travel_experiences');

  test('should have 200+ cities in index', async () => {
    const { nbHits } = await citiesIndex.search('');
    expect(nbHits).toBeGreaterThanOrEqual(200);
  });

  test('should have enhanced attributes in cities', async () => {
    const { hits } = await citiesIndex.search('Tokyo');
    const tokyo = hits[0] as any;
    
    expect(tokyo.budget_tier).toBeDefined();
    expect(tokyo.avg_daily_cost_usd).toBeGreaterThan(0);
    expect(tokyo.best_months).toBeInstanceOf(Array);
    expect(tokyo.safety_rating).toBeGreaterThanOrEqual(1);
  });

  test('should support budget filtering', async () => {
    const { hits } = await citiesIndex.search('', {
      filters: 'budget_tier:budget'
    });
    
    expect(hits.length).toBeGreaterThan(0);
    hits.forEach((hit: any) => {
      expect(hit.budget_tier).toBe('budget');
    });
  });

  test('should support seasonal filtering', async () => {
    const { hits } = await citiesIndex.search('', {
      filters: 'best_months:march'
    });
    
    expect(hits.length).toBeGreaterThan(0);
    hits.forEach((hit: any) => {
      expect(hit.best_months).toContain('march');
    });
  });

  test('should have experiences linked to cities', async () => {
    const { hits } = await experiencesIndex.search('', {
      filters: 'city_ids:tokyo-japan'
    });
    
    expect(hits.length).toBeGreaterThan(0);
  });

  test('should support experience category filtering', async () => {
    const { hits } = await experiencesIndex.search('', {
      filters: 'category:culinary'
    });
    
    expect(hits.length).toBeGreaterThan(0);
    hits.forEach((hit: any) => {
      expect(hit.category).toBe('culinary');
    });
  });
});
```

---

## Summary

### Task Count by Sub-Plan

| Sub-Plan | Focus Area | Tasks | Priority |
|----------|------------|-------|----------|
| **A: Enhanced City Schema** | Types, Schemas, Config, Fixtures | 6 | High |
| **B: Experiences Index** | New index, types, fixtures, pipeline | 8 | High |
| **C: Seasonal Intelligence** | Query utilities, data expansion | 6 | Medium |

**Total Tasks: 20**

### Dependency Graph

```
Sub-Plan A (Enhanced Schema)
       │
       ├────────────────┐
       ▼                ▼
Sub-Plan B          Sub-Plan C
(Experiences)       (Seasonal)
       │                │
       └────────┬───────┘
                ▼
         Integration Tests
```

### Execution Priority

1. **Phase 1**: Sub-Plan A Tasks A.1-A.4 (Types, Schemas, Config)
2. **Phase 2**: Sub-Plan A Tasks A.5-A.6 (Utilities, Exports) + Sub-Plan B Tasks B.1-B.4 (Experience Types & Schemas)
3. **Phase 3**: Sub-Plan B Tasks B.5-B.8 (Experience Pipeline) + Sub-Plan C Tasks C.1-C.4 (Seasonal Queries)
4. **Phase 4**: Sub-Plan C Tasks C.5-C.6 (CLI & Integration Tests)

### Key Deliverables

1. **Enhanced City Schema**: 15+ new attributes per city
2. **200+ Destinations**: Expanded from 50 to 200+ cities
3. **Experiences Index**: 30+ activities linked to cities
4. **Seasonal Intelligence**: Month-based filtering and recommendations
5. **Budget Filtering**: Price tier and daily cost queries
6. **Agent Enhancements**: Updated system prompt for new capabilities

### Testing Strategy

- **Unit Tests**: Vitest for all new types, schemas, utilities
- **Integration Tests**: Pipeline tests with mocked LLM
- **E2E Tests**: Playwright for Algolia index verification
- **Coverage Target**: 80% for new code

---

## Sub-Plan D: Frontend Multi-Index & Agent Studio Integration

**Folder:** `/packages/frontend` (Modifications)
**Estimated Tasks:** 6

Based on [Algolia's documentation](https://www.algolia.com/doc/guides/building-search-ui/ui-and-ux-patterns/multi-index-search/react/), we need to implement federated search across both the cities and experiences indices.

### Task D.1: Implement Multi-Index Search with React InstantSearch

**Description:** Use the `<Index>` widget to search both `travel_destinations` and `travel_experiences` indices simultaneously.

**Files to Create:**
- `packages/frontend/src/components/FederatedSearch/FederatedSearch.tsx`
- `packages/frontend/src/components/FederatedSearch/index.ts`

**Implementation:**

```typescript
// packages/frontend/src/components/FederatedSearch/FederatedSearch.tsx
import { Index, Configure, Hits, useInstantSearch } from 'react-instantsearch';
import { CityCard } from '../CityCard';
import { ExperienceCard } from '../ExperienceCard';

interface FederatedSearchProps {
  showExperiences?: boolean;
  cityFilters?: string;
  experienceFilters?: string;
}

export function FederatedSearch({
  showExperiences = true,
  cityFilters = '',
  experienceFilters = ''
}: FederatedSearchProps) {
  return (
    <>
      {/* Primary Cities Index */}
      <Index indexName="travel_destinations" indexId="cities">
        <Configure
          hitsPerPage={12}
          filters={cityFilters}
        />
        <section className="cities-results">
          <h2>Destinations</h2>
          <Hits hitComponent={CityCard} />
        </section>
      </Index>

      {/* Secondary Experiences Index */}
      {showExperiences && (
        <Index indexName="travel_experiences" indexId="experiences">
          <Configure
            hitsPerPage={8}
            filters={experienceFilters}
          />
          <section className="experiences-results">
            <h2>Experiences</h2>
            <Hits hitComponent={ExperienceCard} />
          </section>
        </Index>
      )}
    </>
  );
}
```

**Key Points from Algolia Docs:**
- Use `indexId` prop when querying the same index with different parameters
- Root-level widgets (like `<SearchBox>`) affect all indices
- Nested `<Configure>` widgets only affect their parent `<Index>`

**Success Criteria:**
- [ ] Both indices are queried simultaneously
- [ ] Search query applies to both indices
- [ ] Each index can have independent filters
- [ ] Results display in separate sections

---

### Task D.2: Configure Agent Studio Tools for Multi-Index Search

**Description:** Set up Agent Studio with Algolia Search tools for both indices.

**Files to Create:**
- `packages/frontend/src/config/agent-studio.config.ts`

**Agent Configuration (Dashboard JSON):**

```json
{
  "tools": [
    {
      "type": "algolia_search",
      "name": "search_destinations",
      "description": "Search travel destinations by vibe, budget, season, or location. Use for queries about places to visit.",
      "config": {
        "index_name": "travel_destinations",
        "attributes_to_retrieve": [
          "objectID", "city", "country", "description", "vibe_tags",
          "budget_tier", "avg_daily_cost_usd", "best_months", "image_url"
        ],
        "hits_per_page": 5
      }
    },
    {
      "type": "algolia_search",
      "name": "search_experiences",
      "description": "Search travel experiences and activities. Use for queries about things to do, tours, or specific activities.",
      "config": {
        "index_name": "travel_experiences",
        "attributes_to_retrieve": [
          "objectID", "name", "category", "description", "vibe_tags",
          "price_tier", "duration_hours", "city_ids", "image_url"
        ],
        "hits_per_page": 5
      }
    }
  ]
}
```

**Success Criteria:**
- [ ] Agent can search destinations index
- [ ] Agent can search experiences index
- [ ] Agent intelligently chooses which index to query based on user intent
- [ ] Search results are correctly formatted in agent responses

---

### Task D.3: Implement Client-Side Tools for Personalization

**Description:** Create client-side tools following [Algolia's OpenAI Function Calling spec](https://www.algolia.com/doc/guides/algolia-ai/agent-studio/how-to/tools/client-side-tools/) to provide user context to the agent.

**Files to Create:**
- `packages/frontend/src/hooks/useAgentTools.ts`
- `packages/frontend/src/services/userContext.service.ts`

**Implementation:**

```typescript
// packages/frontend/src/hooks/useAgentTools.ts
import { useMemo, useCallback } from 'react';

interface ToolCallHandler {
  onToolCall: (params: {
    input: Record<string, any>;
    addToolResult: (result: { output: any }) => void;
  }) => Promise<void>;
}

export function useAgentTools() {
  const tools: Record<string, ToolCallHandler> = useMemo(() => ({
    get_user_preferences: {
      onToolCall: async ({ addToolResult }) => {
        const prefs = getUserPreferencesFromStorage();
        addToolResult({
          output: {
            budget_preference: prefs.budgetTier,
            favorite_vibes: prefs.favoriteVibes,
            saved_destinations: prefs.savedDestinations,
            travel_dates: prefs.plannedDates
          }
        });
      }
    },

    save_destination: {
      onToolCall: async ({ input, addToolResult }) => {
        const { destinationId } = input;
        await saveDestinationToFavorites(destinationId);
        addToolResult({
          output: { success: true, message: 'Destination saved!' }
        });
      }
    },

    get_trip_context: {
      onToolCall: async ({ addToolResult }) => {
        const context = getCurrentTripContext();
        addToolResult({
          output: {
            current_month: new Date().toLocaleString('default', { month: 'long' }),
            user_location: context.userCountry,
            currency_preference: context.currency
          }
        });
      }
    },

    filter_by_budget: {
      onToolCall: async ({ input, addToolResult }) => {
        const { maxDailyBudget } = input;
        applyBudgetFilter(maxDailyBudget);
        addToolResult({
          output: { success: true, appliedFilter: `avg_daily_cost_usd <= ${maxDailyBudget}` }
        });
      }
    }
  }), []);

  return tools;
}
```

**Agent Studio Tool Definitions (JSON):**

```json
[
  {
    "type": "function",
    "function": {
      "name": "get_user_preferences",
      "description": "Retrieves user's saved travel preferences including budget tier, favorite vibes, and saved destinations.",
      "strict": true,
      "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": false
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "save_destination",
      "description": "Saves a destination to user's favorites list.",
      "strict": true,
      "parameters": {
        "type": "object",
        "properties": {
          "destinationId": {
            "type": "string",
            "description": "The Algolia objectID of the destination to save"
          }
        },
        "required": ["destinationId"],
        "additionalProperties": false
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "filter_by_budget",
      "description": "Applies a budget filter to the search results. Use when user specifies a daily budget amount.",
      "strict": true,
      "parameters": {
        "type": "object",
        "properties": {
          "maxDailyBudget": {
            "type": ["integer", "null"],
            "description": "Maximum daily budget in USD"
          }
        },
        "required": ["maxDailyBudget"],
        "additionalProperties": false
      }
    }
  }
]
```

**Success Criteria:**
- [ ] User preferences are accessible to the agent
- [ ] Agent can save destinations on behalf of user
- [ ] Agent can apply UI filters based on conversation
- [ ] Strict mode ensures reliable parameter parsing

---

### Task D.4: Integrate Chat Component with Multi-Index and Tools

**Description:** Update the TravelChat component to use both indices and client-side tools.

**Files to Modify:**
- `packages/frontend/src/components/TravelChat/TravelChat.tsx`

**Updated Implementation:**

```typescript
// packages/frontend/src/components/TravelChat/TravelChat.tsx
import { Chat } from 'react-instantsearch';
import { useAgentTools } from '../../hooks/useAgentTools';

interface TravelChatProps {
  agentId: string;
  onDestinationSelect?: (objectID: string) => void;
  onExperienceSelect?: (objectID: string) => void;
}

export function TravelChat({ 
  agentId, 
  onDestinationSelect,
  onExperienceSelect 
}: TravelChatProps) {
  const tools = useAgentTools();

  return (
    <Chat
      agentId={agentId}
      tools={{
        ...tools,
        // Handle search result interactions
        view_destination: {
          onToolCall: async ({ input, addToolResult }) => {
            onDestinationSelect?.(input.objectID);
            addToolResult({ output: { opened: true } });
          }
        },
        view_experience: {
          onToolCall: async ({ input, addToolResult }) => {
            onExperienceSelect?.(input.objectID);
            addToolResult({ output: { opened: true } });
          }
        }
      }}
      placeholder="Tell me your dream trip vibe..."
      welcomeMessage="Hi! I'm your travel concierge. Tell me about your dream trip - I can help you find destinations, plan experiences, and match your perfect travel vibe. Try asking things like 'Where should I go for a romantic beach getaway in March?' or 'I want an adventure trip under $100/day'."
    />
  );
}
```

**Success Criteria:**
- [ ] Chat integrates with all client-side tools
- [ ] Agent can trigger UI navigation
- [ ] Welcome message guides user interaction
- [ ] Tool calls don't block chat flow

---

### Task D.5: Enable NeuralSearch for Vibe-Based Queries

**Description:** Configure NeuralSearch mode for semantic/vibe matching queries.

**Files to Modify:**
- `packages/shared/src/config/algolia.config.ts`

**Configuration Updates:**

```typescript
// Enhanced index settings with NeuralSearch
export function getEnhancedIndexSettings() {
  return {
    searchableAttributes: ENHANCED_SEARCHABLE_ATTRIBUTES,
    attributesForFaceting: ENHANCED_ATTRIBUTES_FOR_FACETING,
    customRanking: ENHANCED_CUSTOM_RANKING,
    // NeuralSearch configuration
    mode: 'neuralSearch', // Enable NeuralSearch for semantic understanding
    ranking: [
      'typo',
      'geo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom'
    ],
    numericAttributesForFiltering: [
      'avg_daily_cost_usd',
      'safety_rating'
    ]
  };
}
```

**Search Query with NeuralSearch:**

```typescript
// packages/frontend/src/lib/algolia/search.ts
import { liteClient as algoliasearch } from 'algoliasearch/lite';

export async function vibeSearch(query: string, filters?: string) {
  const client = algoliasearch(APP_ID, SEARCH_API_KEY);
  const index = client.initIndex('travel_destinations');
  
  const results = await index.search(query, {
    mode: 'neuralSearch', // Semantic search mode
    filters,
    hitsPerPage: 20,
    attributesToRetrieve: [
      'objectID', 'city', 'country', 'description', 
      'vibe_tags', 'budget_tier', 'image_url'
    ]
  });
  
  return results.hits;
}
```

**Success Criteria:**
- [ ] NeuralSearch mode is enabled for both indices
- [ ] Vibe-based queries return semantically relevant results
- [ ] "cozy winter escape" finds relevant destinations without exact keyword match
- [ ] Search latency remains acceptable (<200ms)

---

### Task D.6: Create Experience Detail and City-Experience Linking

**Description:** Show related experiences when viewing a city, and vice versa.

**Files to Create:**
- `packages/frontend/src/components/ExperienceCard/ExperienceCard.tsx`
- `packages/frontend/src/components/RelatedExperiences/RelatedExperiences.tsx`

**Related Experiences Component:**

```typescript
// packages/frontend/src/components/RelatedExperiences/RelatedExperiences.tsx
import { useEffect, useState } from 'react';
import algoliasearch from 'algoliasearch/lite';

interface RelatedExperiencesProps {
  cityId: string;
  limit?: number;
}

export function RelatedExperiences({ cityId, limit = 4 }: RelatedExperiencesProps) {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      const client = algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
      );
      const index = client.initIndex('travel_experiences');
      
      const { hits } = await index.search('', {
        filters: `city_ids:${cityId}`,
        hitsPerPage: limit
      });
      
      setExperiences(hits);
      setIsLoading(false);
    }

    fetchExperiences();
  }, [cityId, limit]);

  if (isLoading) return <div>Loading experiences...</div>;
  if (experiences.length === 0) return null;

  return (
    <section className="related-experiences">
      <h3>Things to Do Here</h3>
      <div className="experience-grid">
        {experiences.map((exp: any) => (
          <ExperienceCard key={exp.objectID} experience={exp} />
        ))}
      </div>
    </section>
  );
}
```

**Success Criteria:**
- [ ] City detail pages show related experiences
- [ ] Experience pages show available cities
- [ ] Cross-index linking works via city_ids
- [ ] Graceful handling when no experiences available

---

## Sub-Plan E: MCP-Powered Data Enrichment Pipeline

**Folder:** `/packages/data-pipeline` (New services and generators)
**Estimated Tasks:** 7

This sub-plan leverages MCP (Model Context Protocol) tools to programmatically gather real-world data for 200+ cities, reducing hallucination risk and ensuring accuracy.

### Available MCP Tools

| Tool | Purpose | Best For |
|------|---------|----------|
| `web_search_exa` | Deep web search with content scraping | Comprehensive travel guides, safety info, visa requirements |
| `brave_web_search` | General web search | Recent events, festivals, news, seasonal info |
| `brave_local_search` | Local business search | Restaurants, attractions, local experiences |

---

### Task E.1: Create MCP Client Wrapper Service

**Description:** Build a service layer to interact with MCP tools for data gathering.

**Files to Create:**
- `packages/data-pipeline/src/services/mcp-search.service.ts`

**Implementation:**

```typescript
// packages/data-pipeline/src/services/mcp-search.service.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ExaSearchOptions {
  numResults?: number;
  type?: 'auto' | 'fast' | 'deep';
  livecrawl?: 'fallback' | 'preferred';
  contextMaxCharacters?: number;
}

interface BraveSearchOptions {
  count?: number;
  offset?: number;
}

export class MCPSearchService {
  async searchWithExa(query: string, options: ExaSearchOptions = {}): Promise<string> {
    const args = {
      query,
      numResults: options.numResults ?? 5,
      type: options.type ?? 'deep',
      livecrawl: options.livecrawl ?? 'preferred',
      contextMaxCharacters: options.contextMaxCharacters ?? 8000
    };
    
    return this.callMCPTool('user-exa', 'web_search_exa', args);
  }

  async searchWithBrave(query: string, options: BraveSearchOptions = {}): Promise<string> {
    const args = {
      query,
      count: options.count ?? 10,
      offset: options.offset ?? 0
    };
    
    return this.callMCPTool('user-brave-search', 'brave_web_search', args);
  }

  async searchLocalWithBrave(query: string, count: number = 10): Promise<string> {
    return this.callMCPTool('user-brave-search', 'brave_local_search', {
      query,
      count
    });
  }

  private async callMCPTool(server: string, tool: string, args: Record<string, any>): Promise<string> {
    // MCP tool invocation via Cursor's MCP system
    // In production, this would use the actual MCP client SDK
    throw new Error('MCP tools should be called via Cursor MCP integration');
  }
}

// Query templates for consistent data gathering
export const CITY_QUERY_TEMPLATES = {
  travelGuide: (city: string, country: string) =>
    `${city} ${country} comprehensive travel guide 2025 2026 best time to visit weather safety tips`,
  
  costOfLiving: (city: string, country: string) =>
    `${city} ${country} travel budget daily cost accommodation food transportation 2025`,
  
  seasonalEvents: (city: string, country: string) =>
    `${city} ${country} festivals events calendar 2025 2026 cherry blossom carnival cultural`,
  
  localCuisine: (city: string, country: string) =>
    `best local food ${city} ${country} must try dishes street food restaurants`,
  
  safetyInfo: (city: string, country: string) =>
    `${city} ${country} travel safety tourist areas to avoid scams tips 2025`,
  
  visaInfo: (country: string) =>
    `${country} visa requirements tourist visa free countries 2025`,
  
  attractions: (city: string) =>
    `top attractions things to do ${city} hidden gems local experiences`
};
```

**Success Criteria:**
- [ ] Wrapper supports all three MCP tools
- [ ] Query templates cover all enhanced attributes
- [ ] Error handling for rate limits and failures
- [ ] Results are LLM-optimized format

---

### Task E.2: Create City Data Enrichment Pipeline

**Description:** Build an automated pipeline that enriches base city data using MCP searches.

**Files to Create:**
- `packages/data-pipeline/src/enrichment/city-enricher.ts`
- `packages/data-pipeline/src/enrichment/types.ts`

**Enrichment Pipeline:**

```typescript
// packages/data-pipeline/src/enrichment/city-enricher.ts
import type { EnhancedCity, Month, BudgetTier } from '@vibe-travel/shared';

interface BaseCityInput {
  city: string;
  country: string;
  continent: string;
  coordinates: { lat: number; lng: number };
}

interface EnrichmentResult {
  rawData: {
    travelGuide: string;
    costInfo: string;
    events: string;
    cuisine: string;
    safety: string;
    visa: string;
    attractions: string;
  };
  parsedData: Partial<EnhancedCity>;
}

export class CityEnricher {
  private searchService: MCPSearchService;
  private llmService: LLMService;

  constructor(searchService: MCPSearchService, llmService: LLMService) {
    this.searchService = searchService;
    this.llmService = llmService;
  }

  async enrichCity(base: BaseCityInput): Promise<EnrichmentResult> {
    console.log(`Enriching ${base.city}, ${base.country}...`);

    // Step 1: Gather raw data from multiple sources (parallel calls)
    const [travelGuide, costInfo, events, cuisine, safety, visa, attractions] = 
      await Promise.all([
        this.searchService.searchWithExa(
          CITY_QUERY_TEMPLATES.travelGuide(base.city, base.country),
          { type: 'deep', numResults: 3 }
        ),
        this.searchService.searchWithExa(
          CITY_QUERY_TEMPLATES.costOfLiving(base.city, base.country),
          { type: 'deep', numResults: 3 }
        ),
        this.searchService.searchWithBrave(
          CITY_QUERY_TEMPLATES.seasonalEvents(base.city, base.country),
          { count: 10 }
        ),
        this.searchService.searchLocalWithBrave(
          CITY_QUERY_TEMPLATES.localCuisine(base.city, base.country),
          10
        ),
        this.searchService.searchWithExa(
          CITY_QUERY_TEMPLATES.safetyInfo(base.city, base.country),
          { type: 'fast', numResults: 3 }
        ),
        this.searchService.searchWithExa(
          CITY_QUERY_TEMPLATES.visaInfo(base.country),
          { type: 'fast', numResults: 2 }
        ),
        this.searchService.searchLocalWithBrave(
          CITY_QUERY_TEMPLATES.attractions(base.city),
          15
        )
      ]);

    const rawData = { travelGuide, costInfo, events, cuisine, safety, visa, attractions };

    // Step 2: Use LLM to parse and structure the raw data
    const parsedData = await this.parseWithLLM(base, rawData);

    return { rawData, parsedData };
  }

  private async parseWithLLM(
    base: BaseCityInput,
    rawData: EnrichmentResult['rawData']
  ): Promise<Partial<EnhancedCity>> {
    const prompt = `You are a travel data extraction expert. Given the following search results about ${base.city}, ${base.country}, extract structured data.

## Raw Search Results

### Travel Guide Info:
${rawData.travelGuide}

### Cost of Living Info:
${rawData.costInfo}

### Events & Festivals:
${rawData.events}

### Local Cuisine:
${rawData.cuisine}

### Safety Info:
${rawData.safety}

### Visa Info:
${rawData.visa}

### Attractions:
${rawData.attractions}

## Required Output (JSON only, no markdown):

{
  "description": "2-3 sentence compelling description",
  "vibe_tags": ["array", "of", "5-8", "mood", "tags"],
  "budget_tier": "budget|mid-range|luxury",
  "avg_daily_cost_usd": number,
  "cost_breakdown": {
    "accommodation_per_night": number,
    "meal_average": number,
    "transportation_daily": number,
    "activities_daily": number
  },
  "safety_rating": 1-10,
  "visa_free_for": ["US", "GB", "CA", ...ISO codes],
  "primary_language": "string",
  "english_proficiency": "high|medium|low",
  "currency": "XXX",
  "currency_symbol": "$",
  "local_cuisine": ["dish1", "dish2", ...],
  "cuisine_highlights": ["restaurant or food experience", ...],
  "vegetarian_friendly": boolean,
  "best_months": ["january", "february", ...],
  "avoid_months": ["june", "july", ...],
  "seasonal_events": [
    {"name": "Event Name", "month": "april", "description": "...", "type": "festival|natural|cultural|sporting"}
  ],
  "culture_score": 1-10,
  "adventure_score": 1-10,
  "nature_score": 1-10,
  "beach_score": 1-10,
  "nightlife_score": 1-10,
  "climate_type": "string",
  "best_time_to_visit": "Month-Month",
  "flight_hub": boolean,
  "similar_cities": ["city-country", ...],
  "pairs_well_with": ["nearby-city-country", ...]
}

Be accurate and factual based on the search results. If information is not available, use reasonable estimates based on the region.`;

    const response = await this.llmService.complete(prompt);
    return JSON.parse(response);
  }
}
```

**Success Criteria:**
- [ ] Parallel data gathering for efficiency
- [ ] All 7 data categories collected
- [ ] LLM parsing produces valid schema
- [ ] Handles missing data gracefully

---

### Task E.3: Create Batch Processing for 200+ Cities

**Description:** Implement batch processing with rate limiting and progress tracking for large-scale enrichment.

**Files to Create:**
- `packages/data-pipeline/src/enrichment/batch-processor.ts`
- `packages/data-pipeline/src/enrichment/progress-tracker.ts`

**Batch Processor:**

```typescript
// packages/data-pipeline/src/enrichment/batch-processor.ts
import { CityEnricher } from './city-enricher';
import { ProgressTracker } from './progress-tracker';
import { sleep } from '../utils/async.utils';

interface BatchConfig {
  batchSize: number;          // Cities per batch
  delayBetweenBatches: number; // ms between batches (rate limiting)
  delayBetweenCities: number;  // ms between individual cities
  maxRetries: number;
  outputDir: string;
}

const DEFAULT_CONFIG: BatchConfig = {
  batchSize: 10,
  delayBetweenBatches: 5000,  // 5 seconds between batches
  delayBetweenCities: 1000,   // 1 second between cities
  maxRetries: 3,
  outputDir: './output/enriched-cities'
};

export class BatchProcessor {
  private enricher: CityEnricher;
  private tracker: ProgressTracker;
  private config: BatchConfig;

  constructor(enricher: CityEnricher, config: Partial<BatchConfig> = {}) {
    this.enricher = enricher;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.tracker = new ProgressTracker(this.config.outputDir);
  }

  async processAllCities(cities: BaseCityInput[]): Promise<void> {
    console.log(`Starting batch processing of ${cities.length} cities...`);
    
    // Resume from last checkpoint if exists
    const processed = await this.tracker.getProcessedCities();
    const remaining = cities.filter(c => 
      !processed.includes(`${c.city}-${c.country}`.toLowerCase().replace(/\s+/g, '-'))
    );

    console.log(`Resuming: ${processed.length} already done, ${remaining.length} remaining`);

    // Process in batches
    const batches = this.chunkArray(remaining, this.config.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\nProcessing batch ${i + 1}/${batches.length} (${batch.length} cities)...`);

      for (const city of batch) {
        await this.processCity(city);
        await sleep(this.config.delayBetweenCities);
      }

      // Save checkpoint after each batch
      await this.tracker.saveCheckpoint();
      
      if (i < batches.length - 1) {
        console.log(`Waiting ${this.config.delayBetweenBatches}ms before next batch...`);
        await sleep(this.config.delayBetweenBatches);
      }
    }

    console.log('\nBatch processing complete!');
    await this.tracker.generateReport();
  }

  private async processCity(city: BaseCityInput): Promise<void> {
    const cityId = `${city.city}-${city.country}`.toLowerCase().replace(/\s+/g, '-');
    let retries = 0;

    while (retries < this.config.maxRetries) {
      try {
        const result = await this.enricher.enrichCity(city);
        await this.tracker.recordSuccess(cityId, result);
        console.log(`✓ ${city.city}, ${city.country}`);
        return;
      } catch (error) {
        retries++;
        console.error(`✗ ${city.city} (attempt ${retries}/${this.config.maxRetries}): ${error}`);
        
        if (retries < this.config.maxRetries) {
          await sleep(2000 * retries); // Exponential backoff
        }
      }
    }

    await this.tracker.recordFailure(cityId, 'Max retries exceeded');
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// packages/data-pipeline/src/enrichment/progress-tracker.ts
import fs from 'fs/promises';
import path from 'path';

export class ProgressTracker {
  private outputDir: string;
  private results: Map<string, any> = new Map();
  private failures: Map<string, string> = new Map();

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  async getProcessedCities(): Promise<string[]> {
    try {
      const checkpointPath = path.join(this.outputDir, 'checkpoint.json');
      const data = await fs.readFile(checkpointPath, 'utf-8');
      const checkpoint = JSON.parse(data);
      return checkpoint.processed || [];
    } catch {
      return [];
    }
  }

  async recordSuccess(cityId: string, result: any): Promise<void> {
    this.results.set(cityId, result.parsedData);
    
    // Save individual city file
    const cityPath = path.join(this.outputDir, 'cities', `${cityId}.json`);
    await fs.mkdir(path.dirname(cityPath), { recursive: true });
    await fs.writeFile(cityPath, JSON.stringify(result, null, 2));
  }

  async recordFailure(cityId: string, error: string): Promise<void> {
    this.failures.set(cityId, error);
  }

  async saveCheckpoint(): Promise<void> {
    const checkpoint = {
      processed: Array.from(this.results.keys()),
      failed: Array.from(this.failures.entries()),
      timestamp: new Date().toISOString()
    };
    
    const checkpointPath = path.join(this.outputDir, 'checkpoint.json');
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));
  }

  async generateReport(): Promise<void> {
    const report = {
      totalProcessed: this.results.size,
      totalFailed: this.failures.size,
      successRate: `${((this.results.size / (this.results.size + this.failures.size)) * 100).toFixed(1)}%`,
      failures: Array.from(this.failures.entries()).map(([city, error]) => ({ city, error }))
    };

    const reportPath = path.join(this.outputDir, 'enrichment-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n--- Enrichment Report ---');
    console.log(`Processed: ${report.totalProcessed}`);
    console.log(`Failed: ${report.totalFailed}`);
    console.log(`Success Rate: ${report.successRate}`);
  }
}
```

**Success Criteria:**
- [ ] Batch processing with configurable size
- [ ] Rate limiting to avoid API throttling
- [ ] Checkpoint/resume capability
- [ ] Retry logic with exponential backoff
- [ ] Progress reporting

---

### Task E.4: Create Curated 200+ City Source List

**Description:** Define the base list of 200+ cities spanning all continents for enrichment.

**Files to Create:**
- `packages/data-pipeline/src/data/cities-200.json`

**City Source Structure:**

```typescript
// packages/data-pipeline/src/data/cities-200.ts
export interface CitySource {
  city: string;
  country: string;
  continent: 'Asia' | 'Europe' | 'North America' | 'South America' | 'Africa' | 'Oceania' | 'Middle East';
  coordinates: { lat: number; lng: number };
  isoCountry: string; // ISO 3166-1 alpha-2
}

export const CITIES_200: CitySource[] = [
  // === ASIA (55 cities) ===
  // East Asia
  { city: 'Tokyo', country: 'Japan', continent: 'Asia', coordinates: { lat: 35.6762, lng: 139.6503 }, isoCountry: 'JP' },
  { city: 'Kyoto', country: 'Japan', continent: 'Asia', coordinates: { lat: 35.0116, lng: 135.7681 }, isoCountry: 'JP' },
  { city: 'Osaka', country: 'Japan', continent: 'Asia', coordinates: { lat: 34.6937, lng: 135.5023 }, isoCountry: 'JP' },
  { city: 'Seoul', country: 'South Korea', continent: 'Asia', coordinates: { lat: 37.5665, lng: 126.9780 }, isoCountry: 'KR' },
  { city: 'Busan', country: 'South Korea', continent: 'Asia', coordinates: { lat: 35.1796, lng: 129.0756 }, isoCountry: 'KR' },
  { city: 'Beijing', country: 'China', continent: 'Asia', coordinates: { lat: 39.9042, lng: 116.4074 }, isoCountry: 'CN' },
  { city: 'Shanghai', country: 'China', continent: 'Asia', coordinates: { lat: 31.2304, lng: 121.4737 }, isoCountry: 'CN' },
  { city: 'Hong Kong', country: 'Hong Kong', continent: 'Asia', coordinates: { lat: 22.3193, lng: 114.1694 }, isoCountry: 'HK' },
  { city: 'Taipei', country: 'Taiwan', continent: 'Asia', coordinates: { lat: 25.0330, lng: 121.5654 }, isoCountry: 'TW' },
  
  // Southeast Asia
  { city: 'Bangkok', country: 'Thailand', continent: 'Asia', coordinates: { lat: 13.7563, lng: 100.5018 }, isoCountry: 'TH' },
  { city: 'Chiang Mai', country: 'Thailand', continent: 'Asia', coordinates: { lat: 18.7883, lng: 98.9853 }, isoCountry: 'TH' },
  { city: 'Phuket', country: 'Thailand', continent: 'Asia', coordinates: { lat: 7.8804, lng: 98.3923 }, isoCountry: 'TH' },
  { city: 'Singapore', country: 'Singapore', continent: 'Asia', coordinates: { lat: 1.3521, lng: 103.8198 }, isoCountry: 'SG' },
  { city: 'Kuala Lumpur', country: 'Malaysia', continent: 'Asia', coordinates: { lat: 3.1390, lng: 101.6869 }, isoCountry: 'MY' },
  { city: 'Bali', country: 'Indonesia', continent: 'Asia', coordinates: { lat: -8.3405, lng: 115.0920 }, isoCountry: 'ID' },
  { city: 'Jakarta', country: 'Indonesia', continent: 'Asia', coordinates: { lat: -6.2088, lng: 106.8456 }, isoCountry: 'ID' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', continent: 'Asia', coordinates: { lat: 10.8231, lng: 106.6297 }, isoCountry: 'VN' },
  { city: 'Hanoi', country: 'Vietnam', continent: 'Asia', coordinates: { lat: 21.0285, lng: 105.8542 }, isoCountry: 'VN' },
  { city: 'Manila', country: 'Philippines', continent: 'Asia', coordinates: { lat: 14.5995, lng: 120.9842 }, isoCountry: 'PH' },
  { city: 'Siem Reap', country: 'Cambodia', continent: 'Asia', coordinates: { lat: 13.3671, lng: 103.8448 }, isoCountry: 'KH' },
  
  // South Asia
  { city: 'Mumbai', country: 'India', continent: 'Asia', coordinates: { lat: 19.0760, lng: 72.8777 }, isoCountry: 'IN' },
  { city: 'Delhi', country: 'India', continent: 'Asia', coordinates: { lat: 28.7041, lng: 77.1025 }, isoCountry: 'IN' },
  { city: 'Jaipur', country: 'India', continent: 'Asia', coordinates: { lat: 26.9124, lng: 75.7873 }, isoCountry: 'IN' },
  { city: 'Goa', country: 'India', continent: 'Asia', coordinates: { lat: 15.2993, lng: 74.1240 }, isoCountry: 'IN' },
  { city: 'Kathmandu', country: 'Nepal', continent: 'Asia', coordinates: { lat: 27.7172, lng: 85.3240 }, isoCountry: 'NP' },
  { city: 'Colombo', country: 'Sri Lanka', continent: 'Asia', coordinates: { lat: 6.9271, lng: 79.8612 }, isoCountry: 'LK' },
  
  // === EUROPE (50 cities) ===
  // Western Europe
  { city: 'Paris', country: 'France', continent: 'Europe', coordinates: { lat: 48.8566, lng: 2.3522 }, isoCountry: 'FR' },
  { city: 'Nice', country: 'France', continent: 'Europe', coordinates: { lat: 43.7102, lng: 7.2620 }, isoCountry: 'FR' },
  { city: 'Lyon', country: 'France', continent: 'Europe', coordinates: { lat: 45.7640, lng: 4.8357 }, isoCountry: 'FR' },
  { city: 'London', country: 'United Kingdom', continent: 'Europe', coordinates: { lat: 51.5074, lng: -0.1278 }, isoCountry: 'GB' },
  { city: 'Edinburgh', country: 'United Kingdom', continent: 'Europe', coordinates: { lat: 55.9533, lng: -3.1883 }, isoCountry: 'GB' },
  { city: 'Amsterdam', country: 'Netherlands', continent: 'Europe', coordinates: { lat: 52.3676, lng: 4.9041 }, isoCountry: 'NL' },
  { city: 'Berlin', country: 'Germany', continent: 'Europe', coordinates: { lat: 52.5200, lng: 13.4050 }, isoCountry: 'DE' },
  { city: 'Munich', country: 'Germany', continent: 'Europe', coordinates: { lat: 48.1351, lng: 11.5820 }, isoCountry: 'DE' },
  { city: 'Vienna', country: 'Austria', continent: 'Europe', coordinates: { lat: 48.2082, lng: 16.3738 }, isoCountry: 'AT' },
  { city: 'Zurich', country: 'Switzerland', continent: 'Europe', coordinates: { lat: 47.3769, lng: 8.5417 }, isoCountry: 'CH' },
  { city: 'Brussels', country: 'Belgium', continent: 'Europe', coordinates: { lat: 50.8503, lng: 4.3517 }, isoCountry: 'BE' },
  
  // Southern Europe
  { city: 'Rome', country: 'Italy', continent: 'Europe', coordinates: { lat: 41.9028, lng: 12.4964 }, isoCountry: 'IT' },
  { city: 'Florence', country: 'Italy', continent: 'Europe', coordinates: { lat: 43.7696, lng: 11.2558 }, isoCountry: 'IT' },
  { city: 'Venice', country: 'Italy', continent: 'Europe', coordinates: { lat: 45.4408, lng: 12.3155 }, isoCountry: 'IT' },
  { city: 'Milan', country: 'Italy', continent: 'Europe', coordinates: { lat: 45.4642, lng: 9.1900 }, isoCountry: 'IT' },
  { city: 'Barcelona', country: 'Spain', continent: 'Europe', coordinates: { lat: 41.3851, lng: 2.1734 }, isoCountry: 'ES' },
  { city: 'Madrid', country: 'Spain', continent: 'Europe', coordinates: { lat: 40.4168, lng: -3.7038 }, isoCountry: 'ES' },
  { city: 'Seville', country: 'Spain', continent: 'Europe', coordinates: { lat: 37.3891, lng: -5.9845 }, isoCountry: 'ES' },
  { city: 'Lisbon', country: 'Portugal', continent: 'Europe', coordinates: { lat: 38.7223, lng: -9.1393 }, isoCountry: 'PT' },
  { city: 'Porto', country: 'Portugal', continent: 'Europe', coordinates: { lat: 41.1579, lng: -8.6291 }, isoCountry: 'PT' },
  { city: 'Athens', country: 'Greece', continent: 'Europe', coordinates: { lat: 37.9838, lng: 23.7275 }, isoCountry: 'GR' },
  { city: 'Santorini', country: 'Greece', continent: 'Europe', coordinates: { lat: 36.3932, lng: 25.4615 }, isoCountry: 'GR' },
  
  // Eastern & Northern Europe
  { city: 'Prague', country: 'Czech Republic', continent: 'Europe', coordinates: { lat: 50.0755, lng: 14.4378 }, isoCountry: 'CZ' },
  { city: 'Budapest', country: 'Hungary', continent: 'Europe', coordinates: { lat: 47.4979, lng: 19.0402 }, isoCountry: 'HU' },
  { city: 'Krakow', country: 'Poland', continent: 'Europe', coordinates: { lat: 50.0647, lng: 19.9450 }, isoCountry: 'PL' },
  { city: 'Dubrovnik', country: 'Croatia', continent: 'Europe', coordinates: { lat: 42.6507, lng: 18.0944 }, isoCountry: 'HR' },
  { city: 'Copenhagen', country: 'Denmark', continent: 'Europe', coordinates: { lat: 55.6761, lng: 12.5683 }, isoCountry: 'DK' },
  { city: 'Stockholm', country: 'Sweden', continent: 'Europe', coordinates: { lat: 59.3293, lng: 18.0686 }, isoCountry: 'SE' },
  { city: 'Oslo', country: 'Norway', continent: 'Europe', coordinates: { lat: 59.9139, lng: 10.7522 }, isoCountry: 'NO' },
  { city: 'Reykjavik', country: 'Iceland', continent: 'Europe', coordinates: { lat: 64.1466, lng: -21.9426 }, isoCountry: 'IS' },
  
  // === NORTH AMERICA (30 cities) ===
  { city: 'New York', country: 'United States', continent: 'North America', coordinates: { lat: 40.7128, lng: -74.0060 }, isoCountry: 'US' },
  { city: 'Los Angeles', country: 'United States', continent: 'North America', coordinates: { lat: 34.0522, lng: -118.2437 }, isoCountry: 'US' },
  { city: 'San Francisco', country: 'United States', continent: 'North America', coordinates: { lat: 37.7749, lng: -122.4194 }, isoCountry: 'US' },
  { city: 'Miami', country: 'United States', continent: 'North America', coordinates: { lat: 25.7617, lng: -80.1918 }, isoCountry: 'US' },
  { city: 'Las Vegas', country: 'United States', continent: 'North America', coordinates: { lat: 36.1699, lng: -115.1398 }, isoCountry: 'US' },
  { city: 'New Orleans', country: 'United States', continent: 'North America', coordinates: { lat: 29.9511, lng: -90.0715 }, isoCountry: 'US' },
  { city: 'Chicago', country: 'United States', continent: 'North America', coordinates: { lat: 41.8781, lng: -87.6298 }, isoCountry: 'US' },
  { city: 'Hawaii', country: 'United States', continent: 'North America', coordinates: { lat: 21.3069, lng: -157.8583 }, isoCountry: 'US' },
  { city: 'Seattle', country: 'United States', continent: 'North America', coordinates: { lat: 47.6062, lng: -122.3321 }, isoCountry: 'US' },
  { city: 'Austin', country: 'United States', continent: 'North America', coordinates: { lat: 30.2672, lng: -97.7431 }, isoCountry: 'US' },
  { city: 'Toronto', country: 'Canada', continent: 'North America', coordinates: { lat: 43.6532, lng: -79.3832 }, isoCountry: 'CA' },
  { city: 'Vancouver', country: 'Canada', continent: 'North America', coordinates: { lat: 49.2827, lng: -123.1207 }, isoCountry: 'CA' },
  { city: 'Montreal', country: 'Canada', continent: 'North America', coordinates: { lat: 45.5017, lng: -73.5673 }, isoCountry: 'CA' },
  { city: 'Mexico City', country: 'Mexico', continent: 'North America', coordinates: { lat: 19.4326, lng: -99.1332 }, isoCountry: 'MX' },
  { city: 'Cancun', country: 'Mexico', continent: 'North America', coordinates: { lat: 21.1619, lng: -86.8515 }, isoCountry: 'MX' },
  { city: 'Oaxaca', country: 'Mexico', continent: 'North America', coordinates: { lat: 17.0732, lng: -96.7266 }, isoCountry: 'MX' },
  
  // === SOUTH AMERICA (25 cities) ===
  { city: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', coordinates: { lat: -22.9068, lng: -43.1729 }, isoCountry: 'BR' },
  { city: 'Sao Paulo', country: 'Brazil', continent: 'South America', coordinates: { lat: -23.5505, lng: -46.6333 }, isoCountry: 'BR' },
  { city: 'Buenos Aires', country: 'Argentina', continent: 'South America', coordinates: { lat: -34.6037, lng: -58.3816 }, isoCountry: 'AR' },
  { city: 'Mendoza', country: 'Argentina', continent: 'South America', coordinates: { lat: -32.8895, lng: -68.8458 }, isoCountry: 'AR' },
  { city: 'Lima', country: 'Peru', continent: 'South America', coordinates: { lat: -12.0464, lng: -77.0428 }, isoCountry: 'PE' },
  { city: 'Cusco', country: 'Peru', continent: 'South America', coordinates: { lat: -13.5319, lng: -71.9675 }, isoCountry: 'PE' },
  { city: 'Bogota', country: 'Colombia', continent: 'South America', coordinates: { lat: 4.7110, lng: -74.0721 }, isoCountry: 'CO' },
  { city: 'Cartagena', country: 'Colombia', continent: 'South America', coordinates: { lat: 10.3910, lng: -75.4794 }, isoCountry: 'CO' },
  { city: 'Medellin', country: 'Colombia', continent: 'South America', coordinates: { lat: 6.2476, lng: -75.5658 }, isoCountry: 'CO' },
  { city: 'Santiago', country: 'Chile', continent: 'South America', coordinates: { lat: -33.4489, lng: -70.6693 }, isoCountry: 'CL' },
  { city: 'Quito', country: 'Ecuador', continent: 'South America', coordinates: { lat: -0.1807, lng: -78.4678 }, isoCountry: 'EC' },
  { city: 'Montevideo', country: 'Uruguay', continent: 'South America', coordinates: { lat: -34.9011, lng: -56.1645 }, isoCountry: 'UY' },
  
  // === MIDDLE EAST (15 cities) ===
  { city: 'Dubai', country: 'United Arab Emirates', continent: 'Middle East', coordinates: { lat: 25.2048, lng: 55.2708 }, isoCountry: 'AE' },
  { city: 'Abu Dhabi', country: 'United Arab Emirates', continent: 'Middle East', coordinates: { lat: 24.4539, lng: 54.3773 }, isoCountry: 'AE' },
  { city: 'Istanbul', country: 'Turkey', continent: 'Middle East', coordinates: { lat: 41.0082, lng: 28.9784 }, isoCountry: 'TR' },
  { city: 'Cappadocia', country: 'Turkey', continent: 'Middle East', coordinates: { lat: 38.6431, lng: 34.8289 }, isoCountry: 'TR' },
  { city: 'Tel Aviv', country: 'Israel', continent: 'Middle East', coordinates: { lat: 32.0853, lng: 34.7818 }, isoCountry: 'IL' },
  { city: 'Jerusalem', country: 'Israel', continent: 'Middle East', coordinates: { lat: 31.7683, lng: 35.2137 }, isoCountry: 'IL' },
  { city: 'Petra', country: 'Jordan', continent: 'Middle East', coordinates: { lat: 30.3285, lng: 35.4444 }, isoCountry: 'JO' },
  { city: 'Muscat', country: 'Oman', continent: 'Middle East', coordinates: { lat: 23.5880, lng: 58.3829 }, isoCountry: 'OM' },
  { city: 'Doha', country: 'Qatar', continent: 'Middle East', coordinates: { lat: 25.2854, lng: 51.5310 }, isoCountry: 'QA' },
  
  // === AFRICA (20 cities) ===
  { city: 'Cape Town', country: 'South Africa', continent: 'Africa', coordinates: { lat: -33.9249, lng: 18.4241 }, isoCountry: 'ZA' },
  { city: 'Johannesburg', country: 'South Africa', continent: 'Africa', coordinates: { lat: -26.2041, lng: 28.0473 }, isoCountry: 'ZA' },
  { city: 'Marrakech', country: 'Morocco', continent: 'Africa', coordinates: { lat: 31.6295, lng: -7.9811 }, isoCountry: 'MA' },
  { city: 'Fes', country: 'Morocco', continent: 'Africa', coordinates: { lat: 34.0181, lng: -5.0078 }, isoCountry: 'MA' },
  { city: 'Cairo', country: 'Egypt', continent: 'Africa', coordinates: { lat: 30.0444, lng: 31.2357 }, isoCountry: 'EG' },
  { city: 'Luxor', country: 'Egypt', continent: 'Africa', coordinates: { lat: 25.6872, lng: 32.6396 }, isoCountry: 'EG' },
  { city: 'Nairobi', country: 'Kenya', continent: 'Africa', coordinates: { lat: -1.2921, lng: 36.8219 }, isoCountry: 'KE' },
  { city: 'Zanzibar', country: 'Tanzania', continent: 'Africa', coordinates: { lat: -6.1659, lng: 39.2026 }, isoCountry: 'TZ' },
  { city: 'Victoria Falls', country: 'Zimbabwe', continent: 'Africa', coordinates: { lat: -17.9243, lng: 25.8572 }, isoCountry: 'ZW' },
  { city: 'Accra', country: 'Ghana', continent: 'Africa', coordinates: { lat: 5.6037, lng: -0.1870 }, isoCountry: 'GH' },
  { city: 'Dakar', country: 'Senegal', continent: 'Africa', coordinates: { lat: 14.7167, lng: -17.4677 }, isoCountry: 'SN' },
  { city: 'Mauritius', country: 'Mauritius', continent: 'Africa', coordinates: { lat: -20.3484, lng: 57.5522 }, isoCountry: 'MU' },
  
  // === OCEANIA (15 cities) ===
  { city: 'Sydney', country: 'Australia', continent: 'Oceania', coordinates: { lat: -33.8688, lng: 151.2093 }, isoCountry: 'AU' },
  { city: 'Melbourne', country: 'Australia', continent: 'Oceania', coordinates: { lat: -37.8136, lng: 144.9631 }, isoCountry: 'AU' },
  { city: 'Brisbane', country: 'Australia', continent: 'Oceania', coordinates: { lat: -27.4698, lng: 153.0251 }, isoCountry: 'AU' },
  { city: 'Perth', country: 'Australia', continent: 'Oceania', coordinates: { lat: -31.9505, lng: 115.8605 }, isoCountry: 'AU' },
  { city: 'Cairns', country: 'Australia', continent: 'Oceania', coordinates: { lat: -16.9186, lng: 145.7781 }, isoCountry: 'AU' },
  { city: 'Auckland', country: 'New Zealand', continent: 'Oceania', coordinates: { lat: -36.8485, lng: 174.7633 }, isoCountry: 'NZ' },
  { city: 'Queenstown', country: 'New Zealand', continent: 'Oceania', coordinates: { lat: -45.0312, lng: 168.6626 }, isoCountry: 'NZ' },
  { city: 'Fiji', country: 'Fiji', continent: 'Oceania', coordinates: { lat: -17.7134, lng: 178.0650 }, isoCountry: 'FJ' },
  { city: 'Bora Bora', country: 'French Polynesia', continent: 'Oceania', coordinates: { lat: -16.5004, lng: -151.7415 }, isoCountry: 'PF' },
  
  // ... Continue to 200+ total
];

// Helper to get cities by continent
export function getCitiesByContinent(continent: string): CitySource[] {
  return CITIES_200.filter(c => c.continent === continent);
}

// Get distribution stats
export function getCityDistribution(): Record<string, number> {
  return CITIES_200.reduce((acc, city) => {
    acc[city.continent] = (acc[city.continent] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
```

**City Distribution Target:**

| Continent | Target Count | Notes |
|-----------|-------------|-------|
| Asia | 55 | Diverse: East, Southeast, South Asia |
| Europe | 50 | Western, Southern, Eastern, Nordic |
| North America | 30 | US, Canada, Mexico, Caribbean |
| South America | 25 | Brazil, Argentina, Peru, Colombia |
| Middle East | 15 | UAE, Turkey, Israel, Jordan |
| Africa | 20 | North, East, South, West Africa |
| Oceania | 15 | Australia, New Zealand, Pacific Islands |
| **Total** | **210** | |

**Success Criteria:**
- [ ] 200+ cities defined with coordinates
- [ ] All continents represented
- [ ] ISO country codes for visa lookups
- [ ] Geographic distribution is balanced

---

### Task E.5: Create Experience Data Gatherer

**Description:** Use MCP tools to gather experience data for each city.

**Files to Create:**
- `packages/data-pipeline/src/enrichment/experience-gatherer.ts`

**Implementation:**

```typescript
// packages/data-pipeline/src/enrichment/experience-gatherer.ts
import type { ExperienceCategory } from '@vibe-travel/shared';

const EXPERIENCE_QUERIES: Record<ExperienceCategory, (city: string) => string> = {
  cultural: (city) => `best cultural tours ${city} temples museums historical sites`,
  adventure: (city) => `adventure activities ${city} hiking bungee diving extreme sports`,
  culinary: (city) => `food tours cooking classes ${city} street food wine tasting`,
  nature: (city) => `nature experiences ${city} wildlife safari national parks`,
  wellness: (city) => `spa wellness retreats ${city} yoga meditation hot springs`,
  nightlife: (city) => `best nightlife ${city} clubs bars rooftop parties`,
  romantic: (city) => `romantic experiences ${city} couples sunset cruise`,
  family: (city) => `family activities ${city} kids theme parks zoo`,
  photography: (city) => `photography tours ${city} instagram spots scenic views`,
  spiritual: (city) => `spiritual experiences ${city} meditation temples pilgrimage`
};

export class ExperienceGatherer {
  private searchService: MCPSearchService;

  async gatherExperiencesForCity(city: string, country: string): Promise<RawExperienceData[]> {
    const experiences: RawExperienceData[] = [];

    // Search for each category
    for (const [category, queryFn] of Object.entries(EXPERIENCE_QUERIES)) {
      const query = queryFn(`${city} ${country}`);
      
      // Use Brave Local Search for local experiences
      const localResults = await this.searchService.searchLocalWithBrave(query, 5);
      
      // Use Exa for detailed experience information
      const detailedResults = await this.searchService.searchWithExa(query, {
        type: 'deep',
        numResults: 3
      });

      experiences.push({
        category: category as ExperienceCategory,
        localData: localResults,
        detailedData: detailedResults,
        cityId: `${city}-${country}`.toLowerCase().replace(/\s+/g, '-')
      });
    }

    return experiences;
  }
}
```

**Success Criteria:**
- [ ] Experiences gathered for all 10 categories
- [ ] Local business data from Brave
- [ ] Detailed descriptions from Exa
- [ ] Linked to city IDs

---

### Task E.6: Create CLI Commands for MCP Enrichment

**Description:** Add CLI commands to run the MCP-powered enrichment pipeline.

**Files to Modify:**
- `packages/data-pipeline/src/cli/index.ts`

**New Commands:**

```typescript
// packages/data-pipeline/src/cli/commands/enrich.ts
import { Command } from 'commander';
import { BatchProcessor } from '../enrichment/batch-processor';
import { CITIES_200 } from '../data/cities-200';

export const enrichCommand = new Command('enrich')
  .description('Enrich city data using MCP tools (Exa + Brave Search)')
  .option('-c, --continent <continent>', 'Only enrich cities from specific continent')
  .option('-l, --limit <number>', 'Limit number of cities to process')
  .option('--batch-size <number>', 'Cities per batch', '10')
  .option('--delay <number>', 'Delay between batches in ms', '5000')
  .option('-o, --output <dir>', 'Output directory', './output/enriched')
  .option('--dry-run', 'Show what would be processed without making API calls')
  .action(async (options) => {
    let cities = CITIES_200;

    if (options.continent) {
      cities = cities.filter(c => 
        c.continent.toLowerCase() === options.continent.toLowerCase()
      );
    }

    if (options.limit) {
      cities = cities.slice(0, parseInt(options.limit));
    }

    console.log(`\n🌍 MCP-Powered City Enrichment Pipeline`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Cities to process: ${cities.length}`);
    console.log(`Batch size: ${options.batchSize}`);
    console.log(`Output: ${options.output}`);
    
    if (options.dryRun) {
      console.log(`\n[DRY RUN] Would process:`);
      cities.forEach(c => console.log(`  - ${c.city}, ${c.country}`));
      return;
    }

    const processor = new BatchProcessor(enricher, {
      batchSize: parseInt(options.batchSize),
      delayBetweenBatches: parseInt(options.delay),
      outputDir: options.output
    });

    await processor.processAllCities(cities);
  });

export const enrichExperiencesCommand = new Command('enrich-experiences')
  .description('Gather experiences for cities using MCP tools')
  .option('--cities-file <path>', 'Path to enriched cities JSON')
  .option('-l, --limit <number>', 'Limit number of cities')
  .option('-o, --output <dir>', 'Output directory', './output/experiences')
  .action(async (options) => {
    // Implementation
  });

export const validateEnrichmentCommand = new Command('validate-enrichment')
  .description('Validate enriched data against schemas')
  .option('-i, --input <dir>', 'Input directory with enriched data')
  .option('--fix', 'Attempt to fix validation issues')
  .action(async (options) => {
    // Validate all JSON files against EnhancedCitySchema
  });
```

**CLI Usage Examples:**

```bash
# Enrich all 200+ cities (full run)
pnpm --filter data-pipeline run cli enrich

# Enrich only Asian cities
pnpm --filter data-pipeline run cli enrich --continent Asia

# Test with 5 cities first
pnpm --filter data-pipeline run cli enrich --limit 5 --dry-run

# Enrich experiences after cities
pnpm --filter data-pipeline run cli enrich-experiences --cities-file ./output/enriched/all-cities.json

# Validate the enriched data
pnpm --filter data-pipeline run cli validate-enrichment --input ./output/enriched
```

**Success Criteria:**
- [ ] CLI supports continent filtering
- [ ] Dry-run mode shows what would be processed
- [ ] Progress tracking with resume capability
- [ ] Validation command checks schema compliance

---

### Task E.7: Integration Test for MCP Enrichment

**Description:** End-to-end test for the MCP-powered enrichment pipeline.

**Files to Create:**
- `packages/data-pipeline/src/__tests__/mcp-enrichment.integration.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { CityEnricher } from '../enrichment/city-enricher';
import { EnhancedAlgoliaCitySchema } from '@vibe-travel/shared';

describe('MCP Enrichment Pipeline', () => {
  // Mock MCP responses for testing
  const mockExaResponse = `
    Tokyo is a fascinating blend of ancient temples and ultra-modern technology...
    Best time to visit: March-May for cherry blossoms, October-November for autumn...
    Budget: Expect $100-200/day for mid-range travel...
    Safety: Tokyo is one of the safest cities in the world...
  `;

  const mockBraveResponse = `
    Top restaurants: Sukiyabashi Jiro, Narisawa, Den...
    Local dishes: Sushi, Ramen, Tempura, Wagyu beef...
    Attractions: Senso-ji Temple, Shibuya Crossing, Meiji Shrine...
  `;

  it('should enrich a city with all required attributes', async () => {
    const enricher = new CityEnricher(mockSearchService, mockLLMService);
    
    const result = await enricher.enrichCity({
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      coordinates: { lat: 35.6762, lng: 139.6503 }
    });

    // Validate against schema
    const validation = EnhancedAlgoliaCitySchema.safeParse({
      objectID: 'tokyo-japan',
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      ...result.parsedData
    });

    expect(validation.success).toBe(true);
  });

  it('should have all enhanced attributes populated', async () => {
    const result = await enricher.enrichCity(tokyoInput);
    const data = result.parsedData;

    // Budget attributes
    expect(data.budget_tier).toBeDefined();
    expect(data.avg_daily_cost_usd).toBeGreaterThan(0);
    expect(data.cost_breakdown).toBeDefined();

    // Seasonal attributes
    expect(data.best_months).toBeInstanceOf(Array);
    expect(data.best_months.length).toBeGreaterThan(0);
    expect(data.avoid_months).toBeInstanceOf(Array);

    // Safety & practical
    expect(data.safety_rating).toBeGreaterThanOrEqual(1);
    expect(data.safety_rating).toBeLessThanOrEqual(10);
    expect(data.visa_free_for).toBeInstanceOf(Array);

    // Cuisine
    expect(data.local_cuisine).toBeInstanceOf(Array);
    expect(data.local_cuisine.length).toBeGreaterThan(0);
  });

  it('should handle missing data gracefully', async () => {
    // Test with a less-documented city
    const result = await enricher.enrichCity({
      city: 'Bhaktapur',
      country: 'Nepal',
      continent: 'Asia',
      coordinates: { lat: 27.6710, lng: 85.4298 }
    });

    // Should still produce valid output with estimates
    expect(result.parsedData.budget_tier).toBeDefined();
  });
});
```

---

## Updated Summary

### Task Count by Sub-Plan

| Sub-Plan | Focus Area | Tasks | Priority |
|----------|------------|-------|----------|
| **A: Enhanced City Schema** | Types, Schemas, Config, Fixtures | 6 | High |
| **B: Experiences Index** | New index, types, fixtures, pipeline | 8 | High |
| **C: Seasonal Intelligence** | Query utilities, data expansion | 6 | Medium |
| **D: Frontend Multi-Index & Agent Studio** | UI integration, Agent tools | 6 | High |
| **E: MCP-Powered Data Enrichment** | Exa + Brave Search, 200+ cities | 7 | High |

**Total Tasks: 33**

### Task Count by Sub-Plan

| Sub-Plan | Focus Area | Tasks | Priority |
|----------|------------|-------|----------|
| **A: Enhanced City Schema** | Types, Schemas, Config, Fixtures | 6 | High |
| **B: Experiences Index** | New index, types, fixtures, pipeline | 8 | High |
| **C: Seasonal Intelligence** | Query utilities, data expansion | 6 | Medium |
| **D: Frontend Multi-Index & Agent Studio** | UI integration, Agent tools | 6 | High |

**Total Tasks: 26**

### Updated Dependency Graph

```
Sub-Plan A (Enhanced Schema)
       │
       ├────────────────┬────────────────┬────────────────┐
       ▼                ▼                ▼                ▼
Sub-Plan B          Sub-Plan C      Sub-Plan D      Sub-Plan E
(Experiences)       (Seasonal)      (Frontend)      (MCP Enrichment)
       │                │                │                │
       │                │                │                │
       └────────┬───────┴────────────────┴────────────────┘
                ▼
         Integration Tests & Algolia Upload
```

### Updated Execution Priority

1. **Phase 1**: Sub-Plan A Tasks A.1-A.4 (Types, Schemas, Config)
2. **Phase 2**: Sub-Plan A Tasks A.5-A.6 + Sub-Plan E Tasks E.1-E.4 (MCP infrastructure + 200 city list)
3. **Phase 3**: Sub-Plan E Tasks E.5-E.7 (Run enrichment pipeline for 200+ cities)
4. **Phase 4**: Sub-Plan B Tasks B.1-B.8 (Experiences with real city data)
5. **Phase 5**: Sub-Plan C Tasks C.1-C.6 (Seasonal utilities with real data)
6. **Phase 6**: Sub-Plan D Tasks D.1-D.6 (Frontend integration)
7. **Phase 7**: E2E Testing + Production Upload

### MCP Tools Leveraged

| MCP Tool | Purpose | Used In |
|----------|---------|---------|
| `web_search_exa` (deep) | Comprehensive travel guides, safety info, visa requirements | City enrichment |
| `web_search_exa` (fast) | Quick lookups for specific facts | Visa info, safety ratings |
| `brave_web_search` | Recent events, festivals, seasonal info | Seasonal events calendar |
| `brave_local_search` | Restaurants, attractions, local experiences | Cuisine data, experience gathering |

### Data Enrichment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MCP-Powered Enrichment Pipeline                      │
│                                                                         │
│  ┌──────────────┐    ┌──────────────────────────────────────────────┐  │
│  │              │    │           Parallel MCP Queries                │  │
│  │  Base City   │───▶│  ┌────────────┐  ┌────────────┐             │  │
│  │  (200+ list) │    │  │ Exa Deep   │  │ Brave Web  │             │  │
│  │              │    │  │ - Travel   │  │ - Events   │             │  │
│  └──────────────┘    │  │   Guide    │  │ - Festivals│             │  │
│                      │  │ - Safety   │  │ - News     │             │  │
│                      │  │ - Costs    │  └────────────┘             │  │
│                      │  └────────────┘  ┌────────────┐             │  │
│                      │                   │ Brave Local│             │  │
│                      │                   │ - Cuisine  │             │  │
│                      │                   │ - Spots    │             │  │
│                      │                   └────────────┘             │  │
│                      └───────────────────────┬──────────────────────┘  │
│                                              │                          │
│                                              ▼                          │
│                      ┌──────────────────────────────────────────────┐  │
│                      │              LLM Parsing Layer                │  │
│                      │  - Structures raw search results              │  │
│                      │  - Extracts scores, tags, facts               │  │
│                      │  - Validates against schema                   │  │
│                      └───────────────────────┬──────────────────────┘  │
│                                              │                          │
│                                              ▼                          │
│                      ┌──────────────────────────────────────────────┐  │
│                      │            EnhancedAlgoliaCity                │  │
│                      │  - 200+ cities with 25+ attributes each       │  │
│                      │  - Real-world data, minimal hallucination     │  │
│                      └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Algolia Features Leveraged

| Feature | Usage |
|---------|-------|
| **Multi-Index Search** | `<Index>` widget for federated search |
| **NeuralSearch** | Semantic vibe matching |
| **Agent Studio** | Conversational AI with tools |
| **Client-Side Tools** | User context, UI triggers |
| **Faceted Search** | Budget, seasonal, category filters |
| **Numeric Filtering** | Daily cost ranges |

### Key Resources

- [Multi-Index Search](https://www.algolia.com/doc/guides/building-search-ui/ui-and-ux-patterns/multi-index-search/react/)
- [Agent Studio](https://www.algolia.com/doc/guides/algolia-ai/agent-studio/)
- [Client-Side Tools](https://www.algolia.com/doc/guides/algolia-ai/agent-studio/how-to/tools/client-side-tools/)
- [NeuralSearch](https://www.algolia.com/doc/guides/ai-relevance/neuralsearch/get-started/)
- [Chat Widget](https://www.algolia.com/doc/api-reference/widgets/chat/react/)

---

*Implementation Plan Version: 1.1*
*Last Updated: January 2026*
*Enhanced with Algolia Documentation Research*
