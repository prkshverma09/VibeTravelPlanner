import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MiniMap } from '../MiniMap';
import { mockCities } from '@vibe-travel/shared';

const originalEnv = process.env;

const { MockMap, MockMarker } = vi.hoisted(() => {
  const MockMap = ({
    children,
    ref,
  }: {
    children: React.ReactNode;
    ref?: React.Ref<unknown>;
  }) => {
    if (ref && typeof ref === 'object' && 'current' in ref) {
      (ref as React.MutableRefObject<unknown>).current = {
        getBounds: () => ({
          getNorthEast: () => ({ lat: 40, lng: 15 }),
          getSouthWest: () => ({ lat: 35, lng: 10 }),
        }),
        fitBounds: vi.fn(),
        flyTo: vi.fn(),
      };
    }
    return React.createElement('div', { 'data-testid': 'mini-map-inner' }, children);
  };
  const MockMarker = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'mini-map-marker' }, children);
  return { MockMap, MockMarker };
});

vi.mock('react-map-gl', () => ({
  __esModule: true,
  default: MockMap,
  Map: MockMap,
  Marker: MockMarker,
}));

describe('MiniMap', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('should return null when NEXT_PUBLIC_MAPBOX_TOKEN is not set', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = '';
    const citiesWithCoords = mockCities.filter(
      (c) => c._geoloc?.lat != null && c._geoloc?.lng != null
    );
    const { container } = render(
      <MiniMap cities={citiesWithCoords} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should return null when cities have no coordinates', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'pk.test';
    const citiesNoCoords = mockCities.map((c) => ({
      ...c,
      _geoloc: undefined,
    }));
    const { container } = render(<MiniMap cities={citiesNoCoords} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render map when token and cities with coords are provided', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'pk.test';
    const citiesWithCoords = mockCities
      .filter((c) => c._geoloc?.lat != null && c._geoloc?.lng != null)
      .slice(0, 2);
    render(<MiniMap cities={citiesWithCoords} />);
    expect(screen.getByTestId('mini-map')).toBeInTheDocument();
    expect(screen.getByTestId('mini-map-inner')).toBeInTheDocument();
  });

  it('should call onMarkerClick when marker is clicked', async () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'pk.test';
    const onMarkerClick = vi.fn();
    const citiesWithCoords = mockCities
      .filter((c) => c._geoloc?.lat != null && c._geoloc?.lng != null)
      .slice(0, 1);
    render(
      <MiniMap cities={citiesWithCoords} onMarkerClick={onMarkerClick} />
    );
    const markerButton = screen.getByRole('button', {
      name: /show .* on map/i,
    });
    await userEvent.click(markerButton);
    expect(onMarkerClick).toHaveBeenCalledTimes(1);
    expect(onMarkerClick).toHaveBeenCalledWith(
      expect.objectContaining({
        objectID: citiesWithCoords[0].objectID,
        city: citiesWithCoords[0].city,
      })
    );
  });
});
