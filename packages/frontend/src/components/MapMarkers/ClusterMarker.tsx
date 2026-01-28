'use client';

import { memo } from 'react';
import { Marker } from 'react-map-gl';
import type { VibeCategory } from '@vibe-travel/shared';
import { VIBE_COLORS } from '@vibe-travel/shared';
import styles from './ClusterMarker.module.css';

interface ClusterMarkerProps {
  latitude: number;
  longitude: number;
  pointCount: number;
  vibes?: Record<VibeCategory, number>;
  onClick?: () => void;
}

export const ClusterMarker = memo(function ClusterMarker({
  latitude,
  longitude,
  pointCount,
  vibes,
  onClick
}: ClusterMarkerProps) {
  const dominantVibe = vibes
    ? (Object.entries(vibes).sort(([, a], [, b]) => b - a)[0]?.[0] as VibeCategory)
    : 'cultural';

  const dominantColor = VIBE_COLORS[dominantVibe] || VIBE_COLORS.cultural;

  const size = Math.min(Math.max(pointCount * 3 + 24, 30), 60);

  return (
    <Marker latitude={latitude} longitude={longitude} anchor="center">
      <button
        className={styles.cluster}
        style={{
          width: size,
          height: size,
          backgroundColor: dominantColor,
        }}
        onClick={onClick}
        aria-label={`Cluster of ${pointCount} destinations`}
        type="button"
        data-testid="cluster-marker"
      >
        <span className={styles.count}>{pointCount}</span>
      </button>
    </Marker>
  );
});
