import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CityCard } from '../CityCard';
import { TripProvider } from '@/context/TripContext';
import { mockCities } from '@vibe-travel/shared';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<TripProvider>{ui}</TripProvider>);
};

describe('CityCard', () => {
  const mockCity = mockCities[0];
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
    localStorage.clear();
  });

  it('should display city name and country', () => {
    renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByText(mockCity.city)).toBeInTheDocument();
    expect(screen.getByText(mockCity.country)).toBeInTheDocument();
  });

  it('should display maximum 3 vibe tags', () => {
    const cityWithManyTags = {
      ...mockCity,
      vibe_tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };

    renderWithProvider(<CityCard city={cityWithManyTags} onClick={mockOnClick} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    expect(screen.queryByText('tag4')).not.toBeInTheDocument();
  });

  it('should display truncated description', () => {
    const cityWithLongDesc = {
      ...mockCity,
      description: 'A'.repeat(200),
    };

    renderWithProvider(<CityCard city={cityWithLongDesc} onClick={mockOnClick} />);

    const description = screen.getByTestId('city-description');
    expect(description.textContent?.length).toBeLessThan(160);
    expect(description.textContent).toContain('...');
  });

  it('should display culture and nightlife scores', () => {
    renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByText(/Culture:/)).toBeInTheDocument();
    expect(screen.getByText(/Nightlife:/)).toBeInTheDocument();
  });

  it('should display city image', () => {
    renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

    const image = screen.getByRole('img', { name: new RegExp(mockCity.city) });
    expect(image).toHaveAttribute('alt', expect.stringContaining(mockCity.city));
  });

  it('should call onClick when clicked', () => {
    renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('article'));

    expect(mockOnClick).toHaveBeenCalledWith(mockCity);
  });

  it('should be accessible', () => {
    renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining(mockCity.city));
  });

  it('should handle missing image gracefully', () => {
    const cityNoImage = { ...mockCity, image_url: '' };
    renderWithProvider(<CityCard city={cityNoImage} onClick={mockOnClick} />);

    const image = screen.getByRole('img', { name: new RegExp(mockCity.city) });
    expect(image).toHaveAttribute('src', expect.stringContaining('unsplash'));
  });

  it('should handle keyboard navigation', () => {
    renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

    const card = screen.getByRole('article');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledWith(mockCity);
  });

  it('should display vibe tags container', () => {
    renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByTestId('vibe-tags')).toBeInTheDocument();
  });

  it('should display score badges container', () => {
    renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

    expect(screen.getByTestId('score-badges')).toBeInTheDocument();
  });

  describe('Wishlist Button', () => {
    it('should display wishlist button by default', () => {
      renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      expect(wishlistButton).toBeInTheDocument();
    });

    it('should hide wishlist button when showWishlistButton is false', () => {
      renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} showWishlistButton={false} />);

      const wishlistButton = screen.queryByRole('button', { name: /wishlist/i });
      expect(wishlistButton).not.toBeInTheDocument();
    });

    it('should not trigger card click when wishlist button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      await user.click(wishlistButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should toggle wishlist state when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CityCard city={mockCity} onClick={mockOnClick} />);

      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      expect(wishlistButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(wishlistButton);
      expect(wishlistButton).toHaveAttribute('aria-pressed', 'true');

      await user.click(wishlistButton);
      expect(wishlistButton).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
