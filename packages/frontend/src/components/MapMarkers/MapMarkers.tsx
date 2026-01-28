'use client';

import { useCallback } from 'react';
import { useMap } from 'react-map-gl';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { useMapClusters } from '../../hooks/useMapClusters';
import { MapMarker } from '../MapMarker';
import { ClusterMarker } from './ClusterMarker';

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
  const { current: map } = useMap();

  const bounds = map?.getBounds()?.toArray().flat() as [number, number, number, number] | null;
  const zoom = map?.getZoom() || 1;

  const { clusters, supercluster } = useMapClusters(destinations, bounds, zoom);

  const handleClusterClick = useCallback((clusterId: number, lng: number, lat: number) => {
    if (!supercluster || !map) return;

    const expansionZoom = Math.min(
      supercluster.getClusterExpansionZoom(clusterId),
      16
    );

    map.flyTo({
      center: [lng, lat],
      zoom: expansionZoom,
      duration: 500,
    });
  }, [supercluster, map]);

  const getItineraryOrder = useCallback((cityId: string) => {
    return itineraryCityIds.indexOf(cityId);
  }, [itineraryCityIds]);

  return (
    <>
      {clusters.map(cluster => {
        const [lng, lat] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count, city, cityId, vibes } = cluster.properties;

        if (isCluster) {
          return (
            <ClusterMarker
              key={`cluster-${cluster.id}`}
              latitude={lat}
              longitude={lng}
              pointCount={point_count || 0}
              vibes={vibes}
              onClick={() => handleClusterClick(cluster.id as number, lng, lat)}
            />
          );
        }

        if (!city) return null;

        const itineraryOrder = getItineraryOrder(cityId || '');
        const isInItinerary = itineraryOrder >= 0;

        return (
          <MapMarker
            key={cityId}
            city={city}
            isSelected={selectedCity?.objectID === cityId}
            isInItinerary={isInItinerary}
            itineraryOrder={isInItinerary ? itineraryOrder : undefined}
            onClick={onMarkerClick}
          />
        );
      })}
    </>
  );
}
