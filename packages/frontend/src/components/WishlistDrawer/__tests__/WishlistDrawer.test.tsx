import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WishlistDrawer } from '../WishlistDrawer';
import type { WishlistItem } from '../../../context/TripContext';
import type { AlgoliaCity } from '@vibe-travel/shared';

const mockCity: AlgoliaCity = {
  objectID: 'tokyo-japan',
  city: 'Tokyo',
  country: 'Japan',
  continent: 'Asia',
  description: 'A vibrant metropolis',
  vibe_tags: ['modern', 'bustling'],
  culture_score: 9,
  adventure_score: 7,
  nature_score: 5,
  beach_score: 3,
  nightlife_score: 9,
  climate_type: 'Humid subtropical',
  best_time_to_visit: 'Spring',
  image_url: 'https://example.com/tokyo.jpg',
};

const mockCity2: AlgoliaCity = {
  ...mockCity,
  objectID: 'paris-france',
  city: 'Paris',
  country: 'France',
  continent: 'Europe',
};

const mockWishlistItems: WishlistItem[] = [
  { city: mockCity, notes: 'Must visit!', addedAt: Date.now() },
  { city: mockCity2, notes: null, addedAt: Date.now() - 1000 },
];

describe('WishlistDrawer', () => {
  it('should render wishlist items', () => {
    render(
      <WishlistDrawer
        items={mockWishlistItems}
        isOpen={true}
        onClose={vi.fn()}
        onRemove={vi.fn()}
        onMoveToTrip={vi.fn()}
      />
    );

    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('should display item count', () => {
    render(
      <WishlistDrawer
        items={mockWishlistItems}
        isOpen={true}
        onClose={vi.fn()}
        onRemove={vi.fn()}
        onMoveToTrip={vi.fn()}
      />
    );

    expect(screen.getByText(/2 destinations/i)).toBeInTheDocument();
  });

  it('should display notes when available', () => {
    render(
      <WishlistDrawer
        items={mockWishlistItems}
        isOpen={true}
        onClose={vi.fn()}
        onRemove={vi.fn()}
        onMoveToTrip={vi.fn()}
      />
    );

    expect(screen.getByText('Must visit!')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <WishlistDrawer
        items={mockWishlistItems}
        isOpen={true}
        onClose={onClose}
        onRemove={vi.fn()}
        onMoveToTrip={vi.fn()}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onRemove with city id when remove clicked', () => {
    const onRemove = vi.fn();
    render(
      <WishlistDrawer
        items={mockWishlistItems}
        isOpen={true}
        onClose={vi.fn()}
        onRemove={onRemove}
        onMoveToTrip={vi.fn()}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    expect(onRemove).toHaveBeenCalledWith('tokyo-japan');
  });

  it('should call onMoveToTrip with city when clicked', () => {
    const onMoveToTrip = vi.fn();
    render(
      <WishlistDrawer
        items={mockWishlistItems}
        isOpen={true}
        onClose={vi.fn()}
        onRemove={vi.fn()}
        onMoveToTrip={onMoveToTrip}
      />
    );

    const moveButtons = screen.getAllByRole('button', { name: /add to trip/i });
    fireEvent.click(moveButtons[0]);

    expect(onMoveToTrip).toHaveBeenCalledWith(mockCity);
  });

  it('should show empty state when no items', () => {
    render(
      <WishlistDrawer
        items={[]}
        isOpen={true}
        onClose={vi.fn()}
        onRemove={vi.fn()}
        onMoveToTrip={vi.fn()}
      />
    );

    expect(screen.getByText(/no destinations/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <WishlistDrawer
        items={mockWishlistItems}
        isOpen={false}
        onClose={vi.fn()}
        onRemove={vi.fn()}
        onMoveToTrip={vi.fn()}
      />
    );

    expect(screen.queryByText('Tokyo')).not.toBeInTheDocument();
  });

  it('should have proper test id', () => {
    render(
      <WishlistDrawer
        items={mockWishlistItems}
        isOpen={true}
        onClose={vi.fn()}
        onRemove={vi.fn()}
        onMoveToTrip={vi.fn()}
      />
    );

    expect(screen.getByTestId('wishlist-drawer')).toBeInTheDocument();
  });
});
