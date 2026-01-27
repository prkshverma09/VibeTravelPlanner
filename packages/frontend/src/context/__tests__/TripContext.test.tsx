import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TripProvider, useTripContext } from '../TripContext';
import { mockCities } from '@vibe-travel/shared';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <TripProvider>{children}</TripProvider>
);

describe('TripContext', () => {
  describe('initial state', () => {
    it('should have empty preferences initially', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });
      expect(result.current.state.preferences).toEqual([]);
    });

    it('should have empty trip plan initially', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });
      expect(result.current.state.tripPlan).toEqual([]);
    });

    it('should have inactive comparison initially', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });
      expect(result.current.state.comparison.isActive).toBe(false);
      expect(result.current.state.comparison.cities).toEqual([]);
    });

    it('should provide computed values', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });
      expect(result.current.hasPreferences).toBe(false);
      expect(result.current.hasTripPlan).toBe(false);
      expect(result.current.activePreferencesText).toBe('');
    });
  });

  describe('preferences management', () => {
    it('should add a preference', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'romantic', priority: 'must_have' },
        });
      });

      expect(result.current.state.preferences).toHaveLength(1);
      expect(result.current.state.preferences[0]).toMatchObject({
        category: 'vibe',
        value: 'romantic',
        priority: 'must_have',
      });
      expect(result.current.hasPreferences).toBe(true);
    });

    it('should not add duplicate preferences', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'romantic', priority: 'must_have' },
        });
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'romantic', priority: 'must_have' },
        });
      });

      expect(result.current.state.preferences).toHaveLength(1);
    });

    it('should allow same value in different categories', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'beach', priority: 'must_have' },
        });
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'activity', value: 'beach', priority: 'nice_to_have' },
        });
      });

      expect(result.current.state.preferences).toHaveLength(2);
    });

    it('should remove a specific preference', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'romantic', priority: 'must_have' },
        });
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'geography', value: 'Europe', priority: 'must_have' },
        });
      });

      expect(result.current.state.preferences).toHaveLength(2);

      act(() => {
        result.current.dispatch({
          type: 'REMOVE_PREFERENCE',
          payload: { category: 'vibe', value: 'romantic' },
        });
      });

      expect(result.current.state.preferences).toHaveLength(1);
      expect(result.current.state.preferences[0].category).toBe('geography');
    });

    it('should clear preferences by category', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'romantic', priority: 'must_have' },
        });
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'peaceful', priority: 'nice_to_have' },
        });
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'geography', value: 'Europe', priority: 'must_have' },
        });
      });

      expect(result.current.state.preferences).toHaveLength(3);

      act(() => {
        result.current.dispatch({
          type: 'CLEAR_PREFERENCES',
          payload: { category: 'vibe' },
        });
      });

      expect(result.current.state.preferences).toHaveLength(1);
      expect(result.current.state.preferences[0].category).toBe('geography');
    });

    it('should clear all preferences', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'romantic', priority: 'must_have' },
        });
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'geography', value: 'Europe', priority: 'must_have' },
        });
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'budget', value: 'budget-friendly', priority: 'nice_to_have' },
        });
      });

      expect(result.current.state.preferences).toHaveLength(3);

      act(() => {
        result.current.dispatch({
          type: 'CLEAR_PREFERENCES',
          payload: { category: 'all' },
        });
      });

      expect(result.current.state.preferences).toHaveLength(0);
      expect(result.current.hasPreferences).toBe(false);
    });

    it('should generate activePreferencesText correctly', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'romantic', priority: 'must_have' },
        });
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'geography', value: 'Europe', priority: 'must_have' },
        });
      });

      expect(result.current.activePreferencesText).toContain('vibe: romantic');
      expect(result.current.activePreferencesText).toContain('geography: Europe');
    });
  });

  describe('trip plan management', () => {
    it('should add destination to trip', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });
      const city = mockCities[0];

      act(() => {
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city, durationDays: 5, notes: 'Honeymoon spot' },
        });
      });

      expect(result.current.state.tripPlan).toHaveLength(1);
      expect(result.current.state.tripPlan[0].city.objectID).toBe(city.objectID);
      expect(result.current.state.tripPlan[0].durationDays).toBe(5);
      expect(result.current.state.tripPlan[0].notes).toBe('Honeymoon spot');
      expect(result.current.hasTripPlan).toBe(true);
    });

    it('should update existing destination instead of adding duplicate', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });
      const city = mockCities[0];

      act(() => {
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city, durationDays: 5, notes: null },
        });
      });

      expect(result.current.state.tripPlan).toHaveLength(1);
      expect(result.current.state.tripPlan[0].durationDays).toBe(5);

      act(() => {
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city, durationDays: 7, notes: 'Updated duration' },
        });
      });

      expect(result.current.state.tripPlan).toHaveLength(1);
      expect(result.current.state.tripPlan[0].durationDays).toBe(7);
      expect(result.current.state.tripPlan[0].notes).toBe('Updated duration');
    });

    it('should add multiple different destinations', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city: mockCities[0], durationDays: 3, notes: null },
        });
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city: mockCities[1], durationDays: 4, notes: null },
        });
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city: mockCities[2], durationDays: 5, notes: null },
        });
      });

      expect(result.current.state.tripPlan).toHaveLength(3);
    });

    it('should remove destination from trip', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });
      const city = mockCities[0];

      act(() => {
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city, durationDays: 5, notes: null },
        });
      });

      expect(result.current.state.tripPlan).toHaveLength(1);

      act(() => {
        result.current.dispatch({
          type: 'REMOVE_FROM_TRIP',
          payload: { cityId: city.objectID },
        });
      });

      expect(result.current.state.tripPlan).toHaveLength(0);
      expect(result.current.hasTripPlan).toBe(false);
    });

    it('should clear entire trip', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city: mockCities[0], durationDays: 3, notes: null },
        });
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city: mockCities[1], durationDays: 4, notes: null },
        });
      });

      expect(result.current.state.tripPlan).toHaveLength(2);

      act(() => {
        result.current.dispatch({ type: 'CLEAR_TRIP' });
      });

      expect(result.current.state.tripPlan).toHaveLength(0);
    });

    it('should calculate total trip duration', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city: mockCities[0], durationDays: 3, notes: null },
        });
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city: mockCities[1], durationDays: 4, notes: null },
        });
      });

      expect(result.current.totalTripDays).toBe(7);
    });
  });

  describe('comparison management', () => {
    it('should set comparison state', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });
      const cities = mockCities.slice(0, 2);

      act(() => {
        result.current.dispatch({
          type: 'SET_COMPARISON',
          payload: {
            cities,
            focusAttributes: ['culture_score', 'nightlife_score'],
            isActive: true,
          },
        });
      });

      expect(result.current.state.comparison.isActive).toBe(true);
      expect(result.current.state.comparison.cities).toHaveLength(2);
      expect(result.current.state.comparison.focusAttributes).toContain('culture_score');
    });

    it('should clear comparison', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'SET_COMPARISON',
          payload: {
            cities: mockCities.slice(0, 2),
            focusAttributes: ['beach_score'],
            isActive: true,
          },
        });
      });

      expect(result.current.state.comparison.isActive).toBe(true);

      act(() => {
        result.current.dispatch({ type: 'CLEAR_COMPARISON' });
      });

      expect(result.current.state.comparison.isActive).toBe(false);
      expect(result.current.state.comparison.cities).toHaveLength(0);
      expect(result.current.state.comparison.focusAttributes).toHaveLength(0);
    });
  });

  describe('conversation summary', () => {
    it('should add conversation summaries', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_CONVERSATION_SUMMARY',
          payload: 'User is looking for romantic destinations',
        });
      });

      expect(result.current.state.conversationSummary).toHaveLength(1);
      expect(result.current.state.conversationSummary[0]).toBe('User is looking for romantic destinations');
    });

    it('should limit conversation summaries to 10', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.dispatch({
            type: 'ADD_CONVERSATION_SUMMARY',
            payload: `Summary ${i + 1}`,
          });
        }
      });

      expect(result.current.state.conversationSummary).toHaveLength(10);
      expect(result.current.state.conversationSummary[0]).toBe('Summary 6');
      expect(result.current.state.conversationSummary[9]).toBe('Summary 15');
    });
  });

  describe('reset all', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useTripContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'ADD_PREFERENCE',
          payload: { category: 'vibe', value: 'romantic', priority: 'must_have' },
        });
        result.current.dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city: mockCities[0], durationDays: 5, notes: null },
        });
        result.current.dispatch({
          type: 'SET_COMPARISON',
          payload: {
            cities: mockCities.slice(0, 2),
            focusAttributes: [],
            isActive: true,
          },
        });
        result.current.dispatch({
          type: 'ADD_CONVERSATION_SUMMARY',
          payload: 'Test summary',
        });
      });

      expect(result.current.state.preferences).toHaveLength(1);
      expect(result.current.state.tripPlan).toHaveLength(1);
      expect(result.current.state.comparison.isActive).toBe(true);

      act(() => {
        result.current.dispatch({ type: 'RESET_ALL' });
      });

      expect(result.current.state.preferences).toHaveLength(0);
      expect(result.current.state.tripPlan).toHaveLength(0);
      expect(result.current.state.comparison.isActive).toBe(false);
      expect(result.current.state.conversationSummary).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useTripContext());
      }).toThrow('useTripContext must be used within TripProvider');
    });
  });
});
