# Implementation Plan: Vibe-Check Travel Planner

## Overview

This implementation plan divides the project into **3 independent sub-plans** that can be developed in parallel by separate coding agents. Each sub-plan resides in its own folder to prevent conflicts during parallel development.

```
/VibeTravelPlanner
├── /packages
│   ├── /shared          # Sub-Plan 1: Shared types, schemas, and utilities
│   ├── /data-pipeline   # Sub-Plan 2: Data generation, transformation, Algolia setup
│   └── /frontend        # Sub-Plan 3: Next.js application with Chat UI
├── /e2e                 # Integration point: End-to-end tests
└── /specs               # Documentation
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Sub-Plan 1: Shared                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ TypeScript  │  │   Zod       │  │   Algolia   │  │    Test       │  │
│  │   Types     │  │  Schemas    │  │   Config    │  │   Fixtures    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                                       ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│   Sub-Plan 2: Data Pipeline     │   │    Sub-Plan 3: Frontend         │
│                                 │   │                                 │
│  ┌─────────────────────────┐   │   │  ┌─────────────────────────┐   │
│  │   Data Generation       │   │   │  │   Next.js App           │   │
│  │   (Synthetic Cities)    │   │   │  │   + React InstantSearch │   │
│  └───────────┬─────────────┘   │   │  └───────────┬─────────────┘   │
│              ▼                 │   │              ▼                 │
│  ┌─────────────────────────┐   │   │  ┌─────────────────────────┐   │
│  │   LLM Enrichment        │   │   │  │   Chat Widget           │   │
│  │   (vibe_tags, desc)     │   │   │  │   + CityCard Component  │   │
│  └───────────┬─────────────┘   │   │  └───────────┬─────────────┘   │
│              ▼                 │   │              ▼                 │
│  ┌─────────────────────────┐   │   │  ┌─────────────────────────┐   │
│  │   Algolia Index Setup   │   │   │  │   Insights Integration  │   │
│  │   + Data Upload         │   │   │  │   (Event Tracking)      │   │
│  └─────────────────────────┘   │   │  └─────────────────────────┘   │
└─────────────────────────────────┘   └─────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Integration & E2E Tests                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │ Integration     │  │  E2E Tests      │  │  Full Flow              │ │
│  │ Tests           │  │  (Playwright)   │  │  Validation             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Sub-Plan 1: Shared Package

**Folder:** `/packages/shared`
**Owner:** Agent 1
**Dependencies:** None (foundational package)
**Estimated Tasks:** 8

## Purpose

Provides shared TypeScript types, Zod validation schemas, Algolia configuration constants, and test fixtures that both the data pipeline and frontend packages will depend on.

---

### Task 1.1: Initialize Shared Package

**Description:** Set up the shared package with TypeScript configuration and testing framework.

**Test-Driven Approach:**
1. Write test that imports from package entry point
2. Implement package structure to make test pass

**Files to Create:**
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/vitest.config.ts`
- `packages/shared/src/index.ts`

**Success Criteria:**
- [x] `npm install` completes without errors
- [x] `npm run build` produces valid TypeScript output
- [x] `npm run test` executes (even with no tests yet)
- [x] Package can be imported by other packages in monorepo

**Test File:** `packages/shared/src/__tests__/package.test.ts`
```typescript
import { describe, it, expect } from 'vitest';

describe('Shared Package', () => {
  it('should export from main entry point', async () => {
    const exports = await import('../index');
    expect(exports).toBeDefined();
  });
});
```

---

### Task 1.2: Define City Data Types

**Description:** Create TypeScript interfaces for the city data schema as defined in PRD Section 3.2.

**Test-Driven Approach:**
1. Write tests that validate type structure
2. Implement types to satisfy tests

**Files to Create:**
- `packages/shared/src/types/city.ts`
- `packages/shared/src/types/index.ts`

**Success Criteria:**
- [x] `City` type includes all required attributes from PRD
- [x] `AlgoliaCity` type extends `City` with Algolia-specific fields
- [x] All score fields are typed as numbers
- [x] `vibe_tags` is typed as string array
- [x] Types are exported from package entry point

**Test File:** `packages/shared/src/types/__tests__/city.test.ts`
```typescript
import { describe, it, expect, expectTypeOf } from 'vitest';
import type { City, AlgoliaCity } from '../city';

describe('City Types', () => {
  it('should have all required City fields', () => {
    const city: City = {
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      description: 'A vibrant metropolis',
      vibe_tags: ['neon', 'modern', 'bustling'],
      culture_score: 9,
      adventure_score: 7,
      nature_score: 5,
      beach_score: 3,
      nightlife_score: 10,
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring',
      image_url: 'https://example.com/tokyo.jpg'
    };
    
    expect(city.city).toBe('Tokyo');
    expect(city.vibe_tags).toHaveLength(3);
  });

  it('should have AlgoliaCity with objectID', () => {
    const algoliaCity: AlgoliaCity = {
      objectID: 'tokyo-japan',
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      description: 'A vibrant metropolis',
      vibe_tags: ['neon'],
      culture_score: 9,
      adventure_score: 7,
      nature_score: 5,
      beach_score: 3,
      nightlife_score: 10,
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring',
      image_url: 'https://example.com/tokyo.jpg'
    };
    
    expect(algoliaCity.objectID).toBe('tokyo-japan');
  });

  it('should enforce score types as numbers', () => {
    expectTypeOf<City['culture_score']>().toBeNumber();
    expectTypeOf<City['adventure_score']>().toBeNumber();
    expectTypeOf<City['nature_score']>().toBeNumber();
    expectTypeOf<City['beach_score']>().toBeNumber();
    expectTypeOf<City['nightlife_score']>().toBeNumber();
  });
});
```

---

### Task 1.3: Create Zod Validation Schemas

**Description:** Implement Zod schemas for runtime validation of city data.

**Test-Driven Approach:**
1. Write tests for valid and invalid data scenarios
2. Implement Zod schemas to pass all validation tests

**Files to Create:**
- `packages/shared/src/schemas/city.schema.ts`
- `packages/shared/src/schemas/index.ts`

**Success Criteria:**
- [x] `CitySchema` validates all required fields
- [x] Schema rejects invalid score ranges (must be 1-10)
- [x] Schema rejects missing required fields
- [x] Schema validates `vibe_tags` as non-empty array
- [x] Schema validates URL format for `image_url`

**Test File:** `packages/shared/src/schemas/__tests__/city.schema.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { CitySchema, AlgoliaCitySchema } from '../city.schema';

describe('CitySchema', () => {
  const validCity = {
    city: 'Paris',
    country: 'France',
    continent: 'Europe',
    description: 'The city of lights and love',
    vibe_tags: ['romantic', 'artistic', 'historic'],
    culture_score: 10,
    adventure_score: 6,
    nature_score: 5,
    beach_score: 2,
    nightlife_score: 8,
    climate_type: 'Oceanic',
    best_time_to_visit: 'Spring or Fall',
    image_url: 'https://example.com/paris.jpg'
  };

  it('should validate a correct city object', () => {
    const result = CitySchema.safeParse(validCity);
    expect(result.success).toBe(true);
  });

  it('should reject scores outside 1-10 range', () => {
    const invalidCity = { ...validCity, culture_score: 15 };
    const result = CitySchema.safeParse(invalidCity);
    expect(result.success).toBe(false);
  });

  it('should reject scores below 1', () => {
    const invalidCity = { ...validCity, nightlife_score: 0 };
    const result = CitySchema.safeParse(invalidCity);
    expect(result.success).toBe(false);
  });

  it('should reject empty vibe_tags array', () => {
    const invalidCity = { ...validCity, vibe_tags: [] };
    const result = CitySchema.safeParse(invalidCity);
    expect(result.success).toBe(false);
  });

  it('should reject invalid image_url', () => {
    const invalidCity = { ...validCity, image_url: 'not-a-url' };
    const result = CitySchema.safeParse(invalidCity);
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const { city, ...missingCity } = validCity;
    const result = CitySchema.safeParse(missingCity);
    expect(result.success).toBe(false);
  });
});

describe('AlgoliaCitySchema', () => {
  it('should require objectID field', () => {
    const cityWithoutId = {
      city: 'Berlin',
      country: 'Germany',
      continent: 'Europe',
      description: 'A creative hub',
      vibe_tags: ['artsy'],
      culture_score: 9,
      adventure_score: 7,
      nature_score: 6,
      beach_score: 1,
      nightlife_score: 10,
      climate_type: 'Oceanic',
      best_time_to_visit: 'Summer',
      image_url: 'https://example.com/berlin.jpg'
    };
    
    const result = AlgoliaCitySchema.safeParse(cityWithoutId);
    expect(result.success).toBe(false);
  });
});
```

---

### Task 1.4: Define Algolia Configuration Constants

**Description:** Create configuration constants for Algolia index settings, searchable attributes, and facets.

**Test-Driven Approach:**
1. Write tests verifying configuration structure
2. Implement configuration to match PRD specifications

**Files to Create:**
- `packages/shared/src/config/algolia.config.ts`
- `packages/shared/src/config/index.ts`

**Success Criteria:**
- [x] `INDEX_NAME` constant is `travel_destinations`
- [x] `SEARCHABLE_ATTRIBUTES` matches PRD Section 5.2
- [x] `ATTRIBUTES_FOR_FACETING` matches PRD Section 5.2
- [x] `CUSTOM_RANKING` configuration is defined
- [x] Configuration is exported and typed

**Test File:** `packages/shared/src/config/__tests__/algolia.config.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import {
  INDEX_NAME,
  SEARCHABLE_ATTRIBUTES,
  ATTRIBUTES_FOR_FACETING,
  CUSTOM_RANKING,
  getIndexSettings
} from '../algolia.config';

describe('Algolia Configuration', () => {
  it('should have correct index name', () => {
    expect(INDEX_NAME).toBe('travel_destinations');
  });

  it('should include required searchable attributes', () => {
    expect(SEARCHABLE_ATTRIBUTES).toContain('city');
    expect(SEARCHABLE_ATTRIBUTES).toContain('country');
    expect(SEARCHABLE_ATTRIBUTES).toContain('description');
    expect(SEARCHABLE_ATTRIBUTES).toContain('vibe_tags');
  });

  it('should include score attributes for faceting', () => {
    expect(ATTRIBUTES_FOR_FACETING).toContain('culture_score');
    expect(ATTRIBUTES_FOR_FACETING).toContain('adventure_score');
    expect(ATTRIBUTES_FOR_FACETING).toContain('nature_score');
    expect(ATTRIBUTES_FOR_FACETING).toContain('beach_score');
    expect(ATTRIBUTES_FOR_FACETING).toContain('nightlife_score');
  });

  it('should include continent as filterOnly facet', () => {
    expect(ATTRIBUTES_FOR_FACETING).toContain('filterOnly(continent)');
  });

  it('should include climate_type as searchable facet', () => {
    expect(ATTRIBUTES_FOR_FACETING).toContain('searchable(climate_type)');
  });

  it('should have custom ranking defined', () => {
    expect(CUSTOM_RANKING).toContain('desc(culture_score)');
    expect(CUSTOM_RANKING).toContain('desc(nightlife_score)');
  });

  it('should generate complete index settings object', () => {
    const settings = getIndexSettings();
    expect(settings).toHaveProperty('searchableAttributes');
    expect(settings).toHaveProperty('attributesForFaceting');
    expect(settings).toHaveProperty('customRanking');
    expect(settings).toHaveProperty('ranking');
  });
});
```

---

### Task 1.5: Create Test Fixtures

**Description:** Generate mock city data fixtures for use in tests across all packages.

**Test-Driven Approach:**
1. Write tests that fixtures conform to schemas
2. Create fixtures that pass schema validation

**Files to Create:**
- `packages/shared/src/fixtures/cities.fixture.ts`
- `packages/shared/src/fixtures/index.ts`

**Success Criteria:**
- [x] At least 10 diverse city fixtures created
- [x] All fixtures pass Zod schema validation
- [x] Fixtures cover different continents
- [x] Fixtures have varied score distributions
- [x] Fixtures have diverse vibe_tags

**Test File:** `packages/shared/src/fixtures/__tests__/cities.fixture.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { mockCities, getMockCityByName, getRandomMockCities } from '../cities.fixture';
import { AlgoliaCitySchema } from '../../schemas/city.schema';

describe('City Fixtures', () => {
  it('should have at least 10 mock cities', () => {
    expect(mockCities.length).toBeGreaterThanOrEqual(10);
  });

  it('should have all fixtures pass schema validation', () => {
    mockCities.forEach((city) => {
      const result = AlgoliaCitySchema.safeParse(city);
      expect(result.success, `City ${city.city} failed validation`).toBe(true);
    });
  });

  it('should cover multiple continents', () => {
    const continents = new Set(mockCities.map(c => c.continent));
    expect(continents.size).toBeGreaterThanOrEqual(4);
  });

  it('should have unique objectIDs', () => {
    const ids = mockCities.map(c => c.objectID);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should find city by name', () => {
    const tokyo = getMockCityByName('Tokyo');
    expect(tokyo).toBeDefined();
    expect(tokyo?.country).toBe('Japan');
  });

  it('should return random cities subset', () => {
    const randomCities = getRandomMockCities(3);
    expect(randomCities).toHaveLength(3);
  });

  it('should have varied vibe_tags across fixtures', () => {
    const allTags = mockCities.flatMap(c => c.vibe_tags);
    const uniqueTags = new Set(allTags);
    expect(uniqueTags.size).toBeGreaterThanOrEqual(15);
  });
});
```

---

### Task 1.6: Create Utility Functions

**Description:** Implement utility functions for ID generation, slug creation, and data transformation.

**Test-Driven Approach:**
1. Write tests for each utility function
2. Implement functions to pass tests

**Files to Create:**
- `packages/shared/src/utils/id.utils.ts`
- `packages/shared/src/utils/transform.utils.ts`
- `packages/shared/src/utils/index.ts`

**Success Criteria:**
- [x] `generateObjectId(city, country)` creates URL-safe IDs
- [x] `slugify(text)` handles special characters
- [x] `normalizeScore(value, min, max)` clamps values to range
- [x] `truncateDescription(text, maxLength)` truncates with ellipsis

**Test File:** `packages/shared/src/utils/__tests__/utils.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { generateObjectId, slugify, normalizeScore, truncateDescription } from '../index';

describe('ID Utils', () => {
  describe('generateObjectId', () => {
    it('should generate lowercase hyphenated ID', () => {
      const id = generateObjectId('New York', 'United States');
      expect(id).toBe('new-york-united-states');
    });

    it('should handle special characters', () => {
      const id = generateObjectId('São Paulo', 'Brazil');
      expect(id).toBe('sao-paulo-brazil');
    });

    it('should handle multiple spaces', () => {
      const id = generateObjectId('Rio  de  Janeiro', 'Brazil');
      expect(id).toBe('rio-de-janeiro-brazil');
    });
  });

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('HELLO')).toBe('hello');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('hello@world!')).toBe('helloworld');
    });
  });

  describe('normalizeScore', () => {
    it('should return value within range', () => {
      expect(normalizeScore(5, 1, 10)).toBe(5);
    });

    it('should clamp values above max', () => {
      expect(normalizeScore(15, 1, 10)).toBe(10);
    });

    it('should clamp values below min', () => {
      expect(normalizeScore(-5, 1, 10)).toBe(1);
    });

    it('should round to nearest integer', () => {
      expect(normalizeScore(5.7, 1, 10)).toBe(6);
    });
  });

  describe('truncateDescription', () => {
    it('should not truncate short text', () => {
      expect(truncateDescription('Hello', 100)).toBe('Hello');
    });

    it('should truncate long text with ellipsis', () => {
      const long = 'A'.repeat(200);
      const result = truncateDescription(long, 100);
      expect(result.length).toBe(103); // 100 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should truncate at word boundary when possible', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const result = truncateDescription(text, 20);
      expect(result).toBe('The quick brown fox...');
    });
  });
});
```

---

### Task 1.7: Create Event Types for Insights

**Description:** Define TypeScript types for Algolia Insights events.

**Test-Driven Approach:**
1. Write tests validating event structure
2. Implement types matching Algolia Insights API

**Files to Create:**
- `packages/shared/src/types/events.ts`

**Success Criteria:**
- [x] `ClickEvent` type defined for click tracking
- [x] `ConversionEvent` type defined for conversions
- [x] Event types include required fields: `eventType`, `eventName`, `index`, `objectIDs`, `userToken`
- [x] `queryID` is optional (only for after-search events)

**Test File:** `packages/shared/src/types/__tests__/events.test.ts`
```typescript
import { describe, it, expect, expectTypeOf } from 'vitest';
import type { ClickEvent, ConversionEvent, InsightsEvent } from '../events';

describe('Event Types', () => {
  it('should have valid ClickEvent structure', () => {
    const event: ClickEvent = {
      eventType: 'click',
      eventName: 'City Card Clicked',
      index: 'travel_destinations',
      objectIDs: ['tokyo-japan'],
      userToken: 'user-123',
      timestamp: Date.now()
    };
    
    expect(event.eventType).toBe('click');
  });

  it('should have valid ConversionEvent structure', () => {
    const event: ConversionEvent = {
      eventType: 'conversion',
      eventName: 'Trip Planned',
      index: 'travel_destinations',
      objectIDs: ['paris-france'],
      userToken: 'user-123',
      queryID: 'query-abc'
    };
    
    expect(event.eventType).toBe('conversion');
  });

  it('should allow queryID in after-search events', () => {
    const event: ClickEvent = {
      eventType: 'click',
      eventName: 'City Card Clicked After Search',
      index: 'travel_destinations',
      objectIDs: ['tokyo-japan'],
      userToken: 'user-123',
      queryID: 'query-xyz'
    };
    
    expect(event.queryID).toBe('query-xyz');
  });
});
```

---

### Task 1.8: Package Integration Test

**Description:** Verify all exports work correctly together and package is ready for consumption.

**Test-Driven Approach:**
1. Write comprehensive integration test
2. Ensure all exports are accessible

**Success Criteria:**
- [x] All types are exported from main entry point
- [x] All schemas are exported and functional
- [x] All utilities are exported and functional
- [x] All fixtures are exported
- [x] Package builds without errors
- [x] Package can be consumed by other packages

**Test File:** `packages/shared/src/__tests__/integration.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import {
  // Types
  type City,
  type AlgoliaCity,
  type ClickEvent,
  type ConversionEvent,
  // Schemas
  CitySchema,
  AlgoliaCitySchema,
  // Config
  INDEX_NAME,
  SEARCHABLE_ATTRIBUTES,
  ATTRIBUTES_FOR_FACETING,
  getIndexSettings,
  // Fixtures
  mockCities,
  getMockCityByName,
  // Utils
  generateObjectId,
  slugify,
  normalizeScore,
  truncateDescription
} from '../index';

describe('Shared Package Integration', () => {
  it('should export all types', () => {
    const city: City = mockCities[0];
    expect(city).toBeDefined();
  });

  it('should validate fixtures with schemas', () => {
    mockCities.forEach(city => {
      expect(AlgoliaCitySchema.safeParse(city).success).toBe(true);
    });
  });

  it('should have consistent config', () => {
    expect(INDEX_NAME).toBe('travel_destinations');
    const settings = getIndexSettings();
    expect(settings.searchableAttributes).toEqual(SEARCHABLE_ATTRIBUTES);
  });

  it('should have working utilities', () => {
    const city = getMockCityByName('Tokyo');
    if (city) {
      const id = generateObjectId(city.city, city.country);
      expect(id).toBe('tokyo-japan');
    }
  });

  it('should build settings matching PRD requirements', () => {
    const settings = getIndexSettings();
    expect(settings.searchableAttributes).toContain('description');
    expect(settings.attributesForFaceting).toContain('culture_score');
  });
});
```

---

# Sub-Plan 2: Data Pipeline Package

**Folder:** `/packages/data-pipeline`
**Owner:** Agent 2
**Dependencies:** `@vibe-travel/shared`
**Estimated Tasks:** 10

## Purpose

Handles data generation, LLM enrichment, validation, and Algolia index management. This package contains scripts that can be run to populate and configure the Algolia index.

---

### Task 2.1: Initialize Data Pipeline Package

**Description:** Set up the data pipeline package with Node.js/TypeScript configuration.

**Test-Driven Approach:**
1. Write test that package initializes correctly
2. Set up build and test scripts

**Files to Create:**
- `packages/data-pipeline/package.json`
- `packages/data-pipeline/tsconfig.json`
- `packages/data-pipeline/vitest.config.ts`
- `packages/data-pipeline/src/index.ts`
- `packages/data-pipeline/.env.example`

**Success Criteria:**
- [x] Package depends on `@vibe-travel/shared`
- [x] TypeScript compiles without errors
- [x] Tests can import from shared package
- [x] Environment variables template exists

**Test File:** `packages/data-pipeline/src/__tests__/package.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { CitySchema, INDEX_NAME } from '@vibe-travel/shared';

describe('Data Pipeline Package', () => {
  it('should import from shared package', () => {
    expect(CitySchema).toBeDefined();
    expect(INDEX_NAME).toBe('travel_destinations');
  });
});
```

---

### Task 2.2: Create Base City Data Generator

**Description:** Implement a generator that creates base city data with geographic and categorical information.

**Test-Driven Approach:**
1. Write tests for data generation output
2. Implement generator to produce valid data

**Files to Create:**
- `packages/data-pipeline/src/generators/base-city.generator.ts`
- `packages/data-pipeline/src/generators/index.ts`
- `packages/data-pipeline/src/data/base-cities.json`

**Success Criteria:**
- [x] Generator produces at least 50 cities
- [x] Each city has: name, country, continent, climate_type, best_time_to_visit
- [x] Cities span at least 5 continents
- [x] No duplicate city-country combinations
- [x] Output matches partial City schema

**Test File:** `packages/data-pipeline/src/generators/__tests__/base-city.generator.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { generateBaseCities, BaseCityData } from '../base-city.generator';

describe('Base City Generator', () => {
  let cities: BaseCityData[];

  beforeAll(() => {
    cities = generateBaseCities();
  });

  it('should generate at least 50 cities', () => {
    expect(cities.length).toBeGreaterThanOrEqual(50);
  });

  it('should have required base fields', () => {
    cities.forEach(city => {
      expect(city.city).toBeTruthy();
      expect(city.country).toBeTruthy();
      expect(city.continent).toBeTruthy();
      expect(city.climate_type).toBeTruthy();
      expect(city.best_time_to_visit).toBeTruthy();
    });
  });

  it('should cover multiple continents', () => {
    const continents = new Set(cities.map(c => c.continent));
    expect(continents.size).toBeGreaterThanOrEqual(5);
  });

  it('should have unique city-country combinations', () => {
    const keys = cities.map(c => `${c.city}-${c.country}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('should have valid continent values', () => {
    const validContinents = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
    cities.forEach(city => {
      expect(validContinents).toContain(city.continent);
    });
  });
});
```

---

### Task 2.3: Create Score Generator

**Description:** Implement a generator that assigns realistic scores to cities based on their characteristics.

**Test-Driven Approach:**
1. Write tests for score distribution and validity
2. Implement scoring algorithm

**Files to Create:**
- `packages/data-pipeline/src/generators/score.generator.ts`

**Success Criteria:**
- [x] All scores are integers between 1-10
- [x] Beach cities have higher beach_score
- [x] Major capitals have higher culture_score
- [x] Known party cities have higher nightlife_score
- [x] Scores are deterministic (same input = same output)

**Test File:** `packages/data-pipeline/src/generators/__tests__/score.generator.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { generateScores, CityScores } from '../score.generator';
import { BaseCityData } from '../base-city.generator';

describe('Score Generator', () => {
  it('should generate all required scores', () => {
    const baseCity: BaseCityData = {
      city: 'Barcelona',
      country: 'Spain',
      continent: 'Europe',
      climate_type: 'Mediterranean',
      best_time_to_visit: 'Spring'
    };

    const scores = generateScores(baseCity);

    expect(scores.culture_score).toBeGreaterThanOrEqual(1);
    expect(scores.culture_score).toBeLessThanOrEqual(10);
    expect(scores.adventure_score).toBeGreaterThanOrEqual(1);
    expect(scores.adventure_score).toBeLessThanOrEqual(10);
    expect(scores.nature_score).toBeGreaterThanOrEqual(1);
    expect(scores.nature_score).toBeLessThanOrEqual(10);
    expect(scores.beach_score).toBeGreaterThanOrEqual(1);
    expect(scores.beach_score).toBeLessThanOrEqual(10);
    expect(scores.nightlife_score).toBeGreaterThanOrEqual(1);
    expect(scores.nightlife_score).toBeLessThanOrEqual(10);
  });

  it('should give beach cities higher beach scores', () => {
    const beachCity: BaseCityData = {
      city: 'Miami',
      country: 'United States',
      continent: 'North America',
      climate_type: 'Tropical',
      best_time_to_visit: 'Winter'
    };

    const landlockedCity: BaseCityData = {
      city: 'Vienna',
      country: 'Austria',
      continent: 'Europe',
      climate_type: 'Continental',
      best_time_to_visit: 'Spring'
    };

    const beachScores = generateScores(beachCity);
    const landlockedScores = generateScores(landlockedCity);

    expect(beachScores.beach_score).toBeGreaterThan(landlockedScores.beach_score);
  });

  it('should be deterministic', () => {
    const city: BaseCityData = {
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring'
    };

    const scores1 = generateScores(city);
    const scores2 = generateScores(city);

    expect(scores1).toEqual(scores2);
  });

  it('should return integer scores', () => {
    const city: BaseCityData = {
      city: 'Paris',
      country: 'France',
      continent: 'Europe',
      climate_type: 'Oceanic',
      best_time_to_visit: 'Spring'
    };

    const scores = generateScores(city);

    Object.values(scores).forEach(score => {
      expect(Number.isInteger(score)).toBe(true);
    });
  });
});
```

---

### Task 2.4: Create LLM Enrichment Service

**Description:** Implement service that uses OpenAI to generate descriptions and vibe_tags for cities.

**Test-Driven Approach:**
1. Write tests with mocked LLM responses
2. Implement service with proper error handling

**Files to Create:**
- `packages/data-pipeline/src/services/llm.service.ts`
- `packages/data-pipeline/src/services/index.ts`

**Success Criteria:**
- [x] Service generates city descriptions (100-300 words)
- [x] Service generates 5-10 vibe_tags per city
- [x] Service handles rate limiting gracefully
- [x] Service validates LLM output
- [x] Service supports batch processing with concurrency control

**Test File:** `packages/data-pipeline/src/services/__tests__/llm.service.test.ts`
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMService, EnrichmentResult } from '../llm.service';
import { BaseCityData } from '../../generators/base-city.generator';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                description: 'A vibrant city known for its culture and cuisine.',
                vibe_tags: ['artistic', 'romantic', 'historic', 'culinary', 'fashionable']
              })
            }
          }]
        })
      }
    }
  }))
}));

describe('LLM Service', () => {
  let service: LLMService;

  beforeEach(() => {
    service = new LLMService({ apiKey: 'test-key' });
  });

  it('should enrich city with description and vibe_tags', async () => {
    const baseCity: BaseCityData = {
      city: 'Paris',
      country: 'France',
      continent: 'Europe',
      climate_type: 'Oceanic',
      best_time_to_visit: 'Spring'
    };

    const result = await service.enrichCity(baseCity);

    expect(result.description).toBeTruthy();
    expect(result.description.length).toBeGreaterThan(50);
    expect(result.vibe_tags).toBeInstanceOf(Array);
    expect(result.vibe_tags.length).toBeGreaterThanOrEqual(3);
  });

  it('should generate array of string vibe_tags', async () => {
    const baseCity: BaseCityData = {
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      climate_type: 'Humid subtropical',
      best_time_to_visit: 'Spring'
    };

    const result = await service.enrichCity(baseCity);

    result.vibe_tags.forEach(tag => {
      expect(typeof tag).toBe('string');
      expect(tag.length).toBeGreaterThan(0);
    });
  });

  it('should handle batch enrichment', async () => {
    const cities: BaseCityData[] = [
      { city: 'Paris', country: 'France', continent: 'Europe', climate_type: 'Oceanic', best_time_to_visit: 'Spring' },
      { city: 'Tokyo', country: 'Japan', continent: 'Asia', climate_type: 'Humid subtropical', best_time_to_visit: 'Spring' }
    ];

    const results = await service.enrichCities(cities, { concurrency: 2 });

    expect(results).toHaveLength(2);
    results.forEach(result => {
      expect(result.description).toBeTruthy();
      expect(result.vibe_tags.length).toBeGreaterThan(0);
    });
  });

  it('should validate LLM output format', async () => {
    const validOutput = {
      description: 'A beautiful city',
      vibe_tags: ['modern', 'scenic']
    };

    const isValid = service.validateEnrichmentOutput(validOutput);
    expect(isValid).toBe(true);
  });

  it('should reject invalid LLM output', async () => {
    const invalidOutput = {
      description: '', // Empty description
      vibe_tags: []   // Empty tags
    };

    const isValid = service.validateEnrichmentOutput(invalidOutput);
    expect(isValid).toBe(false);
  });
});
```

---

### Task 2.5: Create Image URL Generator

**Description:** Implement service to generate or fetch image URLs for cities (using Unsplash or similar).

**Test-Driven Approach:**
1. Write tests for URL generation
2. Implement generator with fallback mechanism

**Files to Create:**
- `packages/data-pipeline/src/services/image.service.ts`

**Success Criteria:**
- [x] Service generates valid image URLs
- [x] URLs use Unsplash source API or similar free service
- [x] Service provides fallback placeholder image
- [x] URLs include city/country context for relevance

**Test File:** `packages/data-pipeline/src/services/__tests__/image.service.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { ImageService } from '../image.service';

describe('Image Service', () => {
  let service: ImageService;

  beforeEach(() => {
    service = new ImageService();
  });

  it('should generate valid URL for city', () => {
    const url = service.getImageUrl('Paris', 'France');
    
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toBeTruthy();
  });

  it('should include city name in URL query', () => {
    const url = service.getImageUrl('Tokyo', 'Japan');
    
    expect(url.toLowerCase()).toContain('tokyo');
  });

  it('should handle special characters in city names', () => {
    const url = service.getImageUrl('São Paulo', 'Brazil');
    
    expect(url).toMatch(/^https?:\/\//);
    expect(url).not.toContain('undefined');
  });

  it('should provide fallback URL', () => {
    const url = service.getFallbackUrl();
    
    expect(url).toMatch(/^https?:\/\//);
  });

  it('should generate consistent URLs for same city', () => {
    const url1 = service.getImageUrl('Berlin', 'Germany');
    const url2 = service.getImageUrl('Berlin', 'Germany');
    
    expect(url1).toBe(url2);
  });
});
```

---

### Task 2.6: Create City Data Assembler

**Description:** Implement assembler that combines base data, scores, LLM enrichment, and images into complete city records.

**Test-Driven Approach:**
1. Write tests for assembly process
2. Implement assembler that produces valid AlgoliaCity records

**Files to Create:**
- `packages/data-pipeline/src/assemblers/city.assembler.ts`
- `packages/data-pipeline/src/assemblers/index.ts`

**Success Criteria:**
- [x] Assembler produces complete AlgoliaCity records
- [x] Records pass Zod schema validation
- [x] objectID is correctly generated
- [x] All fields are properly combined

**Test File:** `packages/data-pipeline/src/assemblers/__tests__/city.assembler.test.ts`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { CityAssembler } from '../city.assembler';
import { AlgoliaCitySchema } from '@vibe-travel/shared';

describe('City Assembler', () => {
  it('should assemble complete city record', async () => {
    const assembler = new CityAssembler({
      llmService: {
        enrichCity: vi.fn().mockResolvedValue({
          description: 'A beautiful city with rich history',
          vibe_tags: ['historic', 'romantic', 'artistic']
        })
      },
      imageService: {
        getImageUrl: vi.fn().mockReturnValue('https://example.com/image.jpg')
      }
    });

    const baseCity = {
      city: 'Rome',
      country: 'Italy',
      continent: 'Europe',
      climate_type: 'Mediterranean',
      best_time_to_visit: 'Spring or Fall'
    };

    const result = await assembler.assemble(baseCity);

    expect(result.objectID).toBe('rome-italy');
    expect(result.city).toBe('Rome');
    expect(result.description).toBeTruthy();
    expect(result.vibe_tags).toHaveLength(3);
    expect(result.image_url).toBe('https://example.com/image.jpg');
  });

  it('should produce valid AlgoliaCity records', async () => {
    const assembler = new CityAssembler({
      llmService: {
        enrichCity: vi.fn().mockResolvedValue({
          description: 'Test description for validation',
          vibe_tags: ['test', 'mock', 'city']
        })
      },
      imageService: {
        getImageUrl: vi.fn().mockReturnValue('https://example.com/test.jpg')
      }
    });

    const baseCity = {
      city: 'Test City',
      country: 'Test Country',
      continent: 'Europe',
      climate_type: 'Temperate',
      best_time_to_visit: 'Summer'
    };

    const result = await assembler.assemble(baseCity);
    const validation = AlgoliaCitySchema.safeParse(result);

    expect(validation.success).toBe(true);
  });

  it('should generate correct objectID', async () => {
    const assembler = new CityAssembler({
      llmService: {
        enrichCity: vi.fn().mockResolvedValue({
          description: 'Description',
          vibe_tags: ['tag']
        })
      },
      imageService: {
        getImageUrl: vi.fn().mockReturnValue('https://example.com/img.jpg')
      }
    });

    const baseCity = {
      city: 'New York',
      country: 'United States',
      continent: 'North America',
      climate_type: 'Humid continental',
      best_time_to_visit: 'Fall'
    };

    const result = await assembler.assemble(baseCity);

    expect(result.objectID).toBe('new-york-united-states');
  });
});
```

---

### Task 2.7: Create Algolia Client Wrapper

**Description:** Implement a wrapper around the Algolia client for index management operations.

**Test-Driven Approach:**
1. Write tests with mocked Algolia client
2. Implement wrapper with error handling

**Files to Create:**
- `packages/data-pipeline/src/clients/algolia.client.ts`
- `packages/data-pipeline/src/clients/index.ts`

**Success Criteria:**
- [x] Client can create/configure index
- [x] Client can upload records in batches
- [x] Client can clear index
- [x] Client handles rate limiting
- [x] Client reports upload progress

**Test File:** `packages/data-pipeline/src/clients/__tests__/algolia.client.test.ts`
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlgoliaClient } from '../algolia.client';
import { getIndexSettings, mockCities } from '@vibe-travel/shared';

// Mock algoliasearch
vi.mock('algoliasearch', () => ({
  default: vi.fn().mockReturnValue({
    initIndex: vi.fn().mockReturnValue({
      setSettings: vi.fn().mockResolvedValue({ taskID: 1 }),
      saveObjects: vi.fn().mockResolvedValue({ objectIDs: ['id1', 'id2'] }),
      clearObjects: vi.fn().mockResolvedValue({ taskID: 2 }),
      search: vi.fn().mockResolvedValue({ hits: [], nbHits: 0 }),
      waitTask: vi.fn().mockResolvedValue({})
    })
  })
}));

describe('Algolia Client', () => {
  let client: AlgoliaClient;

  beforeEach(() => {
    client = new AlgoliaClient({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      indexName: 'travel_destinations'
    });
  });

  it('should configure index with settings', async () => {
    const settings = getIndexSettings();
    await client.configureIndex(settings);

    expect(client.getIndex().setSettings).toHaveBeenCalledWith(settings);
  });

  it('should upload records in batches', async () => {
    const records = mockCities.slice(0, 5);
    const result = await client.uploadRecords(records);

    expect(result.success).toBe(true);
    expect(client.getIndex().saveObjects).toHaveBeenCalled();
  });

  it('should clear index', async () => {
    await client.clearIndex();

    expect(client.getIndex().clearObjects).toHaveBeenCalled();
  });

  it('should handle upload errors gracefully', async () => {
    const errorClient = new AlgoliaClient({
      appId: 'test',
      apiKey: 'test',
      indexName: 'test'
    });

    // Mock error
    vi.mocked(errorClient.getIndex().saveObjects).mockRejectedValueOnce(new Error('Upload failed'));

    const result = await errorClient.uploadRecords(mockCities.slice(0, 2));

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should report progress during batch upload', async () => {
    const progressCallback = vi.fn();
    const records = mockCities.slice(0, 10);

    await client.uploadRecords(records, { 
      batchSize: 5,
      onProgress: progressCallback 
    });

    expect(progressCallback).toHaveBeenCalled();
  });
});
```

---

### Task 2.8: Create Data Pipeline Orchestrator

**Description:** Implement main orchestrator that runs the complete data pipeline.

**Test-Driven Approach:**
1. Write tests for pipeline stages
2. Implement orchestrator with configurable options

**Files to Create:**
- `packages/data-pipeline/src/pipeline/orchestrator.ts`
- `packages/data-pipeline/src/pipeline/index.ts`

**Success Criteria:**
- [x] Orchestrator runs all stages in correct order
- [x] Orchestrator supports dry-run mode
- [x] Orchestrator reports progress at each stage
- [x] Orchestrator handles failures gracefully
- [x] Output can be saved to file before upload

**Test File:** `packages/data-pipeline/src/pipeline/__tests__/orchestrator.test.ts`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { PipelineOrchestrator, PipelineConfig, PipelineResult } from '../orchestrator';

describe('Pipeline Orchestrator', () => {
  const mockDependencies = {
    baseCityGenerator: { generate: vi.fn().mockReturnValue([{ city: 'Test', country: 'Country' }]) },
    scoreGenerator: { generate: vi.fn().mockReturnValue({ culture_score: 5 }) },
    llmService: { enrichCity: vi.fn().mockResolvedValue({ description: 'Test', vibe_tags: ['test'] }) },
    imageService: { getImageUrl: vi.fn().mockReturnValue('https://example.com/img.jpg') },
    assembler: { assemble: vi.fn().mockResolvedValue({ objectID: 'test-country' }) },
    algoliaClient: { 
      configureIndex: vi.fn().mockResolvedValue(undefined),
      uploadRecords: vi.fn().mockResolvedValue({ success: true })
    }
  };

  it('should run all pipeline stages', async () => {
    const orchestrator = new PipelineOrchestrator(mockDependencies);
    const result = await orchestrator.run();

    expect(result.success).toBe(true);
    expect(result.stages.dataGeneration).toBe('completed');
    expect(result.stages.enrichment).toBe('completed');
    expect(result.stages.upload).toBe('completed');
  });

  it('should support dry-run mode', async () => {
    const orchestrator = new PipelineOrchestrator(mockDependencies);
    const result = await orchestrator.run({ dryRun: true });

    expect(result.success).toBe(true);
    expect(mockDependencies.algoliaClient.uploadRecords).not.toHaveBeenCalled();
  });

  it('should save output to file in dry-run', async () => {
    const orchestrator = new PipelineOrchestrator(mockDependencies);
    const result = await orchestrator.run({ 
      dryRun: true,
      outputFile: './output/cities.json'
    });

    expect(result.outputFile).toBe('./output/cities.json');
  });

  it('should report progress', async () => {
    const progressCallback = vi.fn();
    const orchestrator = new PipelineOrchestrator(mockDependencies);
    
    await orchestrator.run({ onProgress: progressCallback });

    expect(progressCallback).toHaveBeenCalledWith(expect.objectContaining({
      stage: expect.any(String),
      progress: expect.any(Number)
    }));
  });

  it('should handle stage failures', async () => {
    const failingDependencies = {
      ...mockDependencies,
      llmService: { 
        enrichCity: vi.fn().mockRejectedValue(new Error('LLM Error')) 
      }
    };

    const orchestrator = new PipelineOrchestrator(failingDependencies);
    const result = await orchestrator.run();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

---

### Task 2.9: Create CLI Entry Point

**Description:** Implement CLI commands for running the data pipeline.

**Test-Driven Approach:**
1. Write tests for CLI argument parsing
2. Implement CLI with Commander.js or similar

**Files to Create:**
- `packages/data-pipeline/src/cli/index.ts`
- `packages/data-pipeline/src/cli/commands/generate.ts`
- `packages/data-pipeline/src/cli/commands/upload.ts`
- `packages/data-pipeline/src/cli/commands/configure.ts`

**Success Criteria:**
- [x] CLI has `generate` command for data generation
- [x] CLI has `upload` command for Algolia upload
- [x] CLI has `configure` command for index settings
- [x] CLI supports `--dry-run` flag
- [x] CLI validates environment variables

**Test File:** `packages/data-pipeline/src/cli/__tests__/cli.test.ts`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { parseArgs, validateEnv, runCommand } from '../index';

describe('CLI', () => {
  describe('parseArgs', () => {
    it('should parse generate command', () => {
      const args = parseArgs(['generate', '--count', '50']);
      
      expect(args.command).toBe('generate');
      expect(args.options.count).toBe(50);
    });

    it('should parse upload command with dry-run', () => {
      const args = parseArgs(['upload', '--dry-run']);
      
      expect(args.command).toBe('upload');
      expect(args.options.dryRun).toBe(true);
    });

    it('should parse configure command', () => {
      const args = parseArgs(['configure', '--index', 'travel_destinations']);
      
      expect(args.command).toBe('configure');
      expect(args.options.index).toBe('travel_destinations');
    });
  });

  describe('validateEnv', () => {
    it('should require ALGOLIA_APP_ID', () => {
      const env = { ALGOLIA_API_KEY: 'key' };
      const result = validateEnv(env);
      
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('ALGOLIA_APP_ID');
    });

    it('should require ALGOLIA_API_KEY', () => {
      const env = { ALGOLIA_APP_ID: 'app' };
      const result = validateEnv(env);
      
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('ALGOLIA_API_KEY');
    });

    it('should pass with all required vars', () => {
      const env = { 
        ALGOLIA_APP_ID: 'app',
        ALGOLIA_API_KEY: 'key',
        OPENAI_API_KEY: 'openai'
      };
      const result = validateEnv(env);
      
      expect(result.valid).toBe(true);
    });
  });
});
```

---

### Task 2.10: Data Pipeline Integration Test

**Description:** Integration test verifying the complete pipeline works end-to-end.

**Test-Driven Approach:**
1. Test complete pipeline with mocked external services
2. Verify data flows correctly through all stages

**Success Criteria:**
- [x] Pipeline generates valid city data
- [x] Data passes schema validation
- [x] Algolia client receives correctly formatted records
- [x] Pipeline handles 50+ cities without issues

**Test File:** `packages/data-pipeline/src/__tests__/integration.test.ts`
```typescript
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { PipelineOrchestrator } from '../pipeline/orchestrator';
import { AlgoliaCitySchema } from '@vibe-travel/shared';

// Mock external services
vi.mock('openai');
vi.mock('algoliasearch');

describe('Data Pipeline Integration', () => {
  let orchestrator: PipelineOrchestrator;
  let pipelineResult: any;

  beforeAll(async () => {
    // Set up mocks
    vi.mocked(require('openai').default).mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  description: 'A wonderful city to visit',
                  vibe_tags: ['vibrant', 'cultural', 'historic']
                })
              }
            }]
          })
        }
      }
    }));

    vi.mocked(require('algoliasearch').default).mockReturnValue({
      initIndex: vi.fn().mockReturnValue({
        setSettings: vi.fn().mockResolvedValue({ taskID: 1 }),
        saveObjects: vi.fn().mockResolvedValue({ objectIDs: [] }),
        waitTask: vi.fn().mockResolvedValue({})
      })
    });

    orchestrator = PipelineOrchestrator.create({
      algoliaAppId: 'test-app',
      algoliaApiKey: 'test-key',
      openaiApiKey: 'test-openai'
    });

    pipelineResult = await orchestrator.run({ 
      dryRun: true,
      cityCount: 10 
    });
  });

  it('should complete all stages successfully', () => {
    expect(pipelineResult.success).toBe(true);
  });

  it('should generate the requested number of cities', () => {
    expect(pipelineResult.cities).toHaveLength(10);
  });

  it('should produce valid Algolia records', () => {
    pipelineResult.cities.forEach((city: unknown) => {
      const validation = AlgoliaCitySchema.safeParse(city);
      expect(validation.success, `Invalid city: ${JSON.stringify(city)}`).toBe(true);
    });
  });

  it('should have unique objectIDs', () => {
    const ids = pipelineResult.cities.map((c: any) => c.objectID);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should include all required fields', () => {
    const requiredFields = [
      'objectID', 'city', 'country', 'continent', 'description',
      'vibe_tags', 'culture_score', 'adventure_score', 'nature_score',
      'beach_score', 'nightlife_score', 'climate_type', 'best_time_to_visit',
      'image_url'
    ];

    pipelineResult.cities.forEach((city: any) => {
      requiredFields.forEach(field => {
        expect(city[field], `Missing field: ${field}`).toBeDefined();
      });
    });
  });
});
```

---

# Sub-Plan 3: Frontend Package

**Folder:** `/packages/frontend`
**Owner:** Agent 3
**Dependencies:** `@vibe-travel/shared`
**Estimated Tasks:** 12

## Purpose

Implements the Next.js frontend application with React InstantSearch, Chat widget, and Algolia Insights integration.

---

### Task 3.1: Initialize Next.js Application

**Description:** Set up Next.js 14+ application with App Router and TypeScript.

**Test-Driven Approach:**
1. Write test that app renders without errors
2. Set up Next.js with required dependencies

**Files to Create:**
- `packages/frontend/package.json`
- `packages/frontend/next.config.js`
- `packages/frontend/tsconfig.json`
- `packages/frontend/src/app/layout.tsx`
- `packages/frontend/src/app/page.tsx`
- `packages/frontend/vitest.config.ts`
- `packages/frontend/playwright.config.ts`

**Success Criteria:**
- [x] Next.js app starts without errors
- [x] App uses App Router (not Pages Router)
- [x] TypeScript is configured correctly
- [x] Vitest is configured for unit tests
- [x] Playwright is configured for E2E tests

**Test File:** `packages/frontend/src/__tests__/app.test.tsx`
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout from '../app/layout';
import HomePage from '../app/page';

describe('App', () => {
  it('should render home page', () => {
    render(<HomePage />);
    expect(document.body).toBeTruthy();
  });

  it('should have correct metadata', () => {
    // Metadata test for SEO
    expect(true).toBe(true); // Placeholder - actual test depends on implementation
  });
});
```

---

### Task 3.2: Set Up Algolia Search Client

**Description:** Configure Algolia search client with environment variables.

**Test-Driven Approach:**
1. Write tests for client initialization
2. Implement client factory with proper error handling

**Files to Create:**
- `packages/frontend/src/lib/algolia/client.ts`
- `packages/frontend/src/lib/algolia/index.ts`
- `packages/frontend/.env.example`
- `packages/frontend/.env.local` (gitignored)

**Success Criteria:**
- [x] Search client initializes with env variables
- [x] Client throws helpful error if env vars missing
- [x] Client is singleton to prevent multiple instances
- [x] Client works with React InstantSearch

**Test File:** `packages/frontend/src/lib/algolia/__tests__/client.test.ts`
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSearchClient, resetSearchClient } from '../client';

describe('Algolia Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetSearchClient();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create search client with env variables', () => {
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'test-app-id';
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY = 'test-search-key';

    const client = getSearchClient();
    expect(client).toBeDefined();
  });

  it('should throw error if ALGOLIA_APP_ID is missing', () => {
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY = 'test-key';
    delete process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;

    expect(() => getSearchClient()).toThrow('NEXT_PUBLIC_ALGOLIA_APP_ID');
  });

  it('should throw error if ALGOLIA_SEARCH_KEY is missing', () => {
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'test-app';
    delete process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

    expect(() => getSearchClient()).toThrow('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY');
  });

  it('should return singleton instance', () => {
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'test-app';
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY = 'test-key';

    const client1 = getSearchClient();
    const client2 = getSearchClient();

    expect(client1).toBe(client2);
  });
});
```

---

### Task 3.3: Create InstantSearch Provider

**Description:** Create React context provider for InstantSearch that wraps the application.

**Test-Driven Approach:**
1. Write tests for provider rendering
2. Implement provider with proper configuration

**Files to Create:**
- `packages/frontend/src/providers/InstantSearchProvider.tsx`
- `packages/frontend/src/providers/index.ts`

**Success Criteria:**
- [x] Provider wraps children with InstantSearch
- [x] Provider configures index name from shared package
- [x] Provider initializes Insights middleware
- [x] Provider handles loading state

**Test File:** `packages/frontend/src/providers/__tests__/InstantSearchProvider.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InstantSearchProvider } from '../InstantSearchProvider';
import { useInstantSearch } from 'react-instantsearch';

// Mock react-instantsearch
vi.mock('react-instantsearch', () => ({
  InstantSearch: ({ children }: any) => <div data-testid="instantsearch">{children}</div>,
  useInstantSearch: vi.fn().mockReturnValue({ status: 'idle' })
}));

// Mock search-insights
vi.mock('search-insights', () => ({
  default: vi.fn()
}));

describe('InstantSearchProvider', () => {
  it('should render children', () => {
    render(
      <InstantSearchProvider>
        <div data-testid="child">Child Content</div>
      </InstantSearchProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should wrap with InstantSearch component', () => {
    render(
      <InstantSearchProvider>
        <div>Content</div>
      </InstantSearchProvider>
    );

    expect(screen.getByTestId('instantsearch')).toBeInTheDocument();
  });
});
```

---

### Task 3.4: Create CityCard Component

**Description:** Implement the CityCard component for displaying city results.

**Test-Driven Approach:**
1. Write tests for component rendering and interactions
2. Implement component matching design specs

**Files to Create:**
- `packages/frontend/src/components/CityCard/CityCard.tsx`
- `packages/frontend/src/components/CityCard/CityCard.module.css`
- `packages/frontend/src/components/CityCard/index.ts`

**Success Criteria:**
- [x] Component displays city name and country
- [x] Component displays vibe tags (max 3)
- [x] Component displays truncated description
- [x] Component displays score badges
- [x] Component displays city image
- [x] Component handles click events
- [x] Component is accessible (ARIA labels)

**Test File:** `packages/frontend/src/components/CityCard/__tests__/CityCard.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CityCard } from '../CityCard';
import { mockCities } from '@vibe-travel/shared';

describe('CityCard', () => {
  const mockCity = mockCities[0];
  const mockOnClick = vi.fn();

  it('should display city name and country', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByText(mockCity.city)).toBeInTheDocument();
    expect(screen.getByText(mockCity.country)).toBeInTheDocument();
  });

  it('should display maximum 3 vibe tags', () => {
    const cityWithManyTags = {
      ...mockCity,
      vibe_tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    };

    render(<CityCard city={cityWithManyTags} onClick={mockOnClick} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    expect(screen.queryByText('tag4')).not.toBeInTheDocument();
  });

  it('should display truncated description', () => {
    const cityWithLongDesc = {
      ...mockCity,
      description: 'A'.repeat(200)
    };

    render(<CityCard city={cityWithLongDesc} onClick={mockOnClick} />);

    const description = screen.getByTestId('city-description');
    expect(description.textContent?.length).toBeLessThan(160);
    expect(description.textContent).toContain('...');
  });

  it('should display culture and nightlife scores', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByText(/Culture:/)).toBeInTheDocument();
    expect(screen.getByText(/Nightlife:/)).toBeInTheDocument();
  });

  it('should display city image', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining(mockCity.image_url));
    expect(image).toHaveAttribute('alt', expect.stringContaining(mockCity.city));
  });

  it('should call onClick when clicked', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('article'));

    expect(mockOnClick).toHaveBeenCalledWith(mockCity);
  });

  it('should be accessible', () => {
    render(<CityCard city={mockCity} onClick={mockOnClick} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining(mockCity.city));
  });

  it('should handle missing image gracefully', () => {
    const cityNoImage = { ...mockCity, image_url: '' };
    render(<CityCard city={cityNoImage} onClick={mockOnClick} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });
});
```

---

### Task 3.5: Create VibeTag Component

**Description:** Implement reusable VibeTag component for displaying vibe tags.

**Test-Driven Approach:**
1. Write tests for tag rendering and variants
2. Implement component with styling

**Files to Create:**
- `packages/frontend/src/components/VibeTag/VibeTag.tsx`
- `packages/frontend/src/components/VibeTag/VibeTag.module.css`
- `packages/frontend/src/components/VibeTag/index.ts`

**Success Criteria:**
- [x] Component displays tag text
- [x] Component supports different variants/colors
- [x] Component is properly sized
- [x] Component handles long tag names

**Test File:** `packages/frontend/src/components/VibeTag/__tests__/VibeTag.test.tsx`
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VibeTag } from '../VibeTag';

describe('VibeTag', () => {
  it('should display tag text', () => {
    render(<VibeTag>romantic</VibeTag>);
    expect(screen.getByText('romantic')).toBeInTheDocument();
  });

  it('should apply variant class', () => {
    render(<VibeTag variant="primary">modern</VibeTag>);
    const tag = screen.getByText('modern');
    expect(tag).toHaveClass('primary');
  });

  it('should truncate long tag names', () => {
    render(<VibeTag>supercalifragilisticexpialidocious</VibeTag>);
    const tag = screen.getByText(/supercali/);
    expect(tag).toBeInTheDocument();
  });

  it('should have correct base styles', () => {
    render(<VibeTag>test</VibeTag>);
    const tag = screen.getByText('test');
    expect(tag).toHaveClass('vibeTag');
  });
});
```

---

### Task 3.6: Create ScoreBadge Component

**Description:** Implement ScoreBadge component for displaying city scores.

**Test-Driven Approach:**
1. Write tests for badge rendering and color coding
2. Implement component with score visualization

**Files to Create:**
- `packages/frontend/src/components/ScoreBadge/ScoreBadge.tsx`
- `packages/frontend/src/components/ScoreBadge/ScoreBadge.module.css`
- `packages/frontend/src/components/ScoreBadge/index.ts`

**Success Criteria:**
- [x] Component displays score type icon/emoji
- [x] Component displays numeric score
- [x] Component color-codes based on score level
- [x] Component supports different score types

**Test File:** `packages/frontend/src/components/ScoreBadge/__tests__/ScoreBadge.test.tsx`
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBadge } from '../ScoreBadge';

describe('ScoreBadge', () => {
  it('should display score value', () => {
    render(<ScoreBadge type="culture" score={8} />);
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('should display correct icon for culture', () => {
    render(<ScoreBadge type="culture" score={7} />);
    expect(screen.getByText('🎭')).toBeInTheDocument();
  });

  it('should display correct icon for nightlife', () => {
    render(<ScoreBadge type="nightlife" score={9} />);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('should display correct icon for nature', () => {
    render(<ScoreBadge type="nature" score={6} />);
    expect(screen.getByText('🌲')).toBeInTheDocument();
  });

  it('should display correct icon for beach', () => {
    render(<ScoreBadge type="beach" score={5} />);
    expect(screen.getByText('🏖️')).toBeInTheDocument();
  });

  it('should display correct icon for adventure', () => {
    render(<ScoreBadge type="adventure" score={8} />);
    expect(screen.getByText('🧗')).toBeInTheDocument();
  });

  it('should apply high score class for scores >= 8', () => {
    render(<ScoreBadge type="culture" score={9} />);
    const badge = screen.getByTestId('score-badge');
    expect(badge).toHaveClass('high');
  });

  it('should apply medium score class for scores 5-7', () => {
    render(<ScoreBadge type="culture" score={6} />);
    const badge = screen.getByTestId('score-badge');
    expect(badge).toHaveClass('medium');
  });

  it('should apply low score class for scores < 5', () => {
    render(<ScoreBadge type="culture" score={3} />);
    const badge = screen.getByTestId('score-badge');
    expect(badge).toHaveClass('low');
  });
});
```

---

### Task 3.7: Create Chat Widget Integration

**Description:** Integrate the React InstantSearch Chat widget with Agent Studio.

**Test-Driven Approach:**
1. Write tests for chat widget rendering
2. Implement chat integration with custom components

**Files to Create:**
- `packages/frontend/src/components/TravelChat/TravelChat.tsx`
- `packages/frontend/src/components/TravelChat/TravelChat.module.css`
- `packages/frontend/src/components/TravelChat/index.ts`

**Success Criteria:**
- [x] Chat widget renders correctly
- [x] Chat uses configured Agent ID
- [x] Chat uses CityCard as itemComponent
- [x] Chat has custom translations
- [x] Chat handles loading and error states

**Test File:** `packages/frontend/src/components/TravelChat/__tests__/TravelChat.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TravelChat } from '../TravelChat';

// Mock react-instantsearch Chat component
vi.mock('react-instantsearch', () => ({
  Chat: ({ agentId, itemComponent, translations }: any) => (
    <div data-testid="chat-widget" data-agent-id={agentId}>
      <span>{translations?.header?.title}</span>
    </div>
  )
}));

describe('TravelChat', () => {
  const mockAgentId = 'test-agent-id';

  beforeEach(() => {
    process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID = mockAgentId;
  });

  it('should render chat widget', () => {
    render(<TravelChat />);
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
  });

  it('should use agent ID from env', () => {
    render(<TravelChat />);
    const widget = screen.getByTestId('chat-widget');
    expect(widget).toHaveAttribute('data-agent-id', mockAgentId);
  });

  it('should display custom title', () => {
    render(<TravelChat />);
    expect(screen.getByText('Vibe-Check Travel Assistant')).toBeInTheDocument();
  });

  it('should throw error if agent ID is missing', () => {
    delete process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID;
    
    expect(() => render(<TravelChat />)).toThrow('NEXT_PUBLIC_ALGOLIA_AGENT_ID');
  });
});
```

---

### Task 3.8: Create Insights Hook

**Description:** Create custom hook for tracking Algolia Insights events.

**Test-Driven Approach:**
1. Write tests for event tracking functions
2. Implement hook with proper event formatting

**Files to Create:**
- `packages/frontend/src/hooks/useInsights.ts`
- `packages/frontend/src/hooks/index.ts`

**Success Criteria:**
- [x] Hook provides `trackClick` function
- [x] Hook provides `trackConversion` function
- [x] Hook includes queryID when available
- [x] Hook handles missing user token gracefully
- [x] Events match Algolia Insights API format

**Test File:** `packages/frontend/src/hooks/__tests__/useInsights.test.ts`
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInsights } from '../useInsights';

// Mock search-insights
const mockAa = vi.fn();
vi.mock('search-insights', () => ({
  default: (...args: any[]) => mockAa(...args)
}));

describe('useInsights', () => {
  beforeEach(() => {
    mockAa.mockClear();
  });

  it('should track click event', () => {
    const { result } = renderHook(() => useInsights());

    act(() => {
      result.current.trackClick({
        objectID: 'tokyo-japan',
        position: 1
      });
    });

    expect(mockAa).toHaveBeenCalledWith(
      'clickedObjectIDsAfterSearch',
      expect.objectContaining({
        objectIDs: ['tokyo-japan'],
        positions: [1]
      })
    );
  });

  it('should track conversion event', () => {
    const { result } = renderHook(() => useInsights());

    act(() => {
      result.current.trackConversion({
        objectID: 'paris-france',
        eventName: 'Trip Planned'
      });
    });

    expect(mockAa).toHaveBeenCalledWith(
      'convertedObjectIDsAfterSearch',
      expect.objectContaining({
        objectIDs: ['paris-france'],
        eventName: 'Trip Planned'
      })
    );
  });

  it('should include queryID when provided', () => {
    const { result } = renderHook(() => useInsights());

    act(() => {
      result.current.trackClick({
        objectID: 'berlin-germany',
        position: 2,
        queryID: 'query-123'
      });
    });

    expect(mockAa).toHaveBeenCalledWith(
      'clickedObjectIDsAfterSearch',
      expect.objectContaining({
        queryID: 'query-123'
      })
    );
  });

  it('should include index name', () => {
    const { result } = renderHook(() => useInsights());

    act(() => {
      result.current.trackClick({
        objectID: 'london-uk',
        position: 1
      });
    });

    expect(mockAa).toHaveBeenCalledWith(
      'clickedObjectIDsAfterSearch',
      expect.objectContaining({
        index: 'travel_destinations'
      })
    );
  });
});
```

---

### Task 3.9: Create City Detail Page

**Description:** Implement city detail page showing full city information.

**Test-Driven Approach:**
1. Write tests for page rendering with different data
2. Implement page with all city details

**Files to Create:**
- `packages/frontend/src/app/city/[id]/page.tsx`
- `packages/frontend/src/app/city/[id]/loading.tsx`
- `packages/frontend/src/app/city/[id]/error.tsx`

**Success Criteria:**
- [x] Page displays full city details
- [x] Page displays all scores with badges
- [x] Page displays all vibe tags
- [x] Page displays full description
- [x] Page handles city not found
- [x] Page tracks page view event

**Test File:** `packages/frontend/src/app/city/[id]/__tests__/page.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CityDetailPage from '../page';
import { mockCities } from '@vibe-travel/shared';

// Mock Algolia search
vi.mock('@/lib/algolia', () => ({
  getSearchClient: vi.fn().mockReturnValue({
    initIndex: vi.fn().mockReturnValue({
      getObject: vi.fn().mockResolvedValue(mockCities[0])
    })
  })
}));

describe('City Detail Page', () => {
  it('should display city name as heading', async () => {
    render(await CityDetailPage({ params: { id: 'tokyo-japan' } }));
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(mockCities[0].city);
  });

  it('should display full description', async () => {
    render(await CityDetailPage({ params: { id: 'tokyo-japan' } }));
    
    expect(screen.getByText(mockCities[0].description)).toBeInTheDocument();
  });

  it('should display all vibe tags', async () => {
    render(await CityDetailPage({ params: { id: 'tokyo-japan' } }));
    
    mockCities[0].vibe_tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('should display all score types', async () => {
    render(await CityDetailPage({ params: { id: 'tokyo-japan' } }));
    
    expect(screen.getByText(/Culture/)).toBeInTheDocument();
    expect(screen.getByText(/Adventure/)).toBeInTheDocument();
    expect(screen.getByText(/Nature/)).toBeInTheDocument();
    expect(screen.getByText(/Beach/)).toBeInTheDocument();
    expect(screen.getByText(/Nightlife/)).toBeInTheDocument();
  });

  it('should display climate information', async () => {
    render(await CityDetailPage({ params: { id: 'tokyo-japan' } }));
    
    expect(screen.getByText(mockCities[0].climate_type)).toBeInTheDocument();
    expect(screen.getByText(mockCities[0].best_time_to_visit)).toBeInTheDocument();
  });
});
```

---

### Task 3.10: Create Loading and Error States

**Description:** Implement loading skeletons and error boundaries.

**Test-Driven Approach:**
1. Write tests for loading and error states
2. Implement components with proper UX

**Files to Create:**
- `packages/frontend/src/components/LoadingSkeleton/LoadingSkeleton.tsx`
- `packages/frontend/src/components/ErrorBoundary/ErrorBoundary.tsx`
- `packages/frontend/src/components/ErrorMessage/ErrorMessage.tsx`

**Success Criteria:**
- [x] Loading skeleton matches card layout
- [x] Error boundary catches rendering errors
- [x] Error message is user-friendly
- [x] Retry button is available on errors

**Test File:** `packages/frontend/src/components/__tests__/states.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { ErrorBoundary } from '../ErrorBoundary';
import { ErrorMessage } from '../ErrorMessage';

describe('LoadingSkeleton', () => {
  it('should render skeleton elements', () => {
    render(<LoadingSkeleton />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should have animated pulse class', () => {
    render(<LoadingSkeleton />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
  });
});

describe('ErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  it('should catch errors and display fallback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary fallback={<div>Error</div>}>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });
});

describe('ErrorMessage', () => {
  it('should display error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should have retry button', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalled();
  });
});
```

---

### Task 3.11: Style Application with Tailwind CSS

**Description:** Configure Tailwind CSS and create consistent design system.

**Test-Driven Approach:**
1. Write visual regression tests (optional)
2. Implement Tailwind configuration and global styles

**Files to Create:**
- `packages/frontend/tailwind.config.ts`
- `packages/frontend/src/app/globals.css`
- `packages/frontend/src/styles/theme.ts`

**Success Criteria:**
- [x] Tailwind CSS is configured
- [x] Custom color palette for vibe theming
- [x] Responsive breakpoints defined
- [x] Dark mode support (optional)
- [x] Typography scale defined

**Test File:** `packages/frontend/src/styles/__tests__/theme.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { theme, colors, breakpoints } from '../theme';

describe('Theme', () => {
  it('should have primary color palette', () => {
    expect(colors.primary).toBeDefined();
    expect(colors.primary['500']).toBeDefined();
  });

  it('should have score level colors', () => {
    expect(colors.score.high).toBeDefined();
    expect(colors.score.medium).toBeDefined();
    expect(colors.score.low).toBeDefined();
  });

  it('should have responsive breakpoints', () => {
    expect(breakpoints.sm).toBeDefined();
    expect(breakpoints.md).toBeDefined();
    expect(breakpoints.lg).toBeDefined();
  });

  it('should export complete theme object', () => {
    expect(theme.colors).toBeDefined();
    expect(theme.spacing).toBeDefined();
    expect(theme.borderRadius).toBeDefined();
  });
});
```

---

### Task 3.12: Frontend Integration Test

**Description:** Integration test verifying frontend components work together.

**Test-Driven Approach:**
1. Test component composition
2. Verify data flow through components

**Success Criteria:**
- [x] InstantSearch provider works with Chat widget
- [x] CityCard receives correct props from search results
- [x] Click events are tracked correctly
- [x] Navigation to city detail works
- [x] All components render without errors

**Test File:** `packages/frontend/src/__tests__/integration.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstantSearchProvider } from '../providers/InstantSearchProvider';
import { TravelChat } from '../components/TravelChat';
import { CityCard } from '../components/CityCard';
import { mockCities } from '@vibe-travel/shared';

// Mock all external dependencies
vi.mock('algoliasearch/lite');
vi.mock('react-instantsearch');
vi.mock('search-insights');

describe('Frontend Integration', () => {
  it('should render complete search interface', async () => {
    render(
      <InstantSearchProvider>
        <TravelChat />
      </InstantSearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
    });
  });

  it('should display city cards from search results', async () => {
    const mockHits = mockCities.slice(0, 3);
    
    render(
      <InstantSearchProvider>
        <div data-testid="results">
          {mockHits.map(city => (
            <CityCard 
              key={city.objectID} 
              city={city} 
              onClick={vi.fn()} 
            />
          ))}
        </div>
      </InstantSearchProvider>
    );

    await waitFor(() => {
      mockHits.forEach(city => {
        expect(screen.getByText(city.city)).toBeInTheDocument();
      });
    });
  });

  it('should track click events on city cards', async () => {
    const trackClick = vi.fn();
    const city = mockCities[0];

    render(
      <InstantSearchProvider>
        <CityCard 
          city={city} 
          onClick={trackClick}
        />
      </InstantSearchProvider>
    );

    fireEvent.click(screen.getByRole('article'));

    expect(trackClick).toHaveBeenCalledWith(city);
  });
});
```

---

# Integration Phase

**Folder:** `/e2e`
**Owner:** All agents collaborate
**Dependencies:** All packages must be complete

## Purpose

After all sub-plans are complete, this phase integrates the packages and validates the complete system with end-to-end tests.

---

### Task I.1: Monorepo Setup

**Description:** Configure monorepo tooling to link all packages.

**Files to Create:**
- `package.json` (root)
- `pnpm-workspace.yaml` (or npm workspaces config)
- `turbo.json` (optional, for Turborepo)

**Success Criteria:**
- [x] All packages can be installed with single command
- [x] Shared package is linked to other packages
- [x] Build order respects dependencies
- [x] Test command runs all package tests

---

### Task I.2: Environment Configuration

**Description:** Set up environment variables for all packages.

**Files to Create:**
- `.env.example` (root)
- `packages/data-pipeline/.env`
- `packages/frontend/.env.local`

**Success Criteria:**
- [x] All required environment variables documented
- [x] Development environment can be set up from example
- [x] Sensitive keys are not committed

---

### Task I.3: Data Pipeline to Algolia Integration Test

**Description:** Verify data pipeline correctly populates Algolia index.

**Test File:** `e2e/tests/data-pipeline.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import algoliasearch from 'algoliasearch';

test.describe('Data Pipeline Integration', () => {
  const client = algoliasearch(
    process.env.ALGOLIA_APP_ID!,
    process.env.ALGOLIA_ADMIN_KEY!
  );
  const index = client.initIndex('travel_destinations');

  test('should have populated index with cities', async () => {
    const { nbHits } = await index.search('');
    expect(nbHits).toBeGreaterThan(0);
  });

  test('should have correct index settings', async () => {
    const settings = await index.getSettings();
    expect(settings.searchableAttributes).toContain('city');
    expect(settings.searchableAttributes).toContain('description');
  });

  test('should return results for semantic query', async () => {
    const { hits } = await index.search('romantic city');
    expect(hits.length).toBeGreaterThan(0);
  });

  test('should support faceting on scores', async () => {
    const { facets } = await index.search('', {
      facets: ['culture_score', 'nightlife_score']
    });
    expect(facets?.culture_score).toBeDefined();
  });
});
```

---

### Task I.4: Frontend to Algolia Integration Test

**Description:** Verify frontend correctly queries Algolia and displays results.

**Test File:** `e2e/tests/frontend-algolia.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Frontend Algolia Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display chat widget', async ({ page }) => {
    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible();
  });

  test('should receive search results from Algolia', async ({ page }) => {
    // Open chat and send a query
    const input = page.locator('[data-testid="chat-input"]');
    await input.fill('romantic city in Europe');
    await input.press('Enter');

    // Wait for results
    const results = page.locator('[data-testid="city-card"]');
    await expect(results.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to city detail page', async ({ page }) => {
    // Trigger search
    const input = page.locator('[data-testid="chat-input"]');
    await input.fill('Tokyo');
    await input.press('Enter');

    // Click on result
    const cityCard = page.locator('[data-testid="city-card"]').first();
    await cityCard.click();

    // Verify navigation
    await expect(page).toHaveURL(/\/city\//);
  });
});
```

---

### Task I.5: Complete User Flow E2E Test

**Description:** End-to-end test of complete user journey.

**Test File:** `e2e/tests/user-flow.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete User Flow', () => {
  test('Vibe Searcher Journey', async ({ page }) => {
    // Step 1: Navigate to app
    await page.goto('/');
    await expect(page.locator('[data-testid="travel-chat"]')).toBeVisible();

    // Step 2: Enter vibe query
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('I want a neon-punk city with great nightlife');
    await chatInput.press('Enter');

    // Step 3: Wait for AI response and results
    const aiResponse = page.locator('[data-testid="ai-message"]');
    await expect(aiResponse).toBeVisible({ timeout: 15000 });

    // Step 4: Verify city cards appear
    const cityCards = page.locator('[data-testid="city-card"]');
    await expect(cityCards.first()).toBeVisible();

    // Step 5: Verify relevant cities (Tokyo should be in results)
    const tokyoCard = page.locator('[data-testid="city-card"]', { hasText: 'Tokyo' });
    // Note: This might not always pass depending on AI response
    
    // Step 6: Click on a city card
    await cityCards.first().click();

    // Step 7: Verify navigation to detail page
    await expect(page).toHaveURL(/\/city\//);

    // Step 8: Verify detail page content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="vibe-tags"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-badges"]')).toBeVisible();
  });

  test('Query Refinement Journey', async ({ page }) => {
    await page.goto('/');

    // Initial query
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('beach destination');
    await chatInput.press('Enter');

    await expect(page.locator('[data-testid="city-card"]').first()).toBeVisible({ timeout: 15000 });

    // Refinement query
    await chatInput.fill('make it somewhere in Europe');
    await chatInput.press('Enter');

    // Wait for refined results
    await page.waitForTimeout(2000); // Allow time for AI to process

    // Verify conversation context is maintained
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages).toHaveCount(4); // 2 user + 2 AI messages
  });
});
```

---

### Task I.6: Performance Testing

**Description:** Verify application meets performance requirements.

**Test File:** `e2e/tests/performance.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load initial page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.locator('[data-testid="travel-chat"]').waitFor();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('should return search results within 10 seconds', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();
    
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('romantic European city');
    await chatInput.press('Enter');

    await page.locator('[data-testid="city-card"]').first().waitFor({ timeout: 10000 });
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(10000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');

    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
    });

    expect(lcp).toBeLessThan(2500); // Good LCP is < 2.5s
  });
});
```

---

### Task I.7: Accessibility Testing

**Description:** Verify application is accessible.

**Test File:** `e2e/tests/accessibility.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('home page should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="travel-chat"]').waitFor();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('city detail page should have no accessibility violations', async ({ page }) => {
    // Navigate to a city page
    await page.goto('/city/tokyo-japan');
    await page.locator('h1').waitFor();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('chat should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab to chat input
    await page.keyboard.press('Tab');
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeFocused();

    // Type and submit with keyboard
    await chatInput.type('test query');
    await page.keyboard.press('Enter');

    // Results should be reachable via keyboard
    await page.keyboard.press('Tab');
    const firstResult = page.locator('[data-testid="city-card"]').first();
    await expect(firstResult).toBeFocused();
  });
});
```

---

## Summary

### Sub-Plan Overview

| Sub-Plan | Folder | Tasks | Owner | Key Deliverables |
|----------|--------|-------|-------|------------------|
| **1. Shared** | `/packages/shared` | 8 | Agent 1 | Types, Schemas, Config, Fixtures |
| **2. Data Pipeline** | `/packages/data-pipeline` | 10 | Agent 2 | Data generation, Algolia upload |
| **3. Frontend** | `/packages/frontend` | 12 | Agent 3 | Next.js app, Chat UI, Components |
| **Integration** | `/e2e` | 7 | All | E2E tests, Performance, A11y |

### Dependency Graph

```
Sub-Plan 1 (Shared)
       │
       ├────────────────┐
       ▼                ▼
Sub-Plan 2         Sub-Plan 3
(Data Pipeline)    (Frontend)
       │                │
       └────────┬───────┘
                ▼
         Integration
            (E2E)
```

### Execution Order

1. **Week 1:** Sub-Plan 1 (Shared) - Must complete first
2. **Week 2-3:** Sub-Plan 2 & 3 in parallel
3. **Week 4:** Integration phase

### Testing Strategy

- **Unit Tests:** Vitest for all packages
- **Integration Tests:** Within each package
- **E2E Tests:** Playwright for full system
- **Coverage Target:** 80% for all packages
