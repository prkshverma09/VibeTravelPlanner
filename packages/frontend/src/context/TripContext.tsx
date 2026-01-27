'use client';

import { createContext, useContext, useReducer, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AlgoliaCity } from '@vibe-travel/shared';

export type PreferenceCategory =
  | 'vibe'
  | 'geography'
  | 'budget'
  | 'activity'
  | 'travel_style'
  | 'constraint';

export type PreferencePriority = 'must_have' | 'nice_to_have';

export interface TravelPreference {
  category: PreferenceCategory;
  value: string;
  priority: PreferencePriority;
  addedAt: number;
}

export interface TripDestination {
  city: AlgoliaCity;
  durationDays: number | null;
  notes: string | null;
  addedAt: number;
}

export interface ComparisonState {
  cities: AlgoliaCity[];
  focusAttributes: string[];
  isActive: boolean;
}

export interface TripState {
  preferences: TravelPreference[];
  tripPlan: TripDestination[];
  comparison: ComparisonState;
  conversationSummary: string[];
}

type TripAction =
  | { type: 'ADD_PREFERENCE'; payload: Omit<TravelPreference, 'addedAt'> }
  | { type: 'REMOVE_PREFERENCE'; payload: { category: string; value: string } }
  | { type: 'CLEAR_PREFERENCES'; payload: { category: string | 'all' } }
  | { type: 'ADD_TO_TRIP'; payload: Omit<TripDestination, 'addedAt'> }
  | { type: 'REMOVE_FROM_TRIP'; payload: { cityId: string } }
  | { type: 'CLEAR_TRIP' }
  | { type: 'SET_COMPARISON'; payload: ComparisonState }
  | { type: 'CLEAR_COMPARISON' }
  | { type: 'ADD_CONVERSATION_SUMMARY'; payload: string }
  | { type: 'RESET_ALL' };

const initialState: TripState = {
  preferences: [],
  tripPlan: [],
  comparison: {
    cities: [],
    focusAttributes: [],
    isActive: false,
  },
  conversationSummary: [],
};

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'ADD_PREFERENCE': {
      const existingIndex = state.preferences.findIndex(
        (p) => p.category === action.payload.category && p.value === action.payload.value
      );
      if (existingIndex >= 0) {
        return state;
      }
      return {
        ...state,
        preferences: [
          ...state.preferences,
          { ...action.payload, addedAt: Date.now() },
        ],
      };
    }

    case 'REMOVE_PREFERENCE':
      return {
        ...state,
        preferences: state.preferences.filter(
          (p) =>
            !(p.category === action.payload.category && p.value === action.payload.value)
        ),
      };

    case 'CLEAR_PREFERENCES':
      return {
        ...state,
        preferences:
          action.payload.category === 'all'
            ? []
            : state.preferences.filter((p) => p.category !== action.payload.category),
      };

    case 'ADD_TO_TRIP': {
      const existingIndex = state.tripPlan.findIndex(
        (d) => d.city.objectID === action.payload.city.objectID
      );
      if (existingIndex >= 0) {
        const updated = [...state.tripPlan];
        updated[existingIndex] = { ...action.payload, addedAt: Date.now() };
        return { ...state, tripPlan: updated };
      }
      return {
        ...state,
        tripPlan: [...state.tripPlan, { ...action.payload, addedAt: Date.now() }],
      };
    }

    case 'REMOVE_FROM_TRIP':
      return {
        ...state,
        tripPlan: state.tripPlan.filter((d) => d.city.objectID !== action.payload.cityId),
      };

    case 'CLEAR_TRIP':
      return { ...state, tripPlan: [] };

    case 'SET_COMPARISON':
      return { ...state, comparison: action.payload };

    case 'CLEAR_COMPARISON':
      return { ...state, comparison: initialState.comparison };

    case 'ADD_CONVERSATION_SUMMARY':
      return {
        ...state,
        conversationSummary: [...state.conversationSummary, action.payload].slice(-10),
      };

    case 'RESET_ALL':
      return initialState;

    default:
      return state;
  }
}

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
  activePreferencesText: string;
  hasPreferences: boolean;
  hasTripPlan: boolean;
  totalTripDays: number;
}

const TripContext = createContext<TripContextValue | null>(null);

interface TripProviderProps {
  children: ReactNode;
}

export function TripProvider({ children }: TripProviderProps) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  const activePreferencesText = useMemo(() => {
    if (state.preferences.length === 0) return '';
    return state.preferences.map((p) => `${p.category}: ${p.value}`).join(', ');
  }, [state.preferences]);

  const totalTripDays = useMemo(() => {
    return state.tripPlan.reduce((total, dest) => total + (dest.durationDays || 0), 0);
  }, [state.tripPlan]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      activePreferencesText,
      hasPreferences: state.preferences.length > 0,
      hasTripPlan: state.tripPlan.length > 0,
      totalTripDays,
    }),
    [state, activePreferencesText, totalTripDays]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within TripProvider');
  }
  return context;
}

export type { TripAction };
