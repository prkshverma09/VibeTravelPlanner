import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { TripProvider, useTripContext } from '@/context/TripContext';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { AlgoliaCity } from '@vibe-travel/shared';

vi.mock('@/lib/algolia', () => ({
  getAgentId: vi.fn().mockReturnValue('test-agent-id-12345'),
  fetchCityById: vi.fn().mockResolvedValue(null),
  fetchCitiesByIds: vi.fn().mockResolvedValue([]),
  searchWithEnhancement: vi.fn().mockResolvedValue({ hits: [] }),
}));

vi.mock('@/components/CityCard', () => ({
  CityCard: ({ city }: { city: { city: string } }) => (
    <div data-testid="city-card">{city.city}</div>
  ),
}));

vi.mock('react-instantsearch', () => ({
  Chat: (props: any) => <div data-testid="algolia-chat-mock" {...props} />,
  SearchIndexToolType: 'algolia_search_index',
}));

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <TripProvider>{children}</TripProvider>
);

const makeMockCity = (name: string, id?: string): AlgoliaCity =>
  ({
    objectID: id || name.toLowerCase().replace(/\s/g, '-'),
    city: name,
    country: 'Test',
    continent: 'Europe',
    latitude: 0,
    longitude: 0,
    vibe_tags: ['romantic'],
    cost_level: 'moderate',
    best_season: ['spring'],
    cuisine_tags: ['local'],
    language: 'English',
    description: `${name} description`,
    image_url: '',
  } as unknown as AlgoliaCity);

describe('TravelChat buffer mechanism - no dispatch during streaming', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should NOT have a flushCallback variable (regression: dispatch during streaming causes duplicate messages)', async () => {
    const moduleSource = await import('../TravelChat');
    const sourceCode = Object.keys(moduleSource);
    expect(sourceCode).not.toContain('flushCallback');
  });

  it('should use MemoizedAlgoliaChat instead of AlgoliaChat directly', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../TravelChat.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('MemoizedAlgoliaChat');
    expect(content).toContain('memo(function MemoizedAlgoliaChat');
    expect(content).toContain('<MemoizedAlgoliaChat');
    const directUsages = content.match(/<AlgoliaChat\s/g) || [];
    const wrapperUsages = content.match(/<AlgoliaChat \{\.\.\.props\}/g) || [];
    expect(directUsages.length).toBe(wrapperUsages.length);
  });

  it('should memoize tools, classNames, and translations props', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../TravelChat.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('const tools = useMemo(');
    expect(content).toContain('const chatClassNames = useMemo(');
    expect(content).toContain('const memoizedTranslations = useMemo(');
  });

  it('should use refs for volatile state to avoid breaking memoization', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../TravelChat.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('stateRef.current');
    expect(content).toContain('onCityClickRef.current');
    expect(content).toContain('onMapCitySelectRef.current');
  });

  it('should NOT have CSS hacks that hide duplicate messages (hiding carousel chrome is OK)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const cssPath = path.resolve(__dirname, '../TravelChat.module.css');
    const content = fs.readFileSync(cssPath, 'utf8');

    expect(content).not.toContain('ais-ChatMessage-tool');
    expect(content).not.toContain('ais-ChatMessage:has(~');
  });

  it('should store buffered cities in module-level variable instead of dispatching', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../TravelChat.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('latestBufferedCities = unique');
    expect(content).toContain('citiesVersion++');

    expect(content).not.toContain('flushCallback?.(unique)');
    expect(content).not.toContain('flushCallback?.(');
  });

  it('should use a polling interval to dispatch buffered cities (not during streaming)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../TravelChat.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('setInterval');
    expect(content).toContain('citiesVersion > lastVersion');
    expect(content).toContain("dispatch({ type: 'SET_CHAT_RESULTS'");
  });

  it('should have a MutationObserver to remove duplicate assistant messages from the DOM', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../TravelChat.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('MutationObserver');
    expect(content).toContain('deduplicateMessages');
    expect(content).toContain("article[data-role]");
    expect(content).toContain('.remove()');
    expect(content).toContain('observer.observe');
    expect(content).toContain('observer.disconnect');
  });

  it('should override SearchIndexToolType with custom layoutComponent for deduplicated city cards', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../TravelChat.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain("import { SearchIndexToolType } from 'react-instantsearch'");
    expect(content).toContain('[SearchIndexToolType]:');
    expect(content).toContain('layoutComponent');
    expect(content).toContain('styles.chatCarouselGrid');
    expect(content).toContain('message?.output?.hits');
    expect(content).toContain('bufferCity(city)');
    expect(content).toContain('slice(0, 2)');
    expect(content).toContain('hasRenderedSearchResultsForCurrentTurn');
  });
});

describe('TripContext SET_CHAT_RESULTS deduplication', () => {
  function ChatResultsObserver({ onResults }: { onResults: (cities: AlgoliaCity[]) => void }) {
    const { state } = useTripContext();
    useEffect(() => {
      onResults(state.chatResults);
    }, [state.chatResults, onResults]);
    return null;
  }

  function DispatchButton({ cities, actionType }: { cities: AlgoliaCity[]; actionType: string }) {
    const { dispatch } = useTripContext();
    return (
      <button
        data-testid="dispatch-btn"
        onClick={() => dispatch({ type: actionType as any, payload: cities })}
      >
        Dispatch
      </button>
    );
  }

  it('should replace chatResults entirely on SET_CHAT_RESULTS', () => {
    const city1 = makeMockCity('Paris');
    const city2 = makeMockCity('Rome');
    const resultsLog: AlgoliaCity[][] = [];

    render(
      <TripProvider>
        <ChatResultsObserver onResults={(r) => resultsLog.push([...r])} />
        <DispatchButton cities={[city1]} actionType="SET_CHAT_RESULTS" />
      </TripProvider>
    );

    const btn = screen.getByTestId('dispatch-btn');

    act(() => btn.click());
    expect(resultsLog[resultsLog.length - 1]).toHaveLength(1);
    expect(resultsLog[resultsLog.length - 1][0].city).toBe('Paris');
  });

  it('should handle empty payload to clear results', () => {
    const resultsLog: AlgoliaCity[][] = [];

    function MultiDispatcher() {
      const { dispatch, state } = useTripContext();
      useEffect(() => {
        resultsLog.push([...state.chatResults]);
      }, [state.chatResults]);

      return (
        <>
          <button
            data-testid="set-cities"
            onClick={() =>
              dispatch({
                type: 'SET_CHAT_RESULTS',
                payload: [makeMockCity('Paris'), makeMockCity('Rome')],
              })
            }
          >
            Set
          </button>
          <button
            data-testid="clear-cities"
            onClick={() => dispatch({ type: 'SET_CHAT_RESULTS', payload: [] })}
          >
            Clear
          </button>
        </>
      );
    }

    render(
      <TripProvider>
        <MultiDispatcher />
      </TripProvider>
    );

    act(() => screen.getByTestId('set-cities').click());
    expect(resultsLog[resultsLog.length - 1]).toHaveLength(2);

    act(() => screen.getByTestId('clear-cities').click());
    expect(resultsLog[resultsLog.length - 1]).toHaveLength(0);
  });

  it('should cap ADD_CHAT_RESULT to MAX of 3 results', () => {
    const resultsLog: AlgoliaCity[][] = [];

    function MultiAdder() {
      const { dispatch, state } = useTripContext();
      useEffect(() => {
        resultsLog.push([...state.chatResults]);
      }, [state.chatResults]);

      return (
        <button
          data-testid="add-all"
          onClick={() => {
            dispatch({ type: 'ADD_CHAT_RESULT', payload: makeMockCity('Paris') });
            dispatch({ type: 'ADD_CHAT_RESULT', payload: makeMockCity('Rome') });
            dispatch({ type: 'ADD_CHAT_RESULT', payload: makeMockCity('Berlin') });
            dispatch({ type: 'ADD_CHAT_RESULT', payload: makeMockCity('Madrid') });
          }}
        >
          Add All
        </button>
      );
    }

    render(
      <TripProvider>
        <MultiAdder />
      </TripProvider>
    );

    act(() => screen.getByTestId('add-all').click());
    expect(resultsLog[resultsLog.length - 1].length).toBeLessThanOrEqual(3);
  });

  it('should deduplicate ADD_CHAT_RESULT by city name (case-insensitive)', () => {
    const resultsLog: AlgoliaCity[][] = [];

    function DuplicateAdder() {
      const { dispatch, state } = useTripContext();
      useEffect(() => {
        resultsLog.push([...state.chatResults]);
      }, [state.chatResults]);

      return (
        <button
          data-testid="add-dupes"
          onClick={() => {
            dispatch({ type: 'ADD_CHAT_RESULT', payload: makeMockCity('Paris', 'paris-1') });
            dispatch({ type: 'ADD_CHAT_RESULT', payload: makeMockCity('paris', 'paris-2') });
            dispatch({ type: 'ADD_CHAT_RESULT', payload: makeMockCity('PARIS', 'paris-3') });
          }}
        >
          Add Dupes
        </button>
      );
    }

    render(
      <TripProvider>
        <DuplicateAdder />
      </TripProvider>
    );

    act(() => screen.getByTestId('add-dupes').click());
    const finalResults = resultsLog[resultsLog.length - 1];
    const parisCount = finalResults.filter(
      (c) => c.city.toLowerCase() === 'paris'
    ).length;
    expect(parisCount).toBe(1);
  });
});
