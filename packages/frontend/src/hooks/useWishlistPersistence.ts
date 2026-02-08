'use client';

import { useCallback } from 'react';
import type { WishlistItem } from '@/context/TripContext';
import type { AlgoliaCity } from '@vibe-travel/shared';

export const WISHLIST_STORAGE_KEY = 'vibe-travel-wishlist';

export function useWishlistPersistence() {
  const loadWishlist = useCallback((): WishlistItem[] => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      return parsed;
    } catch {
      return [];
    }
  }, []);

  const saveWishlist = useCallback((wishlist: WishlistItem[]): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
    }
  }, []);

  const clearWishlist = useCallback((): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } catch {
    }
  }, []);

  const isInWishlist = useCallback(
    (wishlist: WishlistItem[], cityId: string): boolean => {
      return wishlist.some((item) => item.city.objectID === cityId);
    },
    []
  );

  const addToWishlist = useCallback(
    (
      currentWishlist: WishlistItem[],
      city: AlgoliaCity,
      notes?: string | null
    ): WishlistItem[] => {
      const existingIndex = currentWishlist.findIndex(
        (item) => item.city.objectID === city.objectID
      );

      let newWishlist: WishlistItem[];

      if (existingIndex >= 0) {
        newWishlist = [...currentWishlist];
        newWishlist[existingIndex] = {
          city,
          notes: notes ?? null,
          addedAt: Date.now(),
        };
      } else {
        newWishlist = [
          ...currentWishlist,
          {
            city,
            notes: notes ?? null,
            addedAt: Date.now(),
          },
        ];
      }

      saveWishlist(newWishlist);
      return newWishlist;
    },
    [saveWishlist]
  );

  const removeFromWishlist = useCallback(
    (currentWishlist: WishlistItem[], cityId: string): WishlistItem[] => {
      const newWishlist = currentWishlist.filter(
        (item) => item.city.objectID !== cityId
      );

      saveWishlist(newWishlist);
      return newWishlist;
    },
    [saveWishlist]
  );

  return {
    loadWishlist,
    saveWishlist,
    clearWishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
  };
}
