'use client';

import { useCallback, useMemo } from 'react';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { useTripContext } from '@/context/TripContext';

export interface ItineraryStop {
  city: AlgoliaCity;
  order: number;
}

export function useItinerary() {
  const { state, dispatch } = useTripContext();

  const stops: ItineraryStop[] = useMemo(
    () =>
      state.tripPlan.map((d, i) => ({
        city: d.city,
        order: i,
      })),
    [state.tripPlan]
  );

  const addStop = useCallback(
    (city: AlgoliaCity) => {
      if (state.tripPlan.some((d) => d.city.objectID === city.objectID)) return;
      dispatch({
        type: 'ADD_TO_TRIP',
        payload: { city, durationDays: null, notes: null },
      });
    },
    [state.tripPlan, dispatch]
  );

  const removeStop = useCallback(
    (cityId: string) => {
      dispatch({ type: 'REMOVE_FROM_TRIP', payload: { cityId } });
    },
    [dispatch]
  );

  const reorderStops = useCallback(
    (fromIndex: number, toIndex: number) => {
      dispatch({ type: 'REORDER_TRIP', payload: { fromIndex, toIndex } });
    },
    [dispatch]
  );

  const clearItinerary = useCallback(() => {
    dispatch({ type: 'CLEAR_TRIP' });
  }, [dispatch]);

  const coordinates = useMemo(
    () =>
      stops
        .filter(
          (s) =>
            s.city._geoloc?.lat !== undefined && s.city._geoloc?.lng !== undefined
        )
        .map((s) => [s.city._geoloc!.lng, s.city._geoloc!.lat]),
    [stops]
  );

  const isInItinerary = useCallback(
    (cityId: string) =>
      state.tripPlan.some((d) => d.city.objectID === cityId),
    [state.tripPlan]
  );

  const toggleStop = useCallback(
    (city: AlgoliaCity) => {
      if (state.tripPlan.some((d) => d.city.objectID === city.objectID)) {
        dispatch({ type: 'REMOVE_FROM_TRIP', payload: { cityId: city.objectID } });
      } else {
        dispatch({
          type: 'ADD_TO_TRIP',
          payload: { city, durationDays: null, notes: null },
        });
      }
    },
    [state.tripPlan, dispatch]
  );

  return {
    stops,
    coordinates,
    addStop,
    removeStop,
    reorderStops,
    clearItinerary,
    isInItinerary,
    toggleStop,
    hasRoute: stops.length >= 2,
    totalStops: stops.length,
  };
}
