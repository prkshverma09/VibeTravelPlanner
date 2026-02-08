'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { getVibeColor, calculatePrimaryVibe } from '@vibe-travel/shared';
import styles from './MiniMap.module.css';

import 'mapbox-gl/dist/mapbox-gl.css';

interface MiniMapProps {
  cities: AlgoliaCity[];
  onMarkerClick?: (city: AlgoliaCity) => void;
  className?: string;
}

const DEFAULT_VIEW = {
  latitude: 20,
  longitude: 0,
  zoom: 1.5,
};

export function MiniMap({ cities, onMarkerClick, className }: MiniMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState(DEFAULT_VIEW);

  const withCoords = cities.filter(
    (c) => c._geoloc?.lat != null && c._geoloc?.lng != null
  );

  useEffect(() => {
    if (!mapRef.current || withCoords.length === 0) return;
    const lngs = withCoords.map((c) => c._geoloc!.lng);
    const lats = withCoords.map((c) => c._geoloc!.lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    if (minLng === maxLng && minLat === maxLat) {
      mapRef.current.flyTo({
        center: [minLng, minLat],
        zoom: 5,
        duration: 600,
      });
    } else {
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { duration: 600, padding: 24 }
      );
    }
  }, [withCoords]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!mapboxToken || withCoords.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.container} ${className ?? ''}`} data-testid="mini-map">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%', borderRadius: 8 }}
        attributionControl={false}
        interactive={true}
        dragPan={true}
        scrollZoom={false}
        dragRotate={false}
      >
        {withCoords.map((city) => {
          const primaryVibe = city.primary_vibe || calculatePrimaryVibe(city);
          const color = getVibeColor(primaryVibe);
          return (
            <Marker
              key={city.objectID}
              latitude={city._geoloc!.lat}
              longitude={city._geoloc!.lng}
              anchor="bottom"
            >
              <button
                className={styles.marker}
                style={{ '--marker-color': color } as React.CSSProperties}
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkerClick?.(city);
                }}
                aria-label={`Show ${city.city} on map`}
                type="button"
              >
                <span className={styles.pin} />
              </button>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
