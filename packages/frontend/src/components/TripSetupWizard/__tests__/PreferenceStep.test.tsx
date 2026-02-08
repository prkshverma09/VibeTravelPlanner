import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferenceStep } from '../steps/PreferenceStep';

describe('PreferenceStep', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Budget Level', () => {
    it('should render all budget options', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByLabelText('Budget')).toBeInTheDocument();
      expect(screen.getByLabelText('Moderate')).toBeInTheDocument();
      expect(screen.getByLabelText('Luxury')).toBeInTheDocument();
      expect(screen.getByLabelText('Unlimited')).toBeInTheDocument();
    });

    it('should show default budget selection', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByLabelText('Moderate')).toBeChecked();
    });

    it('should call onChange when budget selected', async () => {
      const user = userEvent.setup();
      render(<PreferenceStep onChange={mockOnChange} />);

      await user.click(screen.getByLabelText('Luxury'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ budgetLevel: 'luxury' })
      );
    });

    it('should show budget descriptions', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByText(/\$50-100\/day/i)).toBeInTheDocument();
      expect(screen.getByText(/\$100-200\/day/i)).toBeInTheDocument();
    });
  });

  describe('Trip Style', () => {
    it('should render trip style options as checkboxes', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByLabelText('Cultural Immersion')).toBeInTheDocument();
      expect(screen.getByLabelText('Adventure & Outdoors')).toBeInTheDocument();
      expect(screen.getByLabelText('Food & Culinary')).toBeInTheDocument();
    });

    it('should allow multiple style selections', async () => {
      const user = userEvent.setup();
      render(
        <PreferenceStep
          onChange={mockOnChange}
          value={{ budgetLevel: 'moderate', tripStyle: ['Cultural Immersion'], pace: 'moderate' }}
        />
      );

      await user.click(screen.getByLabelText('Food & Culinary'));

      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          tripStyle: expect.arrayContaining(['Cultural Immersion', 'Food & Culinary']),
        })
      );
    });

    it('should toggle style off when clicked again', async () => {
      const user = userEvent.setup();
      render(
        <PreferenceStep
          onChange={mockOnChange}
          value={{
            budgetLevel: 'moderate',
            tripStyle: ['Cultural Immersion'],
            pace: 'moderate',
          }}
        />
      );

      await user.click(screen.getByLabelText('Cultural Immersion'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ tripStyle: [] })
      );
    });
  });

  describe('Pace', () => {
    it('should render pace options', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByLabelText('Relaxed')).toBeInTheDocument();
      expect(screen.getByLabelText('Moderate Pace')).toBeInTheDocument();
      expect(screen.getByLabelText('Packed')).toBeInTheDocument();
    });

    it('should call onChange when pace selected', async () => {
      const user = userEvent.setup();
      render(<PreferenceStep onChange={mockOnChange} />);

      await user.click(screen.getByLabelText('Relaxed'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ pace: 'relaxed' })
      );
    });

    it('should show pace descriptions', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByText(/2-3 activities/i)).toBeInTheDocument();
      expect(screen.getByText(/6-8 activities/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Options', () => {
    it('should render mobility options', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByLabelText('Full Mobility')).toBeInTheDocument();
      expect(screen.getByLabelText('Limited Mobility')).toBeInTheDocument();
      expect(screen.getByLabelText('Wheelchair Accessible')).toBeInTheDocument();
    });

    it('should call onChange when mobility selected', async () => {
      const user = userEvent.setup();
      render(<PreferenceStep onChange={mockOnChange} />);

      await user.click(screen.getByLabelText('Wheelchair Accessible'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ mobility: 'wheelchair' })
      );
    });
  });

  describe('Interests', () => {
    it('should show interest tags', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByLabelText('history')).toBeInTheDocument();
      expect(screen.getByLabelText('architecture')).toBeInTheDocument();
      expect(screen.getByLabelText('nature')).toBeInTheDocument();
    });

    it('should call onChange when interest selected', async () => {
      const user = userEvent.setup();
      render(
        <PreferenceStep
          onChange={mockOnChange}
          value={{ budgetLevel: 'moderate', tripStyle: [], pace: 'moderate', interests: [] }}
        />
      );

      await user.click(screen.getByLabelText('history'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          interests: expect.arrayContaining(['history']),
        })
      );
    });
  });

  describe('Rendering', () => {
    it('should display the step heading', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByText(/trip preferences/i)).toBeInTheDocument();
    });

    it('should have section headings', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByText('Budget Level')).toBeInTheDocument();
      expect(screen.getByText('Trip Style')).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /pace/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper fieldset groupings', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      expect(screen.getByRole('group', { name: /budget/i })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /pace/i })).toBeInTheDocument();
    });

    it('should have accessible radio groups', () => {
      render(<PreferenceStep onChange={mockOnChange} />);

      const radioGroups = screen.getAllByRole('radiogroup');
      expect(radioGroups.length).toBeGreaterThanOrEqual(2);
    });
  });
});
