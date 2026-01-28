'use client';

import { useCallback, useState } from 'react';

interface BoundingBox {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

export function useGeoSearch() {
  const [searchOnMove, setSearchOnMove] = useState(false);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);

  const updateBounds = useCallback((bounds: BoundingBox) => {
    setBoundingBox(bounds);
  }, []);

  const toggleSearchOnMove = useCallback(() => {
    setSearchOnMove(prev => !prev);
  }, []);

  const clearBounds = useCallback(() => {
    setBoundingBox(null);
  }, []);

  const getSearchParams = useCallback(() => {
    if (!boundingBox || !searchOnMove) {
      return {};
    }

    return {
      insideBoundingBox: [[
        boundingBox.northEast.lat,
        boundingBox.northEast.lng,
        boundingBox.southWest.lat,
        boundingBox.southWest.lng,
      ]],
    };
  }, [boundingBox, searchOnMove]);

  return {
    searchOnMove,
    boundingBox,
    toggleSearchOnMove,
    updateBounds,
    clearBounds,
    getSearchParams,
  };
}
