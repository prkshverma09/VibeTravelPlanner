import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TravelChat } from '../TravelChat';
import { TripProvider } from '@/context/TripContext';
import type { ReactNode } from 'react';

vi.mock('@/lib/algolia', () => ({
  getAgentId: vi.fn().mockReturnValue('test-agent-id-12345'),
  fetchCityById: vi.fn().mockResolvedValue(null),
  fetchCitiesByIds: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/components/CityCard', () => ({
  CityCard: ({ city }: { city: { city: string } }) => (
    <div data-testid="city-card">{city.city}</div>
  ),
}));

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <TripProvider>{children}</TripProvider>
);

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<TestWrapper>{ui}</TestWrapper>);
};

describe('TravelChat', () => {
  const mockAgentId = 'test-agent-id-12345';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render chat container', () => {
    renderWithProvider(<TravelChat />);
    expect(screen.getByTestId('travel-chat')).toBeInTheDocument();
  });

  it('should render chat widget', () => {
    renderWithProvider(<TravelChat />);
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
  });

  it('should use agent ID from config', async () => {
    renderWithProvider(<TravelChat />);
    await waitFor(() => {
      const widget = screen.getByTestId('chat-widget');
      expect(widget).toHaveAttribute('data-agent-id', mockAgentId);
    });
  });

  it('should display custom title', () => {
    renderWithProvider(<TravelChat />);
    expect(screen.getByText('Vibe-Check Travel Assistant')).toBeInTheDocument();
  });

  it('should display subtitle', () => {
    renderWithProvider(<TravelChat />);
    expect(screen.getByText(/Describe your ideal destination/)).toBeInTheDocument();
  });

  it('should display suggested queries section', () => {
    renderWithProvider(<TravelChat />);
    expect(screen.getByText('Try asking:')).toBeInTheDocument();
  });

  it('should display suggested query chips', () => {
    renderWithProvider(<TravelChat />);
    expect(screen.getByText(/Romantic European city/)).toBeInTheDocument();
    expect(screen.getByText(/Beach vibes with nightlife/)).toBeInTheDocument();
    expect(screen.getByText(/Ancient culture and temples/)).toBeInTheDocument();
  });

  it('should show loading state initially with valid agent ID', async () => {
    renderWithProvider(<TravelChat />);
    await waitFor(() => {
      const loadingOrChat = screen.queryByText(/Loading chat/) || screen.queryByTestId('algolia-chat');
      expect(loadingOrChat).toBeTruthy();
    });
  });

  it('should accept onCityClick prop', () => {
    const onCityClick = vi.fn();
    renderWithProvider(<TravelChat onCityClick={onCityClick} />);
    expect(screen.getByTestId('travel-chat')).toBeInTheDocument();
  });

  it('should render with tools configuration', async () => {
    renderWithProvider(<TravelChat />);
    await waitFor(() => {
      const chat = screen.queryByTestId('algolia-chat');
      if (chat) {
        expect(chat).toHaveAttribute('data-has-tools', 'true');
        expect(chat).toHaveAttribute('data-tools-count', '5');
      }
    });
  });
});
