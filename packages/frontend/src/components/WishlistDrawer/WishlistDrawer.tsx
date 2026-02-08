'use client';

import { useEffect, useCallback } from 'react';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { useTripContext, type WishlistItem } from '@/context/TripContext';
import { useWishlistPersistence } from '@/hooks/useWishlistPersistence';
import styles from './WishlistDrawer.module.css';

export interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCityClick?: (city: AlgoliaCity) => void;
}

function WishlistCard({
  item,
  onRemove,
  onClick,
}: {
  item: WishlistItem;
  onRemove: (cityId: string) => void;
  onClick?: (city: AlgoliaCity) => void;
}) {
  return (
    <div className={styles.wishlistCard}>
      <button
        type="button"
        className={styles.cardContent}
        onClick={() => onClick?.(item.city)}
        aria-label={`View ${item.city.city}, ${item.city.country}`}
      >
        {item.city.image_url && (
          <div className={styles.imageWrapper}>
            <img
              src={item.city.image_url}
              alt={item.city.city}
              className={styles.cityImage}
            />
          </div>
        )}
        <div className={styles.cityInfo}>
          <h3 className={styles.cityName}>{item.city.city}</h3>
          <p className={styles.cityCountry}>{item.city.country}</p>
          {item.notes && <p className={styles.notes}>{item.notes}</p>}
        </div>
      </button>
      <button
        type="button"
        className={styles.removeButton}
        onClick={() => onRemove(item.city.objectID)}
        aria-label={`Remove ${item.city.city} from wishlist`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.removeIcon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function WishlistDrawer({ isOpen, onClose, onCityClick }: WishlistDrawerProps) {
  const { state, dispatch } = useTripContext();
  const { saveWishlist } = useWishlistPersistence();

  const wishlist = state?.wishlist ?? [];

  const handleRemove = useCallback(
    (cityId: string) => {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { cityId } });
      const newWishlist = wishlist.filter((item) => item.city.objectID !== cityId);
      saveWishlist(newWishlist);
    },
    [dispatch, wishlist, saveWishlist]
  );

  const handleCityClick = useCallback(
    (city: AlgoliaCity) => {
      onCityClick?.(city);
      onClose();
    },
    [onCityClick, onClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      data-testid="drawer-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Your Wishlist"
      >
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>
              <svg viewBox="0 0 24 24" fill="currentColor" className={styles.heartTitleIcon}>
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              My Wishlist
            </h2>
            <span className={styles.count}>{wishlist.length} saved</span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close wishlist"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className={styles.content}>
          {wishlist.length === 0 ? (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <h3>No saved destinations yet</h3>
              <p>Start saving places you love by clicking the heart icon on any destination.</p>
            </div>
          ) : (
            <div className={styles.wishlistItems}>
              {wishlist.map((item) => (
                <WishlistCard
                  key={item.city.objectID}
                  item={item}
                  onRemove={handleRemove}
                  onClick={handleCityClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
