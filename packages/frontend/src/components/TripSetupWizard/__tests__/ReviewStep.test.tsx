import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewStep } from '../steps/ReviewStep';
import type { ReviewData } from '../steps/ReviewStep';

describe('ReviewStep', () => {
  const mockOnEdit = vi.fn();

  const completeData: ReviewData = {
    destination: {
      objectID: 'dubai-uae',
      city: 'Dubai',
      country: 'United Arab Emirates',
    },
    dates: {
      start: '2026-03-15T00:00:00.000Z',
      end: '2026-03-22T00:00:00.000Z',
    },
    travelers: {
      adults: 2,
      children: 1,
      childrenAges: [5],
    },
    preferences: {
      budgetLevel: 'moderate',
      tripStyle: ['Cultural Immersion', 'Food & Culinary'],
      pace: 'moderate',
      interests: ['history', 'architecture'],
      mobility: 'full',
    },
  };

  const incompleteData: ReviewData = {
    destination: {
      objectID: 'dubai-uae',
      city: 'Dubai',
      country: 'United Arab Emirates',
    },
    dates: null,
    travelers: {
      adults: 2,
      children: 0,
    },
    preferences: {
      budgetLevel: 'moderate',
      tripStyle: [],
      pace: 'moderate',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should display the step heading', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      expect(screen.getByText(/review your trip/i)).toBeInTheDocument();
    });

    it('should show destination section', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      expect(screen.getAllByText('Dubai').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/united arab emirates/i)).toBeInTheDocument();
    });

    it('should show dates section', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      expect(screen.getByText(/mar 15/i)).toBeInTheDocument();
      expect(screen.getByText(/mar 22/i)).toBeInTheDocument();
    });

    it('should show travelers section', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      expect(screen.getByText(/2 adults/i)).toBeInTheDocument();
      expect(screen.getByText(/1 child/i)).toBeInTheDocument();
    });

    it('should show preferences section', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      expect(screen.getByText('Trip Preferences')).toBeInTheDocument();
      expect(screen.getByText('Budget')).toBeInTheDocument();
    });
  });

  describe('Trip Duration', () => {
    it('should calculate and display trip duration', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      expect(screen.getAllByText(/7 days/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Trip Style Tags', () => {
    it('should display trip style tags', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      expect(screen.getByText('Cultural Immersion')).toBeInTheDocument();
      expect(screen.getByText('Food & Culinary')).toBeInTheDocument();
    });

    it('should not show tags section if no styles selected', () => {
      render(<ReviewStep data={incompleteData} onEdit={mockOnEdit} />);

      expect(screen.queryByText('Cultural Immersion')).not.toBeInTheDocument();
    });
  });

  describe('Edit Buttons', () => {
    it('should show edit button for dates section', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('should call onEdit with step 0 when dates edit clicked', async () => {
      const user = userEvent.setup();
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(0);
    });

    it('should call onEdit with step 1 when travelers edit clicked', async () => {
      const user = userEvent.setup();
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[1]);

      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    it('should call onEdit with step 2 when preferences edit clicked', async () => {
      const user = userEvent.setup();
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[2]);

      expect(mockOnEdit).toHaveBeenCalledWith(2);
    });
  });

  describe('Validation Warnings', () => {
    it('should show warning when dates are missing', () => {
      render(<ReviewStep data={incompleteData} onEdit={mockOnEdit} />);

      expect(screen.getByText(/please select dates/i)).toBeInTheDocument();
    });

    it('should highlight missing dates section', () => {
      render(<ReviewStep data={incompleteData} onEdit={mockOnEdit} />);

      const warningElement = screen.getByText(/please select dates/i);
      expect(warningElement.closest('[data-warning="true"]')).toBeInTheDocument();
    });
  });

  describe('Children Ages Display', () => {
    it('should show children ages when available', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      expect(screen.getByText(/age 5/i)).toBeInTheDocument();
    });

    it('should not show children ages when no children', () => {
      render(<ReviewStep data={incompleteData} onEdit={mockOnEdit} />);

      expect(screen.queryByText(/age \d/i)).not.toBeInTheDocument();
    });
  });

  describe('Budget Summary', () => {
    it('should show estimated daily budget', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      expect(screen.getByText(/\$100-200\/day/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper section structure', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThanOrEqual(4);
    });

    it('should have accessible edit buttons', () => {
      render(<ReviewStep data={completeData} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      editButtons.forEach((btn) => {
        expect(btn).toHaveAccessibleName();
      });
    });
  });
});
