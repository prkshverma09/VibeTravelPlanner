import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '../app/page';
import { TripProvider } from '../context/TripContext';
import type { ReactNode } from 'react';

vi.mock('react-instantsearch', () => ({
  InstantSearch: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="instantsearch">{children}</div>
  ),
  Chat: () => null,
  SearchIndexToolType: 'algolia_search_index',
}));

vi.mock('search-insights', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/algolia', () => ({
  getSearchClient: vi.fn().mockReturnValue({ search: vi.fn() }),
  getIndexName: vi.fn().mockReturnValue('travel_destinations'),
  getAgentId: vi.fn().mockReturnValue('test-agent-id'),
  fetchCityById: vi.fn().mockResolvedValue(null),
  fetchCitiesByIds: vi.fn().mockResolvedValue([]),
}));

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <TripProvider>{children}</TripProvider>
);

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<TestWrapper>{ui}</TestWrapper>);
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'test-app';
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY = 'test-key';
    process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID = 'test-agent';
  });

  it('should render home page with title', async () => {
    renderWithProvider(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Vibe-Check Travel Planner');
    });
  });

  it('should render description text', async () => {
    renderWithProvider(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Discover destinations that match your vibe/)).toBeInTheDocument();
    });
  });

  it('should render chat placeholder', async () => {
    renderWithProvider(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('travel-chat-placeholder')).toBeInTheDocument();
    });
  });

  it('should have main element', async () => {
    renderWithProvider(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  it('should render Featured Destinations section', async () => {
    renderWithProvider(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Featured Destinations')).toBeInTheDocument();
    });
  });

  it('should render city cards', async () => {
    renderWithProvider(<HomePage />);
    
    await waitFor(() => {
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should render city locations', async () => {
    renderWithProvider(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });
  });
});
