import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInsights } from '../useInsights';

const mockAa = vi.fn();
vi.mock('search-insights', () => ({
  default: (...args: unknown[]) => mockAa(...args),
}));

vi.mock('@/lib/algolia', () => ({
  getIndexName: vi.fn().mockReturnValue('travel_destinations'),
}));

describe('useInsights', () => {
  beforeEach(() => {
    mockAa.mockClear();
  });

  describe('trackClick', () => {
    it('should track click event without queryID', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackClick({
          objectID: 'tokyo-japan',
          position: 1,
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'clickedObjectIDs',
        expect.objectContaining({
          objectIDs: ['tokyo-japan'],
        })
      );
    });

    it('should include index name', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackClick({
          objectID: 'london-uk',
          position: 1,
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'clickedObjectIDs',
        expect.objectContaining({
          index: 'travel_destinations',
        })
      );
    });

    it('should include queryID when provided', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackClick({
          objectID: 'berlin-germany',
          position: 2,
          queryID: 'query-123',
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        expect.objectContaining({
          queryID: 'query-123',
        })
      );
    });

    it('should use default event name', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackClick({
          objectID: 'paris-france',
          position: 1,
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'clickedObjectIDs',
        expect.objectContaining({
          eventName: 'City Card Clicked',
        })
      );
    });

    it('should allow custom event name', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackClick({
          objectID: 'tokyo-japan',
          position: 1,
          eventName: 'Custom Click Event',
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'clickedObjectIDs',
        expect.objectContaining({
          eventName: 'Custom Click Event',
        })
      );
    });
  });

  describe('trackConversion', () => {
    it('should track conversion event without queryID', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackConversion({
          objectID: 'paris-france',
          eventName: 'Trip Planned',
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'convertedObjectIDs',
        expect.objectContaining({
          objectIDs: ['paris-france'],
          eventName: 'Trip Planned',
        })
      );
    });

    it('should include queryID when provided', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackConversion({
          objectID: 'rome-italy',
          queryID: 'query-456',
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'convertedObjectIDsAfterSearch',
        expect.objectContaining({
          queryID: 'query-456',
        })
      );
    });

    it('should use default event name', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackConversion({
          objectID: 'amsterdam-netherlands',
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'convertedObjectIDs',
        expect.objectContaining({
          eventName: 'City Selected',
        })
      );
    });
  });

  describe('trackView', () => {
    it('should track view event', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackView({
          objectID: 'barcelona-spain',
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'viewedObjectIDs',
        expect.objectContaining({
          objectIDs: ['barcelona-spain'],
          index: 'travel_destinations',
        })
      );
    });

    it('should use default event name for view', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackView({
          objectID: 'sydney-australia',
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'viewedObjectIDs',
        expect.objectContaining({
          eventName: 'City Viewed',
        })
      );
    });

    it('should allow custom event name for view', () => {
      const { result } = renderHook(() => useInsights());

      act(() => {
        result.current.trackView({
          objectID: 'tokyo-japan',
          eventName: 'Detail Page Viewed',
        });
      });

      expect(mockAa).toHaveBeenCalledWith(
        'viewedObjectIDs',
        expect.objectContaining({
          eventName: 'Detail Page Viewed',
        })
      );
    });
  });
});
