'use client';

import { useState } from 'react';
import { VIBE_COLORS, VIBE_LABELS, VIBE_ICONS, getAllVibeCategories } from '@vibe-travel/shared';
import styles from './MapLegend.module.css';

export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(true);
  const vibes = getAllVibeCategories();

  return (
    <div className={styles.legend} data-testid="map-legend">
      <button
        className={styles.toggle}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Toggle legend"
        type="button"
      >
        <span className={styles.toggleIcon}>
          {isExpanded ? '▼' : '▲'}
        </span>
        <span>Vibe Legend</span>
      </button>

      {isExpanded && (
        <ul className={styles.list}>
          {vibes.map(vibe => (
            <li key={vibe} className={styles.item}>
              <span
                className={styles.colorDot}
                style={{ backgroundColor: VIBE_COLORS[vibe] }}
              />
              <span className={styles.icon}>{VIBE_ICONS[vibe]}</span>
              <span className={styles.label}>{VIBE_LABELS[vibe]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
