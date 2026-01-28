'use client';

import { memo } from 'react';
import { Marker } from 'react-map-gl';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { getVibeColor, calculatePrimaryVibe } from '@vibe-travel/shared';
import styles from './MapMarker.module.css';

interface MapMarkerProps {
  city: AlgoliaCity;
  isSelected?: boolean;
  isInItinerary?: boolean;
  itineraryOrder?: number;
  onClick?: (city: AlgoliaCity) => void;
}

export const MapMarker = memo(function MapMarker({
  city,
  isSelected,
  isInItinerary,
  itineraryOrder,
  onClick
}: MapMarkerProps) {
  if (!city._geoloc) return null;

  const primaryVibe = city.primary_vibe || calculatePrimaryVibe(city);
  const color = getVibeColor(primaryVibe);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(city);
  };

  return (
    <Marker
      latitude={city._geoloc.lat}
      longitude={city._geoloc.lng}
      anchor="bottom"
    >
      <button
        className={`${styles.marker} ${isSelected ? styles.selected : ''} ${isInItinerary ? styles.inItinerary : ''}`}
        style={{ '--marker-color': color } as React.CSSProperties}
        onClick={handleClick}
        aria-label={`View ${city.city}, ${city.country}`}
        type="button"
        data-testid="map-marker"
      >
        <span className={styles.pin}>
          {isInItinerary && itineraryOrder !== undefined ? (
            <span className={styles.orderNumber}>{itineraryOrder + 1}</span>
          ) : (
            <span className={styles.pinInner} />
          )}
        </span>
        {isSelected && (
          <span className={styles.label}>{city.city}</span>
        )}
      </button>
    </Marker>
  );
});
