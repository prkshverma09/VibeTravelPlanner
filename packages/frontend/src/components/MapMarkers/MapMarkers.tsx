'use client';

import { useCallback, useMemo } from 'react';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { MapMarker } from '../MapMarker';

interface MapMarkersProps {
  destinations: AlgoliaCity[];
  onMarkerClick?: (city: AlgoliaCity) => void;
  selectedCity?: AlgoliaCity | null;
  itineraryCityIds?: string[];
  hoveredCityId?: string | null;
  onMarkerHover?: (cityId: string | null) => void;
}

export function MapMarkers({
  destinations,
  onMarkerClick,
  selectedCity,
  itineraryCityIds = [],
  hoveredCityId = null,
  onMarkerHover,
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
            isHovered={hoveredCityId === city.objectID}
            itineraryOrder={isInItinerary ? itineraryOrder : undefined}
            onClick={onMarkerClick}
            onMouseEnter={() => onMarkerHover?.(city.objectID)}
            onMouseLeave={() => onMarkerHover?.(null)}
          />
        );
      })}
    </>
  );
}
