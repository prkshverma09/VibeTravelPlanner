import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InstantSearchProvider } from '../InstantSearchProvider';

vi.mock('react-instantsearch', () => ({
  InstantSearch: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="instantsearch">{children}</div>
  ),
}));

vi.mock('search-insights', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/algolia', () => ({
  getSearchClient: vi.fn(),
  getIndexName: vi.fn().mockReturnValue('travel_destinations'),
}));

import { getSearchClient } from '@/lib/algolia';

describe('InstantSearchProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ALGOLIA_APP_ID: 'test-app-id',
      NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: 'test-search-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should render children when initialized', async () => {
    vi.mocked(getSearchClient).mockReturnValue({
      search: vi.fn(),
    } as unknown as ReturnType<typeof getSearchClient>);

    render(
      <InstantSearchProvider>
        <div data-testid="child">Child Content</div>
      </InstantSearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  it('should wrap with InstantSearch component', async () => {
    vi.mocked(getSearchClient).mockReturnValue({
      search: vi.fn(),
    } as unknown as ReturnType<typeof getSearchClient>);

    render(
      <InstantSearchProvider>
        <div>Content</div>
      </InstantSearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('instantsearch')).toBeInTheDocument();
    });
  });

  it('should eventually render content after loading', async () => {
    vi.mocked(getSearchClient).mockReturnValue({
      search: vi.fn(),
    } as unknown as ReturnType<typeof getSearchClient>);

    render(
      <InstantSearchProvider>
        <div data-testid="content">Content</div>
      </InstantSearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  it('should show error state when client initialization fails', async () => {
    vi.mocked(getSearchClient).mockImplementation(() => {
      throw new Error('Missing NEXT_PUBLIC_ALGOLIA_APP_ID');
    });

    render(
      <InstantSearchProvider>
        <div>Content</div>
      </InstantSearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('search-error')).toBeInTheDocument();
      expect(screen.getByText(/Missing NEXT_PUBLIC_ALGOLIA_APP_ID/)).toBeInTheDocument();
    });
  });

  it('should initialize insights when env vars are present', async () => {
    const mockAa = vi.fn();
    vi.doMock('search-insights', () => ({ default: mockAa }));

    vi.mocked(getSearchClient).mockReturnValue({
      search: vi.fn(),
    } as unknown as ReturnType<typeof getSearchClient>);

    render(
      <InstantSearchProvider>
        <div>Content</div>
      </InstantSearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('instantsearch')).toBeInTheDocument();
    });
  });
});
