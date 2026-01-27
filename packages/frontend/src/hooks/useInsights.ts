'use client';

import { useCallback } from 'react';
import aa from 'search-insights';
import { getIndexName } from '@/lib/algolia';

interface TrackClickParams {
  objectID: string;
  position: number;
  queryID?: string;
  eventName?: string;
}

interface TrackConversionParams {
  objectID: string;
  queryID?: string;
  eventName?: string;
}

interface TrackViewParams {
  objectID: string;
  eventName?: string;
}

export function useInsights() {
  const indexName = getIndexName();

  const trackClick = useCallback(({
    objectID,
    position,
    queryID,
    eventName = 'City Card Clicked',
  }: TrackClickParams) => {
    if (queryID) {
      aa('clickedObjectIDsAfterSearch', {
        index: indexName,
        eventName,
        objectIDs: [objectID],
        positions: [position],
        queryID,
      });
    } else {
      aa('clickedObjectIDs', {
        index: indexName,
        eventName,
        objectIDs: [objectID],
      });
    }
  }, [indexName]);

  const trackConversion = useCallback(({
    objectID,
    queryID,
    eventName = 'City Selected',
  }: TrackConversionParams) => {
    if (queryID) {
      aa('convertedObjectIDsAfterSearch', {
        index: indexName,
        eventName,
        objectIDs: [objectID],
        queryID,
      });
    } else {
      aa('convertedObjectIDs', {
        index: indexName,
        eventName,
        objectIDs: [objectID],
      });
    }
  }, [indexName]);

  const trackView = useCallback(({
    objectID,
    eventName = 'City Viewed',
  }: TrackViewParams) => {
    aa('viewedObjectIDs', {
      index: indexName,
      eventName,
      objectIDs: [objectID],
    });
  }, [indexName]);

  return {
    trackClick,
    trackConversion,
    trackView,
  };
}
