'use client';

import { useCallback, useState, useEffect, Suspense, lazy, Component, ReactNode } from 'react';
import { getAgentId, fetchCityById, fetchCitiesByIds } from '@/lib/algolia';
import { CityCard } from '@/components/CityCard';
import { ActivePreferences } from '@/components/ActivePreferences';
import { ComparisonTable } from '@/components/ComparisonTable';
import { ItineraryView } from '@/components/ItineraryView';
import { useTripContext } from '@/context/TripContext';
import type { AlgoliaCity } from '@vibe-travel/shared';
import styles from './TravelChat.module.css';

const AlgoliaChat = lazy(() => 
  import('react-instantsearch').then(mod => ({ default: mod.Chat }))
);

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ChatErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface TravelChatProps {
  onCityClick?: (city: AlgoliaCity) => void;
}

const SUGGESTED_QUERIES = [
  'Romantic European city',
  'Beach vibes with nightlife',
  'Ancient culture and temples',
];

const UserAvatar = () => (
  <div className={styles.userAvatar}>
    <span>You</span>
  </div>
);

const AssistantAvatar = () => (
  <div className={styles.assistantAvatar}>
    <span>✨</span>
  </div>
);

const HeaderIcon = () => (
  <span className={styles.headerIcon}>✨</span>
);


export function TravelChat({ onCityClick }: TravelChatProps) {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [hasValidAgentId, setHasValidAgentId] = useState(false);
  const { state, dispatch } = useTripContext();

  useEffect(() => {
    try {
      const id = getAgentId();
      const isValid = id && !id.includes('your_') && id.length > 10;
      setAgentId(id);
      setHasValidAgentId(!!isValid);
    } catch {
      setHasValidAgentId(false);
    }
  }, []);

  const handleCityClick = useCallback((city: AlgoliaCity) => {
    if (onCityClick) {
      onCityClick(city);
    }
  }, [onCityClick]);

  const handleSuggestionClick = useCallback((query: string) => {
    const textarea = document.querySelector('.ais-ChatPrompt-textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, query);
      }
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      setTimeout(() => {
        const submitButton = document.querySelector('.ais-ChatPrompt-submit') as HTMLButtonElement;
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
        }
      }, 100);
    }
  }, []);

  const fetchCities = useCallback(async (ids: string[]): Promise<AlgoliaCity[]> => {
    return fetchCitiesByIds(ids);
  }, []);

  const fetchCity = useCallback(async (id: string): Promise<AlgoliaCity | null> => {
    return fetchCityById(id);
  }, []);

  const CityCardItem = useCallback(({ item }: { item: Record<string, unknown> }) => (
    <CityCard city={item as unknown as AlgoliaCity} onClick={handleCityClick} />
  ), [handleCityClick]);

  const tools = {
    save_preference: {
      onToolCall: ({ addToolResult, ...rest }: any) => {
        const input = rest.input as { category: string; value: string; priority: string | null } | undefined;
        if (input) {
          dispatch({
            type: 'ADD_PREFERENCE',
            payload: {
              category: input.category as any,
              value: input.value,
              priority: (input.priority || 'nice_to_have') as any,
            },
          });
          addToolResult({
            output: {
              success: true,
              message: `Saved preference: ${input.category} = "${input.value}"`,
            },
          });
        } else {
          addToolResult({ output: { success: false, message: 'No input provided' } });
        }
      },
      layoutComponent: ({ message }: any) => (
        <div className={styles.toolConfirmation} data-testid="tool-save-preference">
          ✓ Preference saved: {message.input?.value}
        </div>
      ),
    },
    compare_cities: {
      onToolCall: async ({ addToolResult, ...rest }: any) => {
        const input = rest.input as { cities: string[]; focus_attributes: string[] | null } | undefined;
        if (input?.cities) {
          try {
            const cities = await fetchCities(input.cities);
            if (cities.length >= 2) {
              dispatch({
                type: 'SET_COMPARISON',
                payload: {
                  cities,
                  focusAttributes: input.focus_attributes || [],
                  isActive: true,
                },
              });
              addToolResult({
                output: {
                  comparisonData: cities,
                  comparison: {
                    attributes: input.focus_attributes || [],
                    recommendation: cities.length === 2 ? `Compare ${cities[0].city} and ${cities[1].city}` : null,
                    cityNames: cities.map(c => c.city),
                  },
                },
              });
            } else {
              addToolResult({ output: { comparisonData: [], comparison: { recommendation: 'Not enough cities found' } } });
            }
          } catch {
            addToolResult({ output: { comparisonData: [], comparison: { recommendation: 'Error fetching cities' } } });
          }
        } else {
          addToolResult({ output: { comparisonData: [], comparison: { recommendation: 'No cities specified' } } });
        }
      },
      layoutComponent: ({ message }: any) => {
        if (!message.output?.comparisonData?.length) {
          return <div className={styles.toolLoading}>Loading comparison...</div>;
        }
        return (
          <ComparisonTable
            cities={message.output.comparisonData}
            recommendation={message.output.comparison?.recommendation}
            onSelect={(city: AlgoliaCity) => {
              dispatch({
                type: 'ADD_TO_TRIP',
                payload: { city, durationDays: null, notes: null },
              });
            }}
            onClose={() => dispatch({ type: 'CLEAR_COMPARISON' })}
          />
        );
      },
    },
    add_to_trip_plan: {
      onToolCall: async ({ addToolResult, ...rest }: any) => {
        const input = rest.input as { city_id: string; duration_days: number | null; notes: string | null } | undefined;
        if (input?.city_id) {
          const city = await fetchCity(input.city_id);
          if (city) {
            dispatch({
              type: 'ADD_TO_TRIP',
              payload: { city, durationDays: input.duration_days, notes: input.notes },
            });
            addToolResult({
              output: {
                success: true,
                message: `Added ${city.city} to your trip plan`,
              },
            });
          } else {
            addToolResult({ output: { success: false, message: 'City not found' } });
          }
        } else {
          addToolResult({ output: { success: false, message: 'No city specified' } });
        }
      },
      layoutComponent: ({ message }: any) => (
        <div className={styles.toolConfirmation} data-testid="tool-add-trip">
          ✓ {message.output?.message || 'Added to trip plan'}
        </div>
      ),
    },
    generate_itinerary: {
      onToolCall: async ({ addToolResult, ...rest }: any) => {
        const input = rest.input as { city_id: string; duration_days: number; interests: string[] | null; travel_style: string | null } | undefined;
        if (input?.city_id) {
          const city = await fetchCity(input.city_id);
          if (city) {
            const days = Array.from({ length: input.duration_days }, (_, i) => ({
              day: i + 1,
              theme: `Day ${i + 1} in ${city.city}`,
              activities: [
                { time: 'Morning', activity: 'Explore', description: `Morning in ${city.city}`, vibeMatch: city.vibe_tags.slice(0, 2) },
                { time: 'Afternoon', activity: 'Discover', description: `Afternoon adventure`, vibeMatch: city.vibe_tags.slice(0, 2) },
                { time: 'Evening', activity: 'Experience', description: `Evening experience`, vibeMatch: city.vibe_tags.slice(0, 2) },
              ],
            }));
            addToolResult({
              output: { cityId: city.objectID, cityName: city.city, days },
            });
          } else {
            addToolResult({ output: { cityId: input.city_id, cityName: 'Unknown', days: [] } });
          }
        } else {
          addToolResult({ output: { cityId: '', cityName: 'Unknown', days: [] } });
        }
      },
      layoutComponent: ({ message }: any) => {
        if (!message.output?.days?.length) {
          return <div className={styles.toolLoading}>Generating itinerary...</div>;
        }
        return (
          <ItineraryView
            cityName={message.output.cityName || 'Destination'}
            days={message.output.days}
            onAddToTrip={() => {
              if (message.output?.cityId) {
                fetchCity(message.output.cityId).then((city: AlgoliaCity | null) => {
                  if (city) {
                    dispatch({
                      type: 'ADD_TO_TRIP',
                      payload: {
                        city,
                        durationDays: message.output?.days?.length || null,
                        notes: 'Itinerary generated',
                      },
                    });
                  }
                });
              }
            }}
          />
        );
      },
    },
    clear_preferences: {
      onToolCall: ({ addToolResult, ...rest }: any) => {
        const input = rest.input as { category: string | null } | undefined;
        const isAll = !input?.category || input.category === 'all';
        const clearedCount = isAll
          ? state.preferences.length
          : state.preferences.filter((p) => p.category === input?.category).length;
        
        dispatch({
          type: 'CLEAR_PREFERENCES',
          payload: { category: isAll ? 'all' : (input?.category || 'all') },
        });
        
        addToolResult({
          output: {
            success: true,
            message: isAll ? `Cleared all ${clearedCount} preferences` : `Cleared ${clearedCount} preferences`,
            clearedCount,
          },
        });
      },
      layoutComponent: ({ message }: any) => (
        <div className={styles.toolConfirmation} data-testid="tool-clear">
          ✓ {message.output?.message || 'Preferences cleared'}
        </div>
      ),
    },
  } as any;

  const PlaceholderContent = (
    <div className={styles.placeholder}>
      <div className={styles.placeholderIcon}>💬</div>
      <p className={styles.placeholderText}>
        Chat widget will connect to Agent Studio
      </p>
      <p className={styles.placeholderSubtext}>
        Configure NEXT_PUBLIC_ALGOLIA_AGENT_ID to enable
      </p>
    </div>
  );

  const LoadingContent = (
    <div className={styles.placeholder}>
      <div className={styles.placeholderIcon}>⏳</div>
      <p className={styles.placeholderText}>Loading chat...</p>
    </div>
  );

  const chatClassNames = {
    root: styles.algoliaChat,
    container: styles.algoliaChatContainer,
    header: {
      root: styles.algoliaChatHeaderRoot,
      title: styles.algoliaChatHeaderTitle,
      titleIcon: styles.algoliaChatHeaderIcon,
    },
    messages: {
      root: styles.algoliaChatMessages,
      content: styles.algoliaChatMessagesContent,
      scroll: styles.algoliaChatMessagesScroll,
      scrollToBottom: styles.algoliaChatScrollToBottom,
    },
    prompt: {
      root: styles.algoliaChatPrompt,
      textarea: styles.algoliaChatTextarea,
      submit: styles.algoliaChatSubmit,
      footer: styles.algoliaChatPromptFooter,
    },
  };

  const renderChatContent = () => {
    if (!hasValidAgentId || !agentId) {
      return PlaceholderContent;
    }

    return (
      <ChatErrorBoundary fallback={PlaceholderContent}>
        <Suspense fallback={LoadingContent}>
          <AlgoliaChat
            agentId={agentId}
            itemComponent={CityCardItem}
            classNames={chatClassNames}
            tools={tools}
            userMessageLeadingComponent={UserAvatar}
            assistantMessageLeadingComponent={AssistantAvatar}
            headerTitleIconComponent={HeaderIcon}
            translations={{
              header: {
                title: 'Vibe Assistant',
              },
              prompt: {
                textareaPlaceholder: 'Describe your ideal travel vibe...',
                disclaimer: 'Your preferences are remembered during this session.',
              },
            }}
          />
        </Suspense>
      </ChatErrorBoundary>
    );
  };

  const handleClearConversation = useCallback(async () => {
    dispatch({ type: 'RESET_ALL' });
    
    // Clear Algolia Chat storage (conversation history)
    try {
      // Clear localStorage
      const localKeysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('algolia') || key.includes('ais-') || key.includes('chat') || key.includes('agent'))) {
          localKeysToRemove.push(key);
        }
      }
      localKeysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('algolia') || key.includes('ais-') || key.includes('chat') || key.includes('agent'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      // Clear IndexedDB databases used by Algolia
      if (window.indexedDB && window.indexedDB.databases) {
        const databases = await window.indexedDB.databases();
        for (const db of databases) {
          if (db.name && (db.name.includes('algolia') || db.name.includes('chat'))) {
            window.indexedDB.deleteDatabase(db.name);
          }
        }
      }
    } catch (e) {
      // Storage access might fail in some contexts
    }
    
    window.location.reload();
  }, [dispatch]);

  return (
    <div className={styles.chatContainer} data-testid="travel-chat">
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderTop}>
          <h2 className={styles.chatTitle}>Vibe-Check Travel Assistant</h2>
          <button
            onClick={handleClearConversation}
            className={styles.clearButton}
            aria-label="Clear conversation"
            title="Start a new conversation"
            type="button"
          >
            Clear
          </button>
        </div>
        <p className={styles.chatSubtitle}>
          Describe your ideal destination vibe and I&apos;ll find the perfect match
        </p>
      </div>

      <ActivePreferences />
      
      <div 
        className={styles.chatWidget} 
        data-testid="chat-widget"
        data-agent-id={agentId || undefined}
      >
        {renderChatContent()}
      </div>

      <div className={styles.suggestedQueries}>
        <p className={styles.suggestedTitle}>Try asking:</p>
        <div className={styles.queryChips}>
          {SUGGESTED_QUERIES.map((query) => (
            <button 
              key={query} 
              className={styles.queryChip}
              onClick={() => handleSuggestionClick(query)}
              type="button"
            >
              &ldquo;{query}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
