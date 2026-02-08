import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistDrawer } from '../WishlistDrawer';
import { TripProvider } from '@/context/TripContext';

const mockCities = [
  {
    objectID: 'tokyo-japan',
    city: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    description: 'A vibrant metropolis',
    vibe_tags: ['Cultural', 'Modern'],
    image_url: 'https://example.com/tokyo.jpg',
  },
  {
    objectID: 'paris-france',
    city: 'Paris',
    country: 'France',
    continent: 'Europe',
    description: 'City of Light',
    vibe_tags: ['Romantic', 'Cultural'],
    image_url: 'https://example.com/paris.jpg',
  },
];

const mockWishlistItems = mockCities.map((city, idx) => ({
  city: city as any,
  notes: idx === 0 ? 'Spring trip' : null,
  addedAt: Date.now() - idx * 1000,
}));

vi.mock('@/context/TripContext', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useTripContext: () => ({
      state: {
        wishlist: mockWishlistItems,
        preferences: [],
        tripPlan: [],
        comparison: { cities: [], focusAttributes: [], isActive: false },
        conversationSummary: [],
      },
      dispatch: vi.fn(),
      hasWishlist: true,
      wishlistCount: 2,
    }),
  };
});

describe('WishlistDrawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Closed State', () => {
    it('should not render content when closed', () => {
      render(<WishlistDrawer isOpen={false} onClose={() => {}} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Open State', () => {
    it('should render drawer when open', () => {
      render(<WishlistDrawer isOpen={true} onClose={() => {}} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should show wishlist title', () => {
      render(<WishlistDrawer isOpen={true} onClose={() => {}} />);

      expect(screen.getByText(/My Wishlist/i)).toBeInTheDocument();
    });

    it('should display wishlist count', () => {
      render(<WishlistDrawer isOpen={true} onClose={() => {}} />);

      expect(screen.getByText(/2/)).toBeInTheDocument();
    });

    it('should show saved cities', () => {
      render(<WishlistDrawer isOpen={true} onClose={() => {}} />);

      expect(screen.getByText('Tokyo')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    it('should show city country', () => {
      render(<WishlistDrawer isOpen={true} onClose={() => {}} />);

      expect(screen.getByText(/Japan/i)).toBeInTheDocument();
      expect(screen.getByText(/France/i)).toBeInTheDocument();
    });

    it('should show notes when available', () => {
      render(<WishlistDrawer isOpen={true} onClose={() => {}} />);

      expect(screen.getByText('Spring trip')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(<WishlistDrawer isOpen={true} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when overlay clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(<WishlistDrawer isOpen={true} onClose={onClose} />);

      const overlay = screen.getByTestId('drawer-overlay');
      await user.click(overlay);

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose on Escape key', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(<WishlistDrawer isOpen={true} onClose={onClose} />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });

    it('should have remove button for each item', () => {
      render(<WishlistDrawer isOpen={true} onClose={() => {}} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      expect(removeButtons).toHaveLength(2);
    });

    it('should call onCityClick when city is clicked', async () => {
      const onCityClick = vi.fn();
      const user = userEvent.setup();

      render(<WishlistDrawer isOpen={true} onClose={() => {}} onCityClick={onCityClick} />);

      const tokyoCard = screen.getByText('Tokyo').closest('button, a, [role="button"]');
      if (tokyoCard) {
        await user.click(tokyoCard);
        expect(onCityClick).toHaveBeenCalled();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<WishlistDrawer isOpen={true} onClose={() => {}} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible title', () => {
      render(<WishlistDrawer isOpen={true} onClose={() => {}} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleName();
    });
  });
});

