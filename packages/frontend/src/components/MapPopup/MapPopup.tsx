'use client';

import { Popup } from 'react-map-gl';
import Image from 'next/image';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { truncateDescription } from '@vibe-travel/shared';
import { VibeTag } from '../VibeTag';
import { ScoreBadge } from '../ScoreBadge';
import styles from './MapPopup.module.css';

interface MapPopupProps {
  city: AlgoliaCity;
  onClose: () => void;
  onViewDetails?: () => void;
  onAddToItinerary?: () => void;
  isInItinerary?: boolean;
}

export function MapPopup({
  city,
  onClose,
  onViewDetails,
  onAddToItinerary,
  isInItinerary
}: MapPopupProps) {
  if (!city._geoloc) return null;

  return (
    <Popup
      latitude={city._geoloc.lat}
      longitude={city._geoloc.lng}
      anchor="bottom"
      offset={30}
      closeOnClick={false}
      onClose={onClose}
      className={styles.popup}
    >
      <article className={styles.card} data-testid="map-popup">
        <div className={styles.imageContainer}>
          <Image
            src={city.image_url || '/placeholder-city.jpg'}
            alt={city.city}
            fill
            className={styles.image}
            sizes="280px"
          />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>
            {city.city}, {city.country}
          </h3>

          <div className={styles.tags}>
            {city.vibe_tags.slice(0, 3).map(tag => (
              <VibeTag key={tag}>{tag}</VibeTag>
            ))}
          </div>

          <p className={styles.description}>
            {truncateDescription(city.description, 100)}
          </p>

          <div className={styles.scores}>
            <ScoreBadge type="culture" score={city.culture_score} showLabel={false} />
            <ScoreBadge type="adventure" score={city.adventure_score} showLabel={false} />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.viewButton}
              onClick={onViewDetails}
              type="button"
              data-testid="popup-view-details"
            >
              View Details
            </button>
            {onAddToItinerary && (
              <button
                className={`${styles.itineraryButton} ${isInItinerary ? styles.inItinerary : ''}`}
                onClick={onAddToItinerary}
                type="button"
                data-testid="popup-add-itinerary"
              >
                {isInItinerary ? 'Remove' : '+ Add'}
              </button>
            )}
          </div>
        </div>
      </article>
    </Popup>
  );
}
