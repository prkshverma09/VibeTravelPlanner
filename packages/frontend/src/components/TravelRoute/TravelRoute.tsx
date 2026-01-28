'use client';

import { useMemo } from 'react';
import { Source, Layer, type LayerProps } from 'react-map-gl';

interface TravelRouteProps {
  coordinates: number[][];
}

const routeLayerStyle: LayerProps = {
  id: 'route-line',
  type: 'line',
  paint: {
    'line-color': '#667eea',
    'line-width': 3,
    'line-dasharray': [2, 2],
  },
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
};

export function TravelRoute({ coordinates }: TravelRouteProps) {
  const routeGeoJSON = useMemo(() => {
    if (coordinates.length < 2) return null;

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates,
      },
    };
  }, [coordinates]);

  if (!routeGeoJSON) return null;

  return (
    <Source id="route" type="geojson" data={routeGeoJSON}>
      <Layer {...routeLayerStyle} />
    </Source>
  );
}
