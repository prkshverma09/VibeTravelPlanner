'use client';

import { useState, useCallback, useEffect } from 'react';
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl';
import type { ViewState, MapRef } from 'react-map-gl';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { MapMarkers } from '../MapMarkers';
import { MapPopup } from '../MapPopup';
import { MapLegend } from '../MapLegend';
import { TravelRoute } from '../TravelRoute';
import { useItinerary } from '../../hooks';
import { useTripContext } from '@/context/TripContext';
import styles from './DestinationMap.module.css';

import 'mapbox-gl/dist/mapbox-gl.css';

interface DestinationMapProps {
  destinations: AlgoliaCity[];
  selectedCity?: AlgoliaCity | null;
  onCitySelect?: (city: AlgoliaCity) => void;
  onCityClick?: (city: AlgoliaCity) => void;
  onAskInChat?: (query: string) => void;
  className?: string;
  showItinerary?: boolean;
}

const INITIAL_VIEW_STATE: ViewState = {
  latitude: 20,
  longitude: 0,
  zoom: 1.5,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 }
};

export function DestinationMap({
  destinations,
  selectedCity,
  onCitySelect,
  onCityClick,
  onAskInChat,
  className,
  showItinerary = true
}: DestinationMapProps) {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [popupCity, setPopupCity] = useState<AlgoliaCity | null>(null);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);

  const {
    stops,
    coordinates,
    toggleStop,
    isInItinerary,
    clearItinerary,
    totalStops
  } = useItinerary();

  const { state: tripState, dispatch: tripDispatch } = useTripContext();
  const itineraryCityIds = stops.map(s => s.city.objectID);

  const handleMarkerHover = useCallback(
    (cityId: string | null) => {
      tripDispatch({ type: 'SET_HOVERED_CITY', payload: cityId });
    },
    [tripDispatch]
  );

  const handleMoveEnd = useCallback(() => {
    if (!mapRef) return;
    const bounds = mapRef.getBounds();
    if (!bounds) return;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    tripDispatch({
      type: 'SET_MAP_BOUNDS',
      payload: {
        north: ne.lat,
        south: sw.lat,
        east: ne.lng,
        west: sw.lng,
      },
    });
  }, [mapRef, tripDispatch]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (selectedCity?._geoloc && mapRef) {
      mapRef.flyTo({
        center: [selectedCity._geoloc.lng, selectedCity._geoloc.lat],
        zoom: 6,
        duration: 1000,
      });
    }
  }, [selectedCity, mapRef]);

  useEffect(() => {
    if (!mapRef || destinations.length === 0) return;
    const withCoords = destinations.filter(
      (c) => c._geoloc?.lat != null && c._geoloc?.lng != null
    );
    if (withCoords.length === 0) return;
    const lngs = withCoords.map((c) => c._geoloc!.lng);
    const lats = withCoords.map((c) => c._geoloc!.lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    if (minLng === maxLng && minLat === maxLat) {
      mapRef.flyTo({
        center: [minLng, minLat],
        zoom: 5,
        duration: 1000,
      });
    } else {
      mapRef.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { duration: 1000, padding: 80 }
      );
    }
    const timeout = setTimeout(() => {
      const b = mapRef.getBounds();
      if (b) {
        const ne = b.getNorthEast();
        const sw = b.getSouthWest();
        tripDispatch({
          type: 'SET_MAP_BOUNDS',
          payload: {
            north: ne.lat,
            south: sw.lat,
            east: ne.lng,
            west: sw.lng,
          },
        });
      }
    }, 1100);
    return () => clearTimeout(timeout);
  }, [destinations, mapRef, tripDispatch]);

  const handleMarkerClick = useCallback((city: AlgoliaCity) => {
    setPopupCity(city);
    onCitySelect?.(city);
  }, [onCitySelect]);

  const handlePopupClose = useCallback(() => {
    setPopupCity(null);
  }, []);

  const handlePopupViewDetails = useCallback(() => {
    if (popupCity) {
      onCityClick?.(popupCity);
    }
  }, [popupCity, onCityClick]);

  const handleAddToItinerary = useCallback(() => {
    if (popupCity) {
      toggleStop(popupCity);
    }
  }, [popupCity, toggleStop]);

  if (!mapboxToken) {
    return (
      <div className={`${styles.mapContainer} ${className || ''}`}>
        <div className={styles.mapError}>
          <p>Map is not available.</p>
          <p className={styles.errorHint}>Please configure NEXT_PUBLIC_MAPBOX_TOKEN in your environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mapContainer} ${className || ''}`} data-testid="destination-map">
      <Map
        ref={setMapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {showItinerary && coordinates.length >= 2 && (
          <TravelRoute coordinates={coordinates} />
        )}

        <MapMarkers
          destinations={destinations}
          onMarkerClick={handleMarkerClick}
          selectedCity={selectedCity}
          itineraryCityIds={itineraryCityIds}
          hoveredCityId={tripState.hoveredCityId}
          onMarkerHover={handleMarkerHover}
        />

        {popupCity && (
          <MapPopup
            city={popupCity}
            onClose={handlePopupClose}
            onViewDetails={handlePopupViewDetails}
            onAskInChat={onAskInChat}
            onAddToItinerary={showItinerary ? handleAddToItinerary : undefined}
            isInItinerary={popupCity ? isInItinerary(popupCity.objectID) : false}
          />
        )}
      </Map>

      <div className={styles.legend}>
        <MapLegend />
      </div>

      {showItinerary && totalStops > 0 && (
        <div className={styles.itineraryInfo}>
          <span className={styles.stopCount} data-testid="itinerary-stop-count">{totalStops} stop{totalStops > 1 ? 's' : ''}</span>
          <button
            className={styles.clearButton}
            onClick={clearItinerary}
            type="button"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
