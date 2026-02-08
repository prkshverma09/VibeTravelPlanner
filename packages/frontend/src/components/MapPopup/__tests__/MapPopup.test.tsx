import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MapPopup } from '../MapPopup';
import { mockCities } from '@vibe-travel/shared';

vi.mock('react-map-gl', () => ({
  Popup: ({
    children,
    onClose,
  }: {
    children: React.ReactNode;
    onClose?: () => void;
  }) => (
    <div data-testid="mapbox-popup">
      {children}
      <button type="button" onClick={onClose} aria-label="Close popup">
        Close
      </button>
    </div>
  ),
}));

const cityWithGeoloc = { ...mockCities[0], _geoloc: { lat: 35.6, lng: 139.7 } };

describe('MapPopup', () => {
  const onClose = vi.fn();
  const onViewDetails = vi.fn();
  const onAddToItinerary = vi.fn();
  const onAskInChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when city has no _geoloc', () => {
    const { container } = render(
      <MapPopup
        city={{ ...mockCities[0], _geoloc: undefined } as typeof mockCities[0]}
        onClose={onClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render city name and country', () => {
    render(
      <MapPopup
        city={cityWithGeoloc as typeof mockCities[0]}
        onClose={onClose}
      />
    );
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument();
  });

  it('should show View Details button', async () => {
    render(
      <MapPopup
        city={cityWithGeoloc as typeof mockCities[0]}
        onClose={onClose}
        onViewDetails={onViewDetails}
      />
    );
    const viewDetails = screen.getByTestId('popup-view-details');
    expect(viewDetails).toHaveTextContent('View Details');
    await userEvent.click(viewDetails);
    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });

  it('should show Ask in Chat button when onAskInChat is provided', () => {
    render(
      <MapPopup
        city={cityWithGeoloc as typeof mockCities[0]}
        onClose={onClose}
        onAskInChat={onAskInChat}
      />
    );
    const askInChat = screen.getByTestId('popup-ask-in-chat');
    expect(askInChat).toHaveTextContent('Ask in Chat');
  });

  it('should not show Ask in Chat button when onAskInChat is not provided', () => {
    render(
      <MapPopup
        city={cityWithGeoloc as typeof mockCities[0]}
        onClose={onClose}
      />
    );
    expect(screen.queryByTestId('popup-ask-in-chat')).not.toBeInTheDocument();
  });

  it('should call onAskInChat with query containing city and country when Ask in Chat is clicked', async () => {
    render(
      <MapPopup
        city={cityWithGeoloc as typeof mockCities[0]}
        onClose={onClose}
        onAskInChat={onAskInChat}
      />
    );
    const askInChat = screen.getByTestId('popup-ask-in-chat');
    await userEvent.click(askInChat);
    expect(onAskInChat).toHaveBeenCalledTimes(1);
    expect(onAskInChat).toHaveBeenCalledWith('Tell me more about Tokyo, Japan');
  });

  it('should show Add to itinerary when onAddToItinerary provided and not in itinerary', () => {
    render(
      <MapPopup
        city={cityWithGeoloc as typeof mockCities[0]}
        onClose={onClose}
        onAddToItinerary={onAddToItinerary}
        isInItinerary={false}
      />
    );
    const addBtn = screen.getByTestId('popup-add-itinerary');
    expect(addBtn).toHaveTextContent('Add');
  });

  it('should show Remove when isInItinerary is true', () => {
    render(
      <MapPopup
        city={cityWithGeoloc as typeof mockCities[0]}
        onClose={onClose}
        onAddToItinerary={onAddToItinerary}
        isInItinerary={true}
      />
    );
    const addBtn = screen.getByTestId('popup-add-itinerary');
    expect(addBtn).toHaveTextContent('Remove');
  });
});
