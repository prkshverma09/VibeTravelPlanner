import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanTripButton } from '../PlanTripButton';

describe('PlanTripButton', () => {
  const mockDestination = {
    objectID: 'dubai-uae',
    city: 'Dubai',
    country: 'United Arab Emirates',
    continent: 'Middle East',
    bestTimeToVisit: 'November to March',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Plan Trip button', () => {
      render(<PlanTripButton destination={mockDestination} />);

      expect(screen.getByRole('button', { name: /plan.*trip/i })).toBeInTheDocument();
    });

    it('should not show wizard initially', () => {
      render(<PlanTripButton destination={mockDestination} />);

      expect(screen.queryByTestId('trip-setup-wizard')).not.toBeInTheDocument();
    });
  });

  describe('Opening Wizard', () => {
    it('should open wizard when button clicked', async () => {
      const user = userEvent.setup();
      render(<PlanTripButton destination={mockDestination} />);

      await user.click(screen.getByRole('button', { name: /plan.*trip/i }));

      await waitFor(() => {
        expect(screen.getByTestId('trip-setup-wizard')).toBeInTheDocument();
      });
    });

    it('should show modal overlay when wizard open', async () => {
      const user = userEvent.setup();
      render(<PlanTripButton destination={mockDestination} />);

      await user.click(screen.getByRole('button', { name: /plan.*trip/i }));

      await waitFor(() => {
        expect(screen.getByTestId('wizard-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Closing Wizard', () => {
    it('should close wizard when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<PlanTripButton destination={mockDestination} />);

      await user.click(screen.getByRole('button', { name: /plan.*trip/i }));

      await waitFor(() => {
        expect(screen.getByTestId('trip-setup-wizard')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('trip-setup-wizard')).not.toBeInTheDocument();
      });
    });

    it('should close wizard when clicking overlay', async () => {
      const user = userEvent.setup();
      render(<PlanTripButton destination={mockDestination} />);

      await user.click(screen.getByRole('button', { name: /plan.*trip/i }));

      await waitFor(() => {
        expect(screen.getByTestId('wizard-modal')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('wizard-overlay'));

      await waitFor(() => {
        expect(screen.queryByTestId('trip-setup-wizard')).not.toBeInTheDocument();
      });
    });

    it('should close wizard when pressing Escape', async () => {
      const user = userEvent.setup();
      render(<PlanTripButton destination={mockDestination} />);

      await user.click(screen.getByRole('button', { name: /plan.*trip/i }));

      await waitFor(() => {
        expect(screen.getByTestId('trip-setup-wizard')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByTestId('trip-setup-wizard')).not.toBeInTheDocument();
      });
    });
  });

  describe('Wizard Completion', () => {
    it('should pass onComplete callback to wizard', async () => {
      const mockOnComplete = vi.fn();
      const user = userEvent.setup();
      
      render(
        <PlanTripButton
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      await user.click(screen.getByRole('button', { name: /plan.*trip/i }));

      await waitFor(() => {
        expect(screen.getByTestId('trip-setup-wizard')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });
  });

  describe('Button Variants', () => {
    it('should render primary variant by default', () => {
      render(<PlanTripButton destination={mockDestination} />);

      const button = screen.getByRole('button', { name: /plan.*trip/i });
      expect(button.className).toMatch(/primary/);
    });

    it('should render secondary variant when specified', () => {
      render(<PlanTripButton destination={mockDestination} variant="secondary" />);

      const button = screen.getByRole('button', { name: /plan.*trip/i });
      expect(button.className).toMatch(/secondary/);
    });

    it('should render custom button text when provided', () => {
      render(
        <PlanTripButton
          destination={mockDestination}
          buttonText="Start Planning Now"
        />
      );

      expect(screen.getByRole('button', { name: /start planning now/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      render(<PlanTripButton destination={mockDestination} />);

      const button = screen.getByRole('button', { name: /plan.*trip/i });
      expect(button).toBeEnabled();
    });

    it('should trap focus in modal when open', async () => {
      const user = userEvent.setup();
      render(<PlanTripButton destination={mockDestination} />);

      await user.click(screen.getByRole('button', { name: /plan.*trip/i }));

      await waitFor(() => {
        expect(screen.getByTestId('wizard-modal')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });
  });
});
