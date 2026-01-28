import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetEstimator } from '../BudgetEstimator';
import type { BudgetEstimate } from '../../../services/budget.service';

const mockEstimate: BudgetEstimate = {
  cityName: 'Tokyo',
  durationDays: 5,
  travelers: 2,
  travelStyle: 'mid-range',
  totalEstimate: {
    low: 1700,
    mid: 2000,
    high: 2400,
  },
  breakdown: {
    accommodation: { perNight: 150, total: 750 },
    food: { perDay: 100, total: 500 },
    transportation: { perDay: 40, total: 200 },
    activities: { perDay: 80, total: 400 },
    miscellaneous: { perDay: 30, total: 150 },
  },
  perPerson: 1000,
  perDay: 400,
  currency: 'USD',
  budgetTips: [
    'Mix budget and splurge activities for balance',
    'Consider boutique hotels for better value',
    'Book popular attractions in advance',
  ],
};

describe('BudgetEstimator', () => {
  it('should render city name', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByText('Tokyo')).toBeInTheDocument();
  });

  it('should display total estimate', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByText('$2,000')).toBeInTheDocument();
  });

  it('should display estimate range', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByText(/\$1,700/)).toBeInTheDocument();
    expect(screen.getByText(/\$2,400/)).toBeInTheDocument();
  });

  it('should display per person cost', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText(/per person/i)).toBeInTheDocument();
  });

  it('should display per day cost', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getAllByText('$400').length).toBeGreaterThan(0);
    expect(screen.getByText(/per day/i)).toBeInTheDocument();
  });

  it('should display trip details', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByText(/5 days/i)).toBeInTheDocument();
    expect(screen.getByText(/2 travelers/i)).toBeInTheDocument();
  });

  it('should display budget breakdown', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByText('Accommodation')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getAllByText(/Activities/i).length).toBeGreaterThan(0);
  });

  it('should display breakdown amounts', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByText('$750')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('should display budget tips', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByText('Mix budget and splurge activities for balance')).toBeInTheDocument();
    expect(screen.getByText('Consider boutique hotels for better value')).toBeInTheDocument();
  });

  it('should display travel style badge', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByText(/mid-range/i)).toBeInTheDocument();
  });

  it('should have proper test id', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    expect(screen.getByTestId('budget-estimator')).toBeInTheDocument();
  });

  it('should call onAddToTrip when button clicked', () => {
    const onAddToTrip = vi.fn();
    render(<BudgetEstimator estimate={mockEstimate} onAddToTrip={onAddToTrip} />);

    const button = screen.getByRole('button', { name: /add to trip/i });
    fireEvent.click(button);

    expect(onAddToTrip).toHaveBeenCalledWith(mockEstimate);
  });

  it('should be accessible with proper ARIA labels', () => {
    render(<BudgetEstimator estimate={mockEstimate} />);

    const card = screen.getByTestId('budget-estimator');
    expect(card).toHaveAttribute('role', 'region');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Tokyo'));
  });
});
