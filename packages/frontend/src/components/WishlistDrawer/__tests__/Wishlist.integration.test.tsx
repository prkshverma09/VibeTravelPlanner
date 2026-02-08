import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { WishlistButton } from '@/components/WishlistButton';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { TripProvider } from '@/context/TripContext';
import { WISHLIST_STORAGE_KEY } from '@/hooks/useWishlistPersistence';

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
  {
    objectID: 'new-york-usa',
    city: 'New York',
    country: 'United States',
    continent: 'North America',
    description: 'The Big Apple',
    vibe_tags: ['Urban', 'Exciting'],
    image_url: 'https://example.com/nyc.jpg',
  },
];

function WishlistTestApp() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <TripProvider>
      <div>
        <button onClick={() => setIsDrawerOpen(true)} data-testid="open-drawer">
          Open Wishlist
        </button>

        <div data-testid="city-list">
          {mockCities.map((city) => (
            <div key={city.objectID} data-testid={`city-card-${city.objectID}`}>
              <h3>{city.city}</h3>
              <p>{city.country}</p>
              <WishlistButton city={city as any} />
            </div>
          ))}
        </div>

        <WishlistDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
    </TripProvider>
  );
}

describe('Wishlist Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Adding to Wishlist', () => {
    it('should add city to wishlist when heart is clicked', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      const tokyoCard = screen.getByTestId('city-card-tokyo-japan');
      const heartButton = tokyoCard.querySelector('button[aria-label*="wishlist"]');

      expect(heartButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(heartButton!);

      expect(heartButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should persist to localStorage when added', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      const tokyoCard = screen.getByTestId('city-card-tokyo-japan');
      const heartButton = tokyoCard.querySelector('button[aria-label*="wishlist"]');

      await user.click(heartButton!);

      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].city.objectID).toBe('tokyo-japan');
    });

    it('should show added city in drawer', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      const tokyoCard = screen.getByTestId('city-card-tokyo-japan');
      const heartButton = tokyoCard.querySelector('button[aria-label*="wishlist"]');
      await user.click(heartButton!);

      const openDrawerButton = screen.getByTestId('open-drawer');
      await user.click(openDrawerButton);

      await waitFor(() => {
        const drawer = screen.getByRole('dialog');
        expect(drawer).toBeInTheDocument();
      });

      expect(screen.getAllByText('Tokyo').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Removing from Wishlist', () => {
    it('should remove city when heart is clicked again', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      const tokyoCard = screen.getByTestId('city-card-tokyo-japan');
      const heartButton = tokyoCard.querySelector('button[aria-label*="wishlist"]');

      await user.click(heartButton!);
      expect(heartButton).toHaveAttribute('aria-pressed', 'true');

      await user.click(heartButton!);
      expect(heartButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should remove from localStorage when removed', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      const tokyoCard = screen.getByTestId('city-card-tokyo-japan');
      const heartButton = tokyoCard.querySelector('button[aria-label*="wishlist"]');

      await user.click(heartButton!);
      let stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      expect(JSON.parse(stored!)).toHaveLength(1);

      await user.click(heartButton!);
      stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      expect(JSON.parse(stored!)).toHaveLength(0);
    });
  });

  describe('Multiple Cities', () => {
    it('should handle adding multiple cities', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      const tokyoCard = screen.getByTestId('city-card-tokyo-japan');
      const parisCard = screen.getByTestId('city-card-paris-france');
      const nycCard = screen.getByTestId('city-card-new-york-usa');

      const tokyoHeart = tokyoCard.querySelector('button[aria-label*="wishlist"]');
      const parisHeart = parisCard.querySelector('button[aria-label*="wishlist"]');
      const nycHeart = nycCard.querySelector('button[aria-label*="wishlist"]');

      await user.click(tokyoHeart!);
      await user.click(parisHeart!);
      await user.click(nycHeart!);

      expect(tokyoHeart).toHaveAttribute('aria-pressed', 'true');
      expect(parisHeart).toHaveAttribute('aria-pressed', 'true');
      expect(nycHeart).toHaveAttribute('aria-pressed', 'true');

      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      expect(JSON.parse(stored!)).toHaveLength(3);
    });

    it('should show all cities in drawer', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      const tokyoCard = screen.getByTestId('city-card-tokyo-japan');
      const parisCard = screen.getByTestId('city-card-paris-france');

      await user.click(tokyoCard.querySelector('button[aria-label*="wishlist"]')!);
      await user.click(parisCard.querySelector('button[aria-label*="wishlist"]')!);

      await user.click(screen.getByTestId('open-drawer'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveTextContent('Tokyo');
      expect(drawer).toHaveTextContent('Paris');
    });
  });

  describe('Drawer Interactions', () => {
    it('should close drawer on escape key', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      await user.click(screen.getByTestId('open-drawer'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close drawer on close button click', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      await user.click(screen.getByTestId('open-drawer'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('State Synchronization', () => {
    it('should sync wishlist button state with drawer', async () => {
      const user = userEvent.setup();
      render(<WishlistTestApp />);

      const tokyoCard = screen.getByTestId('city-card-tokyo-japan');
      const heartButton = tokyoCard.querySelector('button[aria-label*="wishlist"]');

      await user.click(heartButton!);

      await user.click(screen.getByTestId('open-drawer'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(heartButton).toHaveAttribute('aria-pressed', 'false');
      });
    });
  });
});
