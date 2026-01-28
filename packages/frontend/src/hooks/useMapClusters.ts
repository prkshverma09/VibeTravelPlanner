'use client';

import { useMemo } from 'react';
import useSupercluster from 'use-supercluster';
import type { AlgoliaCity, VibeCategory } from '@vibe-travel/shared';
import { calculatePrimaryVibe } from '@vibe-travel/shared';

interface ClusterProperties {
  cluster: boolean;
  cityId?: string;
  city?: AlgoliaCity;
  point_count?: number;
  vibes?: Record<VibeCategory, number>;
}

export type MapPoint = GeoJSON.Feature<GeoJSON.Point, ClusterProperties>;

export function useMapClusters(
  destinations: AlgoliaCity[],
  bounds: [number, number, number, number] | null,
  zoom: number
) {
  const points: MapPoint[] = useMemo(() => {
    return destinations
      .filter(city => city._geoloc?.lat !== undefined && city._geoloc?.lng !== undefined)
      .map(city => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          cityId: city.objectID,
          city,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [city._geoloc!.lng, city._geoloc!.lat],
        },
      }));
  }, [destinations]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: bounds || undefined,
    zoom,
    options: {
      radius: 75,
      maxZoom: 16,
      reduce: (accumulated: ClusterProperties, props: ClusterProperties) => {
        if (!accumulated.vibes) {
          accumulated.vibes = {
            adventure: 0,
            romantic: 0,
            cultural: 0,
            beach: 0,
            nightlife: 0,
            nature: 0,
          };
        }

        if (props.city) {
          const vibe = props.city.primary_vibe || calculatePrimaryVibe(props.city);
          accumulated.vibes[vibe] = (accumulated.vibes[vibe] || 0) + 1;
        }
      },
    },
  });

  return { clusters, supercluster };
}
