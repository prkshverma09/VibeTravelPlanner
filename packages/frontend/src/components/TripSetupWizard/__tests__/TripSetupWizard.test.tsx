import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TripSetupWizard } from '../TripSetupWizard';

describe('TripSetupWizard', () => {
  const mockDestination = {
    objectID: 'dubai-uae',
    city: 'Dubai',
    country: 'United Arab Emirates',
    continent: 'Middle East',
    bestTimeToVisit: 'November to March',
  };

  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render wizard container', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );
      expect(screen.getByTestId('trip-setup-wizard')).toBeInTheDocument();
    });

    it('should display destination name in header', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );
      expect(screen.getByText(/Dubai/)).toBeInTheDocument();
    });

    it('should render step indicators', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );
      expect(screen.getByTestId('wizard-steps')).toBeInTheDocument();
    });

    it('should show 4 steps', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );
      const stepIndicators = screen.getAllByRole('tab');
      expect(stepIndicators.length).toBe(4);
    });

    it('should start on first step (dates)', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );
      expect(screen.getByTestId('step-dates')).toBeVisible();
    });

    it('should highlight current step', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );
      const firstStep = screen.getAllByRole('tab')[0];
      expect(firstStep).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Navigation', () => {
    it('should show continue button', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('should show back button after first step', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={1}
        />
      );
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should not show back button on first step', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );
      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });

    it('should navigate back when back button clicked', async () => {
      const user = userEvent.setup();
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={1}
        />
      );

      await user.click(screen.getByRole('button', { name: /back/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-dates')).toBeVisible();
      });
    });

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should show finish button on last step', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={3}
        />
      );
      expect(screen.getByRole('button', { name: /start planning/i })).toBeInTheDocument();
    });
  });

  describe('Step Content', () => {
    it('should show dates step content on step 0', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={0}
        />
      );
      expect(screen.getByTestId('step-dates')).toBeInTheDocument();
      expect(screen.getByText(/when are you traveling/i)).toBeInTheDocument();
    });

    it('should show travelers step content on step 1', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={1}
        />
      );
      expect(screen.getByTestId('step-travelers')).toBeInTheDocument();
      expect(screen.getByText(/who.*traveling/i)).toBeInTheDocument();
    });

    it('should show preferences step content on step 2', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={2}
        />
      );
      expect(screen.getByTestId('step-preferences')).toBeInTheDocument();
      expect(screen.getByText(/trip style/i)).toBeInTheDocument();
    });

    it('should show review step content on step 3', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={3}
        />
      );
      expect(screen.getByTestId('step-review')).toBeInTheDocument();
      expect(screen.getByText(/review your trip/i)).toBeInTheDocument();
    });
  });

  describe('Progress Indicator', () => {
    it('should show progress bar', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should update progress as steps advance', () => {
      const { unmount } = render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={0}
        />
      );
      const progress1 = screen.getByRole('progressbar').getAttribute('aria-valuenow');
      unmount();

      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={2}
        />
      );
      const progress2 = screen.getByRole('progressbar').getAttribute('aria-valuenow');

      expect(Number(progress2)).toBeGreaterThan(Number(progress1));
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form structure', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label');
    });

    it('should have step tabs with proper ARIA attributes', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('should have live region for announcements', () => {
      render(
        <TripSetupWizard destination={mockDestination} onComplete={mockOnComplete} />
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});
