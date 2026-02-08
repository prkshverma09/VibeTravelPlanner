import React, { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';

export interface TripSetup {
  destinationId: string;
  dates: {
    start: string;
    end: string;
  };
  travelers: {
    adults: number;
    children: number;
    childrenAges?: number[];
  };
  budgetLevel: 'budget' | 'moderate' | 'luxury' | 'unlimited';
  tripStyle: string[];
  pace: 'relaxed' | 'moderate' | 'packed';
  interests?: string[];
  mobility?: 'full' | 'limited' | 'wheelchair';
}

export interface ScheduledActivity {
  id: string;
  name: string;
  type?: string;
  startTime: string;
  duration: number;
  location: {
    lat: number;
    lng: number;
  };
  neighborhood?: string;
  priceRange: {
    min: number;
    max: number;
  };
  bookingRequired?: boolean;
  bookingUrl?: string;
  description?: string;
  tips?: string[];
  photos?: string[];
  rating?: number;
  reviews?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  theme: string;
  activities: ScheduledActivity[];
  meals?: Array<{ type: string; name: string; location: string }>;
  estimatedCost: number;
  walkingDistance?: number;
  alternativeActivities?: ScheduledActivity[];
}

export interface TripItinerary {
  id: string;
  destination: {
    objectID: string;
    city: string;
    country: string;
    continent?: string;
  };
  dates: {
    start: string;
    end: string;
  };
  travelers: {
    adults: number;
    children: number;
  };
  days: ItineraryDay[];
  totalEstimatedCost: {
    activities: number;
    accommodation: number;
    food: number;
    transport: number;
    total: number;
  };
}

export interface POI {
  objectID: string;
  name: string;
  category: string;
  subcategory?: string;
  _geoloc: {
    lat: number;
    lng: number;
  };
  distance?: number;
  rating: number;
  reviews_count?: number;
  price_range?: string;
  opening_hours?: Record<string, string>;
  description?: string;
  photos?: string[];
}

interface TripPlannerState {
  tripSetup: TripSetup | null;
  itinerary: TripItinerary | null;
  isLoading: boolean;
  error: string | null;
}

type TripPlannerAction =
  | { type: 'SET_TRIP_SETUP'; payload: TripSetup }
  | { type: 'SET_ITINERARY'; payload: TripItinerary }
  | { type: 'ADD_ACTIVITY_TO_DAY'; payload: { dayNumber: number; activity: ScheduledActivity } }
  | { type: 'REMOVE_ACTIVITY_FROM_DAY'; payload: { dayNumber: number; activityId: string } }
  | { type: 'REORDER_ACTIVITIES'; payload: { dayNumber: number; fromIndex: number; toIndex: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: TripPlannerState = {
  tripSetup: null,
  itinerary: null,
  isLoading: false,
  error: null,
};

function tripPlannerReducer(state: TripPlannerState, action: TripPlannerAction): TripPlannerState {
  switch (action.type) {
    case 'SET_TRIP_SETUP':
      return { ...state, tripSetup: action.payload };

    case 'SET_ITINERARY':
      return { ...state, itinerary: action.payload };

    case 'ADD_ACTIVITY_TO_DAY': {
      if (!state.itinerary) return state;
      const updatedDays = state.itinerary.days.map((day) => {
        if (day.dayNumber === action.payload.dayNumber) {
          return {
            ...day,
            activities: [...day.activities, action.payload.activity],
          };
        }
        return day;
      });
      return {
        ...state,
        itinerary: { ...state.itinerary, days: updatedDays },
      };
    }

    case 'REMOVE_ACTIVITY_FROM_DAY': {
      if (!state.itinerary) return state;
      const updatedDays = state.itinerary.days.map((day) => {
        if (day.dayNumber === action.payload.dayNumber) {
          return {
            ...day,
            activities: day.activities.filter((a) => a.id !== action.payload.activityId),
          };
        }
        return day;
      });
      return {
        ...state,
        itinerary: { ...state.itinerary, days: updatedDays },
      };
    }

    case 'REORDER_ACTIVITIES': {
      if (!state.itinerary) return state;
      const updatedDays = state.itinerary.days.map((day) => {
        if (day.dayNumber === action.payload.dayNumber) {
          const activities = [...day.activities];
          const [removed] = activities.splice(action.payload.fromIndex, 1);
          activities.splice(action.payload.toIndex, 0, removed);
          return { ...day, activities };
        }
        return day;
      });
      return {
        ...state,
        itinerary: { ...state.itinerary, days: updatedDays },
      };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface TripPlannerContextValue {
  tripSetup: TripSetup | null;
  itinerary: TripItinerary | null;
  isLoading: boolean;
  error: string | null;
  setTripSetup: (setup: TripSetup) => void;
  setItinerary: (itinerary: TripItinerary) => void;
  addActivityToDay: (dayNumber: number, activity: ScheduledActivity) => void;
  removeActivityFromDay: (dayNumber: number, activityId: string) => void;
  reorderActivities: (dayNumber: number, fromIndex: number, toIndex: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const TripPlannerTestContext = createContext<TripPlannerContextValue | null>(null);

interface TripPlannerTestProviderProps {
  children: ReactNode;
  initialTripSetup?: TripSetup;
  initialItinerary?: TripItinerary;
}

export function TripPlannerTestProvider({
  children,
  initialTripSetup,
  initialItinerary,
}: TripPlannerTestProviderProps) {
  const [state, dispatch] = useReducer(tripPlannerReducer, {
    ...initialState,
    tripSetup: initialTripSetup || null,
    itinerary: initialItinerary || null,
  });

  const value = useMemo<TripPlannerContextValue>(
    () => ({
      tripSetup: state.tripSetup,
      itinerary: state.itinerary,
      isLoading: state.isLoading,
      error: state.error,
      setTripSetup: (setup: TripSetup) => dispatch({ type: 'SET_TRIP_SETUP', payload: setup }),
      setItinerary: (itinerary: TripItinerary) =>
        dispatch({ type: 'SET_ITINERARY', payload: itinerary }),
      addActivityToDay: (dayNumber: number, activity: ScheduledActivity) =>
        dispatch({ type: 'ADD_ACTIVITY_TO_DAY', payload: { dayNumber, activity } }),
      removeActivityFromDay: (dayNumber: number, activityId: string) =>
        dispatch({ type: 'REMOVE_ACTIVITY_FROM_DAY', payload: { dayNumber, activityId } }),
      reorderActivities: (dayNumber: number, fromIndex: number, toIndex: number) =>
        dispatch({ type: 'REORDER_ACTIVITIES', payload: { dayNumber, fromIndex, toIndex } }),
      setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
      setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state]
  );

  return (
    <TripPlannerTestContext.Provider value={value}>{children}</TripPlannerTestContext.Provider>
  );
}

export function useMockTripPlannerStore(): TripPlannerContextValue {
  const context = useContext(TripPlannerTestContext);
  if (!context) {
    throw new Error('useMockTripPlannerStore must be used within TripPlannerTestProvider');
  }
  return context;
}

interface RenderWithTripPlannerOptions extends Omit<RenderOptions, 'wrapper'> {
  initialTripSetup?: TripSetup;
  initialItinerary?: TripItinerary;
}

export function renderWithTripPlannerContext(
  ui: React.ReactElement,
  options: RenderWithTripPlannerOptions = {}
) {
  const { initialTripSetup, initialItinerary, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TripPlannerTestProvider
      initialTripSetup={initialTripSetup}
      initialItinerary={initialItinerary}
    >
      {children}
    </TripPlannerTestProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

let activityIdCounter = 0;
let poiIdCounter = 0;
let itineraryIdCounter = 0;

export function createMockTripSetup(overrides: Partial<TripSetup> = {}): TripSetup {
  const defaultDates = {
    start: '2026-03-15T00:00:00.000Z',
    end: '2026-03-22T00:00:00.000Z',
  };

  return {
    destinationId: 'dubai-uae',
    dates: overrides.dates || defaultDates,
    travelers: {
      adults: 2,
      children: 0,
      ...overrides.travelers,
    },
    budgetLevel: 'moderate',
    tripStyle: ['Cultural Immersion', 'Food & Culinary'],
    pace: 'moderate',
    interests: ['architecture', 'food', 'history'],
    mobility: 'full',
    ...overrides,
  };
}

export function createMockActivity(overrides: Partial<ScheduledActivity> = {}): ScheduledActivity {
  activityIdCounter++;
  return {
    id: overrides.id || `activity-${activityIdCounter}`,
    name: 'Test Activity',
    type: 'sightseeing',
    startTime: '10:00',
    duration: 120,
    location: {
      lat: 25.2048,
      lng: 55.2708,
    },
    neighborhood: 'Downtown',
    priceRange: {
      min: 0,
      max: 50,
    },
    bookingRequired: false,
    description: 'A test activity description',
    tips: ['Tip 1', 'Tip 2'],
    photos: ['photo1.jpg'],
    rating: 4.5,
    reviews: 100,
    ...overrides,
  };
}

export function createMockItinerary(
  overrides: Partial<{
    destinationId: string;
    destinationName: string;
    totalDays: number;
  }> = {}
): TripItinerary {
  itineraryIdCounter++;
  const totalDays = overrides.totalDays || 7;
  const startDate = new Date('2026-03-15');

  const days: ItineraryDay[] = Array.from({ length: totalDays }, (_, i) => {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + i);

    return {
      dayNumber: i + 1,
      date: dayDate.toISOString(),
      theme: `Day ${i + 1} Theme`,
      activities: [],
      estimatedCost: 100,
      walkingDistance: 5000,
    };
  });

  return {
    id: `itinerary-${itineraryIdCounter}`,
    destination: {
      objectID: overrides.destinationId || 'dubai-uae',
      city: overrides.destinationName || 'Dubai',
      country: 'United Arab Emirates',
      continent: 'Middle East',
    },
    dates: {
      start: startDate.toISOString(),
      end: new Date(startDate.getTime() + (totalDays - 1) * 24 * 60 * 60 * 1000).toISOString(),
    },
    travelers: {
      adults: 2,
      children: 0,
    },
    days,
    totalEstimatedCost: {
      activities: 500,
      accommodation: 1000,
      food: 400,
      transport: 100,
      total: 2000,
    },
  };
}

export function createMockPOI(overrides: Partial<POI> = {}): POI {
  poiIdCounter++;
  return {
    objectID: overrides.objectID || `poi-${poiIdCounter}`,
    name: 'Test POI',
    category: 'cafe',
    subcategory: 'specialty_coffee',
    _geoloc: {
      lat: 25.2048,
      lng: 55.2708,
    },
    rating: 4.5,
    reviews_count: 100,
    price_range: '$$',
    opening_hours: {
      monday: '07:00-18:00',
      tuesday: '07:00-18:00',
      wednesday: '07:00-18:00',
      thursday: '07:00-18:00',
      friday: '08:00-18:00',
      saturday: '08:00-18:00',
      sunday: '08:00-18:00',
    },
    description: 'A test POI description',
    photos: ['photo1.jpg'],
    ...overrides,
  };
}

interface AlgoliaSearchResponseOptions {
  page?: number;
  hitsPerPage?: number;
  nbPages?: number;
  processingTimeMS?: number;
}

export function createMockAlgoliaSearchResponse<T>(
  hits: T[],
  options: AlgoliaSearchResponseOptions = {}
) {
  const { page = 0, hitsPerPage = 20, nbPages = 1, processingTimeMS = 5 } = options;

  return {
    results: [
      {
        hits,
        nbHits: hits.length,
        page,
        hitsPerPage,
        nbPages,
        processingTimeMS,
        query: '',
        params: '',
      },
    ],
  };
}

interface GeoSearchResponseOptions extends AlgoliaSearchResponseOptions {
  sortByDistance?: boolean;
}

export function createMockGeoSearchResponse<T extends { distance?: number }>(
  hits: T[],
  options: GeoSearchResponseOptions = {}
) {
  const { sortByDistance = false, ...searchOptions } = options;

  let processedHits = hits;
  if (sortByDistance) {
    processedHits = [...hits].sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return createMockAlgoliaSearchResponse(processedHits, searchOptions);
}

export function resetMockCounters() {
  activityIdCounter = 0;
  poiIdCounter = 0;
  itineraryIdCounter = 0;
}
