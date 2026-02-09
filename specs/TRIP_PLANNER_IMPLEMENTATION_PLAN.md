# Trip Planner Implementation Plan

## Test-Driven Development (TDD) Implementation Strategy

**Reference PRD:** [contextual_travel_builder.md](./contextual_travel_builder.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Testing Strategy](#2-testing-strategy)
3. [Phase 0: Testing Infrastructure](#phase-0-testing-infrastructure)
4. [Phase 1: Data Models & Types](#phase-1-data-models--types)
5. [Phase 2: Trip Setup Wizard](#phase-2-trip-setup-wizard)
6. [Phase 3: Itinerary Builder Core](#phase-3-itinerary-builder-core)
7. [Phase 4: Neighborhood Explorer](#phase-4-neighborhood-explorer)
8. [Phase 5: Activity Discovery](#phase-5-activity-discovery)
9. [Phase 6: Budget Tracker](#phase-6-budget-tracker)
10. [Phase 7: AI Planning Agent](#phase-7-ai-planning-agent)
11. [Phase 8: Collaboration Features](#phase-8-collaboration-features)
12. [Phase 9: Export & Offline](#phase-9-export--offline)
13. [Phase 10: Integration & E2E Testing](#phase-10-integration--e2e-testing)
14. [Validation Checklist](#validation-checklist)

---

## 1. Overview

### Project Scope

Transform the existing city detail page (`/city/{city-slug}`) into a comprehensive trip planning experience (`/plan/{city-slug}`).

### TDD Principles

Every task follows the **Red-Green-Refactor** cycle:

```
1. RED:    Write a failing test that defines expected behavior
2. GREEN:  Write minimal code to make the test pass
3. REFACTOR: Improve code while keeping tests green
```

### Definition of Done (DoD)

A task is complete when:

- [ ] All unit tests pass (>80% coverage for new code)
- [ ] Integration tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Component renders without errors
- [ ] Accessibility audit passes (axe-core)
- [ ] Performance budget met (<100ms render time)

---

## 2. Testing Strategy

### 2.1 Testing Pyramid

```
                    ┌──────────┐
                    │   E2E    │  ~10% (Critical user flows)
                    │Playwright│
                   ┌┴──────────┴┐
                   │ Integration │  ~20% (Component + API)
                   │   Vitest    │
                  ┌┴─────────────┴┐
                  │     Unit      │  ~70% (Functions, Utils)
                  │    Vitest     │
                  └───────────────┘
```

### 2.2 Test File Conventions

```
packages/
├── shared/src/
│   ├── types/
│   │   └── trip.ts
│   └── types/__tests__/
│       └── trip.test.ts          # Unit tests for types
├── frontend/src/
│   ├── components/TripWizard/
│   │   ├── TripWizard.tsx
│   │   ├── TripWizard.module.css
│   │   └── __tests__/
│   │       └── TripWizard.test.tsx  # Component tests
│   ├── services/
│   │   ├── trip.service.ts
│   │   └── __tests__/
│   │       └── trip.service.test.ts # Service unit tests
│   └── hooks/
│       ├── useTripPlanner.ts
│       └── __tests__/
│           └── useTripPlanner.test.ts
└── e2e/tests/
    └── trip-planner.spec.ts      # E2E tests
```

### 2.3 Algolia Mocking Strategy

Create reusable mocks for Algolia operations:

```typescript
// packages/frontend/src/test/mocks/algolia.mock.ts
export const mockAlgoliaSearch = vi.fn();
export const mockGeoSearch = vi.fn();

export const createMockSearchResponse = (hits: unknown[]) => ({
  results: [{ hits, nbHits: hits.length, page: 0 }]
});

export const createMockGeoHit = (overrides = {}) => ({
  objectID: 'poi_001',
  name: 'Test POI',
  _geoloc: { lat: 25.2048, lng: 55.2708 },
  category: 'cafe',
  rating: 4.5,
  ...overrides
});
```

### 2.4 Test Data Fixtures

```typescript
// packages/shared/src/fixtures/trip.fixture.ts
export const mockTripSetup = {
  destinationId: 'dubai-uae',
  dates: { start: '2026-03-15', end: '2026-03-22' },
  travelers: { adults: 2, children: 0 },
  budgetLevel: 'moderate' as const,
  tripStyle: ['Cultural Immersion', 'Food & Culinary'],
  pace: 'moderate' as const,
  interests: ['architecture', 'food', 'history'],
  mobility: 'full' as const,
};

export const mockItineraryDay = {
  date: new Date('2026-03-15'),
  dayNumber: 1,
  theme: 'Old Dubai & Cultural Heritage',
  activities: [/* ... */],
  estimatedCost: 150,
};
```

---

## Phase 0: Testing Infrastructure

### Task 0.1: Setup Trip Planner Test Utilities

**Priority:** P0 (Blocker)
**Estimated Effort:** 2 hours

#### Test First (RED)

```typescript
// packages/frontend/src/test/trip-test-utils.test.ts
import { describe, it, expect } from 'vitest';
import { renderWithTripContext, mockTripPlannerStore } from './trip-test-utils';

describe('Trip Test Utilities', () => {
  it('should render component with TripContext provider', () => {
    const { getByTestId } = renderWithTripContext(<div data-testid="test" />);
    expect(getByTestId('test')).toBeInTheDocument();
  });

  it('should provide mock trip planner store', () => {
    const store = mockTripPlannerStore();
    expect(store.trip).toBeDefined();
    expect(store.setTrip).toBeInstanceOf(Function);
  });

  it('should allow overriding default trip state', () => {
    const store = mockTripPlannerStore({
      trip: { destinationId: 'paris-france' }
    });
    expect(store.trip.destinationId).toBe('paris-france');
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/test/trip-test-utils.tsx`:
- Custom render function with TripContext
- Mock store factory
- Mock Algolia client factory
- Common test fixtures

#### Validation Criteria

- [ ] All test utility tests pass
- [ ] Can render components with mock trip context
- [ ] Can mock Algolia search responses
- [ ] Utilities are typed correctly

---

### Task 0.2: Setup Algolia Mock Server for Integration Tests

**Priority:** P0 (Blocker)
**Estimated Effort:** 3 hours

#### Test First (RED)

```typescript
// packages/frontend/src/test/algolia-mock.test.ts
describe('Algolia Mock Server', () => {
  it('should return mock geo-search results within radius', async () => {
    const results = await mockAlgoliaGeoSearch({
      aroundLatLng: '25.2048, 55.2708',
      aroundRadius: 1000,
      filters: 'category:cafe'
    });

    expect(results.hits).toHaveLength(5);
    results.hits.forEach(hit => {
      expect(hit._geoloc).toBeDefined();
      expect(hit.category).toBe('cafe');
    });
  });

  it('should filter POIs by multiple categories', async () => {
    const results = await mockAlgoliaGeoSearch({
      filters: 'category:restaurant OR category:cafe'
    });

    results.hits.forEach(hit => {
      expect(['restaurant', 'cafe']).toContain(hit.category);
    });
  });

  it('should sort results by distance', async () => {
    const results = await mockAlgoliaGeoSearch({
      aroundLatLng: '25.2048, 55.2708',
      getRankingInfo: true
    });

    const distances = results.hits.map(h => h._rankingInfo.geoDistance);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });
});
```

#### Implementation (GREEN)

Create mock server in `packages/frontend/src/test/algolia-mock-server.ts`:
- Mock search endpoint
- Mock geo-search with distance calculation
- Mock facet filtering
- Response delay simulation for loading states

#### Validation Criteria

- [ ] Mock server handles geo-search queries
- [ ] Distance calculations are accurate
- [ ] Filter logic works correctly
- [ ] Can simulate network delays

---

## Phase 1: Data Models & Types

### Task 1.1: Define Core Trip Types

**Priority:** P0 (Blocker)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/shared/src/types/__tests__/trip.test.ts
import { describe, it, expect } from 'vitest';
import { tripSchema, tripSetupSchema, itineraryDaySchema } from '../trip';
import { mockTripSetup, mockItineraryDay } from '../../fixtures/trip.fixture';

describe('Trip Types & Schemas', () => {
  describe('TripSetup Schema', () => {
    it('should validate valid trip setup', () => {
      const result = tripSetupSchema.safeParse(mockTripSetup);
      expect(result.success).toBe(true);
    });

    it('should reject trip with end date before start date', () => {
      const invalid = {
        ...mockTripSetup,
        dates: { start: '2026-03-22', end: '2026-03-15' }
      };
      const result = tripSetupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should require at least one adult traveler', () => {
      const invalid = {
        ...mockTripSetup,
        travelers: { adults: 0, children: 2 }
      };
      const result = tripSetupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate budget level enum', () => {
      const invalid = { ...mockTripSetup, budgetLevel: 'invalid' };
      const result = tripSetupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should allow optional mobility field', () => {
      const { mobility, ...withoutMobility } = mockTripSetup;
      const result = tripSetupSchema.safeParse(withoutMobility);
      expect(result.success).toBe(true);
    });
  });

  describe('ItineraryDay Schema', () => {
    it('should validate valid itinerary day', () => {
      const result = itineraryDaySchema.safeParse(mockItineraryDay);
      expect(result.success).toBe(true);
    });

    it('should require at least one activity per day', () => {
      const invalid = { ...mockItineraryDay, activities: [] };
      const result = itineraryDaySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate activity time format', () => {
      const invalidActivity = {
        ...mockItineraryDay,
        activities: [{
          ...mockItineraryDay.activities[0],
          startTime: 'invalid-time'
        }]
      };
      const result = itineraryDaySchema.safeParse(invalidActivity);
      expect(result.success).toBe(false);
    });
  });

  describe('Trip Schema', () => {
    it('should calculate total days from date range', () => {
      const trip = createTrip(mockTripSetup);
      expect(trip.totalDays).toBe(7);
    });

    it('should generate unique trip ID', () => {
      const trip1 = createTrip(mockTripSetup);
      const trip2 = createTrip(mockTripSetup);
      expect(trip1.id).not.toBe(trip2.id);
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/shared/src/types/trip.ts`:

```typescript
import { z } from 'zod';

export const budgetLevelSchema = z.enum(['budget', 'moderate', 'luxury', 'unlimited']);
export type BudgetLevel = z.infer<typeof budgetLevelSchema>;

export const paceSchema = z.enum(['relaxed', 'moderate', 'packed']);
export type Pace = z.infer<typeof paceSchema>;

export const mobilitySchema = z.enum(['full', 'limited', 'wheelchair']);
export type Mobility = z.infer<typeof mobilitySchema>;

export const tripStyleOptions = [
  'Cultural Immersion',
  'Adventure & Outdoors',
  'Food & Culinary',
  'Relaxation & Wellness',
  'Nightlife & Entertainment',
  'Shopping & Markets',
  'Photography & Sightseeing',
  'Family-Friendly',
  'Romantic Getaway',
  'Business + Leisure',
] as const;

export const travelersSchema = z.object({
  adults: z.number().min(1, 'At least one adult required'),
  children: z.number().min(0).default(0),
  childrenAges: z.array(z.number().min(0).max(17)).optional(),
});

export const tripSetupSchema = z.object({
  destinationId: z.string().min(1),
  dates: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).refine(
    data => new Date(data.end) > new Date(data.start),
    'End date must be after start date'
  ),
  travelers: travelersSchema,
  budgetLevel: budgetLevelSchema,
  tripStyle: z.array(z.enum(tripStyleOptions)).min(1),
  pace: paceSchema,
  interests: z.array(z.string()).optional(),
  mobility: mobilitySchema.optional().default('full'),
});

// ... complete implementation
```

#### Validation Criteria

- [ ] All schema tests pass
- [ ] Types are exported correctly
- [ ] Schemas validate edge cases
- [ ] Type inference works in IDE

---

### Task 1.2: Define Activity & POI Types

**Priority:** P0 (Blocker)
**Estimated Effort:** 3 hours

#### Test First (RED)

```typescript
// packages/shared/src/types/__tests__/activity.test.ts
describe('Activity Types & Schemas', () => {
  describe('Activity Schema', () => {
    it('should validate activity with required fields', () => {
      const result = activitySchema.safeParse(mockActivity);
      expect(result.success).toBe(true);
    });

    it('should validate price object structure', () => {
      const activity = {
        ...mockActivity,
        price: { amount: 75, currency: 'USD', per: 'person' }
      };
      expect(activitySchema.safeParse(activity).success).toBe(true);
    });

    it('should validate geo-location format', () => {
      const activity = {
        ...mockActivity,
        _geoloc: { lat: 91, lng: 55 } // Invalid latitude
      };
      expect(activitySchema.safeParse(activity).success).toBe(false);
    });

    it('should validate duration is positive', () => {
      const activity = { ...mockActivity, duration_hours: -1 };
      expect(activitySchema.safeParse(activity).success).toBe(false);
    });
  });

  describe('POI Schema', () => {
    it('should validate POI with opening hours', () => {
      const poi = {
        ...mockPOI,
        opening_hours: {
          monday: '07:00-18:00',
          tuesday: '07:00-18:00',
        }
      };
      expect(poiSchema.safeParse(poi).success).toBe(true);
    });

    it('should validate POI category', () => {
      const validCategories = ['cafe', 'restaurant', 'museum', 'pharmacy'];
      validCategories.forEach(category => {
        const poi = { ...mockPOI, category };
        expect(poiSchema.safeParse(poi).success).toBe(true);
      });
    });
  });

  describe('ScheduledActivity Schema', () => {
    it('should validate start time format (HH:mm)', () => {
      const valid = { ...mockScheduledActivity, startTime: '14:30' };
      expect(scheduledActivitySchema.safeParse(valid).success).toBe(true);

      const invalid = { ...mockScheduledActivity, startTime: '2:30 PM' };
      expect(scheduledActivitySchema.safeParse(invalid).success).toBe(false);
    });

    it('should require duration in minutes', () => {
      const activity = { ...mockScheduledActivity, duration: 120 };
      expect(scheduledActivitySchema.safeParse(activity).success).toBe(true);
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/shared/src/types/activity.ts` with:
- Activity schema with price, availability, geo-location
- POI schema with categories, opening hours
- ScheduledActivity schema for itinerary items

#### Validation Criteria

- [ ] All activity type tests pass
- [ ] Geo-location validation works
- [ ] Price structure is flexible
- [ ] Opening hours parsing works

---

### Task 1.3: Define Budget Types

**Priority:** P1 (High)
**Estimated Effort:** 2 hours

#### Test First (RED)

```typescript
// packages/shared/src/types/__tests__/trip-budget.test.ts
describe('Trip Budget Types', () => {
  it('should calculate total from category costs', () => {
    const budget = createTripBudget({
      accommodation: { min: 500, max: 700 },
      activities: { min: 200, max: 400 },
      food: { min: 300, max: 500 },
      transport: { min: 100, max: 150 },
    });

    expect(budget.total.min).toBe(1100);
    expect(budget.total.max).toBe(1750);
  });

  it('should determine budget status', () => {
    const underBudget = createTripBudget({ /* ... */ }, { limit: 2000 });
    expect(underBudget.status).toBe('under');

    const overBudget = createTripBudget({ /* ... */ }, { limit: 500 });
    expect(overBudget.status).toBe('over');
  });

  it('should identify savings opportunities', () => {
    const budget = analyzeBudgetOpportunities(mockTrip);
    expect(budget.savingsOpportunities).toBeInstanceOf(Array);
    budget.savingsOpportunities.forEach(opp => {
      expect(opp.savings).toBeGreaterThan(0);
      expect(opp.category).toBeDefined();
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/shared/src/types/trip-budget.ts`

#### Validation Criteria

- [ ] Budget calculation tests pass
- [ ] Status determination works
- [ ] Types integrate with existing budget types

---

## Phase 2: Trip Setup Wizard

### Task 2.1: Create TripSetupWizard Component Shell

**Priority:** P0 (Blocker)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/TripSetupWizard/__tests__/TripSetupWizard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TripSetupWizard } from '../TripSetupWizard';

describe('TripSetupWizard', () => {
  const mockDestination = {
    objectID: 'dubai-uae',
    city: 'Dubai',
    country: 'United Arab Emirates',
  };

  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render wizard container', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );
      expect(screen.getByTestId('trip-setup-wizard')).toBeInTheDocument();
    });

    it('should display destination name in header', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );
      expect(screen.getByText(/Dubai/)).toBeInTheDocument();
    });

    it('should render step indicators', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );
      expect(screen.getByTestId('wizard-steps')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(4); // Dates, Travelers, Style, Review
    });

    it('should start on first step (dates)', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );
      expect(screen.getByTestId('step-dates')).toBeVisible();
    });
  });

  describe('Navigation', () => {
    it('should navigate to next step on continue', async () => {
      const user = userEvent.setup();
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      // Fill required date fields
      await user.click(screen.getByLabelText(/start date/i));
      await user.click(screen.getByText('15')); // Select 15th
      await user.click(screen.getByLabelText(/end date/i));
      await user.click(screen.getByText('22'));

      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-travelers')).toBeVisible();
      });
    });

    it('should navigate back to previous step', async () => {
      const user = userEvent.setup();
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={1}
        />
      );

      await user.click(screen.getByRole('button', { name: /back/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-dates')).toBeVisible();
      });
    });

    it('should disable continue when step is invalid', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByRole('form')).toHaveAttribute('aria-label', expect.stringContaining('trip'));
    });

    it('should manage focus when navigating steps', async () => {
      const user = userEvent.setup();
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={0}
        />
      );

      // Complete step 1
      // ... fill dates
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        // First focusable element in new step should have focus
        expect(document.activeElement).toBe(screen.getByLabelText(/adults/i));
      });
    });

    it('should announce step changes to screen readers', async () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/TripSetupWizard/TripSetupWizard.tsx`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import type { TripSetup } from '@vibe-travel/shared';
import styles from './TripSetupWizard.module.css';

interface TripSetupWizardProps {
  destination: { objectID: string; city: string; country: string };
  onComplete: (setup: TripSetup) => void;
  onCancel?: () => void;
  initialStep?: number;
}

const STEPS = ['dates', 'travelers', 'style', 'review'] as const;

export function TripSetupWizard({
  destination,
  onComplete,
  onCancel,
  initialStep = 0,
}: TripSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<Partial<TripSetup>>({
    destinationId: destination.objectID,
  });

  // Implementation...
}
```

#### Validation Criteria

- [ ] All wizard shell tests pass
- [ ] Component renders step indicators
- [ ] Navigation between steps works
- [ ] Accessibility requirements met
- [ ] No TypeScript errors

---

### Task 2.2: Implement DateRangePicker Step

**Priority:** P0 (Blocker)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/TripSetupWizard/__tests__/DateRangeStep.test.tsx
describe('DateRangeStep', () => {
  it('should render date range picker', () => {
    render(<DateRangeStep onChange={vi.fn()} />);
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it('should not allow selecting past dates', async () => {
    const user = userEvent.setup();
    render(<DateRangeStep onChange={vi.fn()} />);

    await user.click(screen.getByLabelText(/start date/i));

    // Past dates should be disabled
    const pastDate = screen.getByText('1'); // Assuming it's past
    expect(pastDate).toHaveAttribute('aria-disabled', 'true');
  });

  it('should auto-set end date when start is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DateRangeStep onChange={onChange} defaultDuration={7} />);

    await user.click(screen.getByLabelText(/start date/i));
    await user.click(screen.getByText('15'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        end: expect.any(String) // 7 days after start
      })
    );
  });

  it('should validate minimum trip duration (1 day)', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DateRangeStep onChange={onChange} />);

    // Select same day for start and end
    await user.click(screen.getByLabelText(/start date/i));
    await user.click(screen.getByText('15'));
    await user.click(screen.getByLabelText(/end date/i));
    await user.click(screen.getByText('15'));

    expect(screen.getByText(/minimum 1 day/i)).toBeInTheDocument();
  });

  it('should display trip duration', async () => {
    render(
      <DateRangeStep
        onChange={vi.fn()}
        value={{ start: '2026-03-15', end: '2026-03-22' }}
      />
    );

    expect(screen.getByText(/7 days/i)).toBeInTheDocument();
  });

  it('should show best time to visit hint', () => {
    render(
      <DateRangeStep
        onChange={vi.fn()}
        bestTimeToVisit="November to March"
      />
    );

    expect(screen.getByText(/best time.*november to march/i)).toBeInTheDocument();
  });
});
```

#### Implementation (GREEN)

Create `DateRangeStep.tsx` component with:
- Calendar date picker (use react-day-picker or similar)
- Min/max date validation
- Duration calculation
- Best time hint display

#### Validation Criteria

- [ ] All date picker tests pass
- [ ] Calendar is accessible (keyboard navigation)
- [ ] Past dates disabled
- [ ] Duration calculated correctly
- [ ] Mobile-friendly touch targets

---

### Task 2.3: Implement TravelerSelector Step

**Priority:** P0 (Blocker)
**Estimated Effort:** 3 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/TripSetupWizard/__tests__/TravelerStep.test.tsx
describe('TravelerStep', () => {
  it('should render adult and children counters', () => {
    render(<TravelerStep onChange={vi.fn()} />);
    expect(screen.getByLabelText(/adults/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/children/i)).toBeInTheDocument();
  });

  it('should default to 1 adult', () => {
    render(<TravelerStep onChange={vi.fn()} />);
    expect(screen.getByTestId('adult-count')).toHaveTextContent('1');
  });

  it('should not allow 0 adults', async () => {
    const user = userEvent.setup();
    render(<TravelerStep onChange={vi.fn()} />);

    const decrementAdult = screen.getByRole('button', { name: /decrease adults/i });
    await user.click(decrementAdult);

    expect(screen.getByTestId('adult-count')).toHaveTextContent('1');
  });

  it('should prompt for children ages when children > 0', async () => {
    const user = userEvent.setup();
    render(<TravelerStep onChange={vi.fn()} />);

    const incrementChildren = screen.getByRole('button', { name: /increase children/i });
    await user.click(incrementChildren);

    expect(screen.getByLabelText(/child 1 age/i)).toBeInTheDocument();
  });

  it('should limit maximum travelers', () => {
    render(<TravelerStep onChange={vi.fn()} maxTravelers={10} />);

    // Assuming we start with 1 adult, max 9 more
    const incrementAdult = screen.getByRole('button', { name: /increase adults/i });
    for (let i = 0; i < 15; i++) {
      fireEvent.click(incrementAdult);
    }

    expect(screen.getByTestId('adult-count')).toHaveTextContent('10');
  });

  it('should call onChange with updated travelers', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TravelerStep onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /increase adults/i }));

    expect(onChange).toHaveBeenCalledWith({
      adults: 2,
      children: 0,
      childrenAges: []
    });
  });
});
```

#### Implementation (GREEN)

Create `TravelerStep.tsx` with counter controls and age inputs.

#### Validation Criteria

- [ ] All traveler tests pass
- [ ] Counter controls work correctly
- [ ] Children ages prompt appears
- [ ] Max travelers enforced

---

### Task 2.4: Implement PreferenceSelector Step

**Priority:** P0 (Blocker)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/TripSetupWizard/__tests__/PreferenceStep.test.tsx
describe('PreferenceStep', () => {
  describe('Budget Level', () => {
    it('should render all budget options', () => {
      render(<PreferenceStep onChange={vi.fn()} />);

      expect(screen.getByRole('radio', { name: /budget/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /moderate/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /luxury/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /unlimited/i })).toBeInTheDocument();
    });

    it('should show estimated daily cost for each option', () => {
      render(<PreferenceStep onChange={vi.fn()} destination="dubai-uae" />);

      expect(screen.getByText(/\$50-100\/day/)).toBeInTheDocument(); // Budget
      expect(screen.getByText(/\$100-200\/day/)).toBeInTheDocument(); // Moderate
    });
  });

  describe('Trip Style', () => {
    it('should render all trip style options', () => {
      render(<PreferenceStep onChange={vi.fn()} />);

      expect(screen.getByRole('checkbox', { name: /cultural immersion/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /food & culinary/i })).toBeInTheDocument();
    });

    it('should allow multiple style selections', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<PreferenceStep onChange={onChange} />);

      await user.click(screen.getByRole('checkbox', { name: /cultural/i }));
      await user.click(screen.getByRole('checkbox', { name: /food/i }));

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          tripStyle: expect.arrayContaining(['Cultural Immersion', 'Food & Culinary'])
        })
      );
    });

    it('should require at least one style selection', () => {
      render(<PreferenceStep onChange={vi.fn()} />);

      expect(screen.getByText(/select at least one/i)).toBeInTheDocument();
    });
  });

  describe('Pace Selection', () => {
    it('should render pace options', () => {
      render(<PreferenceStep onChange={vi.fn()} />);

      expect(screen.getByRole('radio', { name: /relaxed/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /moderate/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /packed/i })).toBeInTheDocument();
    });

    it('should show activities per day for each pace', () => {
      render(<PreferenceStep onChange={vi.fn()} />);

      expect(screen.getByText(/2-3 activities\/day/i)).toBeInTheDocument(); // Relaxed
      expect(screen.getByText(/4-5 activities\/day/i)).toBeInTheDocument(); // Moderate
      expect(screen.getByText(/6-8 activities\/day/i)).toBeInTheDocument(); // Packed
    });
  });

  describe('Accessibility', () => {
    it('should have accessible mobility options', () => {
      render(<PreferenceStep onChange={vi.fn()} showAccessibility />);

      expect(screen.getByRole('radio', { name: /full mobility/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /limited mobility/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /wheelchair/i })).toBeInTheDocument();
    });
  });
});
```

#### Implementation (GREEN)

Create `PreferenceStep.tsx` with:
- Budget level radio buttons
- Trip style checkboxes (multi-select)
- Pace radio buttons
- Mobility options (optional)

#### Validation Criteria

- [ ] All preference tests pass
- [ ] Multi-select works for trip style
- [ ] Budget estimates show for destination
- [ ] Form is accessible

---

### Task 2.5: Implement Review Step

**Priority:** P0 (Blocker)
**Estimated Effort:** 2 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/TripSetupWizard/__tests__/ReviewStep.test.tsx
describe('ReviewStep', () => {
  const mockSetup = {
    destinationId: 'dubai-uae',
    dates: { start: '2026-03-15', end: '2026-03-22' },
    travelers: { adults: 2, children: 0 },
    budgetLevel: 'moderate',
    tripStyle: ['Cultural Immersion', 'Food & Culinary'],
    pace: 'moderate',
  };

  it('should display all trip setup information', () => {
    render(<ReviewStep setup={mockSetup} destination={mockDestination} />);

    expect(screen.getByText(/dubai/i)).toBeInTheDocument();
    expect(screen.getByText(/mar 15.*mar 22/i)).toBeInTheDocument();
    expect(screen.getByText(/2 adults/i)).toBeInTheDocument();
    expect(screen.getByText(/moderate/i)).toBeInTheDocument();
    expect(screen.getByText(/cultural immersion/i)).toBeInTheDocument();
  });

  it('should show estimated total cost', () => {
    render(<ReviewStep setup={mockSetup} destination={mockDestination} />);

    expect(screen.getByText(/estimated cost/i)).toBeInTheDocument();
    expect(screen.getByText(/\$\d+.*\$\d+/)).toBeInTheDocument();
  });

  it('should allow editing each section', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <ReviewStep
        setup={mockSetup}
        destination={mockDestination}
        onEdit={onEdit}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit dates/i }));
    expect(onEdit).toHaveBeenCalledWith('dates');
  });

  it('should have confirm button', () => {
    render(<ReviewStep setup={mockSetup} destination={mockDestination} />);

    expect(screen.getByRole('button', { name: /start planning/i })).toBeInTheDocument();
  });
});
```

#### Implementation (GREEN)

Create `ReviewStep.tsx` showing summary of all selections.

#### Validation Criteria

- [ ] All review tests pass
- [ ] All setup info displayed
- [ ] Edit buttons navigate correctly
- [ ] Confirm triggers onComplete

---

### Task 2.6: Integration Test - Complete Wizard Flow

**Priority:** P0 (Blocker)
**Estimated Effort:** 3 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/TripSetupWizard/__tests__/TripSetupWizard.integration.test.tsx
describe('TripSetupWizard Integration', () => {
  it('should complete full wizard flow and call onComplete', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();

    render(
      <TripSetupWizard
        destination={mockDestination}
        onComplete={onComplete}
      />
    );

    // Step 1: Dates
    await user.click(screen.getByLabelText(/start date/i));
    await user.click(screen.getByText('15'));
    await user.click(screen.getByLabelText(/end date/i));
    await user.click(screen.getByText('22'));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2: Travelers
    await waitFor(() => expect(screen.getByTestId('step-travelers')).toBeVisible());
    await user.click(screen.getByRole('button', { name: /increase adults/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: Preferences
    await waitFor(() => expect(screen.getByTestId('step-style')).toBeVisible());
    await user.click(screen.getByRole('radio', { name: /moderate/i })); // Budget
    await user.click(screen.getByRole('checkbox', { name: /cultural/i }));
    await user.click(screen.getByRole('radio', { name: /moderate pace/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4: Review & Confirm
    await waitFor(() => expect(screen.getByTestId('step-review')).toBeVisible());
    await user.click(screen.getByRole('button', { name: /start planning/i }));

    // Verify completion
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationId: 'dubai-uae',
        travelers: { adults: 2, children: 0 },
        budgetLevel: 'moderate',
        tripStyle: expect.arrayContaining(['Cultural Immersion']),
      })
    );
  });

  it('should preserve state when navigating back', async () => {
    const user = userEvent.setup();

    render(
      <TripSetupWizard
        destination={mockDestination}
        onComplete={vi.fn()}
      />
    );

    // Complete step 1
    await user.click(screen.getByLabelText(/start date/i));
    await user.click(screen.getByText('15'));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Go back
    await waitFor(() => expect(screen.getByTestId('step-travelers')).toBeVisible());
    await user.click(screen.getByRole('button', { name: /back/i }));

    // Date should still be selected
    await waitFor(() => {
      expect(screen.getByText('15')).toHaveClass('selected');
    });
  });
});
```

#### Validation Criteria

- [ ] Full flow integration test passes
- [ ] State preserved on navigation
- [ ] Form validation works across steps
- [ ] onComplete called with correct data

---

## Phase 3: Itinerary Builder Core

### Task 3.1: Create Itinerary Store/Context

**Priority:** P0 (Blocker)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/context/__tests__/ItineraryContext.test.tsx
describe('ItineraryContext', () => {
  describe('State Management', () => {
    it('should provide initial empty itinerary', () => {
      const { result } = renderHook(() => useItineraryContext(), {
        wrapper: ItineraryProvider
      });

      expect(result.current.itinerary).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set itinerary from trip setup', async () => {
      const { result } = renderHook(() => useItineraryContext(), {
        wrapper: ItineraryProvider
      });

      await act(async () => {
        await result.current.initializeItinerary(mockTripSetup);
      });

      expect(result.current.itinerary).toBeDefined();
      expect(result.current.itinerary?.destination.objectID).toBe('dubai-uae');
      expect(result.current.itinerary?.days).toHaveLength(7);
    });

    it('should add activity to specific day', async () => {
      const { result } = renderHook(() => useItineraryContext(), {
        wrapper: createProviderWithItinerary(mockItinerary)
      });

      await act(async () => {
        await result.current.addActivity(1, mockActivity);
      });

      const day1 = result.current.itinerary?.days.find(d => d.dayNumber === 1);
      expect(day1?.activities).toContainEqual(
        expect.objectContaining({ id: mockActivity.id })
      );
    });

    it('should remove activity from day', async () => {
      const { result } = renderHook(() => useItineraryContext(), {
        wrapper: createProviderWithItinerary(mockItineraryWithActivities)
      });

      const activityToRemove = mockItineraryWithActivities.days[0].activities[0];

      await act(async () => {
        await result.current.removeActivity(1, activityToRemove.id);
      });

      const day1 = result.current.itinerary?.days.find(d => d.dayNumber === 1);
      expect(day1?.activities).not.toContainEqual(
        expect.objectContaining({ id: activityToRemove.id })
      );
    });

    it('should reorder activities within a day', async () => {
      const { result } = renderHook(() => useItineraryContext(), {
        wrapper: createProviderWithItinerary(mockItineraryWithActivities)
      });

      await act(async () => {
        await result.current.reorderActivities(1, 0, 2); // Move first to third position
      });

      const day1 = result.current.itinerary?.days.find(d => d.dayNumber === 1);
      expect(day1?.activities[2].id).toBe(mockItineraryWithActivities.days[0].activities[0].id);
    });

    it('should update total cost when activities change', async () => {
      const { result } = renderHook(() => useItineraryContext(), {
        wrapper: createProviderWithItinerary(mockItinerary)
      });

      const initialCost = result.current.itinerary?.totalEstimatedCost.total;

      await act(async () => {
        await result.current.addActivity(1, { ...mockActivity, price: { amount: 100 } });
      });

      expect(result.current.itinerary?.totalEstimatedCost.total).toBeGreaterThan(initialCost);
    });
  });

  describe('Persistence', () => {
    it('should save itinerary to localStorage', async () => {
      const { result } = renderHook(() => useItineraryContext(), {
        wrapper: ItineraryProvider
      });

      await act(async () => {
        await result.current.initializeItinerary(mockTripSetup);
        await result.current.saveItinerary();
      });

      expect(localStorage.getItem('trip_dubai-uae')).toBeDefined();
    });

    it('should restore itinerary from localStorage', async () => {
      localStorage.setItem('trip_dubai-uae', JSON.stringify(mockSavedItinerary));

      const { result } = renderHook(() => useItineraryContext(), {
        wrapper: ItineraryProvider
      });

      await act(async () => {
        await result.current.loadItinerary('dubai-uae');
      });

      expect(result.current.itinerary).toEqual(mockSavedItinerary);
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/context/ItineraryContext.tsx`

#### Validation Criteria

- [ ] All context tests pass
- [ ] State updates correctly
- [ ] Cost calculations work
- [ ] Persistence works

---

### Task 3.2: Create DayPlanner Component

**Priority:** P0 (Blocker)
**Estimated Effort:** 5 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/DayPlanner/__tests__/DayPlanner.test.tsx
describe('DayPlanner', () => {
  const mockDay: ItineraryDay = {
    date: new Date('2026-03-15'),
    dayNumber: 1,
    theme: 'Old Dubai & Cultural Heritage',
    activities: [
      { id: 'act1', name: 'Al Fahidi District', startTime: '14:00', duration: 120 },
      { id: 'act2', name: 'Creek Abra Ride', startTime: '16:30', duration: 30 },
    ],
    estimatedCost: 50,
  };

  describe('Rendering', () => {
    it('should render day header with theme', () => {
      render(<DayPlanner day={mockDay} />);

      expect(screen.getByText(/day 1/i)).toBeInTheDocument();
      expect(screen.getByText(/old dubai/i)).toBeInTheDocument();
    });

    it('should render timeline of activities', () => {
      render(<DayPlanner day={mockDay} />);

      expect(screen.getByText('Al Fahidi District')).toBeInTheDocument();
      expect(screen.getByText('Creek Abra Ride')).toBeInTheDocument();
      expect(screen.getByText('14:00')).toBeInTheDocument();
      expect(screen.getByText('16:30')).toBeInTheDocument();
    });

    it('should show estimated cost for day', () => {
      render(<DayPlanner day={mockDay} />);

      expect(screen.getByText(/\$50/)).toBeInTheDocument();
    });

    it('should show travel time between activities', () => {
      render(<DayPlanner day={mockDay} showTravelTime />);

      expect(screen.getByText(/travel.*15 min/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should allow adding activity via button', async () => {
      const onAddActivity = vi.fn();
      const user = userEvent.setup();

      render(<DayPlanner day={mockDay} onAddActivity={onAddActivity} />);

      await user.click(screen.getByRole('button', { name: /add activity/i }));

      expect(onAddActivity).toHaveBeenCalledWith(1);
    });

    it('should allow removing activity', async () => {
      const onRemoveActivity = vi.fn();
      const user = userEvent.setup();

      render(<DayPlanner day={mockDay} onRemoveActivity={onRemoveActivity} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      expect(onRemoveActivity).toHaveBeenCalledWith(1, 'act1');
    });

    it('should allow drag-and-drop reordering', async () => {
      const onReorder = vi.fn();

      render(<DayPlanner day={mockDay} onReorder={onReorder} />);

      // Simulate drag and drop
      const activities = screen.getAllByTestId('activity-card');
      fireEvent.dragStart(activities[0]);
      fireEvent.dragOver(activities[1]);
      fireEvent.drop(activities[1]);

      expect(onReorder).toHaveBeenCalledWith(1, 0, 1);
    });

    it('should allow editing activity time', async () => {
      const onUpdateActivity = vi.fn();
      const user = userEvent.setup();

      render(<DayPlanner day={mockDay} onUpdateActivity={onUpdateActivity} />);

      await user.click(screen.getByText('14:00'));
      await user.clear(screen.getByRole('textbox', { name: /time/i }));
      await user.type(screen.getByRole('textbox', { name: /time/i }), '15:00');
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(onUpdateActivity).toHaveBeenCalledWith(
        1, 'act1',
        expect.objectContaining({ startTime: '15:00' })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper list structure', () => {
      render(<DayPlanner day={mockDay} />);

      expect(screen.getByRole('list', { name: /activities/i })).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('should support keyboard reordering', async () => {
      const onReorder = vi.fn();
      const user = userEvent.setup();

      render(<DayPlanner day={mockDay} onReorder={onReorder} />);

      const firstActivity = screen.getAllByTestId('activity-card')[0];
      firstActivity.focus();

      await user.keyboard('{Alt>}{ArrowDown}{/Alt}');

      expect(onReorder).toHaveBeenCalledWith(1, 0, 1);
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/DayPlanner/DayPlanner.tsx`

#### Validation Criteria

- [ ] All day planner tests pass
- [ ] Activities render in timeline
- [ ] Drag-and-drop works
- [ ] Time editing works
- [ ] Accessible reordering

---

### Task 3.3: Create ActivityCard Component

**Priority:** P1 (High)
**Estimated Effort:** 3 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/ActivityCard/__tests__/ActivityCard.test.tsx
describe('ActivityCard', () => {
  const mockActivity = {
    id: 'act_001',
    name: 'Desert Safari',
    startTime: '15:00',
    duration: 360,
    location: { lat: 25.2, lng: 55.2 },
    neighborhood: 'Desert',
    priceRange: { min: 75, max: 100 },
    bookingRequired: true,
    description: 'Experience the Arabian desert',
    rating: 4.7,
    photos: ['photo1.jpg'],
  };

  it('should render activity name and time', () => {
    render(<ActivityCard activity={mockActivity} />);

    expect(screen.getByText('Desert Safari')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('should show duration in human-readable format', () => {
    render(<ActivityCard activity={mockActivity} />);

    expect(screen.getByText(/6h/)).toBeInTheDocument();
  });

  it('should show price range', () => {
    render(<ActivityCard activity={mockActivity} />);

    expect(screen.getByText(/\$75.*\$100/)).toBeInTheDocument();
  });

  it('should indicate booking requirement', () => {
    render(<ActivityCard activity={mockActivity} />);

    expect(screen.getByText(/booking required/i)).toBeInTheDocument();
  });

  it('should show rating with stars', () => {
    render(<ActivityCard activity={mockActivity} />);

    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByLabelText(/4.7 out of 5/i)).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(
      <ActivityCard
        activity={mockActivity}
        onSwap={vi.fn()}
        onRemove={vi.fn()}
        onViewDetails={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /swap/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument();
  });

  it('should show booking link when provided', () => {
    render(
      <ActivityCard
        activity={{ ...mockActivity, bookingUrl: 'https://book.example.com' }}
      />
    );

    expect(screen.getByRole('link', { name: /book/i })).toHaveAttribute(
      'href', 'https://book.example.com'
    );
  });

  it('should be draggable when in edit mode', () => {
    render(<ActivityCard activity={mockActivity} editable />);

    const card = screen.getByTestId('activity-card');
    expect(card).toHaveAttribute('draggable', 'true');
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/ActivityCard/ActivityCard.tsx`

#### Validation Criteria

- [ ] All activity card tests pass
- [ ] Displays all activity info
- [ ] Actions work correctly
- [ ] Drag-and-drop enabled when editable

---

### Task 3.4: Create ItineraryTimeline Component

**Priority:** P1 (High)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/ItineraryTimeline/__tests__/ItineraryTimeline.test.tsx
describe('ItineraryTimeline', () => {
  it('should render all days as tabs', () => {
    render(<ItineraryTimeline itinerary={mockItinerary} />);

    expect(screen.getAllByRole('tab')).toHaveLength(7);
    expect(screen.getByRole('tab', { name: /day 1/i })).toBeInTheDocument();
  });

  it('should show active day content', () => {
    render(<ItineraryTimeline itinerary={mockItinerary} />);

    expect(screen.getByRole('tabpanel')).toBeVisible();
    expect(screen.getByText(/day 1/i)).toBeInTheDocument();
  });

  it('should switch days on tab click', async () => {
    const user = userEvent.setup();
    render(<ItineraryTimeline itinerary={mockItinerary} />);

    await user.click(screen.getByRole('tab', { name: /day 3/i }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent(/day 3/i);
  });

  it('should show day themes in tabs', () => {
    render(<ItineraryTimeline itinerary={mockItinerary} />);

    expect(screen.getByRole('tab', { name: /old dubai/i })).toBeInTheDocument();
  });

  it('should allow keyboard navigation between days', async () => {
    const user = userEvent.setup();
    render(<ItineraryTimeline itinerary={mockItinerary} />);

    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();

    await user.keyboard('{ArrowRight}');
    expect(tabs[1]).toHaveFocus();
  });

  it('should display summary statistics', () => {
    render(<ItineraryTimeline itinerary={mockItinerary} showSummary />);

    expect(screen.getByText(/7 days/i)).toBeInTheDocument();
    expect(screen.getByText(/\d+ activities/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated.*\$/i)).toBeInTheDocument();
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/ItineraryTimeline/ItineraryTimeline.tsx`

#### Validation Criteria

- [ ] All timeline tests pass
- [ ] Day tabs render correctly
- [ ] Tab switching works
- [ ] Keyboard navigation works
- [ ] Summary displays correctly

---

## Phase 4: Neighborhood Explorer

### Task 4.1: Create useGeoSearch Hook Enhancement

**Priority:** P0 (Blocker)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/hooks/__tests__/useNeighborhoodSearch.test.ts
describe('useNeighborhoodSearch', () => {
  beforeEach(() => {
    vi.mocked(mockAlgoliaSearch).mockResolvedValue(createMockSearchResponse([
      createMockGeoHit({ category: 'cafe', name: 'Test Cafe', distance: 100 }),
      createMockGeoHit({ category: 'restaurant', name: 'Test Restaurant', distance: 200 }),
    ]));
  });

  it('should search POIs within radius', async () => {
    const { result } = renderHook(() => useNeighborhoodSearch({
      center: { lat: 25.2048, lng: 55.2708 },
      radius: 1000,
    }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.pois).toHaveLength(2);
    expect(mockAlgoliaSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        aroundLatLng: '25.2048, 55.2708',
        aroundRadius: 1000,
      })
    );
  });

  it('should filter by category', async () => {
    const { result, rerender } = renderHook(
      ({ category }) => useNeighborhoodSearch({
        center: { lat: 25.2048, lng: 55.2708 },
        radius: 1000,
        category,
      }),
      { initialProps: { category: 'cafe' } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAlgoliaSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.stringContaining('category:cafe'),
      })
    );
  });

  it('should apply contextual filters based on time of day', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T09:00:00'));

    const { result } = renderHook(() => useNeighborhoodSearch({
      center: { lat: 25.2048, lng: 55.2708 },
      contextualFiltering: true,
    }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Morning = prioritize cafes/bakeries
    expect(mockAlgoliaSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        optionalFilters: expect.arrayContaining(['category:cafe', 'category:bakery']),
      })
    );

    vi.useRealTimers();
  });

  it('should group POIs by category', async () => {
    const { result } = renderHook(() => useNeighborhoodSearch({
      center: { lat: 25.2048, lng: 55.2708 },
      groupByCategory: true,
    }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.groupedPois).toHaveProperty('cafe');
    expect(result.current.groupedPois).toHaveProperty('restaurant');
  });

  it('should include distance in results', async () => {
    const { result } = renderHook(() => useNeighborhoodSearch({
      center: { lat: 25.2048, lng: 55.2708 },
    }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.pois.forEach(poi => {
      expect(poi.distance).toBeDefined();
      expect(typeof poi.distance).toBe('number');
    });
  });

  it('should handle search errors gracefully', async () => {
    vi.mocked(mockAlgoliaSearch).mockRejectedValue(new Error('Search failed'));

    const { result } = renderHook(() => useNeighborhoodSearch({
      center: { lat: 25.2048, lng: 55.2708 },
    }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.pois).toEqual([]);
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/hooks/useNeighborhoodSearch.ts`

#### Validation Criteria

- [ ] All geo-search hook tests pass
- [ ] Radius filtering works
- [ ] Category filtering works
- [ ] Contextual time-based filtering works
- [ ] Error handling works

---

### Task 4.2: Create NeighborhoodExplorer Component

**Priority:** P1 (High)
**Estimated Effort:** 5 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/NeighborhoodExplorer/__tests__/NeighborhoodExplorer.test.tsx
describe('NeighborhoodExplorer', () => {
  const mockCenter = { lat: 25.2048, lng: 55.2708 };
  const mockLocation = 'Rove Downtown';

  beforeEach(() => {
    vi.mocked(useNeighborhoodSearch).mockReturnValue({
      pois: mockPOIs,
      groupedPois: { cafe: mockPOIs.slice(0, 2), restaurant: mockPOIs.slice(2) },
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render explorer panel', () => {
      render(<NeighborhoodExplorer center={mockCenter} locationName={mockLocation} />);

      expect(screen.getByTestId('neighborhood-explorer')).toBeInTheDocument();
      expect(screen.getByText(/near your hotel/i)).toBeInTheDocument();
      expect(screen.getByText(/rove downtown/i)).toBeInTheDocument();
    });

    it('should render category tabs', () => {
      render(<NeighborhoodExplorer center={mockCenter} locationName={mockLocation} />);

      expect(screen.getByRole('tab', { name: /coffee/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /lunch/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /culture/i })).toBeInTheDocument();
    });

    it('should render POI cards for selected category', () => {
      render(<NeighborhoodExplorer center={mockCenter} locationName={mockLocation} />);

      expect(screen.getAllByTestId('poi-card').length).toBeGreaterThan(0);
    });

    it('should show loading state', () => {
      vi.mocked(useNeighborhoodSearch).mockReturnValue({
        pois: [],
        groupedPois: {},
        isLoading: true,
        error: null,
      });

      render(<NeighborhoodExplorer center={mockCenter} locationName={mockLocation} />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should filter POIs when category tab clicked', async () => {
      const user = userEvent.setup();
      render(<NeighborhoodExplorer center={mockCenter} locationName={mockLocation} />);

      await user.click(screen.getByRole('tab', { name: /lunch/i }));

      expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'tab-lunch');
    });

    it('should call onAddToItinerary when POI is added', async () => {
      const onAdd = vi.fn();
      const user = userEvent.setup();

      render(
        <NeighborhoodExplorer
          center={mockCenter}
          locationName={mockLocation}
          onAddToItinerary={onAdd}
        />
      );

      await user.click(screen.getAllByRole('button', { name: /add to day/i })[0]);

      expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
        poi: mockPOIs[0],
      }));
    });

    it('should show POI details on card click', async () => {
      const user = userEvent.setup();
      render(<NeighborhoodExplorer center={mockCenter} locationName={mockLocation} />);

      await user.click(screen.getAllByTestId('poi-card')[0]);

      expect(screen.getByTestId('poi-detail-modal')).toBeVisible();
    });

    it('should allow closing explorer', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <NeighborhoodExplorer
          center={mockCenter}
          locationName={mockLocation}
          onClose={onClose}
        />
      );

      await user.click(screen.getByRole('button', { name: /close/i }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Map Integration', () => {
    it('should highlight POI on map when hovered', async () => {
      const onHighlight = vi.fn();
      const user = userEvent.setup();

      render(
        <NeighborhoodExplorer
          center={mockCenter}
          locationName={mockLocation}
          onHighlightPOI={onHighlight}
        />
      );

      await user.hover(screen.getAllByTestId('poi-card')[0]);

      expect(onHighlight).toHaveBeenCalledWith(mockPOIs[0]._geoloc);
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/NeighborhoodExplorer/NeighborhoodExplorer.tsx`

#### Validation Criteria

- [ ] All explorer tests pass
- [ ] Category filtering works
- [ ] POI cards render correctly
- [ ] Add to itinerary works
- [ ] Map integration works

---

### Task 4.3: Create POICard Component

**Priority:** P1 (High)
**Estimated Effort:** 2 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/POICard/__tests__/POICard.test.tsx
describe('POICard', () => {
  const mockPOI = {
    objectID: 'poi_001',
    name: 'Tom & Serg',
    category: 'cafe',
    _geoloc: { lat: 25.1861, lng: 55.2619 },
    distance: 150,
    rating: 4.8,
    price_range: '$$',
    opening_hours: { monday: '07:00-18:00' },
  };

  it('should display POI name', () => {
    render(<POICard poi={mockPOI} />);
    expect(screen.getByText('Tom & Serg')).toBeInTheDocument();
  });

  it('should display distance', () => {
    render(<POICard poi={mockPOI} />);
    expect(screen.getByText(/150m/)).toBeInTheDocument();
  });

  it('should display rating', () => {
    render(<POICard poi={mockPOI} />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('should display price range', () => {
    render(<POICard poi={mockPOI} />);
    expect(screen.getByText('$$')).toBeInTheDocument();
  });

  it('should show open/closed status', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-16T10:00:00')); // Monday 10am

    render(<POICard poi={mockPOI} />);
    expect(screen.getByText(/open/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should show category icon', () => {
    render(<POICard poi={mockPOI} />);
    expect(screen.getByTestId('category-icon-cafe')).toBeInTheDocument();
  });

  it('should call onAdd when add button clicked', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<POICard poi={mockPOI} onAdd={onAdd} />);
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(onAdd).toHaveBeenCalledWith(mockPOI);
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/POICard/POICard.tsx`

#### Validation Criteria

- [ ] All POI card tests pass
- [ ] Distance displays correctly
- [ ] Open/closed status works
- [ ] Category icon shows

---

## Phase 5: Activity Discovery

### Task 5.1: Create ActivitySearch Component

**Priority:** P1 (High)
**Estimated Effort:** 5 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/ActivitySearch/__tests__/ActivitySearch.test.tsx
describe('ActivitySearch', () => {
  it('should render search input', () => {
    render(<ActivitySearch destinationId="dubai-uae" />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('should render category filters', () => {
    render(<ActivitySearch destinationId="dubai-uae" />);

    expect(screen.getByRole('checkbox', { name: /adventure/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /cultural/i })).toBeInTheDocument();
  });

  it('should search activities on query input', async () => {
    const user = userEvent.setup();
    render(<ActivitySearch destinationId="dubai-uae" />);

    await user.type(screen.getByRole('searchbox'), 'desert safari');

    await waitFor(() => {
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'desert safari',
          filters: expect.stringContaining('destination_id:dubai-uae'),
        })
      );
    });
  });

  it('should filter by price range', async () => {
    const user = userEvent.setup();
    render(<ActivitySearch destinationId="dubai-uae" />);

    await user.click(screen.getByRole('button', { name: /price/i }));
    await user.click(screen.getByRole('option', { name: /under \$50/i }));

    await waitFor(() => {
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.stringContaining('price.amount < 50'),
        })
      );
    });
  });

  it('should filter by duration', async () => {
    const user = userEvent.setup();
    render(<ActivitySearch destinationId="dubai-uae" />);

    await user.click(screen.getByRole('button', { name: /duration/i }));
    await user.click(screen.getByRole('option', { name: /half day/i }));

    await waitFor(() => {
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.stringContaining('duration_hours <= 4'),
        })
      );
    });
  });

  it('should display search results', async () => {
    vi.mocked(mockAlgoliaSearch).mockResolvedValue(
      createMockSearchResponse([mockActivity])
    );

    render(<ActivitySearch destinationId="dubai-uae" />);

    await waitFor(() => {
      expect(screen.getByText(mockActivity.name)).toBeInTheDocument();
    });
  });

  it('should call onSelect when activity is selected', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    vi.mocked(mockAlgoliaSearch).mockResolvedValue(
      createMockSearchResponse([mockActivity])
    );

    render(<ActivitySearch destinationId="dubai-uae" onSelect={onSelect} />);

    await waitFor(() => screen.getByText(mockActivity.name));
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(onSelect).toHaveBeenCalledWith(mockActivity);
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/ActivitySearch/ActivitySearch.tsx`

#### Validation Criteria

- [ ] All search tests pass
- [ ] Search queries work
- [ ] Filters apply correctly
- [ ] Results display properly
- [ ] Selection callback works

---

## Phase 6: Budget Tracker

### Task 6.1: Create useBudgetCalculator Hook

**Priority:** P1 (High)
**Estimated Effort:** 3 hours

#### Test First (RED)

```typescript
// packages/frontend/src/hooks/__tests__/useBudgetCalculator.test.ts
describe('useBudgetCalculator', () => {
  it('should calculate total from itinerary activities', () => {
    const { result } = renderHook(() => useBudgetCalculator(mockItinerary));

    expect(result.current.total.activities).toBeGreaterThan(0);
    expect(result.current.total.sum).toBeDefined();
  });

  it('should estimate accommodation cost based on budget level', () => {
    const { result } = renderHook(() => useBudgetCalculator({
      ...mockItinerary,
      setup: { ...mockTripSetup, budgetLevel: 'moderate' },
    }));

    expect(result.current.total.accommodation).toBeDefined();
    expect(result.current.total.accommodation.min).toBeGreaterThan(0);
  });

  it('should estimate food cost per day', () => {
    const { result } = renderHook(() => useBudgetCalculator(mockItinerary));

    expect(result.current.total.food).toBeDefined();
    expect(result.current.perDay.food).toBeGreaterThan(0);
  });

  it('should calculate per-person cost', () => {
    const { result } = renderHook(() => useBudgetCalculator({
      ...mockItinerary,
      setup: { ...mockTripSetup, travelers: { adults: 2, children: 1 } },
    }));

    expect(result.current.perPerson).toBeDefined();
    expect(result.current.perPerson).toBeLessThan(result.current.total.sum);
  });

  it('should determine budget status', () => {
    const { result } = renderHook(() => useBudgetCalculator({
      ...mockItinerary,
      budget: { limit: 1000 },
    }));

    expect(['under', 'on-track', 'over']).toContain(result.current.status);
  });

  it('should identify savings opportunities', () => {
    const { result } = renderHook(() => useBudgetCalculator({
      ...mockItinerary,
      budget: { limit: 500 }, // Low limit to trigger savings
    }));

    expect(result.current.savingsOpportunities.length).toBeGreaterThan(0);
    result.current.savingsOpportunities.forEach(opp => {
      expect(opp.savings).toBeGreaterThan(0);
      expect(opp.alternativeItem).toBeDefined();
    });
  });

  it('should update when itinerary changes', () => {
    const { result, rerender } = renderHook(
      ({ itinerary }) => useBudgetCalculator(itinerary),
      { initialProps: { itinerary: mockItinerary } }
    );

    const initialTotal = result.current.total.sum;

    rerender({
      itinerary: {
        ...mockItinerary,
        days: [...mockItinerary.days, mockExpensiveDay],
      }
    });

    expect(result.current.total.sum).toBeGreaterThan(initialTotal);
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/hooks/useBudgetCalculator.ts`

#### Validation Criteria

- [ ] All budget tests pass
- [ ] Calculations are accurate
- [ ] Status determination works
- [ ] Savings suggestions work
- [ ] Updates on changes

---

### Task 6.2: Create BudgetDashboard Component

**Priority:** P1 (High)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/BudgetDashboard/__tests__/BudgetDashboard.test.tsx
describe('BudgetDashboard', () => {
  it('should render budget overview', () => {
    render(<BudgetDashboard itinerary={mockItinerary} />);

    expect(screen.getByTestId('budget-dashboard')).toBeInTheDocument();
    expect(screen.getByText(/estimated cost/i)).toBeInTheDocument();
  });

  it('should show progress bar for budget status', () => {
    render(<BudgetDashboard itinerary={mockItinerary} budgetLimit={2000} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show category breakdown', () => {
    render(<BudgetDashboard itinerary={mockItinerary} />);

    expect(screen.getByText(/accommodation/i)).toBeInTheDocument();
    expect(screen.getByText(/activities/i)).toBeInTheDocument();
    expect(screen.getByText(/food/i)).toBeInTheDocument();
    expect(screen.getByText(/transport/i)).toBeInTheDocument();
  });

  it('should show warning when over budget', () => {
    render(<BudgetDashboard itinerary={mockExpensiveItinerary} budgetLimit={500} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/over budget/i)).toBeInTheDocument();
  });

  it('should show savings suggestions when over budget', () => {
    render(<BudgetDashboard itinerary={mockExpensiveItinerary} budgetLimit={500} />);

    expect(screen.getByText(/ways to save/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('savings-suggestion').length).toBeGreaterThan(0);
  });

  it('should allow applying savings suggestion', async () => {
    const onApplySuggestion = vi.fn();
    const user = userEvent.setup();

    render(
      <BudgetDashboard
        itinerary={mockExpensiveItinerary}
        budgetLimit={500}
        onApplySuggestion={onApplySuggestion}
      />
    );

    await user.click(screen.getAllByRole('button', { name: /apply/i })[0]);

    expect(onApplySuggestion).toHaveBeenCalled();
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/BudgetDashboard/BudgetDashboard.tsx`

#### Validation Criteria

- [ ] All dashboard tests pass
- [ ] Budget breakdown displays
- [ ] Warning shows when over budget
- [ ] Savings suggestions work

---

## Phase 7: AI Planning Agent

### Task 7.1: Create Trip Planner API Route

**Priority:** P0 (Blocker)
**Estimated Effort:** 5 hours

#### Test First (RED)

```typescript
// packages/frontend/src/app/api/trip/__tests__/route.test.ts
describe('Trip Planner API', () => {
  describe('POST /api/trip/generate', () => {
    it('should generate itinerary for valid setup', async () => {
      const response = await POST(createMockRequest({
        body: mockTripSetup,
      }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.itinerary).toBeDefined();
      expect(data.itinerary.days).toHaveLength(7);
    });

    it('should return 400 for invalid setup', async () => {
      const response = await POST(createMockRequest({
        body: { ...mockTripSetup, travelers: { adults: 0 } },
      }));

      expect(response.status).toBe(400);
    });

    it('should include activities from Algolia search', async () => {
      vi.mocked(mockAlgoliaSearch).mockResolvedValue(
        createMockSearchResponse(mockActivities)
      );

      const response = await POST(createMockRequest({
        body: mockTripSetup,
      }));

      const data = await response.json();
      data.itinerary.days.forEach(day => {
        expect(day.activities.length).toBeGreaterThan(0);
      });
    });

    it('should respect pace setting', async () => {
      const relaxedSetup = { ...mockTripSetup, pace: 'relaxed' };
      const packedSetup = { ...mockTripSetup, pace: 'packed' };

      const [relaxedRes, packedRes] = await Promise.all([
        POST(createMockRequest({ body: relaxedSetup })),
        POST(createMockRequest({ body: packedSetup })),
      ]);

      const relaxedData = await relaxedRes.json();
      const packedData = await packedRes.json();

      const relaxedActivities = relaxedData.itinerary.days[0].activities.length;
      const packedActivities = packedData.itinerary.days[0].activities.length;

      expect(packedActivities).toBeGreaterThan(relaxedActivities);
    });
  });

  describe('POST /api/trip/chat', () => {
    it('should handle planning chat messages', async () => {
      const response = await POST(createMockRequest({
        url: '/api/trip/chat',
        body: {
          tripId: 'trip_123',
          message: 'Add more food activities',
        },
      }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.response).toBeDefined();
    });

    it('should maintain conversation context', async () => {
      // First message
      await POST(createMockRequest({
        url: '/api/trip/chat',
        body: { tripId: 'trip_123', message: 'Focus on beaches' },
      }));

      // Second message should remember context
      const response = await POST(createMockRequest({
        url: '/api/trip/chat',
        body: { tripId: 'trip_123', message: 'What about snorkeling?' },
      }));

      const data = await response.json();
      expect(data.response).toContain(/beach|snorkel/i);
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/app/api/trip/route.ts`
Create `packages/frontend/src/app/api/trip/chat/route.ts`

#### Validation Criteria

- [ ] All API tests pass
- [ ] Itinerary generation works
- [ ] Chat endpoint works
- [ ] Context maintained
- [ ] Error handling works

---

### Task 7.2: Create PlannerChat Component

**Priority:** P1 (High)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/PlannerChat/__tests__/PlannerChat.test.tsx
describe('PlannerChat', () => {
  it('should render chat interface', () => {
    render(<PlannerChat tripId="trip_123" />);

    expect(screen.getByTestId('planner-chat')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display initial greeting', () => {
    render(<PlannerChat tripId="trip_123" />);

    expect(screen.getByText(/help you plan/i)).toBeInTheDocument();
  });

  it('should send message on submit', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      createMockResponse({ response: 'Sure, I can help with that!' })
    );

    render(<PlannerChat tripId="trip_123" />);

    await user.type(screen.getByRole('textbox'), 'Add more food activities');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/trip/chat', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Add more food activities'),
      }));
    });
  });

  it('should display AI response', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      createMockResponse({ response: 'I\'ve added 3 food activities!' })
    );

    render(<PlannerChat tripId="trip_123" />);

    await user.type(screen.getByRole('textbox'), 'Add food');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/added 3 food activities/i)).toBeInTheDocument();
    });
  });

  it('should show loading state while waiting for response', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<PlannerChat tripId="trip_123" />);

    await user.type(screen.getByRole('textbox'), 'Add food');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('should display suggestion chips', async () => {
    vi.mocked(fetch).mockResolvedValue(
      createMockResponse({
        response: 'Here are some ideas...',
        suggestions: ['Add more beaches', 'Optimize budget', 'Show alternatives']
      })
    );

    render(<PlannerChat tripId="trip_123" />);

    // Trigger response
    await userEvent.setup().click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add more beaches/i })).toBeInTheDocument();
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/PlannerChat/PlannerChat.tsx`

#### Validation Criteria

- [ ] All chat tests pass
- [ ] Messages send correctly
- [ ] Responses display
- [ ] Loading states work
- [ ] Suggestions render

---

## Phase 8: Collaboration Features

### Task 8.1: Create Share Trip Functionality

**Priority:** P2 (Medium)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/components/ShareModal/__tests__/ShareModal.test.tsx
describe('ShareModal', () => {
  it('should generate shareable link', async () => {
    const user = userEvent.setup();
    render(<ShareModal tripId="trip_123" />);

    await user.click(screen.getByRole('button', { name: /generate link/i }));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /share link/i })).toHaveValue(
        expect.stringContaining('/share/trip_123')
      );
    });
  });

  it('should copy link to clipboard', async () => {
    const user = userEvent.setup();
    const mockClipboard = vi.fn();
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } });

    render(<ShareModal tripId="trip_123" />);

    await user.click(screen.getByRole('button', { name: /generate link/i }));
    await user.click(screen.getByRole('button', { name: /copy/i }));

    expect(mockClipboard).toHaveBeenCalled();
  });

  it('should allow setting permissions', async () => {
    const user = userEvent.setup();
    render(<ShareModal tripId="trip_123" />);

    await user.click(screen.getByRole('radio', { name: /can edit/i }));
    await user.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"permissions":"edit"'),
        })
      );
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/components/ShareModal/ShareModal.tsx`

#### Validation Criteria

- [ ] All share tests pass
- [ ] Link generation works
- [ ] Copy to clipboard works
- [ ] Permission levels work

---

## Phase 9: Export & Offline

### Task 9.1: Create PDF Export Functionality

**Priority:** P2 (Medium)
**Estimated Effort:** 4 hours

#### Test First (RED)

```typescript
// packages/frontend/src/services/__tests__/export.service.test.ts
describe('ExportService', () => {
  describe('generatePDF', () => {
    it('should generate PDF buffer', async () => {
      const result = await exportService.generatePDF(mockItinerary);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all days in PDF', async () => {
      const pdfContent = await exportService.generatePDF(mockItinerary);
      const text = await extractPDFText(pdfContent);

      mockItinerary.days.forEach(day => {
        expect(text).toContain(`Day ${day.dayNumber}`);
        expect(text).toContain(day.theme);
      });
    });

    it('should include budget summary', async () => {
      const pdfContent = await exportService.generatePDF(mockItinerary);
      const text = await extractPDFText(pdfContent);

      expect(text).toContain('Estimated Cost');
    });
  });

  describe('generateICS', () => {
    it('should generate valid ICS file', async () => {
      const result = await exportService.generateICS(mockItinerary);

      expect(result).toContain('BEGIN:VCALENDAR');
      expect(result).toContain('END:VCALENDAR');
    });

    it('should include all activities as events', async () => {
      const result = await exportService.generateICS(mockItinerary);

      const eventCount = (result.match(/BEGIN:VEVENT/g) || []).length;
      const totalActivities = mockItinerary.days.reduce(
        (sum, day) => sum + day.activities.length, 0
      );

      expect(eventCount).toBe(totalActivities);
    });
  });
});
```

#### Implementation (GREEN)

Create `packages/frontend/src/services/export.service.ts`

#### Validation Criteria

- [ ] All export tests pass
- [ ] PDF generates correctly
- [ ] ICS format is valid
- [ ] All data included

---

## Phase 10: Integration & E2E Testing

### Task 10.1: Trip Planner E2E Tests

**Priority:** P0 (Blocker)
**Estimated Effort:** 6 hours

#### Test Implementation

```typescript
// e2e/tests/trip-planner.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Trip Planner E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/city/dubai-uae');
  });

  test('Complete trip planning flow', async ({ page }) => {
    // Step 1: Click "Plan My Trip" button
    await page.click('text=Plan My Trip');
    await expect(page).toHaveURL(/\/plan\/dubai-uae/);

    // Step 2: Complete trip setup wizard
    // Dates
    await expect(page.getByTestId('trip-setup-wizard')).toBeVisible();
    await page.click('[aria-label="Start date"]');
    await page.click('text=15');
    await page.click('[aria-label="End date"]');
    await page.click('text=22');
    await page.click('text=Continue');

    // Travelers
    await expect(page.getByTestId('step-travelers')).toBeVisible();
    await page.click('[aria-label="Increase adults"]');
    await page.click('text=Continue');

    // Preferences
    await expect(page.getByTestId('step-style')).toBeVisible();
    await page.click('text=Moderate'); // Budget
    await page.click('text=Cultural Immersion');
    await page.click('text=Food & Culinary');
    await page.click('text=Continue');

    // Review & Confirm
    await expect(page.getByTestId('step-review')).toBeVisible();
    await expect(page.getByText('Dubai')).toBeVisible();
    await expect(page.getByText('7 days')).toBeVisible();
    await page.click('text=Start Planning');

    // Step 3: Verify itinerary generated
    await expect(page.getByTestId('itinerary-timeline')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Day 1')).toBeVisible();

    // Step 4: Test day expansion
    await page.click('text=Day 1');
    await expect(page.getByTestId('day-activities')).toBeVisible();

    // Step 5: Test activity actions
    const activityCard = page.getByTestId('activity-card').first();
    await expect(activityCard).toBeVisible();

    // Swap activity
    await activityCard.hover();
    await page.click('[aria-label="Swap activity"]');
    await expect(page.getByTestId('activity-search-modal')).toBeVisible();
    await page.keyboard.press('Escape');

    // Step 6: Test neighborhood explorer
    await page.click('text=View Neighborhood');
    await expect(page.getByTestId('neighborhood-explorer')).toBeVisible();
    await expect(page.getByText(/nearby/i)).toBeVisible();

    // Add POI to itinerary
    await page.click('[aria-label="Add to Day 1"]');
    await expect(page.getByRole('alert')).toContainText(/added/i);
    await page.click('[aria-label="Close"]');

    // Step 7: Test budget dashboard
    await expect(page.getByTestId('budget-dashboard')).toBeVisible();
    await expect(page.getByText(/estimated cost/i)).toBeVisible();

    // Step 8: Test AI chat
    await page.fill('[data-testid="planner-chat-input"]', 'Add more food activities');
    await page.click('[aria-label="Send message"]');
    await expect(page.getByTestId('ai-response')).toBeVisible({ timeout: 15000 });

    // Step 9: Test export
    await page.click('text=Export');
    await expect(page.getByText('PDF')).toBeVisible();
    await expect(page.getByText('Calendar')).toBeVisible();
  });

  test('Wizard navigation - back button preserves state', async ({ page }) => {
    await page.click('text=Plan My Trip');

    // Fill step 1
    await page.click('[aria-label="Start date"]');
    await page.click('text=15');
    await page.click('text=Continue');

    // Go back
    await page.click('text=Back');

    // Verify date is still selected
    await expect(page.getByText('15').first()).toHaveClass(/selected/);
  });

  test('Mobile responsive trip planner', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('text=Plan My Trip');

    // Wizard should be visible and usable on mobile
    await expect(page.getByTestId('trip-setup-wizard')).toBeVisible();

    // Complete wizard
    await page.click('[aria-label="Start date"]');
    await page.click('text=15');
    await page.click('[aria-label="End date"]');
    await page.click('text=22');
    await page.click('text=Continue');

    // Mobile layout should show bottom navigation
    await expect(page.getByTestId('mobile-nav')).toBeVisible();
  });

  test('Error handling - invalid dates', async ({ page }) => {
    await page.click('text=Plan My Trip');

    // Try to continue without selecting dates
    await page.click('text=Continue');

    // Should show validation error
    await expect(page.getByText(/select dates/i)).toBeVisible();
  });

  test('Persistence - reload preserves trip', async ({ page }) => {
    await page.click('text=Plan My Trip');

    // Complete setup
    await page.click('[aria-label="Start date"]');
    await page.click('text=15');
    await page.click('[aria-label="End date"]');
    await page.click('text=22');
    await page.click('text=Continue');
    await page.click('text=Continue');
    await page.click('text=Moderate');
    await page.click('text=Cultural Immersion');
    await page.click('text=Continue');
    await page.click('text=Start Planning');

    await expect(page.getByTestId('itinerary-timeline')).toBeVisible({ timeout: 30000 });

    // Reload page
    await page.reload();

    // Trip should still be visible
    await expect(page.getByTestId('itinerary-timeline')).toBeVisible();
    await expect(page.getByText('Day 1')).toBeVisible();
  });
});

test.describe('Trip Planner Accessibility', () => {
  test('Keyboard navigation through wizard', async ({ page }) => {
    await page.goto('/city/dubai-uae');
    await page.click('text=Plan My Trip');

    // Navigate with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Open date picker
    await page.keyboard.press('ArrowRight'); // Next day
    await page.keyboard.press('Enter'); // Select

    // Continue with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Continue button

    await expect(page.getByTestId('step-travelers')).toBeVisible();
  });

  test('Screen reader announcements', async ({ page }) => {
    await page.goto('/city/dubai-uae');
    await page.click('text=Plan My Trip');

    // Check for live region announcements
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();

    // Navigate to next step
    await page.click('[aria-label="Start date"]');
    await page.click('text=15');
    await page.click('[aria-label="End date"]');
    await page.click('text=22');
    await page.click('text=Continue');

    // Should announce new step
    await expect(liveRegion).toContainText(/step 2|travelers/i);
  });
});
```

#### Validation Criteria

- [ ] All E2E tests pass
- [ ] Complete flow works end-to-end
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] State persists across reloads

---

### Task 10.2: Integration Tests - Data Flow

**Priority:** P0 (Blocker)
**Estimated Effort:** 4 hours

```typescript
// packages/frontend/src/__tests__/trip-planner.integration.test.tsx
describe('Trip Planner Integration', () => {
  it('should flow data from wizard to itinerary context', async () => {
    const { getByTestId, getByText, getByRole } = render(
      <TripPlannerProvider>
        <TripSetupWizard destination={mockDestination} onComplete={vi.fn()} />
        <ItineraryDisplay />
      </TripPlannerProvider>
    );

    // Complete wizard...
    // Verify itinerary receives data
    await waitFor(() => {
      expect(getByTestId('itinerary-display')).toHaveTextContent('Dubai');
    });
  });

  it('should update budget when activities change', async () => {
    const { getByTestId, getByRole } = render(
      <TripPlannerProvider initialItinerary={mockItinerary}>
        <ItineraryTimeline />
        <BudgetDashboard />
      </TripPlannerProvider>
    );

    const initialBudget = getByTestId('total-cost').textContent;

    // Add activity
    await userEvent.click(getByRole('button', { name: /add activity/i }));
    // ... select activity

    await waitFor(() => {
      expect(getByTestId('total-cost').textContent).not.toBe(initialBudget);
    });
  });

  it('should sync neighborhood explorer with map', async () => {
    const mapHighlight = vi.fn();

    const { getByTestId } = render(
      <TripPlannerProvider>
        <NeighborhoodExplorer
          center={mockCenter}
          onHighlightPOI={mapHighlight}
        />
        <MapView onHighlight={mapHighlight} />
      </TripPlannerProvider>
    );

    // Hover POI
    await userEvent.hover(getByTestId('poi-card'));

    expect(mapHighlight).toHaveBeenCalled();
  });
});
```

#### Validation Criteria

- [ ] Data flows correctly between components
- [ ] Context updates propagate
- [ ] Map and explorer sync
- [ ] Budget recalculates on changes

---

## Validation Checklist

### Per-Phase Completion Criteria

#### Phase 1: Data Models ✓
- [ ] All type schemas validated with tests
- [ ] Fixtures created for testing
- [ ] Types exported from shared package
- [ ] No TypeScript errors

#### Phase 2: Trip Setup Wizard ✓
- [ ] Wizard shell renders correctly
- [ ] All steps implemented and tested
- [ ] Form validation works
- [ ] Integration test passes
- [ ] Accessibility audit passes

#### Phase 3: Itinerary Builder ✓
- [ ] Context manages state correctly
- [ ] Day planner renders activities
- [ ] Drag-and-drop reordering works
- [ ] Cost recalculation on changes

#### Phase 4: Neighborhood Explorer ✓
- [ ] Geo-search returns correct POIs
- [ ] Category filtering works
- [ ] Time-based contextual filtering works
- [ ] Add to itinerary works

#### Phase 5: Activity Discovery ✓
- [ ] Search returns relevant activities
- [ ] Filters work correctly
- [ ] Activity selection works

#### Phase 6: Budget Tracker ✓
- [ ] Calculations are accurate
- [ ] Status determination correct
- [ ] Savings suggestions work

#### Phase 7: AI Planning Agent ✓
- [ ] API generates valid itineraries
- [ ] Chat maintains context
- [ ] Suggestions are relevant

#### Phase 8: Collaboration ✓
- [ ] Share links generate correctly
- [ ] Permissions work

#### Phase 9: Export ✓
- [ ] PDF generates correctly
- [ ] ICS format valid

#### Phase 10: E2E ✓
- [ ] Complete user flow passes
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Performance targets met

---

## Test Commands Summary

```bash
# Run all tests
pnpm test:all

# Run unit tests only
pnpm test:unit

# Run E2E tests only
pnpm test:e2e

# Run tests with coverage
pnpm test:unit -- --coverage

# Run specific test file
pnpm test:unit -- packages/frontend/src/components/TripSetupWizard/__tests__/TripSetupWizard.test.tsx

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run E2E tests for specific browser
pnpm test:e2e -- --project=chromium

# Run E2E tests with debug
pnpm test:e2e -- --debug
```

---

## Estimated Total Effort

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Phase 0 | Testing Infrastructure | 5 |
| Phase 1 | Data Models & Types | 9 |
| Phase 2 | Trip Setup Wizard | 20 |
| Phase 3 | Itinerary Builder | 16 |
| Phase 4 | Neighborhood Explorer | 11 |
| Phase 5 | Activity Discovery | 5 |
| Phase 6 | Budget Tracker | 7 |
| Phase 7 | AI Planning Agent | 9 |
| Phase 8 | Collaboration | 4 |
| Phase 9 | Export | 4 |
| Phase 10 | Integration & E2E | 10 |
| **Total** | | **100 hours** |

---

## Risk Mitigation

1. **Algolia Rate Limits**: Use mock server for all development/testing
2. **AI Response Latency**: Implement optimistic UI updates
3. **Complex State**: Use context + reducer pattern with clear actions
4. **Mobile Performance**: Lazy load heavy components (map, PDF generator)
5. **Test Flakiness**: Use explicit waits, avoid time-based assertions

---

## Next Steps

1. Begin with **Phase 0** to establish testing infrastructure
2. Complete **Phase 1** types before any component work
3. Work through phases sequentially, ensuring all tests pass before moving on
4. Run E2E tests after each major phase completion
5. Conduct accessibility audit at Phase 2 and Phase 10 milestones
