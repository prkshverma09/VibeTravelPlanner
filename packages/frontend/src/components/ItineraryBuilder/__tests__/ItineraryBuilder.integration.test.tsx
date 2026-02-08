import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItineraryBuilder } from '../ItineraryBuilder';
import { generateItinerary, type ItineraryInput } from '@/services/itinerary.service';

const mockCity = {
  objectID: 'paris-france',
  city: 'Paris',
  country: 'France',
  continent: 'Europe',
  description: 'The City of Light',
  vibe_tags: ['Romantic', 'Cultural', 'Historic', 'Food Paradise'],
  culture_score: 98,
  adventure_score: 60,
  nature_score: 65,
  beach_score: 20,
  nightlife_score: 85,
  climate_type: 'Temperate',
  best_time_to_visit: 'April to October',
};

describe('Itinerary Integration', () => {
  describe('Itinerary Generation and Display', () => {
    it('should generate and display a complete itinerary', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 3,
        interests: ['culture', 'food'],
        travelStyle: 'balanced',
        pace: 'moderate',
        startDate: '2026-04-15',
      };

      const itinerary = generateItinerary(input);
      render(<ItineraryBuilder itinerary={itinerary} />);

      expect(screen.getByText(/Paris, France/)).toBeInTheDocument();
      expect(screen.getByText(/3-day itinerary/i)).toBeInTheDocument();

      expect(screen.getAllByRole('tab').length).toBe(3);
    });

    it('should navigate through all days', async () => {
      const user = userEvent.setup();

      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 3,
        interests: ['culture'],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const itinerary = generateItinerary(input);
      render(<ItineraryBuilder itinerary={itinerary} />);

      const tabs = screen.getAllByRole('tab');

      await user.click(tabs[1]);
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

      await user.click(tabs[2]);
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

      await user.click(tabs[0]);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('should show activities matching user interests', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 1,
        interests: ['food'],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const itinerary = generateItinerary(input);
      render(<ItineraryBuilder itinerary={itinerary} />);

      const hasFood = itinerary.days[0].activities.some(
        (a) => a.category === 'food' || (a.vibeTags && a.vibeTags.includes('Food Paradise'))
      );
      expect(hasFood).toBe(true);
    });

    it('should generate more activities for packed pace', () => {
      const relaxedInput: ItineraryInput = {
        city: mockCity,
        durationDays: 1,
        interests: [],
        travelStyle: 'balanced',
        pace: 'relaxed',
      };

      const packedInput: ItineraryInput = {
        city: mockCity,
        durationDays: 1,
        interests: [],
        travelStyle: 'balanced',
        pace: 'packed',
      };

      const relaxedItinerary = generateItinerary(relaxedInput);
      const packedItinerary = generateItinerary(packedInput);

      expect(packedItinerary.days[0].activities.length).toBeGreaterThan(
        relaxedItinerary.days[0].activities.length
      );
    });

    it('should calculate costs correctly', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 2,
        interests: ['culture'],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const itinerary = generateItinerary(input);

      const totalFromDays = itinerary.days.reduce(
        (sum, day) => sum + day.estimatedCost,
        0
      );

      expect(itinerary.estimatedTotalCost).toBe(totalFromDays);
    });

    it('should include transport tips on first day', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 2,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const itinerary = generateItinerary(input);
      render(<ItineraryBuilder itinerary={itinerary} />);

      expect(itinerary.days[0].transportTips.length).toBeGreaterThan(0);
    });
  });

  describe('Different City Types', () => {
    it('should generate culture-focused itinerary for high culture city', () => {
      const cultureCity = {
        ...mockCity,
        culture_score: 95,
        adventure_score: 30,
        nature_score: 40,
        beach_score: 10,
        nightlife_score: 50,
      };

      const input: ItineraryInput = {
        city: cultureCity,
        durationDays: 1,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const itinerary = generateItinerary(input);

      const hasCultureActivities = itinerary.days[0].activities.some(
        (a) => a.category === 'culture' || (a.vibeTags && a.vibeTags.some((t) => t.includes('Cultur')))
      );
      expect(hasCultureActivities).toBe(true);
    });

    it('should generate adventure-focused itinerary for high adventure city', () => {
      const adventureCity = {
        ...mockCity,
        objectID: 'queenstown-nz',
        city: 'Queenstown',
        country: 'New Zealand',
        culture_score: 40,
        adventure_score: 98,
        nature_score: 95,
        beach_score: 50,
        nightlife_score: 60,
      };

      const input: ItineraryInput = {
        city: adventureCity,
        durationDays: 1,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const itinerary = generateItinerary(input);

      const hasAdventureActivities = itinerary.days[0].activities.some(
        (a) => a.category === 'adventure' || a.category === 'nature'
      );
      expect(hasAdventureActivities).toBe(true);
    });
  });

  describe('Edit and Export Actions', () => {
    it('should call onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 2,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const itinerary = generateItinerary(input);
      render(<ItineraryBuilder itinerary={itinerary} onEdit={onEdit} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onExport when export button clicked', async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();

      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 2,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const itinerary = generateItinerary(input);
      render(<ItineraryBuilder itinerary={itinerary} onExport={onExport} />);

      await user.click(screen.getByRole('button', { name: /export/i }));
      expect(onExport).toHaveBeenCalledTimes(1);
    });
  });

  describe('Date Handling', () => {
    it('should display dates when provided', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 2,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
        startDate: '2026-06-15',
      };

      const itinerary = generateItinerary(input);

      expect(itinerary.days[0].date).toBe('2026-06-15');
      expect(itinerary.days[1].date).toBe('2026-06-16');
    });

    it('should work without dates', () => {
      const input: ItineraryInput = {
        city: mockCity,
        durationDays: 2,
        interests: [],
        travelStyle: 'balanced',
        pace: 'moderate',
      };

      const itinerary = generateItinerary(input);
      render(<ItineraryBuilder itinerary={itinerary} />);

      expect(itinerary.days[0].date).toBeUndefined();
      expect(screen.getByTestId('itinerary-builder')).toBeInTheDocument();
    });
  });
});
