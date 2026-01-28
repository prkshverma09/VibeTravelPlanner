'use client';

import { useState, useCallback, useMemo } from 'react';
import type { AlgoliaCity } from '@vibe-travel/shared';

export interface ItineraryStop {
  city: AlgoliaCity;
  order: number;
}

export function useItinerary() {
  const [stops, setStops] = useState<ItineraryStop[]>([]);

  const addStop = useCallback((city: AlgoliaCity) => {
    setStops(prev => {
      if (prev.some(s => s.city.objectID === city.objectID)) {
        return prev;
      }
      return [...prev, { city, order: prev.length }];
    });
  }, []);

  const removeStop = useCallback((cityId: string) => {
    setStops(prev =>
      prev
        .filter(s => s.city.objectID !== cityId)
        .map((s, i) => ({ ...s, order: i }))
    );
  }, []);

  const reorderStops = useCallback((fromIndex: number, toIndex: number) => {
    setStops(prev => {
      const newStops = [...prev];
      const [removed] = newStops.splice(fromIndex, 1);
      newStops.splice(toIndex, 0, removed);
      return newStops.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const clearItinerary = useCallback(() => {
    setStops([]);
  }, []);

  const coordinates = useMemo(() => {
    return stops
      .filter(s => s.city._geoloc?.lat !== undefined && s.city._geoloc?.lng !== undefined)
      .map(s => [s.city._geoloc!.lng, s.city._geoloc!.lat]);
  }, [stops]);

  const isInItinerary = useCallback((cityId: string) => {
    return stops.some(s => s.city.objectID === cityId);
  }, [stops]);

  const toggleStop = useCallback((city: AlgoliaCity) => {
    if (stops.some(s => s.city.objectID === city.objectID)) {
      removeStop(city.objectID);
    } else {
      addStop(city);
    }
  }, [stops, addStop, removeStop]);

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
