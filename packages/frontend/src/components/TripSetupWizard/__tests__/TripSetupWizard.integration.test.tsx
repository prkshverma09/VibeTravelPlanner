import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TripSetupWizard } from '../TripSetupWizard';
import type { TripSetup } from '@vibe-travel/shared';

describe('TripSetupWizard Integration', () => {
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

  describe('Complete Wizard Flow', () => {
    it('should complete full wizard flow from start to finish', async () => {
      const user = userEvent.setup();

      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('step-dates')).toBeVisible();

      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-travelers')).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-preferences')).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-review')).toBeVisible();
      });

      expect(screen.getByRole('button', { name: /start planning/i })).toBeInTheDocument();
    });

    it('should navigate backward through steps', async () => {
      const user = userEvent.setup();

      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={3}
        />
      );

      expect(screen.getByTestId('step-review')).toBeVisible();

      await user.click(screen.getByRole('button', { name: /back/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-preferences')).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: /back/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-travelers')).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: /back/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-dates')).toBeVisible();
      });

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });

    it('should update progress bar as user advances', async () => {
      const user = userEvent.setup();

      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      const getProgress = () => {
        const progressBar = screen.getByRole('progressbar');
        return Number(progressBar.getAttribute('aria-valuenow'));
      };

      expect(getProgress()).toBe(25);

      await user.click(screen.getByRole('button', { name: /continue/i }));
      await waitFor(() => expect(getProgress()).toBe(50));

      await user.click(screen.getByRole('button', { name: /continue/i }));
      await waitFor(() => expect(getProgress()).toBe(75));

      await user.click(screen.getByRole('button', { name: /continue/i }));
      await waitFor(() => expect(getProgress()).toBe(100));
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

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Step Tab Navigation', () => {
    it('should allow clicking on completed step tabs to go back', async () => {
      const user = userEvent.setup();

      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={2}
        />
      );

      expect(screen.getByTestId('step-preferences')).toBeVisible();

      const tabs = screen.getAllByRole('tab');
      const datesTab = tabs[0];

      await user.click(datesTab);

      await waitFor(() => {
        expect(screen.getByTestId('step-dates')).toBeVisible();
      });
    });

    it('should not allow clicking on future step tabs', async () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={0}
        />
      );

      const tabs = screen.getAllByRole('tab');
      const reviewTab = tabs[3];

      expect(reviewTab).toBeDisabled();
    });

    it('should mark completed steps with aria-selected false', async () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={2}
        />
      );

      const tabs = screen.getAllByRole('tab');
      
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[3]).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Data Persistence Across Steps', () => {
    it('should remember traveler count when navigating back and forth', async () => {
      const user = userEvent.setup();

      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId('step-travelers')).toBeVisible();
      });

      expect(screen.getByTestId('adult-count')).toHaveTextContent('2');

      await user.click(screen.getByRole('button', { name: /increase adults/i }));

      expect(screen.getByTestId('adult-count')).toHaveTextContent('3');

      await user.click(screen.getByRole('button', { name: /continue/i }));
      await waitFor(() => {
        expect(screen.getByTestId('step-preferences')).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: /back/i }));
      await waitFor(() => {
        expect(screen.getByTestId('step-travelers')).toBeVisible();
      });

      expect(screen.getByTestId('adult-count')).toHaveTextContent('3');
    });
  });

  describe('Destination Display', () => {
    it('should display destination info throughout wizard', async () => {
      const user = userEvent.setup();

      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText(/Dubai/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /continue/i }));
      await waitFor(() => {
        expect(screen.getByTestId('step-travelers')).toBeVisible();
      });

      expect(screen.getByText(/Dubai/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /continue/i }));
      await waitFor(() => {
        expect(screen.getByTestId('step-preferences')).toBeVisible();
      });

      expect(screen.getByText(/Dubai/)).toBeInTheDocument();
    });

    it('should display best time to visit hint when provided', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getAllByText(/november to march/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form structure throughout flow', async () => {
      const user = userEvent.setup();

      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByRole('form')).toHaveAttribute('aria-label');

      await user.click(screen.getByRole('button', { name: /continue/i }));
      await waitFor(() => {
        expect(screen.getByTestId('step-travelers')).toBeVisible();
      });

      expect(screen.getByRole('form')).toHaveAttribute('aria-label');
    });

    it('should have live region for step announcements', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should have properly labeled tab navigation', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label');
    });
  });

  describe('Button State Management', () => {
    it('should show Continue on steps 0-2 and Start Planning on step 3', async () => {
      const user = userEvent.setup();

      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /start planning/i })).not.toBeInTheDocument();

      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole('button', { name: /continue/i }));
        await waitFor(() => {
          const stepIndex = i + 1;
          if (stepIndex === 3) {
            expect(screen.getByTestId('step-review')).toBeVisible();
          }
        });
      }

      expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start planning/i })).toBeInTheDocument();
    });

    it('should not show Back button on first step', () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={0}
        />
      );

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });

    it('should show Back button on steps 1-3', () => {
      const { rerender } = render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
          initialStep={1}
        />
      );

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onCancel gracefully', async () => {
      render(
        <TripSetupWizard
          destination={mockDestination}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });
});
