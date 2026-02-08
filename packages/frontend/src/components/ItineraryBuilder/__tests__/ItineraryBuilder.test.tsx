import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItineraryBuilder } from '../ItineraryBuilder';
import type { GeneratedItinerary } from '@/services/itinerary.service';

const mockItinerary: GeneratedItinerary = {
  destination: {
    city: 'Tokyo',
    country: 'Japan',
    objectID: 'tokyo-japan',
  },
  totalDays: 3,
  interests: ['culture', 'food'],
  travelStyle: 'balanced',
  days: [
    {
      dayNumber: 1,
      date: '2026-03-15',
      theme: 'Cultural Exploration',
      activities: [
        {
          id: 'act-1',
          name: 'Temple Visit',
          description: 'Visit historic Senso-ji Temple',
          timeSlot: 'morning',
          startTime: '09:00',
          duration: 120,
          cost: 'budget',
          category: 'culture',
          vibeTags: ['Cultural', 'Historic'],
        },
        {
          id: 'act-2',
          name: 'Ramen Lunch',
          description: 'Try authentic Tokyo ramen',
          timeSlot: 'afternoon',
          startTime: '12:30',
          duration: 60,
          cost: 'budget',
          category: 'food',
          vibeTags: ['Food Paradise'],
        },
        {
          id: 'act-3',
          name: 'Shibuya Crossing',
          description: 'Experience the famous crossing',
          timeSlot: 'evening',
          startTime: '18:00',
          duration: 60,
          cost: 'free',
          category: 'exploration',
          vibeTags: ['Iconic', 'Urban'],
        },
      ],
      meals: [
        { mealType: 'breakfast', suggestion: 'Hotel breakfast', cuisineType: 'Japanese', priceRange: '$15' },
        { mealType: 'lunch', suggestion: 'Ramen shop', cuisineType: 'Japanese', priceRange: '$12' },
        { mealType: 'dinner', suggestion: 'Izakaya', cuisineType: 'Japanese', priceRange: '$30' },
      ],
      transportTips: ['Get a Suica card for easy transit'],
      estimatedCost: 75,
    },
    {
      dayNumber: 2,
      date: '2026-03-16',
      theme: 'Food & Flavors',
      activities: [
        {
          id: 'act-4',
          name: 'Tsukiji Market',
          description: 'Explore the outer market',
          timeSlot: 'morning',
          startTime: '08:00',
          duration: 150,
          cost: 'moderate',
          category: 'food',
          vibeTags: ['Food Paradise', 'Local'],
        },
      ],
      meals: [],
      transportTips: [],
      estimatedCost: 50,
    },
    {
      dayNumber: 3,
      date: '2026-03-17',
      theme: 'Modern Tokyo',
      activities: [
        {
          id: 'act-5',
          name: 'Akihabara District',
          description: 'Electronics and anime culture',
          timeSlot: 'afternoon',
          startTime: '13:00',
          duration: 180,
          cost: 'free',
          category: 'exploration',
          vibeTags: ['Modern', 'Pop Culture'],
        },
      ],
      meals: [],
      transportTips: [],
      estimatedCost: 25,
    },
  ],
  estimatedTotalCost: 150,
  currency: 'USD',
  generatedAt: '2026-01-29T10:00:00.000Z',
};

describe('ItineraryBuilder', () => {
  describe('Rendering', () => {
    it('should render the itinerary header with destination', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getByText(/Tokyo, Japan/)).toBeInTheDocument();
    });

    it('should display total days count', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getByText(/3-day itinerary/i)).toBeInTheDocument();
    });

    it('should render all days', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getAllByText(/Day 1/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Day 2/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Day 3/).length).toBeGreaterThanOrEqual(1);
    });

    it('should display day themes', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getAllByText(/Cultural Exploration/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Food & Flavors/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Modern Tokyo/).length).toBeGreaterThanOrEqual(1);
    });

    it('should show estimated total cost', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getByText(/\$150/)).toBeInTheDocument();
    });
  });

  describe('Day Selection', () => {
    it('should highlight selected day', async () => {
      const user = userEvent.setup();
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      const day2Tab = screen.getByRole('tab', { name: /day 2/i });
      await user.click(day2Tab);

      expect(day2Tab).toHaveAttribute('aria-selected', 'true');
    });

    it('should show activities for selected day', async () => {
      const user = userEvent.setup();
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      const day2Tab = screen.getByRole('tab', { name: /day 2/i });
      await user.click(day2Tab);

      expect(screen.getByText(/Tsukiji Market/)).toBeInTheDocument();
    });

    it('should show first day by default', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getByText(/Temple Visit/)).toBeInTheDocument();
    });
  });

  describe('Activity Display', () => {
    it('should display activity name and description', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getByText('Temple Visit')).toBeInTheDocument();
      expect(screen.getByText(/Visit historic Senso-ji Temple/)).toBeInTheDocument();
    });

    it('should show activity time slot', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getByText(/morning/i)).toBeInTheDocument();
    });

    it('should show activity duration', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getByText(/120 min|2 hours|2h/i)).toBeInTheDocument();
    });

    it('should display cost indicator', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getAllByText('$').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Transport Tips', () => {
    it('should show transport tips for day 1', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      expect(screen.getByText(/Suica card/i)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should handle empty itinerary gracefully', () => {
      const emptyItinerary: GeneratedItinerary = {
        ...mockItinerary,
        days: [],
        totalDays: 0,
      };

      render(<ItineraryBuilder itinerary={emptyItinerary} />);

      expect(screen.getByText(/no itinerary/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button clicked', async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<ItineraryBuilder itinerary={mockItinerary} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalled();
    });

    it('should call onExport when export button clicked', async () => {
      const onExport = vi.fn();
      const user = userEvent.setup();

      render(<ItineraryBuilder itinerary={mockItinerary} onExport={onExport} />);

      const exportButton = screen.getByRole('button', { name: /export|download/i });
      await user.click(exportButton);

      expect(onExport).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible day tabs', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(3);
    });

    it('should have proper heading structure', () => {
      render(<ItineraryBuilder itinerary={mockItinerary} />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
