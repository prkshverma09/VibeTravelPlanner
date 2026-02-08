import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistButton } from '../WishlistButton';
import { TripProvider } from '@/context/TripContext';

const mockCity = {
  objectID: 'tokyo-japan',
  city: 'Tokyo',
  country: 'Japan',
  continent: 'Asia',
  description: 'A vibrant metropolis',
  vibe_tags: ['Cultural', 'Modern'],
  image_url: 'https://example.com/tokyo.jpg',
  latitude: 35.6762,
  longitude: 139.6503,
  rating: 4.8,
  review_count: 1000,
  average_cost_per_day: 150,
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<TripProvider>{ui}</TripProvider>);
};

describe('WishlistButton', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the wishlist button', () => {
      renderWithProvider(<WishlistButton city={mockCity as any} />);

      const button = screen.getByRole('button', { name: /add.*wishlist|save|favorite/i });
      expect(button).toBeInTheDocument();
    });

    it('should show empty heart when not in wishlist', () => {
      renderWithProvider(<WishlistButton city={mockCity as any} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have accessible label', () => {
      renderWithProvider(<WishlistButton city={mockCity as any} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName();
    });
  });

  describe('Interactions', () => {
    it('should toggle wishlist state on click', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WishlistButton city={mockCity as any} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');

      await user.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should call onToggle callback when clicked', async () => {
      const onToggle = vi.fn();
      const user = userEvent.setup();

      renderWithProvider(<WishlistButton city={mockCity as any} onToggle={onToggle} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onToggle).toHaveBeenCalledWith(true);

      await user.click(button);
      expect(onToggle).toHaveBeenCalledWith(false);
    });
  });

  describe('Visual Variants', () => {
    it('should apply small size variant', () => {
      renderWithProvider(<WishlistButton city={mockCity as any} size="small" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/small/i);
    });

    it('should apply large size variant', () => {
      renderWithProvider(<WishlistButton city={mockCity as any} size="large" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/large/i);
    });

    it('should apply overlay variant', () => {
      renderWithProvider(<WishlistButton city={mockCity as any} variant="overlay" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/overlay/i);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WishlistButton city={mockCity as any} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(button).toHaveAttribute('aria-pressed', 'true');

      await user.keyboard(' ');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should announce state changes to screen readers', async () => {
      const user = userEvent.setup();
      renderWithProvider(<WishlistButton city={mockCity as any} />);

      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Tokyo'));

      await user.click(button);
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Tokyo'));
    });
  });
});
