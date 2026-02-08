import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstantSearchProvider } from '../providers/InstantSearchProvider';
import { TravelChat } from '../components/TravelChat';
import { CityCard } from '../components/CityCard';
import { VibeTag } from '../components/VibeTag';
import { ScoreBadge } from '../components/ScoreBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorMessage } from '../components/ErrorMessage';
import { TripProvider } from '../context/TripContext';
import { mockCities } from '@vibe-travel/shared';
import type { ReactNode } from 'react';

vi.mock('react-instantsearch', () => ({
  InstantSearch: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="instantsearch">{children}</div>
  ),
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

describe('Frontend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'test-app';
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY = 'test-key';
    process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID = 'test-agent';
  });

  describe('Component Composition', () => {
    it('should render complete search interface', async () => {
      renderWithProvider(
        <InstantSearchProvider>
          <TravelChat />
        </InstantSearchProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('travel-chat')).toBeInTheDocument();
      });
    });

    it('should display city cards from search results', async () => {
      const mockHits = mockCities.slice(0, 3);
      
      renderWithProvider(
        <InstantSearchProvider>
          <div data-testid="results">
            {mockHits.map(city => (
              <CityCard 
                key={city.objectID} 
                city={city} 
                onClick={vi.fn()} 
              />
            ))}
          </div>
        </InstantSearchProvider>
      );

      await waitFor(() => {
        mockHits.forEach(city => {
          expect(screen.getByText(city.city)).toBeInTheDocument();
        });
      });
    });

    it('should track click events on city cards', async () => {
      const trackClick = vi.fn();
      const city = mockCities[0];

      renderWithProvider(
        <InstantSearchProvider>
          <CityCard 
            city={city} 
            onClick={trackClick}
          />
        </InstantSearchProvider>
      );

      fireEvent.click(screen.getByRole('article'));

      expect(trackClick).toHaveBeenCalledWith(city);
    });
  });

  describe('Component Rendering', () => {
    it('should render CityCard with all required elements', () => {
      const city = mockCities[0];
      renderWithProvider(<CityCard city={city} onClick={vi.fn()} />);

      expect(screen.getByText(city.city)).toBeInTheDocument();
      expect(screen.getByText(city.country)).toBeInTheDocument();
      expect(screen.getByTestId('vibe-tags')).toBeInTheDocument();
      expect(screen.getByTestId('score-badges')).toBeInTheDocument();
    });

    it('should render VibeTag with correct styling', () => {
      render(<VibeTag variant="primary">romantic</VibeTag>);
      
      const tag = screen.getByText('romantic');
      expect(tag).toHaveClass('bg-purple-100');
    });

    it('should render ScoreBadge with correct icon', () => {
      render(<ScoreBadge type="culture" score={8} />);
      
      expect(screen.getByText('🎭')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should render LoadingSkeleton', () => {
      render(<LoadingSkeleton variant="card" count={2} />);
      
      const skeleton = screen.getByTestId('loading-skeleton');
      expect(skeleton.children.length).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should render ErrorMessage with retry button', () => {
      const onRetry = vi.fn();
      render(<ErrorMessage message="Something went wrong" onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });

    it('should catch errors with ErrorBoundary', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={<div>Error caught</div>}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error caught')).toBeInTheDocument();
    });
  });

  describe('Data Flow', () => {
    it('should display multiple city cards with different data', () => {
      const cities = mockCities.slice(0, 3);

      renderWithProvider(
        <div>
          {cities.map(city => (
            <CityCard key={city.objectID} city={city} onClick={vi.fn()} />
          ))}
        </div>
      );

      cities.forEach(city => {
        expect(screen.getByText(city.city)).toBeInTheDocument();
        expect(screen.getByText(city.country)).toBeInTheDocument();
      });
    });

    it('should render all score types correctly', () => {
      const scoreTypes: Array<'culture' | 'adventure' | 'nature' | 'beach' | 'nightlife'> = [
        'culture', 'adventure', 'nature', 'beach', 'nightlife'
      ];

      render(
        <div>
          {scoreTypes.map(type => (
            <ScoreBadge key={type} type={type} score={7} />
          ))}
        </div>
      );

      expect(screen.getByText('🎭')).toBeInTheDocument();
      expect(screen.getByText('🧗')).toBeInTheDocument();
      expect(screen.getByText('🌲')).toBeInTheDocument();
      expect(screen.getByText('🏖️')).toBeInTheDocument();
      expect(screen.getByText('🌙')).toBeInTheDocument();
    });

    it('should render all vibe tag variants', () => {
      const variants: Array<'default' | 'primary' | 'secondary' | 'accent'> = [
        'default', 'primary', 'secondary', 'accent'
      ];

      render(
        <div>
          {variants.map(variant => (
            <VibeTag key={variant} variant={variant}>{variant}</VibeTag>
          ))}
        </div>
      );

      variants.forEach(variant => {
        expect(screen.getByText(variant)).toBeInTheDocument();
      });
    });
  });

  describe('Chat Integration', () => {
    it('should render TravelChat with header and suggestions', () => {
      renderWithProvider(<TravelChat />);

      expect(screen.getByText('Vibe-Check Travel Assistant')).toBeInTheDocument();
      expect(screen.getByText('Try asking:')).toBeInTheDocument();
    });

    it('should render suggested query chips', () => {
      renderWithProvider(<TravelChat />);

      expect(screen.getByText(/Romantic European city/)).toBeInTheDocument();
      expect(screen.getByText(/Beach vibes with nightlife/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible city card', () => {
      const city = mockCities[0];
      renderWithProvider(<CityCard city={city} onClick={vi.fn()} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should have accessible score badges', () => {
      render(<ScoreBadge type="culture" score={8} />);

      const icon = screen.getByRole('img', { name: 'culture' });
      expect(icon).toBeInTheDocument();
    });
  });
});
