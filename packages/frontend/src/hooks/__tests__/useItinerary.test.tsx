import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useItinerary } from '../useItinerary';
import { TripProvider } from '@/context/TripContext';
import { mockCities } from '@vibe-travel/shared';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <TripProvider>{children}</TripProvider>
);

describe('useItinerary', () => {
  it('should have empty stops initially', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });
    expect(result.current.stops).toEqual([]);
    expect(result.current.totalStops).toBe(0);
    expect(result.current.hasRoute).toBe(false);
  });

  it('should add stop and sync with TripContext', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    act(() => {
      result.current.addStop(mockCities[0]);
    });

    expect(result.current.stops).toHaveLength(1);
    expect(result.current.stops[0].city.objectID).toBe(mockCities[0].objectID);
    expect(result.current.stops[0].order).toBe(0);
    expect(result.current.totalStops).toBe(1);
    expect(result.current.isInItinerary(mockCities[0].objectID)).toBe(true);
  });

  it('should not add duplicate city', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    act(() => {
      result.current.addStop(mockCities[0]);
      result.current.addStop(mockCities[0]);
    });

    expect(result.current.stops).toHaveLength(1);
  });

  it('should remove stop', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    act(() => {
      result.current.addStop(mockCities[0]);
      result.current.addStop(mockCities[1]);
    });
    expect(result.current.stops).toHaveLength(2);

    act(() => {
      result.current.removeStop(mockCities[0].objectID);
    });

    expect(result.current.stops).toHaveLength(1);
    expect(result.current.stops[0].city.objectID).toBe(mockCities[1].objectID);
    expect(result.current.isInItinerary(mockCities[0].objectID)).toBe(false);
  });

  it('should clear itinerary', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    act(() => {
      result.current.addStop(mockCities[0]);
      result.current.addStop(mockCities[1]);
    });
    expect(result.current.totalStops).toBe(2);

    act(() => {
      result.current.clearItinerary();
    });

    expect(result.current.stops).toEqual([]);
    expect(result.current.totalStops).toBe(0);
  });

  it('should toggle stop on when not in itinerary', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    act(() => {
      result.current.toggleStop(mockCities[0]);
    });

    expect(result.current.stops).toHaveLength(1);
    expect(result.current.isInItinerary(mockCities[0].objectID)).toBe(true);
  });

  it('should toggle stop off when already in itinerary', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    act(() => {
      result.current.addStop(mockCities[0]);
    });
    expect(result.current.stops).toHaveLength(1);

    act(() => {
      result.current.toggleStop(mockCities[0]);
    });

    expect(result.current.stops).toHaveLength(0);
    expect(result.current.isInItinerary(mockCities[0].objectID)).toBe(false);
  });

  it('should provide coordinates for route when stops have geoloc', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });
    const cityWithGeoloc = { ...mockCities[0], _geoloc: { lat: 35.6, lng: 139.7 } };

    act(() => {
      result.current.addStop(cityWithGeoloc as typeof mockCities[0]);
      result.current.addStop({
        ...mockCities[1],
        _geoloc: { lat: 48.8, lng: 2.3 },
      } as typeof mockCities[1]);
    });

    expect(result.current.coordinates).toHaveLength(2);
    expect(result.current.coordinates[0]).toEqual([139.7, 35.6]);
    expect(result.current.coordinates[1]).toEqual([2.3, 48.8]);
    expect(result.current.hasRoute).toBe(true);
  });

  it('should reorder stops', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    act(() => {
      result.current.addStop(mockCities[0]);
      result.current.addStop(mockCities[1]);
      result.current.addStop(mockCities[2]);
    });
    expect(result.current.stops.map((s) => s.city.objectID)).toEqual([
      mockCities[0].objectID,
      mockCities[1].objectID,
      mockCities[2].objectID,
    ]);

    act(() => {
      result.current.reorderStops(0, 2);
    });

    expect(result.current.stops.map((s) => s.city.objectID)).toEqual([
      mockCities[1].objectID,
      mockCities[2].objectID,
      mockCities[0].objectID,
    ]);
  });
});
