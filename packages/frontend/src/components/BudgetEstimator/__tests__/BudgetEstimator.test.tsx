import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetEstimator } from '../BudgetEstimator';
import type { BudgetEstimate } from '@/services/budget.service';

const mockEstimate: BudgetEstimate = {
  totalEstimate: 1500,
  perPersonPerDay: 150,
  perPersonTotal: 750,
  breakdown: {
    accommodation: 525,
    food: 450,
    activities: 300,
    transport: 150,
    miscellaneous: 75,
  },
  currency: 'USD',
  travelStyle: 'moderate',
  durationDays: 5,
  travelers: 2,
  cityName: 'Tokyo',
  confidence: 'high',
  tips: [
    'Book tours in advance for better rates',
    'Mix dining between local spots and restaurants',
  ],
};

describe('BudgetEstimator', () => {
  describe('Display', () => {
    it('should display total estimate', () => {
      render(<BudgetEstimator estimate={mockEstimate} />);
      expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
    });

    it('should display city name', () => {
      render(<BudgetEstimator estimate={mockEstimate} />);
      expect(screen.getByText(/Tokyo/)).toBeInTheDocument();
    });

    it('should display per person cost', () => {
      render(<BudgetEstimator estimate={mockEstimate} />);
      expect(screen.getByText(/\$750.*person/i)).toBeInTheDocument();
    });

    it('should display trip duration', () => {
      render(<BudgetEstimator estimate={mockEstimate} />);
      expect(screen.getByText(/5.*days/i)).toBeInTheDocument();
    });

    it('should display number of travelers', () => {
      render(<BudgetEstimator estimate={mockEstimate} />);
      expect(screen.getByText(/2.*travelers/i)).toBeInTheDocument();
    });
  });

  describe('Breakdown', () => {
    it('should display accommodation cost', () => {
      render(<BudgetEstimator estimate={mockEstimate} showBreakdown={true} />);
      expect(screen.getByText(/accommodation/i)).toBeInTheDocument();
      expect(screen.getByText(/\$525/)).toBeInTheDocument();
    });

    it('should display food cost', () => {
      render(<BudgetEstimator estimate={mockEstimate} showBreakdown={true} />);
      expect(screen.getByText(/food/i)).toBeInTheDocument();
    });

    it('should display activities cost', () => {
      render(<BudgetEstimator estimate={mockEstimate} showBreakdown={true} />);
      expect(screen.getByText(/activities/i)).toBeInTheDocument();
    });
  });

  describe('Tips', () => {
    it('should display budget tips when showTips is true', () => {
      render(<BudgetEstimator estimate={mockEstimate} showTips={true} />);
      expect(screen.getByText(/Book tours in advance/i)).toBeInTheDocument();
    });

    it('should hide tips when showTips is false', () => {
      render(<BudgetEstimator estimate={mockEstimate} showTips={false} />);
      expect(screen.queryByText(/Book tours in advance/i)).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onAddToTrip when button is clicked', async () => {
      const onAddToTrip = vi.fn();
      const user = userEvent.setup();

      render(<BudgetEstimator estimate={mockEstimate} onAddToTrip={onAddToTrip} />);

      const addButton = screen.getByRole('button', { name: /add.*trip|plan/i });
      await user.click(addButton);

      expect(onAddToTrip).toHaveBeenCalled();
    });
  });

  describe('Confidence Indicator', () => {
    it('should display high confidence indicator', () => {
      render(<BudgetEstimator estimate={mockEstimate} />);
      expect(screen.getByTestId('confidence-indicator')).toHaveAttribute('data-confidence', 'high');
    });

    it('should display low confidence indicator', () => {
      const lowConfidenceEstimate = { ...mockEstimate, confidence: 'low' as const };
      render(<BudgetEstimator estimate={lowConfidenceEstimate} />);
      expect(screen.getByTestId('confidence-indicator')).toHaveAttribute('data-confidence', 'low');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible budget card', () => {
      render(<BudgetEstimator estimate={mockEstimate} />);
      expect(screen.getByTestId('budget-estimator')).toBeInTheDocument();
    });
  });
});
