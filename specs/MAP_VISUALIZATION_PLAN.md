# Implementation Plan: Interactive Map Visualization

## Overview

This plan details the implementation of an interactive map visualization feature for the Vibe-Check Travel Planner. The map will complement the conversational search experience by providing visual discovery of destinations.

**Goal**: Add visual discovery to complement conversational search, allowing users to explore destinations geographically.

---

## Architecture Decision

### Recommended Library: react-map-gl with Mapbox GL JS

After evaluating the options (Mapbox GL JS, Leaflet, Google Maps), **react-map-gl** is the recommended choice for the following reasons:

| Criteria | react-map-gl (Mapbox) | react-leaflet | Google Maps |
|----------|----------------------|---------------|-------------|
| Performance | Excellent (WebGL) | Good (Canvas) | Good (Canvas) |
| React Integration | Native hooks/context | Requires workarounds | Limited |
| Clustering Support | Built-in supercluster | Plugin required | Native |
| Custom Styling | Excellent | Good | Limited |
| Cost | Free tier available | Free (OSM tiles) | Paid at scale |
| TypeScript | Full support | Good support | Limited |
| Next.js Compatibility | Excellent | Requires `use client` | Good |

**Why react-map-gl:**
1. WebGL-based rendering provides smooth animations and better performance with many markers
2. Fully controlled React components that integrate with InstantSearch state
3. Built-in support for marker clustering via supercluster
4. Excellent TypeScript support
5. Easy to create custom markers with React components

---

## Data Schema Updates

### Add Geolocation to City Schema

The existing `AlgoliaCity` type needs to be extended with geolocation data.

**File: `packages/shared/src/types/city.ts`**

```typescript
export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface City {
  // Existing fields...
  city: string;
  country: string;
  continent: string;
  description: string;
  vibe_tags: string[];
  culture_score: number;
  adventure_score: number;
  nature_score: number;
  beach_score: number;
  nightlife_score: number;
  climate_type: string;
  best_time_to_visit: string;
  image_url: string;
  
  // NEW: Geolocation fields
  _geoloc: GeoLocation;
  primary_vibe?: VibeCategory;
}

export type VibeCategory = 
  | 'adventure'
  | 'romantic'
  | 'cultural'
  | 'beach'
  | 'nightlife'
  | 'nature';
```

### Algolia Geolocation Configuration

Algolia supports geo search natively. The `_geoloc` field is a reserved attribute that enables geographic filtering and sorting.

**Index Settings Update:**
```json
{
  "attributesForFaceting": [
    "filterOnly(continent)",
    "searchable(climate_type)",
    "culture_score",
    "adventure_score",
    "nature_score",
    "beach_score",
    "nightlife_score",
    "primary_vibe"
  ]
}
```

---

## Feature Breakdown

### Feature 1: Basic Map Display
Display an interactive world map with destination markers.

### Feature 2: Vibe-Coded Markers
Color-code markers by dominant vibe category.

### Feature 3: Marker Clustering
Group nearby markers into clusters at low zoom levels.

### Feature 4: City Card Popups
Show destination cards when clicking markers.

### Feature 5: Search Integration
Sync map with search results from Algolia/Chat.

### Feature 6: Multi-City Routes
Draw travel routes for trip planning.

---

## Implementation Tasks

### Task 4.1: Install Map Dependencies

**Description:** Add required packages for map visualization.

**Files to Modify:**
- `packages/frontend/package.json`

**Dependencies:**
```json
{
  "dependencies": {
    "react-map-gl": "^7.1.7",
    "mapbox-gl": "^3.3.0",
    "@types/mapbox-gl": "^3.1.0",
    "supercluster": "^8.0.1",
    "@types/supercluster": "^7.1.3",
    "use-supercluster": "^1.2.0"
  }
}
```

**Environment Variables:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
```

**Success Criteria:**
- [ ] All packages install without errors
- [ ] TypeScript types are available
- [ ] Mapbox token is configured in environment

---

### Task 4.2: Update City Data with Geolocation

**Description:** Add geolocation coordinates to base city data and update the data pipeline.

**Files to Modify:**
- `packages/shared/src/types/city.ts`
- `packages/shared/src/schemas/city.schema.ts`
- `packages/data-pipeline/src/data/base-cities.json`
- `packages/data-pipeline/src/generators/base-city.generator.ts`

**Geolocation Data Source:**
Use a predefined mapping of city coordinates or integrate with a geocoding API.

```typescript
// packages/data-pipeline/src/data/city-coordinates.ts
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Tokyo-Japan': { lat: 35.6762, lng: 139.6503 },
  'Paris-France': { lat: 48.8566, lng: 2.3522 },
  'New York-United States': { lat: 40.7128, lng: -74.0060 },
  'Barcelona-Spain': { lat: 41.3851, lng: 2.1734 },
  'Bali-Indonesia': { lat: -8.3405, lng: 115.0920 },
  // ... more cities
};
```

**Success Criteria:**
- [ ] All cities have valid `_geoloc` coordinates
- [ ] Schema validates geolocation data
- [ ] Data pipeline generates geolocation for all cities
- [ ] Fixtures include geolocation data

**Test File:** `packages/shared/src/types/__tests__/city.test.ts`
```typescript
describe('City Geolocation', () => {
  it('should have valid geolocation coordinates', () => {
    const city: AlgoliaCity = {
      // ... existing fields
      _geoloc: { lat: 35.6762, lng: 139.6503 },
      primary_vibe: 'cultural'
    };
    
    expect(city._geoloc.lat).toBeGreaterThanOrEqual(-90);
    expect(city._geoloc.lat).toBeLessThanOrEqual(90);
    expect(city._geoloc.lng).toBeGreaterThanOrEqual(-180);
    expect(city._geoloc.lng).toBeLessThanOrEqual(180);
  });
});
```

---

### Task 4.3: Create Primary Vibe Calculator

**Description:** Implement logic to determine the primary vibe category for each city based on scores.

**Files to Create:**
- `packages/shared/src/utils/vibe.utils.ts`

**Implementation:**
```typescript
import type { City, VibeCategory } from '../types/city';

export const VIBE_COLORS: Record<VibeCategory, string> = {
  adventure: '#FF6B35',   // Orange
  romantic: '#FF69B4',    // Pink
  cultural: '#9B59B6',    // Purple
  beach: '#00CED1',       // Turquoise
  nightlife: '#FFD700',   // Gold
  nature: '#228B22',      // Forest Green
};

export function calculatePrimaryVibe(city: City): VibeCategory {
  const vibeScores: Record<VibeCategory, number> = {
    adventure: city.adventure_score,
    romantic: 0, // Derived from tags or combination
    cultural: city.culture_score,
    beach: city.beach_score,
    nightlife: city.nightlife_score,
    nature: city.nature_score,
  };
  
  // Check vibe_tags for romantic indicators
  const romanticKeywords = ['romantic', 'couples', 'honeymoon', 'love'];
  const hasRomanticTags = city.vibe_tags.some(tag => 
    romanticKeywords.some(keyword => tag.toLowerCase().includes(keyword))
  );
  
  if (hasRomanticTags) {
    vibeScores.romantic = Math.max(city.culture_score, city.nature_score);
  }
  
  // Find the highest scoring vibe
  const sortedVibes = Object.entries(vibeScores)
    .sort(([, a], [, b]) => b - a);
  
  return sortedVibes[0][0] as VibeCategory;
}

export function getVibeColor(vibe: VibeCategory): string {
  return VIBE_COLORS[vibe];
}
```

**Success Criteria:**
- [ ] Function correctly identifies dominant vibe
- [ ] Color mapping is consistent
- [ ] Handles edge cases (tied scores)

**Test File:** `packages/shared/src/utils/__tests__/vibe.utils.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { calculatePrimaryVibe, getVibeColor, VIBE_COLORS } from '../vibe.utils';

describe('Vibe Utils', () => {
  describe('calculatePrimaryVibe', () => {
    it('should return adventure for high adventure score', () => {
      const city = {
        adventure_score: 9,
        culture_score: 5,
        nature_score: 6,
        beach_score: 3,
        nightlife_score: 4,
        vibe_tags: ['hiking', 'extreme']
      };
      
      expect(calculatePrimaryVibe(city as any)).toBe('adventure');
    });

    it('should detect romantic vibe from tags', () => {
      const city = {
        adventure_score: 5,
        culture_score: 8,
        nature_score: 7,
        beach_score: 6,
        nightlife_score: 4,
        vibe_tags: ['romantic', 'honeymoon', 'couples']
      };
      
      expect(calculatePrimaryVibe(city as any)).toBe('romantic');
    });

    it('should return cultural for high culture score', () => {
      const city = {
        adventure_score: 5,
        culture_score: 10,
        nature_score: 4,
        beach_score: 2,
        nightlife_score: 6,
        vibe_tags: ['historic', 'museums']
      };
      
      expect(calculatePrimaryVibe(city as any)).toBe('cultural');
    });
  });

  describe('getVibeColor', () => {
    it('should return correct color for each vibe', () => {
      expect(getVibeColor('adventure')).toBe('#FF6B35');
      expect(getVibeColor('romantic')).toBe('#FF69B4');
      expect(getVibeColor('cultural')).toBe('#9B59B6');
      expect(getVibeColor('beach')).toBe('#00CED1');
      expect(getVibeColor('nightlife')).toBe('#FFD700');
      expect(getVibeColor('nature')).toBe('#228B22');
    });
  });
});
```

---

### Task 4.4: Create Map Container Component

**Description:** Create the main map container component using react-map-gl.

**Files to Create:**
- `packages/frontend/src/components/DestinationMap/DestinationMap.tsx`
- `packages/frontend/src/components/DestinationMap/DestinationMap.module.css`
- `packages/frontend/src/components/DestinationMap/index.ts`

**Implementation:**
```typescript
'use client';

import { useState, useCallback, useMemo } from 'react';
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl';
import type { ViewState } from 'react-map-gl';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { MapMarkers } from '../MapMarkers';
import { MapPopup } from '../MapPopup';
import styles from './DestinationMap.module.css';

import 'mapbox-gl/dist/mapbox-gl.css';

interface DestinationMapProps {
  destinations: AlgoliaCity[];
  selectedCity?: AlgoliaCity | null;
  onCitySelect?: (city: AlgoliaCity) => void;
  onCityClick?: (city: AlgoliaCity) => void;
  className?: string;
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
  className
}: DestinationMapProps) {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [popupCity, setPopupCity] = useState<AlgoliaCity | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not configured');
    return (
      <div className={styles.mapError}>
        Map is not available. Please configure MAPBOX_TOKEN.
      </div>
    );
  }

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

  return (
    <div className={`${styles.mapContainer} ${className || ''}`}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        
        <MapMarkers 
          destinations={destinations}
          onMarkerClick={handleMarkerClick}
          selectedCity={selectedCity}
        />
        
        {popupCity && (
          <MapPopup
            city={popupCity}
            onClose={handlePopupClose}
            onViewDetails={handlePopupViewDetails}
          />
        )}
      </Map>
      
      <div className={styles.legend}>
        <MapLegend />
      </div>
    </div>
  );
}
```

**Success Criteria:**
- [ ] Map renders without errors
- [ ] Map is responsive and fills container
- [ ] Navigation controls are visible
- [ ] Handles missing token gracefully

**Test File:** `packages/frontend/src/components/DestinationMap/__tests__/DestinationMap.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DestinationMap } from '../DestinationMap';
import { mockCities } from '@vibe-travel/shared';

// Mock react-map-gl
vi.mock('react-map-gl', () => ({
  default: ({ children }: any) => <div data-testid="map">{children}</div>,
  NavigationControl: () => <div data-testid="nav-control" />,
  GeolocateControl: () => <div data-testid="geo-control" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

describe('DestinationMap', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-token';
  });

  it('should render map container', () => {
    render(<DestinationMap destinations={[]} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('should render navigation controls', () => {
    render(<DestinationMap destinations={[]} />);
    expect(screen.getByTestId('nav-control')).toBeInTheDocument();
  });

  it('should show error when token is missing', () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    render(<DestinationMap destinations={[]} />);
    expect(screen.getByText(/not available/i)).toBeInTheDocument();
  });

  it('should render markers for destinations', () => {
    const citiesWithGeo = mockCities.slice(0, 3).map(city => ({
      ...city,
      _geoloc: { lat: 35.6762, lng: 139.6503 }
    }));
    
    render(<DestinationMap destinations={citiesWithGeo as any} />);
    expect(screen.getAllByTestId('marker')).toHaveLength(3);
  });
});
```

---

### Task 4.5: Create Custom Marker Component

**Description:** Create vibe-coded custom markers for destinations.

**Files to Create:**
- `packages/frontend/src/components/MapMarker/MapMarker.tsx`
- `packages/frontend/src/components/MapMarker/MapMarker.module.css`
- `packages/frontend/src/components/MapMarker/index.ts`

**Implementation:**
```typescript
'use client';

import { memo } from 'react';
import { Marker } from 'react-map-gl';
import type { AlgoliaCity, VibeCategory } from '@vibe-travel/shared';
import { getVibeColor, calculatePrimaryVibe } from '@vibe-travel/shared';
import styles from './MapMarker.module.css';

interface MapMarkerProps {
  city: AlgoliaCity;
  isSelected?: boolean;
  onClick?: (city: AlgoliaCity) => void;
}

export const MapMarker = memo(function MapMarker({
  city,
  isSelected,
  onClick
}: MapMarkerProps) {
  const primaryVibe = city.primary_vibe || calculatePrimaryVibe(city);
  const color = getVibeColor(primaryVibe);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(city);
  };

  return (
    <Marker
      latitude={city._geoloc.lat}
      longitude={city._geoloc.lng}
      anchor="bottom"
    >
      <button
        className={`${styles.marker} ${isSelected ? styles.selected : ''}`}
        style={{ '--marker-color': color } as React.CSSProperties}
        onClick={handleClick}
        aria-label={`View ${city.city}, ${city.country}`}
        type="button"
      >
        <span className={styles.pin}>
          <span className={styles.pinInner} />
        </span>
        {isSelected && (
          <span className={styles.label}>{city.city}</span>
        )}
      </button>
    </Marker>
  );
});
```

**CSS:**
```css
/* MapMarker.module.css */
.marker {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(0);
  transition: transform 0.2s ease;
}

.marker:hover {
  transform: translateY(-4px);
}

.pin {
  width: 24px;
  height: 24px;
  background: var(--marker-color);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.pinInner {
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  transform: rotate(45deg);
}

.selected .pin {
  width: 32px;
  height: 32px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.label {
  margin-top: 4px;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
```

**Success Criteria:**
- [ ] Marker displays with correct vibe color
- [ ] Hover state provides visual feedback
- [ ] Selected state is visually distinct
- [ ] Click events fire correctly
- [ ] Accessible with keyboard navigation

**Test File:** `packages/frontend/src/components/MapMarker/__tests__/MapMarker.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MapMarker } from '../MapMarker';
import { mockCities } from '@vibe-travel/shared';

vi.mock('react-map-gl', () => ({
  Marker: ({ children }: any) => <div data-testid="marker-wrapper">{children}</div>,
}));

describe('MapMarker', () => {
  const mockCity = {
    ...mockCities[0],
    _geoloc: { lat: 35.6762, lng: 139.6503 },
    primary_vibe: 'cultural' as const
  };

  it('should render marker button', () => {
    render(<MapMarker city={mockCity as any} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    render(<MapMarker city={mockCity as any} />);
    expect(screen.getByLabelText(/View Tokyo/i)).toBeInTheDocument();
  });

  it('should apply selected styles when selected', () => {
    render(<MapMarker city={mockCity as any} isSelected />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('selected');
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<MapMarker city={mockCity as any} onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalledWith(mockCity);
  });

  it('should show label when selected', () => {
    render(<MapMarker city={mockCity as any} isSelected />);
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
  });
});
```

---

### Task 4.6: Implement Marker Clustering

**Description:** Implement marker clustering using supercluster to handle many destinations.

**Files to Create:**
- `packages/frontend/src/components/MapMarkers/MapMarkers.tsx`
- `packages/frontend/src/components/MapMarkers/ClusterMarker.tsx`
- `packages/frontend/src/components/MapMarkers/index.ts`
- `packages/frontend/src/hooks/useMapClusters.ts`

**Implementation:**
```typescript
// useMapClusters.ts
'use client';

import { useMemo } from 'react';
import useSupercluster from 'use-supercluster';
import type { AlgoliaCity, VibeCategory } from '@vibe-travel/shared';
import { calculatePrimaryVibe } from '@vibe-travel/shared';

interface ClusterProperties {
  cluster: boolean;
  cityId?: string;
  city?: AlgoliaCity;
  point_count?: number;
  vibes?: Record<VibeCategory, number>;
}

export type MapPoint = GeoJSON.Feature<GeoJSON.Point, ClusterProperties>;

export function useMapClusters(
  destinations: AlgoliaCity[],
  bounds: [number, number, number, number] | null,
  zoom: number
) {
  const points: MapPoint[] = useMemo(() => {
    return destinations
      .filter(city => city._geoloc?.lat && city._geoloc?.lng)
      .map(city => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          cityId: city.objectID,
          city,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [city._geoloc.lng, city._geoloc.lat],
        },
      }));
  }, [destinations]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: bounds || undefined,
    zoom,
    options: {
      radius: 75,
      maxZoom: 16,
      reduce: (accumulated: ClusterProperties, props: ClusterProperties) => {
        // Track vibe distribution in clusters
        if (!accumulated.vibes) {
          accumulated.vibes = {
            adventure: 0,
            romantic: 0,
            cultural: 0,
            beach: 0,
            nightlife: 0,
            nature: 0,
          };
        }
        
        if (props.city) {
          const vibe = props.city.primary_vibe || calculatePrimaryVibe(props.city);
          accumulated.vibes[vibe] = (accumulated.vibes[vibe] || 0) + 1;
        }
      },
    },
  });

  return { clusters, supercluster };
}

// MapMarkers.tsx
'use client';

import { useCallback } from 'react';
import { useMap } from 'react-map-gl';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { useMapClusters, type MapPoint } from '../../hooks/useMapClusters';
import { MapMarker } from '../MapMarker';
import { ClusterMarker } from './ClusterMarker';

interface MapMarkersProps {
  destinations: AlgoliaCity[];
  onMarkerClick?: (city: AlgoliaCity) => void;
  selectedCity?: AlgoliaCity | null;
}

export function MapMarkers({
  destinations,
  onMarkerClick,
  selectedCity
}: MapMarkersProps) {
  const { current: map } = useMap();
  
  const bounds = map?.getBounds()?.toArray().flat() as [number, number, number, number] | null;
  const zoom = map?.getZoom() || 1;

  const { clusters, supercluster } = useMapClusters(destinations, bounds, zoom);

  const handleClusterClick = useCallback((clusterId: number, lng: number, lat: number) => {
    if (!supercluster || !map) return;
    
    const expansionZoom = Math.min(
      supercluster.getClusterExpansionZoom(clusterId),
      16
    );
    
    map.flyTo({
      center: [lng, lat],
      zoom: expansionZoom,
      duration: 500,
    });
  }, [supercluster, map]);

  return (
    <>
      {clusters.map(cluster => {
        const [lng, lat] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count, city, cityId, vibes } = cluster.properties;

        if (isCluster) {
          return (
            <ClusterMarker
              key={`cluster-${cluster.id}`}
              latitude={lat}
              longitude={lng}
              pointCount={point_count || 0}
              vibes={vibes}
              onClick={() => handleClusterClick(cluster.id as number, lng, lat)}
            />
          );
        }

        if (!city) return null;

        return (
          <MapMarker
            key={cityId}
            city={city}
            isSelected={selectedCity?.objectID === cityId}
            onClick={onMarkerClick}
          />
        );
      })}
    </>
  );
}

// ClusterMarker.tsx
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
  // Get dominant vibe in cluster
  const dominantVibe = vibes 
    ? Object.entries(vibes).sort(([, a], [, b]) => b - a)[0]?.[0] as VibeCategory
    : 'cultural';
  
  const dominantColor = VIBE_COLORS[dominantVibe] || VIBE_COLORS.cultural;

  // Size based on point count
  const size = Math.min(Math.max(pointCount * 2, 30), 60);

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
      >
        <span className={styles.count}>{pointCount}</span>
      </button>
    </Marker>
  );
});
```

**CSS:**
```css
/* ClusterMarker.module.css */
.cluster {
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cluster:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.count {
  color: white;
  font-weight: 700;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
```

**Success Criteria:**
- [ ] Markers cluster at low zoom levels
- [ ] Clusters display point count
- [ ] Clicking cluster zooms to reveal contents
- [ ] Cluster color reflects dominant vibe
- [ ] Performance is smooth with 200+ markers

---

### Task 4.7: Create Map Popup Component

**Description:** Create a popup component to display city details when clicking a marker.

**Files to Create:**
- `packages/frontend/src/components/MapPopup/MapPopup.tsx`
- `packages/frontend/src/components/MapPopup/MapPopup.module.css`
- `packages/frontend/src/components/MapPopup/index.ts`

**Implementation:**
```typescript
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
}

export function MapPopup({ city, onClose, onViewDetails }: MapPopupProps) {
  return (
    <Popup
      latitude={city._geoloc.lat}
      longitude={city._geoloc.lng}
      anchor="bottom"
      offset={20}
      closeOnClick={false}
      onClose={onClose}
      className={styles.popup}
    >
      <article className={styles.card}>
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
            <ScoreBadge type="culture" score={city.culture_score} compact />
            <ScoreBadge type="nightlife" score={city.nightlife_score} compact />
          </div>
          
          <button
            className={styles.viewButton}
            onClick={onViewDetails}
            type="button"
          >
            View Details
          </button>
        </div>
      </article>
    </Popup>
  );
}
```

**CSS:**
```css
/* MapPopup.module.css */
.popup :global(.mapboxgl-popup-content) {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.popup :global(.mapboxgl-popup-close-button) {
  font-size: 20px;
  color: white;
  right: 8px;
  top: 8px;
  z-index: 1;
}

.card {
  width: 280px;
}

.imageContainer {
  position: relative;
  height: 140px;
}

.image {
  object-fit: cover;
}

.content {
  padding: 12px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.description {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px;
  line-height: 1.4;
}

.scores {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.viewButton {
  width: 100%;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.viewButton:hover {
  opacity: 0.9;
}
```

**Success Criteria:**
- [ ] Popup appears on marker click
- [ ] City image and details display correctly
- [ ] Close button works
- [ ] View Details button navigates to city page
- [ ] Popup is positioned correctly relative to marker

---

### Task 4.8: Create Map Legend Component

**Description:** Create a legend showing vibe color codes.

**Files to Create:**
- `packages/frontend/src/components/MapLegend/MapLegend.tsx`
- `packages/frontend/src/components/MapLegend/MapLegend.module.css`
- `packages/frontend/src/components/MapLegend/index.ts`

**Implementation:**
```typescript
'use client';

import { useState } from 'react';
import { VIBE_COLORS, type VibeCategory } from '@vibe-travel/shared';
import styles from './MapLegend.module.css';

const VIBE_LABELS: Record<VibeCategory, string> = {
  adventure: 'Adventure',
  romantic: 'Romantic',
  cultural: 'Cultural',
  beach: 'Beach',
  nightlife: 'Nightlife',
  nature: 'Nature',
};

const VIBE_ICONS: Record<VibeCategory, string> = {
  adventure: '🧗',
  romantic: '💕',
  cultural: '🎭',
  beach: '🏖️',
  nightlife: '🌙',
  nature: '🌲',
};

export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={styles.legend}>
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
        <span>Legend</span>
      </button>
      
      {isExpanded && (
        <ul className={styles.list}>
          {(Object.keys(VIBE_COLORS) as VibeCategory[]).map(vibe => (
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
```

**CSS:**
```css
/* MapLegend.module.css */
.legend {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 150px;
}

.toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.toggleIcon {
  font-size: 10px;
}

.list {
  list-style: none;
  padding: 8px 0;
  margin: 0;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
}

.colorDot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.icon {
  font-size: 14px;
}

.label {
  font-size: 12px;
  color: #333;
}
```

**Success Criteria:**
- [ ] Legend displays all vibe categories
- [ ] Colors match marker colors
- [ ] Toggle collapse/expand works
- [ ] Accessible with screen readers

---

### Task 4.9: Integrate Map with Search Results

**Description:** Connect the map to display search results from InstantSearch/Chat.

**Files to Create:**
- `packages/frontend/src/components/SearchWithMap/SearchWithMap.tsx`
- `packages/frontend/src/components/SearchWithMap/index.ts`
- `packages/frontend/src/hooks/useMapSearch.ts`

**Implementation:**
```typescript
// useMapSearch.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHits } from 'react-instantsearch';
import type { AlgoliaCity } from '@vibe-travel/shared';

export function useMapSearch() {
  const { items: hits } = useHits<AlgoliaCity>();
  const [selectedCity, setSelectedCity] = useState<AlgoliaCity | null>(null);

  // Reset selection when results change
  useEffect(() => {
    setSelectedCity(null);
  }, [hits]);

  const handleCitySelect = useCallback((city: AlgoliaCity) => {
    setSelectedCity(city);
  }, []);

  return {
    destinations: hits,
    selectedCity,
    onCitySelect: handleCitySelect,
  };
}

// SearchWithMap.tsx
'use client';

import { useRouter } from 'next/navigation';
import { DestinationMap } from '../DestinationMap';
import { TravelChat } from '../TravelChat';
import { useMapSearch } from '../../hooks/useMapSearch';
import styles from './SearchWithMap.module.css';

export function SearchWithMap() {
  const router = useRouter();
  const { destinations, selectedCity, onCitySelect } = useMapSearch();

  const handleCityClick = (city: AlgoliaCity) => {
    router.push(`/city/${city.objectID}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatPanel}>
        <TravelChat />
      </div>
      
      <div className={styles.mapPanel}>
        <DestinationMap
          destinations={destinations}
          selectedCity={selectedCity}
          onCitySelect={onCitySelect}
          onCityClick={handleCityClick}
        />
      </div>
    </div>
  );
}
```

**CSS:**
```css
/* SearchWithMap.module.css */
.container {
  display: grid;
  grid-template-columns: 400px 1fr;
  height: calc(100vh - 64px);
  gap: 0;
}

.chatPanel {
  border-right: 1px solid #e0e0e0;
  overflow: hidden;
}

.mapPanel {
  position: relative;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 300px;
  }
  
  .chatPanel {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
}
```

**Success Criteria:**
- [ ] Map shows cities from search results
- [ ] Map updates when search results change
- [ ] Clicking map marker highlights city
- [ ] Clicking "View Details" navigates to city page
- [ ] Layout is responsive

---

### Task 4.10: Add Route Drawing for Multi-City Trips

**Description:** Implement the ability to draw travel routes between selected cities.

**Files to Create:**
- `packages/frontend/src/components/TravelRoute/TravelRoute.tsx`
- `packages/frontend/src/components/TravelRoute/TravelRoute.module.css`
- `packages/frontend/src/components/TravelRoute/index.ts`
- `packages/frontend/src/hooks/useItinerary.ts`

**Implementation:**
```typescript
// useItinerary.ts
'use client';

import { useState, useCallback } from 'react';
import type { AlgoliaCity } from '@vibe-travel/shared';

export interface ItineraryStop {
  city: AlgoliaCity;
  order: number;
}

export function useItinerary() {
  const [stops, setStops] = useState<ItineraryStop[]>([]);

  const addStop = useCallback((city: AlgoliaCity) => {
    setStops(prev => {
      if (prev.some(s => s.city.objectID === city.objectID)) {
        return prev;
      }
      return [...prev, { city, order: prev.length }];
    });
  }, []);

  const removeStop = useCallback((cityId: string) => {
    setStops(prev => 
      prev
        .filter(s => s.city.objectID !== cityId)
        .map((s, i) => ({ ...s, order: i }))
    );
  }, []);

  const reorderStops = useCallback((fromIndex: number, toIndex: number) => {
    setStops(prev => {
      const newStops = [...prev];
      const [removed] = newStops.splice(fromIndex, 1);
      newStops.splice(toIndex, 0, removed);
      return newStops.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const clearItinerary = useCallback(() => {
    setStops([]);
  }, []);

  const coordinates = stops.map(s => [
    s.city._geoloc.lng,
    s.city._geoloc.lat
  ]);

  return {
    stops,
    coordinates,
    addStop,
    removeStop,
    reorderStops,
    clearItinerary,
    hasRoute: stops.length >= 2,
  };
}

// TravelRoute.tsx
'use client';

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { LineLayer } from 'mapbox-gl';

interface TravelRouteProps {
  coordinates: number[][];
}

const routeLayerStyle: LineLayer = {
  id: 'route-line',
  type: 'line',
  paint: {
    'line-color': '#667eea',
    'line-width': 3,
    'line-dasharray': [2, 2],
  },
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
};

export function TravelRoute({ coordinates }: TravelRouteProps) {
  const routeGeoJSON = useMemo(() => {
    if (coordinates.length < 2) return null;
    
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates,
      },
    };
  }, [coordinates]);

  if (!routeGeoJSON) return null;

  return (
    <Source id="route" type="geojson" data={routeGeoJSON}>
      <Layer {...routeLayerStyle} />
    </Source>
  );
}
```

**Success Criteria:**
- [ ] Users can add cities to itinerary
- [ ] Route line draws between stops
- [ ] Stops can be reordered
- [ ] Route updates dynamically
- [ ] Clear itinerary works

---

### Task 4.11: Add Geo Search Filtering

**Description:** Enable users to search within the visible map area.

**Files to Create:**
- `packages/frontend/src/components/MapSearchControl/MapSearchControl.tsx`
- `packages/frontend/src/hooks/useGeoSearch.ts`

**Implementation:**
```typescript
// useGeoSearch.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useConfigure } from 'react-instantsearch';
import type { SearchParameters } from 'algoliasearch/lite';

interface BoundingBox {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

export function useGeoSearch() {
  const [searchOnMove, setSearchOnMove] = useState(false);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);

  const searchParams: SearchParameters = boundingBox && searchOnMove
    ? {
        insideBoundingBox: [[
          boundingBox.northEast.lat,
          boundingBox.northEast.lng,
          boundingBox.southWest.lat,
          boundingBox.southWest.lng,
        ]],
      }
    : {};

  useConfigure(searchParams);

  const updateBounds = useCallback((bounds: BoundingBox) => {
    setBoundingBox(bounds);
  }, []);

  const toggleSearchOnMove = useCallback(() => {
    setSearchOnMove(prev => !prev);
  }, []);

  return {
    searchOnMove,
    toggleSearchOnMove,
    updateBounds,
  };
}

// MapSearchControl.tsx
'use client';

import styles from './MapSearchControl.module.css';

interface MapSearchControlProps {
  searchOnMove: boolean;
  onToggle: () => void;
  onSearchThisArea?: () => void;
}

export function MapSearchControl({
  searchOnMove,
  onToggle,
  onSearchThisArea
}: MapSearchControlProps) {
  return (
    <div className={styles.control}>
      <label className={styles.toggleLabel}>
        <input
          type="checkbox"
          checked={searchOnMove}
          onChange={onToggle}
          className={styles.checkbox}
        />
        <span>Search as I move the map</span>
      </label>
      
      {!searchOnMove && (
        <button
          className={styles.searchButton}
          onClick={onSearchThisArea}
          type="button"
        >
          Search this area
        </button>
      )}
    </div>
  );
}
```

**Success Criteria:**
- [ ] Toggle enables/disables search-on-move
- [ ] "Search this area" button triggers search
- [ ] Map bounds are sent as Algolia filter
- [ ] Results update based on map viewport

---

### Task 4.12: E2E Tests for Map Visualization

**Description:** Write end-to-end tests for the map feature.

**Files to Create:**
- `e2e/tests/map-visualization.spec.ts`

**Test File:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Map Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the map', async ({ page }) => {
    const map = page.locator('[data-testid="destination-map"]');
    await expect(map).toBeVisible();
  });

  test('should show markers for search results', async ({ page }) => {
    // Search for destinations
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('beach destinations');
    await chatInput.press('Enter');

    // Wait for results
    await page.waitForSelector('[data-testid="map-marker"]', { timeout: 10000 });
    
    const markers = page.locator('[data-testid="map-marker"]');
    await expect(markers.first()).toBeVisible();
  });

  test('should show popup on marker click', async ({ page }) => {
    // Search for a specific city
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('Tokyo');
    await chatInput.press('Enter');

    // Wait for marker
    await page.waitForSelector('[data-testid="map-marker"]', { timeout: 10000 });
    
    // Click marker
    await page.locator('[data-testid="map-marker"]').first().click();
    
    // Verify popup
    const popup = page.locator('[data-testid="map-popup"]');
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('Tokyo');
  });

  test('should navigate to city page from popup', async ({ page }) => {
    // Setup: search and click marker
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('Paris');
    await chatInput.press('Enter');
    
    await page.waitForSelector('[data-testid="map-marker"]', { timeout: 10000 });
    await page.locator('[data-testid="map-marker"]').first().click();
    
    // Click view details
    await page.locator('[data-testid="popup-view-details"]').click();
    
    // Verify navigation
    await expect(page).toHaveURL(/\/city\//);
  });

  test('should cluster markers at low zoom', async ({ page }) => {
    // Zoom out
    const map = page.locator('[data-testid="destination-map"]');
    await map.click();
    await page.mouse.wheel(0, 300); // Zoom out
    
    // Wait for clusters
    await page.waitForTimeout(500);
    
    const clusters = page.locator('[data-testid="cluster-marker"]');
    // At low zoom with many results, there should be clusters
    const clusterCount = await clusters.count();
    expect(clusterCount).toBeGreaterThan(0);
  });

  test('should display legend', async ({ page }) => {
    const legend = page.locator('[data-testid="map-legend"]');
    await expect(legend).toBeVisible();
    
    // Check vibe categories are shown
    await expect(legend).toContainText('Adventure');
    await expect(legend).toContainText('Romantic');
    await expect(legend).toContainText('Cultural');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const map = page.locator('[data-testid="destination-map"]');
    await expect(map).toBeVisible();
    
    // Map should be below chat on mobile
    const chatPanel = page.locator('[data-testid="chat-panel"]');
    const mapBbox = await map.boundingBox();
    const chatBbox = await chatPanel.boundingBox();
    
    expect(mapBbox!.y).toBeGreaterThan(chatBbox!.y);
  });
});
```

**Success Criteria:**
- [ ] All E2E tests pass
- [ ] Tests cover main user interactions
- [ ] Tests verify responsive behavior
- [ ] Tests check marker/popup functionality

---

## Summary

### Task Overview

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| 4.1 | Install Map Dependencies | Low | None |
| 4.2 | Update City Data with Geolocation | Medium | 4.1 |
| 4.3 | Create Primary Vibe Calculator | Low | 4.2 |
| 4.4 | Create Map Container Component | Medium | 4.1 |
| 4.5 | Create Custom Marker Component | Medium | 4.3, 4.4 |
| 4.6 | Implement Marker Clustering | High | 4.5 |
| 4.7 | Create Map Popup Component | Medium | 4.5 |
| 4.8 | Create Map Legend Component | Low | 4.3 |
| 4.9 | Integrate Map with Search Results | Medium | 4.6, 4.7 |
| 4.10 | Add Route Drawing | Medium | 4.9 |
| 4.11 | Add Geo Search Filtering | Medium | 4.9 |
| 4.12 | E2E Tests | Medium | 4.9 |

### Dependency Graph

```
4.1 (Dependencies)
    │
    ├──► 4.2 (Geolocation Data)
    │        │
    │        └──► 4.3 (Vibe Calculator)
    │                 │
    └──► 4.4 (Map Container)
             │
             └──► 4.5 (Markers)
                      │
                      ├──► 4.6 (Clustering)
                      │        │
                      ├──► 4.7 (Popups)
                      │        │
                      └──► 4.8 (Legend)
                               │
                               └──► 4.9 (Search Integration)
                                        │
                                        ├──► 4.10 (Routes)
                                        │
                                        ├──► 4.11 (Geo Search)
                                        │
                                        └──► 4.12 (E2E Tests)
```

### Environment Variables Required

```env
# Add to packages/frontend/.env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token_here
```

### Package Dependencies

```json
{
  "react-map-gl": "^7.1.7",
  "mapbox-gl": "^3.3.0",
  "@types/mapbox-gl": "^3.1.0",
  "supercluster": "^8.0.1",
  "@types/supercluster": "^7.1.3",
  "use-supercluster": "^1.2.0"
}
```

### File Structure

```
packages/frontend/src/
├── components/
│   ├── DestinationMap/
│   │   ├── DestinationMap.tsx
│   │   ├── DestinationMap.module.css
│   │   ├── index.ts
│   │   └── __tests__/
│   │       └── DestinationMap.test.tsx
│   ├── MapMarker/
│   │   ├── MapMarker.tsx
│   │   ├── MapMarker.module.css
│   │   ├── index.ts
│   │   └── __tests__/
│   │       └── MapMarker.test.tsx
│   ├── MapMarkers/
│   │   ├── MapMarkers.tsx
│   │   ├── ClusterMarker.tsx
│   │   ├── ClusterMarker.module.css
│   │   └── index.ts
│   ├── MapPopup/
│   │   ├── MapPopup.tsx
│   │   ├── MapPopup.module.css
│   │   └── index.ts
│   ├── MapLegend/
│   │   ├── MapLegend.tsx
│   │   ├── MapLegend.module.css
│   │   └── index.ts
│   ├── MapSearchControl/
│   │   ├── MapSearchControl.tsx
│   │   ├── MapSearchControl.module.css
│   │   └── index.ts
│   ├── TravelRoute/
│   │   ├── TravelRoute.tsx
│   │   └── index.ts
│   └── SearchWithMap/
│       ├── SearchWithMap.tsx
│       ├── SearchWithMap.module.css
│       └── index.ts
├── hooks/
│   ├── useMapClusters.ts
│   ├── useMapSearch.ts
│   ├── useItinerary.ts
│   └── useGeoSearch.ts
packages/shared/src/
├── types/
│   └── city.ts (updated)
├── schemas/
│   └── city.schema.ts (updated)
└── utils/
    └── vibe.utils.ts (new)
packages/data-pipeline/src/
└── data/
    └── city-coordinates.ts (new)
e2e/tests/
└── map-visualization.spec.ts
```

---

## Algolia Geo Search Integration Notes

From the Algolia documentation, the following parameters are relevant for geo search:

- **`aroundLatLng`**: Search around a specific coordinate
- **`aroundRadius`**: Maximum radius for location-based search  
- **`insideBoundingBox`**: Filter results within a rectangular area
- **`insidePolygon`**: Filter results within a polygon area
- **`_geoloc`**: Reserved attribute for storing coordinates

The `_geoloc` field should be added to all city records in the format:
```json
{
  "_geoloc": {
    "lat": 48.8566,
    "lng": 2.3522
  }
}
```

This enables Algolia's native geo search capabilities, which can be combined with the map's viewport to filter results.

---

*Created: January 2026*
