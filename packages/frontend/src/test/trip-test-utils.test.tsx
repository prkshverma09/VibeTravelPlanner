import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import {
  renderWithTripPlannerContext,
  createMockTripSetup,
  createMockItinerary,
  createMockActivity,
  createMockPOI,
  createMockAlgoliaSearchResponse,
  createMockGeoSearchResponse,
  useMockTripPlannerStore,
  TripPlannerTestProvider,
} from './trip-test-utils';

describe('Trip Planner Test Utilities', () => {
  describe('renderWithTripPlannerContext', () => {
    it('should render component with TripPlannerContext provider', () => {
      const TestComponent = () => <div data-testid="test-component">Test</div>;

      renderWithTripPlannerContext(<TestComponent />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should provide default trip planner state', () => {
      const TestComponent = () => {
        const store = useMockTripPlannerStore();
        return <div data-testid="has-state">{store.tripSetup ? 'has-setup' : 'no-setup'}</div>;
      };

      renderWithTripPlannerContext(<TestComponent />);

      expect(screen.getByTestId('has-state')).toHaveTextContent('no-setup');
    });

    it('should allow overriding initial trip setup', () => {
      const mockSetup = createMockTripSetup({ destinationId: 'paris-france' });

      const TestComponent = () => {
        const store = useMockTripPlannerStore();
        return <div data-testid="destination">{store.tripSetup?.destinationId || 'none'}</div>;
      };

      renderWithTripPlannerContext(<TestComponent />, {
        initialTripSetup: mockSetup,
      });

      expect(screen.getByTestId('destination')).toHaveTextContent('paris-france');
    });

    it('should allow overriding initial itinerary', () => {
      const mockItinerary = createMockItinerary({
        destinationId: 'dubai-uae',
        totalDays: 5,
      });

      const TestComponent = () => {
        const store = useMockTripPlannerStore();
        return <div data-testid="days">{store.itinerary?.days.length || 0}</div>;
      };

      renderWithTripPlannerContext(<TestComponent />, {
        initialItinerary: mockItinerary,
      });

      expect(screen.getByTestId('days')).toHaveTextContent('5');
    });
  });

  describe('useMockTripPlannerStore hook', () => {
    it('should provide setTripSetup function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TripPlannerTestProvider>{children}</TripPlannerTestProvider>
      );

      const { result } = renderHook(() => useMockTripPlannerStore(), { wrapper });

      expect(result.current.setTripSetup).toBeInstanceOf(Function);
    });

    it('should update trip setup when setTripSetup is called', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TripPlannerTestProvider>{children}</TripPlannerTestProvider>
      );

      const { result } = renderHook(() => useMockTripPlannerStore(), { wrapper });

      const newSetup = createMockTripSetup({ destinationId: 'tokyo-japan' });

      act(() => {
        result.current.setTripSetup(newSetup);
      });

      expect(result.current.tripSetup?.destinationId).toBe('tokyo-japan');
    });

    it('should provide addActivityToDay function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TripPlannerTestProvider
          initialItinerary={createMockItinerary({ totalDays: 3 })}
        >
          {children}
        </TripPlannerTestProvider>
      );

      const { result } = renderHook(() => useMockTripPlannerStore(), { wrapper });

      const activity = createMockActivity({ name: 'Test Activity' });

      act(() => {
        result.current.addActivityToDay(1, activity);
      });

      const day1 = result.current.itinerary?.days.find((d) => d.dayNumber === 1);
      expect(day1?.activities).toContainEqual(expect.objectContaining({ name: 'Test Activity' }));
    });

    it('should provide removeActivityFromDay function', () => {
      const activity = createMockActivity({ id: 'act-to-remove', name: 'Remove Me' });
      const itinerary = createMockItinerary({ totalDays: 1 });
      itinerary.days[0].activities = [activity];

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TripPlannerTestProvider initialItinerary={itinerary}>
          {children}
        </TripPlannerTestProvider>
      );

      const { result } = renderHook(() => useMockTripPlannerStore(), { wrapper });

      act(() => {
        result.current.removeActivityFromDay(1, 'act-to-remove');
      });

      const day1 = result.current.itinerary?.days.find((d) => d.dayNumber === 1);
      expect(day1?.activities).not.toContainEqual(
        expect.objectContaining({ id: 'act-to-remove' })
      );
    });
  });

  describe('Mock Data Factories', () => {
    describe('createMockTripSetup', () => {
      it('should create valid trip setup with defaults', () => {
        const setup = createMockTripSetup();

        expect(setup.destinationId).toBeDefined();
        expect(setup.dates.start).toBeDefined();
        expect(setup.dates.end).toBeDefined();
        expect(setup.travelers.adults).toBeGreaterThanOrEqual(1);
        expect(setup.budgetLevel).toBeDefined();
        expect(setup.tripStyle).toBeInstanceOf(Array);
        expect(setup.pace).toBeDefined();
      });

      it('should allow overriding specific fields', () => {
        const setup = createMockTripSetup({
          destinationId: 'custom-destination',
          budgetLevel: 'luxury',
          travelers: { adults: 4, children: 2 },
        });

        expect(setup.destinationId).toBe('custom-destination');
        expect(setup.budgetLevel).toBe('luxury');
        expect(setup.travelers.adults).toBe(4);
        expect(setup.travelers.children).toBe(2);
      });

      it('should calculate correct trip duration from dates', () => {
        const setup = createMockTripSetup({
          dates: {
            start: '2026-03-15T00:00:00.000Z',
            end: '2026-03-22T00:00:00.000Z',
          },
        });

        const startDate = new Date(setup.dates.start);
        const endDate = new Date(setup.dates.end);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        expect(days).toBe(7);
      });
    });

    describe('createMockItinerary', () => {
      it('should create itinerary with specified number of days', () => {
        const itinerary = createMockItinerary({ totalDays: 5 });

        expect(itinerary.days).toHaveLength(5);
        expect(itinerary.days[0].dayNumber).toBe(1);
        expect(itinerary.days[4].dayNumber).toBe(5);
      });

      it('should generate unique IDs for each day', () => {
        const itinerary = createMockItinerary({ totalDays: 3 });

        const dayIds = itinerary.days.map((d) => d.dayNumber);
        const uniqueIds = new Set(dayIds);

        expect(uniqueIds.size).toBe(3);
      });

      it('should include destination info', () => {
        const itinerary = createMockItinerary({
          destinationId: 'dubai-uae',
          destinationName: 'Dubai',
        });

        expect(itinerary.destination.objectID).toBe('dubai-uae');
        expect(itinerary.destination.city).toBe('Dubai');
      });
    });

    describe('createMockActivity', () => {
      it('should create valid activity with defaults', () => {
        const activity = createMockActivity();

        expect(activity.id).toBeDefined();
        expect(activity.name).toBeDefined();
        expect(activity.startTime).toMatch(/^\d{2}:\d{2}$/);
        expect(activity.duration).toBeGreaterThan(0);
        expect(activity.location).toBeDefined();
        expect(activity.location.lat).toBeDefined();
        expect(activity.location.lng).toBeDefined();
      });

      it('should allow overriding activity fields', () => {
        const activity = createMockActivity({
          id: 'custom-id',
          name: 'Desert Safari',
          startTime: '15:00',
          duration: 360,
          priceRange: { min: 75, max: 100 },
        });

        expect(activity.id).toBe('custom-id');
        expect(activity.name).toBe('Desert Safari');
        expect(activity.startTime).toBe('15:00');
        expect(activity.duration).toBe(360);
        expect(activity.priceRange.min).toBe(75);
      });
    });

    describe('createMockPOI', () => {
      it('should create valid POI with defaults', () => {
        const poi = createMockPOI();

        expect(poi.objectID).toBeDefined();
        expect(poi.name).toBeDefined();
        expect(poi.category).toBeDefined();
        expect(poi._geoloc).toBeDefined();
        expect(poi._geoloc.lat).toBeDefined();
        expect(poi._geoloc.lng).toBeDefined();
        expect(poi.rating).toBeGreaterThanOrEqual(1);
        expect(poi.rating).toBeLessThanOrEqual(5);
      });

      it('should allow overriding POI fields', () => {
        const poi = createMockPOI({
          objectID: 'poi-custom',
          name: 'Test Cafe',
          category: 'cafe',
          _geoloc: { lat: 25.2048, lng: 55.2708 },
          rating: 4.8,
          price_range: '$$',
        });

        expect(poi.objectID).toBe('poi-custom');
        expect(poi.name).toBe('Test Cafe');
        expect(poi.category).toBe('cafe');
        expect(poi.rating).toBe(4.8);
      });

      it('should include distance when specified', () => {
        const poi = createMockPOI({ distance: 150 });

        expect(poi.distance).toBe(150);
      });
    });
  });

  describe('Algolia Mock Responses', () => {
    describe('createMockAlgoliaSearchResponse', () => {
      it('should create valid search response structure', () => {
        const hits = [createMockActivity(), createMockActivity()];
        const response = createMockAlgoliaSearchResponse(hits);

        expect(response.results).toBeDefined();
        expect(response.results[0].hits).toHaveLength(2);
        expect(response.results[0].nbHits).toBe(2);
      });

      it('should include pagination info', () => {
        const response = createMockAlgoliaSearchResponse([], { page: 1, hitsPerPage: 20 });

        expect(response.results[0].page).toBe(1);
        expect(response.results[0].hitsPerPage).toBe(20);
      });
    });

    describe('createMockGeoSearchResponse', () => {
      it('should create geo search response with distance info', () => {
        const pois = [
          createMockPOI({ distance: 100 }),
          createMockPOI({ distance: 200 }),
        ];
        const response = createMockGeoSearchResponse(pois);

        expect(response.results[0].hits).toHaveLength(2);
        response.results[0].hits.forEach((hit: { distance?: number }) => {
          expect(hit.distance).toBeDefined();
        });
      });

      it('should sort results by distance when specified', () => {
        const pois = [
          createMockPOI({ distance: 500 }),
          createMockPOI({ distance: 100 }),
          createMockPOI({ distance: 300 }),
        ];
        const response = createMockGeoSearchResponse(pois, { sortByDistance: true });

        const distances = response.results[0].hits.map((h: { distance?: number }) => h.distance);
        expect(distances).toEqual([100, 300, 500]);
      });
    });
  });
});
