import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWishlistPersistence, WISHLIST_STORAGE_KEY } from '../useWishlistPersistence';
import type { WishlistItem } from '@/context/TripContext';

const mockCity = {
  objectID: 'tokyo-japan',
  city: 'Tokyo',
  country: 'Japan',
  continent: 'Asia',
  description: 'A vibrant metropolis',
  vibe_tags: ['Cultural', 'Modern'],
};

const mockWishlistItem: WishlistItem = {
  city: mockCity as any,
  notes: 'Want to visit in spring',
  addedAt: Date.now(),
};

describe('useWishlistPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadWishlist', () => {
    it('should return empty array when localStorage is empty', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      const wishlist = result.current.loadWishlist();

      expect(wishlist).toEqual([]);
    });

    it('should load wishlist from localStorage', () => {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([mockWishlistItem]));

      const { result } = renderHook(() => useWishlistPersistence());
      const wishlist = result.current.loadWishlist();

      expect(wishlist).toHaveLength(1);
      expect(wishlist[0].city.objectID).toBe('tokyo-japan');
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem(WISHLIST_STORAGE_KEY, 'invalid json');

      const { result } = renderHook(() => useWishlistPersistence());
      const wishlist = result.current.loadWishlist();

      expect(wishlist).toEqual([]);
    });

    it('should handle non-array data in localStorage', () => {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify({ invalid: true }));

      const { result } = renderHook(() => useWishlistPersistence());
      const wishlist = result.current.loadWishlist();

      expect(wishlist).toEqual([]);
    });
  });

  describe('saveWishlist', () => {
    it('should save wishlist to localStorage', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      act(() => {
        result.current.saveWishlist([mockWishlistItem]);
      });

      const saved = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].city.objectID).toBe('tokyo-japan');
    });

    it('should save empty array', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      act(() => {
        result.current.saveWishlist([]);
      });

      const saved = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
      expect(saved).toEqual([]);
    });
  });

  describe('clearWishlist', () => {
    it('should remove wishlist from localStorage', () => {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([mockWishlistItem]));

      const { result } = renderHook(() => useWishlistPersistence());

      act(() => {
        result.current.clearWishlist();
      });

      expect(localStorage.getItem(WISHLIST_STORAGE_KEY)).toBeNull();
    });
  });

  describe('isInWishlist', () => {
    it('should return true if city is in wishlist', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      const isIn = result.current.isInWishlist([mockWishlistItem], 'tokyo-japan');

      expect(isIn).toBe(true);
    });

    it('should return false if city is not in wishlist', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      const isIn = result.current.isInWishlist([mockWishlistItem], 'paris-france');

      expect(isIn).toBe(false);
    });

    it('should return false for empty wishlist', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      const isIn = result.current.isInWishlist([], 'tokyo-japan');

      expect(isIn).toBe(false);
    });
  });

  describe('addToWishlist', () => {
    it('should add city to wishlist and save', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      let newWishlist: WishlistItem[] = [];
      act(() => {
        newWishlist = result.current.addToWishlist([], mockCity as any, 'My notes');
      });

      expect(newWishlist).toHaveLength(1);
      expect(newWishlist[0].city.objectID).toBe('tokyo-japan');
      expect(newWishlist[0].notes).toBe('My notes');

      const saved = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
      expect(saved).toHaveLength(1);
    });

    it('should update existing city in wishlist', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      let newWishlist: WishlistItem[] = [];
      act(() => {
        newWishlist = result.current.addToWishlist([mockWishlistItem], mockCity as any, 'New notes');
      });

      expect(newWishlist).toHaveLength(1);
      expect(newWishlist[0].notes).toBe('New notes');
    });

    it('should add without notes', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      let newWishlist: WishlistItem[] = [];
      act(() => {
        newWishlist = result.current.addToWishlist([], mockCity as any);
      });

      expect(newWishlist).toHaveLength(1);
      expect(newWishlist[0].notes).toBeNull();
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove city from wishlist and save', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      let newWishlist: WishlistItem[] = [];
      act(() => {
        newWishlist = result.current.removeFromWishlist([mockWishlistItem], 'tokyo-japan');
      });

      expect(newWishlist).toHaveLength(0);

      const saved = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
      expect(saved).toHaveLength(0);
    });

    it('should not modify wishlist if city not found', () => {
      const { result } = renderHook(() => useWishlistPersistence());

      let newWishlist: WishlistItem[] = [];
      act(() => {
        newWishlist = result.current.removeFromWishlist([mockWishlistItem], 'paris-france');
      });

      expect(newWishlist).toHaveLength(1);
    });
  });
});
