import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangeStep } from '../steps/DateRangeStep';

describe('DateRangeStep', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render date range picker', () => {
      render(<DateRangeStep onChange={mockOnChange} />);

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    it('should display the step heading', () => {
      render(<DateRangeStep onChange={mockOnChange} />);

      expect(screen.getByText(/when are you traveling/i)).toBeInTheDocument();
    });

    it('should show best time hint when provided', () => {
      render(
        <DateRangeStep
          onChange={mockOnChange}
          bestTimeToVisit="November to March"
        />
      );

      expect(screen.getByText(/november to march/i)).toBeInTheDocument();
    });

    it('should show quick duration options', () => {
      render(<DateRangeStep onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /weekend/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /1 week/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /2 weeks/i })).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('should call onChange when start date is selected', async () => {
      const user = userEvent.setup();
      render(<DateRangeStep onChange={mockOnChange} />);

      const startInput = screen.getByLabelText(/start date/i);
      await user.clear(startInput);
      fireEvent.change(startInput, { target: { value: '2026-04-15' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should call onChange when end date is selected', async () => {
      const user = userEvent.setup();
      render(
        <DateRangeStep
          onChange={mockOnChange}
          value={{ start: '2026-04-15T00:00:00.000Z', end: '2026-04-15T00:00:00.000Z' }}
        />
      );

      const endInput = screen.getByLabelText(/end date/i);
      fireEvent.change(endInput, { target: { value: '2026-04-20' } });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          end: '2026-04-20T00:00:00.000Z',
        })
      );
    });

    it('should not allow end date before start date', async () => {
      render(
        <DateRangeStep
          onChange={mockOnChange}
          value={{ start: '2026-04-15T00:00:00.000Z', end: '2026-04-20T00:00:00.000Z' }}
        />
      );

      const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;
      expect(endInput.min).toBe('2026-04-15');
    });

    it('should not allow dates in the past', () => {
      render(<DateRangeStep onChange={mockOnChange} />);

      const startInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];

      expect(startInput.min).toBe(today);
    });
  });

  describe('Trip Duration Display', () => {
    it('should show trip duration when both dates selected', () => {
      render(
        <DateRangeStep
          onChange={mockOnChange}
          value={{ start: '2026-04-15T00:00:00.000Z', end: '2026-04-22T00:00:00.000Z' }}
        />
      );

      expect(screen.getByText(/7 days/i)).toBeInTheDocument();
    });

    it('should show singular "day" for 1 day trip', () => {
      render(
        <DateRangeStep
          onChange={mockOnChange}
          value={{ start: '2026-04-15T00:00:00.000Z', end: '2026-04-16T00:00:00.000Z' }}
        />
      );

      expect(screen.getByText(/1 day/i)).toBeInTheDocument();
    });

    it('should not show duration when dates are not selected', () => {
      render(<DateRangeStep onChange={mockOnChange} />);

      expect(screen.queryByText(/days?$/i)).not.toBeInTheDocument();
    });
  });

  describe('Quick Duration Buttons', () => {
    it('should set weekend duration (3 days) when clicked', async () => {
      const user = userEvent.setup();
      render(<DateRangeStep onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /weekend/i }));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String),
        })
      );
    });

    it('should set 1 week duration when clicked', async () => {
      const user = userEvent.setup();
      render(<DateRangeStep onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /1 week/i }));

      expect(mockOnChange).toHaveBeenCalled();
      const call = mockOnChange.mock.calls[0][0];
      const start = new Date(call.start);
      const end = new Date(call.end);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      expect(days).toBe(7);
    });

    it('should set 2 weeks duration when clicked', async () => {
      const user = userEvent.setup();
      render(<DateRangeStep onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /2 weeks/i }));

      expect(mockOnChange).toHaveBeenCalled();
      const call = mockOnChange.mock.calls[0][0];
      const start = new Date(call.start);
      const end = new Date(call.end);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      expect(days).toBe(14);
    });

    it('should highlight selected quick duration', () => {
      render(
        <DateRangeStep
          onChange={mockOnChange}
          value={{ start: '2026-04-15T00:00:00.000Z', end: '2026-04-22T00:00:00.000Z' }}
        />
      );

      const weekButton = screen.getByRole('button', { name: /1 week/i });
      expect(weekButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Flexible Dates', () => {
    it('should show flexible dates toggle', () => {
      render(<DateRangeStep onChange={mockOnChange} />);

      expect(screen.getByRole('checkbox', { name: /flexible/i })).toBeInTheDocument();
    });

    it('should include flexibility when toggled', async () => {
      const user = userEvent.setup();
      render(
        <DateRangeStep
          onChange={mockOnChange}
          value={{ start: '2026-04-15T00:00:00.000Z', end: '2026-04-22T00:00:00.000Z' }}
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /flexible/i }));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          flexible: true,
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have accessible date inputs', () => {
      render(<DateRangeStep onChange={mockOnChange} />);

      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);

      expect(startInput).toHaveAttribute('type', 'date');
      expect(endInput).toHaveAttribute('type', 'date');
    });

    it('should have proper fieldset grouping', () => {
      render(<DateRangeStep onChange={mockOnChange} />);

      expect(screen.getByRole('group', { name: /travel dates/i })).toBeInTheDocument();
    });
  });
});
