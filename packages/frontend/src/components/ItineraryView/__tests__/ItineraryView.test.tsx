import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItineraryView } from '../ItineraryView';
import type { ItineraryDay } from '../../../tools/types';

const mockDays: ItineraryDay[] = [
  {
    day: 1,
    theme: 'Cultural Exploration',
    activities: [
      { time: 'Morning', activity: 'Temple Visit', description: 'Visit ancient temples', vibeMatch: ['cultural', 'historic'] },
      { time: 'Afternoon', activity: 'Museum Tour', description: 'Explore local museums', vibeMatch: ['cultural', 'artistic'] },
      { time: 'Evening', activity: 'Traditional Dinner', description: 'Enjoy local cuisine', vibeMatch: ['culinary'] },
    ],
  },
  {
    day: 2,
    theme: 'Nature Discovery',
    activities: [
      { time: 'Morning', activity: 'Park Hike', description: 'Scenic morning hike', vibeMatch: ['nature', 'active'] },
      { time: 'Afternoon', activity: 'Garden Visit', description: 'Beautiful botanical gardens', vibeMatch: ['nature', 'peaceful'] },
    ],
  },
];

describe('ItineraryView', () => {
  const defaultProps = {
    cityName: 'Tokyo',
    days: mockDays,
  };

  it('should render itinerary view', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.getByTestId('itinerary-view')).toBeInTheDocument();
  });

  it('should display city name in title', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.getByText(/Tokyo/)).toBeInTheDocument();
  });

  it('should display all days', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('Day 2')).toBeInTheDocument();
  });

  it('should display day themes', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.getByText('Cultural Exploration')).toBeInTheDocument();
    expect(screen.getByText('Nature Discovery')).toBeInTheDocument();
  });

  it('should display activities for each day', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.getByText('Temple Visit')).toBeInTheDocument();
    expect(screen.getByText('Museum Tour')).toBeInTheDocument();
    expect(screen.getByText('Park Hike')).toBeInTheDocument();
  });

  it('should display activity times', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.getAllByText('Morning')).toHaveLength(2);
    expect(screen.getAllByText('Afternoon')).toHaveLength(2);
    expect(screen.getByText('Evening')).toBeInTheDocument();
  });

  it('should display activity descriptions', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.getByText('Visit ancient temples')).toBeInTheDocument();
  });

  it('should display vibe matches as tags', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.getAllByText('cultural').length).toBeGreaterThan(0);
    expect(screen.getAllByText('nature').length).toBeGreaterThan(0);
  });

  it('should show total days count', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.getByText(/2 days/i)).toBeInTheDocument();
  });

  it('should call onAddToTrip when add button is clicked', () => {
    const onAddToTrip = vi.fn();
    render(<ItineraryView {...defaultProps} onAddToTrip={onAddToTrip} />);

    const addButton = screen.getByRole('button', { name: /add to trip/i });
    fireEvent.click(addButton);

    expect(onAddToTrip).toHaveBeenCalled();
  });

  it('should show add to trip button when onAddToTrip is provided', () => {
    const onAddToTrip = vi.fn();
    render(<ItineraryView {...defaultProps} onAddToTrip={onAddToTrip} />);
    expect(screen.getByRole('button', { name: /add to trip/i })).toBeInTheDocument();
  });

  it('should not show add to trip button when onAddToTrip is not provided', () => {
    render(<ItineraryView {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /add to trip/i })).not.toBeInTheDocument();
  });

  it('should handle empty days array', () => {
    render(<ItineraryView cityName="Tokyo" days={[]} />);
    expect(screen.getByTestId('itinerary-view')).toBeInTheDocument();
    expect(screen.getByText(/no itinerary/i)).toBeInTheDocument();
  });

  it('should allow expanding/collapsing days', () => {
    render(<ItineraryView {...defaultProps} />);
    
    const day1Header = screen.getByText('Day 1');
    expect(screen.getByText('Temple Visit')).toBeInTheDocument();

    fireEvent.click(day1Header);
  });

  it('should have accessible structure', () => {
    render(<ItineraryView {...defaultProps} />);
    
    const container = screen.getByTestId('itinerary-view');
    expect(container).toHaveAttribute('role', 'region');
    expect(container).toHaveAttribute('aria-label', expect.stringContaining('itinerary'));
  });
});
