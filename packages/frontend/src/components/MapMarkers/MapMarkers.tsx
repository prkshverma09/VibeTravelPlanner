'use client';

import { useCallback, useMemo } from 'react';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { MapMarker } from '../MapMarker';

interface MapMarkersProps {
  destinations: AlgoliaCity[];
  onMarkerClick?: (city: AlgoliaCity) => void;
  selectedCity?: AlgoliaCity | null;
  itineraryCityIds?: string[];
}

export function MapMarkers({
  destinations,
  onMarkerClick,
  selectedCity,
  itineraryCityIds = []
}: MapMarkersProps) {
  const getItineraryOrder = useCallback((cityId: string) => {
    return itineraryCityIds.indexOf(cityId);
  }, [itineraryCityIds]);

  const citiesWithGeoloc = useMemo(() => 
    destinations.filter(city => city._geoloc?.lat !== undefined && city._geoloc?.lng !== undefined),
    [destinations]
  );

  return (
    <>
      {citiesWithGeoloc.map(city => {
        const itineraryOrder = getItineraryOrder(city.objectID);
        const isInItinerary = itineraryOrder >= 0;

        return (
          <MapMarker
            key={city.objectID}
            city={city}
            isSelected={selectedCity?.objectID === city.objectID}
            isInItinerary={isInItinerary}
            itineraryOrder={isInItinerary ? itineraryOrder : undefined}
            onClick={onMarkerClick}
          />
        );
      })}
    </>
  );
}
