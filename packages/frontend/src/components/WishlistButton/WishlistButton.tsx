'use client';

import { useCallback } from 'react';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { useTripContext } from '@/context/TripContext';
import { useWishlistPersistence } from '@/hooks/useWishlistPersistence';
import styles from './WishlistButton.module.css';

export interface WishlistButtonProps {
  city: AlgoliaCity;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'overlay';
  onToggle?: (isInWishlist: boolean) => void;
  className?: string;
}

export function WishlistButton({
  city,
  size = 'medium',
  variant = 'default',
  onToggle,
  className = '',
}: WishlistButtonProps) {
  const { state, dispatch } = useTripContext();
  const { saveWishlist } = useWishlistPersistence();

  const isInWishlist = state.wishlist.some(
    (item) => item.city.objectID === city.objectID
  );

  const handleToggle = useCallback(() => {
    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { cityId: city.objectID } });
      const newWishlist = state.wishlist.filter(
        (item) => item.city.objectID !== city.objectID
      );
      saveWishlist(newWishlist);
      onToggle?.(false);
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: { city, notes: null } });
      const newWishlist = [...state.wishlist, { city, notes: null, addedAt: Date.now() }];
      saveWishlist(newWishlist);
      onToggle?.(true);
    }
  }, [isInWishlist, city, dispatch, state.wishlist, saveWishlist, onToggle]);

  const ariaLabel = isInWishlist
    ? `Remove ${city.city} from wishlist`
    : `Add ${city.city} to wishlist`;

  return (
    <button
      type="button"
      className={`${styles.wishlistButton} ${styles[size]} ${styles[variant]} ${className}`}
      onClick={handleToggle}
      aria-pressed={isInWishlist}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-testid={`wishlist-button-${city.objectID}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isInWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className={styles.heartIcon}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
