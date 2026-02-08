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
  isHovered?: boolean;
  isDimmed?: boolean;
  itineraryOrder?: number;
  onClick?: (city: AlgoliaCity) => void;
  onMouseEnter?: (city: AlgoliaCity) => void;
  onMouseLeave?: () => void;
}

export const MapMarker = memo(function MapMarker({
  city,
  isSelected,
  isInItinerary,
  isHovered,
  isDimmed,
  itineraryOrder,
  onClick,
  onMouseEnter,
  onMouseLeave,
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
        className={`${styles.marker} ${isSelected ? styles.selected : ''} ${isInItinerary ? styles.inItinerary : ''} ${isHovered ? styles.hovered : ''} ${isDimmed ? styles.dimmed : ''}`}
        style={{ '--marker-color': color } as React.CSSProperties}
        onClick={handleClick}
        onMouseEnter={() => onMouseEnter?.(city)}
        onMouseLeave={() => onMouseLeave?.()}
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
