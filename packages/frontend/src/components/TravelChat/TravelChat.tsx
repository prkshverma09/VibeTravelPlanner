'use client';

import { useCallback, useState, useEffect, Suspense, lazy, Component, ReactNode, useMemo, useRef, memo } from 'react';
import { getAgentId, fetchCityById, fetchCitiesByIds, searchWithEnhancement } from '@/lib/algolia';
import { CityCard } from '@/components/CityCard';
import { ActivePreferences } from '@/components/ActivePreferences';
import { ComparisonTable } from '@/components/ComparisonTable';
import { ItineraryView } from '@/components/ItineraryView';
import { WeatherCard } from '@/components/WeatherCard';
import { BudgetEstimator } from '@/components/BudgetEstimator';
import { MiniMap } from '@/components/MiniMap';
import { useTripContext } from '@/context/TripContext';
import { weatherService } from '@/services/weather.service';
import { budgetService, TravelStyle } from '@/services/budget.service';
import { queryEnhancementService } from '@/services/query-enhancement.service';
import type { AlgoliaCity } from '@vibe-travel/shared';
import styles from './TravelChat.module.css';

const AlgoliaChat = lazy(() => 
  import('react-instantsearch').then(mod => ({ default: mod.Chat }))
);

const MemoizedAlgoliaChat = memo(function MemoizedAlgoliaChat(props: any) {
  return <AlgoliaChat {...props} />;
});

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
  onMapCitySelect?: (city: AlgoliaCity) => void;
  pendingChatQuery?: string | null;
  onClearPendingChatQuery?: () => void;
}

const SUGGESTED_QUERIES = [
  'Romantic European city',
  'Beach vibes with nightlife',
  'Ancient culture and temples',
];

const MAX_MAP_CITIES = 3;

let lastSubmitTimestamp = 0;

let seenBatchKeys = new Set<string>();
let currentBatchKeys = new Set<string>();
const pendingCitiesBuffer: AlgoliaCity[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let latestBufferedCities: AlgoliaCity[] = [];
let citiesVersion = 0;

function cityKey(city: AlgoliaCity): string {
  return (city.city || city.objectID).toLowerCase();
}

function bufferCity(city: AlgoliaCity) {
  const key = cityKey(city);
  if (seenBatchKeys.has(key)) return;

  const isDuplicate = pendingCitiesBuffer.some((c) => cityKey(c) === key);
  if (isDuplicate) return;

  pendingCitiesBuffer.push(city);
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    const unique = pendingCitiesBuffer.slice(0, MAX_MAP_CITIES);
    unique.forEach((c) => currentBatchKeys.add(cityKey(c)));
    latestBufferedCities = unique;
    citiesVersion++;
    flushTimer = null;
  }, 600);
}

function clearBuffer() {
  const merged = new Set<string>();
  seenBatchKeys.forEach((k) => merged.add(k));
  currentBatchKeys.forEach((k) => merged.add(k));
  seenBatchKeys = merged;
  currentBatchKeys = new Set();
  pendingCitiesBuffer.length = 0;
  latestBufferedCities = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

function fullClearBuffer() {
  seenBatchKeys = new Set();
  currentBatchKeys = new Set();
  pendingCitiesBuffer.length = 0;
  latestBufferedCities = [];
  citiesVersion = 0;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

function ChatCityCardInner({
  city,
  onCityClick,
}: {
  city: AlgoliaCity;
  onCityClick?: (city: AlgoliaCity) => void;
}) {
  const { state, dispatch } = useTripContext();

  useEffect(() => {
    if (city?.objectID) {
      bufferCity(city);
    }
  }, [city?.objectID]);

  const key = cityKey(city);
  if (seenBatchKeys.has(key)) {
    return null;
  }

  return (
    <CityCard
      city={city}
      onClick={onCityClick}
      onMouseEnter={() =>
        dispatch({ type: 'SET_HOVERED_CITY', payload: city.objectID })
      }
      onMouseLeave={() =>
        dispatch({ type: 'SET_HOVERED_CITY', payload: null })
      }
      isHighlighted={state.hoveredCityId === city.objectID}
    />
  );
}

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


export function TravelChat({
  onCityClick,
  onMapCitySelect,
  pendingChatQuery,
  onClearPendingChatQuery,
}: TravelChatProps) {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [hasValidAgentId, setHasValidAgentId] = useState(false);
  const [fallbackResults, setFallbackResults] = useState<AlgoliaCity[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [showFallback, setShowFallback] = useState(false);
  const [visibleResultsCount, setVisibleResultsCount] = useState(2);
  const [chatSessionKey, setChatSessionKey] = useState(() => Date.now().toString());
  const { state, dispatch } = useTripContext();

  const stateRef = useRef(state);
  stateRef.current = state;

  const onCityClickRef = useRef(onCityClick);
  onCityClickRef.current = onCityClick;

  const onMapCitySelectRef = useRef(onMapCitySelect);
  onMapCitySelectRef.current = onMapCitySelect;

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

  useEffect(() => {
    let lastVersion = 0;
    const interval = setInterval(() => {
      if (citiesVersion > lastVersion) {
        lastVersion = citiesVersion;
        if (latestBufferedCities.length > 0) {
          dispatch({ type: 'SET_CHAT_RESULTS', payload: [...latestBufferedCities] });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const chatWidget = document.querySelector('[data-testid="chat-widget"]');
    if (!chatWidget) return;

    let dedupeTimer: ReturnType<typeof setTimeout> | null = null;

    const deduplicateMessages = () => {
      const allMessages = chatWidget.querySelectorAll('article[data-role]');
      const messages = Array.from(allMessages);

      let groupAssistants: Element[] = [];

      const processGroup = () => {
        if (groupAssistants.length > 1) {
          for (let j = 0; j < groupAssistants.length - 1; j++) {
            groupAssistants[j].remove();
          }
        }
      };

      for (const msg of messages) {
        const role = msg.getAttribute('data-role');
        if (role === 'user') {
          processGroup();
          groupAssistants = [];
        } else if (role === 'assistant') {
          groupAssistants.push(msg);
        }
      }
      processGroup();
    };

    const observer = new MutationObserver(() => {
      if (dedupeTimer) clearTimeout(dedupeTimer);
      dedupeTimer = setTimeout(deduplicateMessages, 3000);
    });

    observer.observe(chatWidget, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (dedupeTimer) clearTimeout(dedupeTimer);
    };
  }, []);

  useEffect(() => {
    let attachedForm: HTMLFormElement | null = null;

    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const textarea = form.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea && textarea.value.trim()) {
        const now = Date.now();
        if (now - lastSubmitTimestamp < 500) return;
        lastSubmitTimestamp = now;
        const value = textarea.value.trim();
        setTimeout(() => {
          setLastQuery(value);
          setShowFallback(false);
          setFallbackResults([]);
          clearBuffer();
          dispatch({ type: 'SET_CHAT_RESULTS', payload: [] });
        }, 100);
      }
    };

    const tryAttach = () => {
      if (attachedForm) return;
      const chatWidget = document.querySelector('[data-testid="chat-widget"]');
      if (!chatWidget) return;
      const form = chatWidget.querySelector('form');
      if (form) {
        form.addEventListener('submit', handleFormSubmit);
        attachedForm = form;
        console.log('[Event] form submit handler attached');
      }
    };

    tryAttach();
    const interval = setInterval(tryAttach, 1000);

    return () => {
      clearInterval(interval);
      if (attachedForm) {
        attachedForm.removeEventListener('submit', handleFormSubmit);
      }
    };
  }, [hasValidAgentId, dispatch]);

  useEffect(() => {
    if (!pendingChatQuery?.trim() || !onClearPendingChatQuery) return;
    const chatWidget = document.querySelector('[data-testid="chat-widget"]');
    if (!chatWidget) {
      onClearPendingChatQuery();
      return;
    }
    const textarea = chatWidget.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) {
      onClearPendingChatQuery();
      return;
    }
    setLastQuery(pendingChatQuery.trim());
    setShowFallback(false);
    setFallbackResults([]);
    clearBuffer();
    dispatch({ type: 'SET_CHAT_RESULTS', payload: [] });
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textarea, pendingChatQuery);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
    textarea.focus();
    const submitAfter = () => {
      const submitButton = chatWidget.querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement;
      if (submitButton) {
        submitButton.removeAttribute('disabled');
        submitButton.click();
      }
      onClearPendingChatQuery();
    };
    const t = setTimeout(submitAfter, 100);
    return () => clearTimeout(t);
  }, [pendingChatQuery, onClearPendingChatQuery]);

  const performEnhancedSearch = useCallback(async (query: string) => {
    if (isEnhancing || !query.trim()) return;
    
    setIsEnhancing(true);
    setVisibleResultsCount(2);
    try {
      const enhancement = await queryEnhancementService.enhanceQuery(query, true);
      
      const searchResult = await searchWithEnhancement({
        query: enhancement.originalQuery,
        expandedTerms: enhancement.expandedTerms,
        filters: enhancement.suggestedFilters,
        hitsPerPage: 3,
      });
      
      if (searchResult.hits.length > 0) {
        const uniqueHits = searchResult.hits.filter(
          (city, idx, self) =>
            self.findIndex(
              (c) =>
                c.objectID === city.objectID ||
                c.city.toLowerCase() === city.city.toLowerCase()
            ) === idx
        );
        setFallbackResults(uniqueHits);
        setShowFallback(true);
        dispatch({ type: 'SET_CHAT_RESULTS', payload: uniqueHits.slice(0, 3) });
      }
    } catch (error) {
      console.error('Enhanced search failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [isEnhancing]);

  const handleCityClick = useCallback((city: AlgoliaCity) => {
    onCityClickRef.current?.(city);
  }, []);

  const setReactInputValue = useCallback((input: HTMLTextAreaElement, value: string) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, value);
    }
    
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, []);

  const handleSuggestionClick = useCallback((query: string) => {
    setLastQuery(query);
    setShowFallback(false);
    setFallbackResults([]);
    clearBuffer();
    dispatch({ type: 'SET_CHAT_RESULTS', payload: [] });
    
    const chatWidget = document.querySelector('[data-testid="chat-widget"]');
    if (!chatWidget) return;

    const textarea = chatWidget.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    textarea.focus();
    setReactInputValue(textarea, query);
    
    setTimeout(() => {
      setReactInputValue(textarea, query);
      
      setTimeout(() => {
        const submitButton = chatWidget.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.click();
        }
      }, 50);
    }, 50);
  }, [setReactInputValue, dispatch]);

  const handleManualEnhancedSearch = useCallback(() => {
    if (lastQuery) {
      performEnhancedSearch(lastQuery);
    }
  }, [lastQuery, performEnhancedSearch]);

  const handleDismissFallback = useCallback(() => {
    setShowFallback(false);
    setFallbackResults([]);
    setVisibleResultsCount(2);
  }, []);

  const handleShowMoreResults = useCallback(() => {
    setVisibleResultsCount(prev => prev + 2);
  }, []);

  const fetchCities = useCallback(async (ids: string[]): Promise<AlgoliaCity[]> => {
    return fetchCitiesByIds(ids);
  }, []);

  const fetchCity = useCallback(async (id: string): Promise<AlgoliaCity | null> => {
    return fetchCityById(id);
  }, []);

  const CityCardItem = useCallback(
    ({ item }: { item: Record<string, unknown> }) => {
      const city = item as unknown as AlgoliaCity;
      return (
        <ChatCityCardInner
          city={city}
          onCityClick={handleCityClick}
        />
      );
    },
    [handleCityClick]
  );

  const tools = useMemo(() => ({
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
              dispatch({ type: 'SET_CHAT_RESULTS', payload: cities.slice(0, 3) });
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
        const cities = message.output.comparisonData as AlgoliaCity[];
        return (
          <div className={styles.compareWithMap}>
            <MiniMap cities={cities} onMarkerClick={(city: AlgoliaCity) => onMapCitySelectRef.current?.(city)} />
            <ComparisonTable
              cities={cities}
              recommendation={message.output.comparison?.recommendation}
              onSelect={(city: AlgoliaCity) => {
                dispatch({
                  type: 'ADD_TO_TRIP',
                  payload: { city, durationDays: null, notes: null },
                });
              }}
              onClose={() => dispatch({ type: 'CLEAR_COMPARISON' })}
            />
          </div>
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
        const currentPrefs = stateRef.current.preferences;
        const clearedCount = isAll
          ? currentPrefs.length
          : currentPrefs.filter((p) => p.category === input?.category).length;
        
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
    check_weather: {
      onToolCall: async ({ addToolResult, ...rest }: any) => {
        const input = rest.input as { city_name: string; country: string | null } | undefined;
        if (input?.city_name) {
          try {
            const weather = await weatherService.getWeather(input.city_name, input.country || undefined);
            if (weather) {
              addToolResult({
                output: { weather },
              });
            } else {
              addToolResult({
                output: {
                  weather: null,
                  error: `Could not find weather data for ${input.city_name}`,
                },
              });
            }
          } catch {
            addToolResult({
              output: {
                weather: null,
                error: 'Failed to fetch weather data. Please try again.',
              },
            });
          }
        } else {
          addToolResult({
            output: {
              weather: null,
              error: 'No city specified',
            },
          });
        }
      },
      layoutComponent: ({ message }: any) => {
        if (message.output?.error) {
          return (
            <div className={styles.toolError} data-testid="tool-weather-error">
              ⚠️ {message.output.error}
            </div>
          );
        }
        if (!message.output?.weather) {
          return <div className={styles.toolLoading}>Loading weather data...</div>;
        }
        return <WeatherCard weather={message.output.weather} />;
      },
    },
    estimate_budget: {
      onToolCall: async ({ addToolResult, ...rest }: any) => {
        const input = rest.input as {
          city_id: string;
          duration_days: number;
          travel_style: TravelStyle;
          travelers: number;
        } | undefined;
        
        if (input?.city_id) {
          try {
            const city = await fetchCity(input.city_id);
            if (city) {
              const estimate = budgetService.calculateEstimate({
                city,
                durationDays: input.duration_days || 5,
                travelStyle: input.travel_style || 'mid-range',
                travelers: input.travelers || 1,
              });
              addToolResult({
                output: { estimate, city },
              });
            } else {
              addToolResult({
                output: {
                  estimate: null,
                  error: `Could not find city with ID ${input.city_id}`,
                },
              });
            }
          } catch {
            addToolResult({
              output: {
                estimate: null,
                error: 'Failed to calculate budget estimate. Please try again.',
              },
            });
          }
        } else {
          addToolResult({
            output: {
              estimate: null,
              error: 'No city specified for budget estimate',
            },
          });
        }
      },
      layoutComponent: ({ message }: any) => {
        if (message.output?.error) {
          return (
            <div className={styles.toolError} data-testid="tool-budget-error">
              ⚠️ {message.output.error}
            </div>
          );
        }
        if (!message.output?.estimate) {
          return <div className={styles.toolLoading}>Calculating budget estimate...</div>;
        }
        return (
          <BudgetEstimator
            estimate={message.output.estimate}
            onAddToTrip={() => {
              if (message.output?.city && message.output?.estimate) {
                const est = message.output.estimate;
                dispatch({
                  type: 'ADD_TO_TRIP',
                  payload: {
                    city: message.output.city,
                    durationDays: est.durationDays,
                    notes: `Budget: $${est.totalEstimate} (${est.travelStyle})`,
                  },
                });
              }
            }}
          />
        );
      },
    },
    add_to_wishlist: {
      onToolCall: async ({ addToolResult, ...rest }: any) => {
        const input = rest.input as { city_id: string; notes: string | null } | undefined;
        
        if (input?.city_id) {
          try {
            const city = await fetchCity(input.city_id);
            if (city) {
              dispatch({
                type: 'ADD_TO_WISHLIST',
                payload: {
                  city,
                  notes: input.notes,
                },
              });
              addToolResult({
                output: {
                  success: true,
                  message: `Added ${city.city} to your wishlist!`,
                  city,
                },
              });
            } else {
              addToolResult({
                output: {
                  success: false,
                  error: `Could not find city with ID ${input.city_id}`,
                },
              });
            }
          } catch {
            addToolResult({
              output: {
                success: false,
                error: 'Failed to add to wishlist. Please try again.',
              },
            });
          }
        } else {
          addToolResult({
            output: {
              success: false,
              error: 'No city specified',
            },
          });
        }
      },
      layoutComponent: ({ message }: any) => {
        if (message.output?.error) {
          return (
            <div className={styles.toolError} data-testid="tool-wishlist-error">
              ⚠️ {message.output.error}
            </div>
          );
        }
        if (!message.output?.success) {
          return <div className={styles.toolLoading}>Adding to wishlist...</div>;
        }
        return (
          <div className={styles.toolConfirmation} data-testid="tool-wishlist-success">
            💫 {message.output.message}
          </div>
        );
      },
    },
    get_map_bounds: {
      onToolCall: ({ addToolResult }: any) => {
        const bounds = stateRef.current.mapBounds;
        if (!bounds) {
          addToolResult({
            output: {
              hasBounds: false,
              message:
                'User has not panned or zoomed the map yet. Recommend any region.',
            },
          });
          return;
        }
        addToolResult({
          output: {
            hasBounds: true,
            north: bounds.north,
            south: bounds.south,
            east: bounds.east,
            west: bounds.west,
            message: `User is viewing map region: latitude ${bounds.south.toFixed(2)} to ${bounds.north.toFixed(2)}, longitude ${bounds.west.toFixed(2)} to ${bounds.east.toFixed(2)}. Prefer recommending destinations within or near this region.`,
          },
        });
      },
      layoutComponent: () => null,
    },
  } as any), [dispatch, fetchCity, fetchCities]);

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

  const chatClassNames = useMemo(() => ({
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
  }), []);

  const memoizedTranslations = useMemo(() => ({
    header: {
      title: 'Vibe Assistant',
    },
    prompt: {
      textareaPlaceholder: 'Describe your ideal travel vibe...',
      disclaimer: 'Your preferences are remembered during this session.',
    },
  }), []);

  const renderChatContent = () => {
    if (!hasValidAgentId || !agentId) {
      return PlaceholderContent;
    }

    return (
      <ChatErrorBoundary fallback={PlaceholderContent}>
        <Suspense fallback={LoadingContent}>
          <MemoizedAlgoliaChat
            key={chatSessionKey}
            agentId={agentId}
            itemComponent={CityCardItem}
            classNames={chatClassNames}
            tools={tools}
            userMessageLeadingComponent={UserAvatar}
            assistantMessageLeadingComponent={AssistantAvatar}
            headerTitleIconComponent={HeaderIcon}
            translations={memoizedTranslations}
          />
        </Suspense>
      </ChatErrorBoundary>
    );
  };

  const handleClearConversation = useCallback(async () => {
    fullClearBuffer();
    dispatch({ type: 'RESET_ALL' });
    
    setFallbackResults([]);
    setLastQuery('');
    setShowFallback(false);
    setIsEnhancing(false);
    setVisibleResultsCount(2);
    
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('instantsearch') || key.includes('algolia') || key.includes('chat'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      const localKeysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('instantsearch') || key.includes('algolia') || key.includes('chat'))) {
          localKeysToRemove.push(key);
        }
      }
      localKeysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    
    setChatSessionKey(Date.now().toString());
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
        onKeyDownCapture={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            const directTarget = e.target as HTMLElement;
            if (directTarget.tagName === 'TEXTAREA') {
              const value = (directTarget as HTMLTextAreaElement).value.trim();
              if (value) {
                const now = Date.now();
                if (now - lastSubmitTimestamp < 500) return;
                lastSubmitTimestamp = now;
                setTimeout(() => {
                  setLastQuery(value);
                  setShowFallback(false);
                  setFallbackResults([]);
                  clearBuffer();
                  dispatch({ type: 'SET_CHAT_RESULTS', payload: [] });
                }, 100);
              }
            }
          }
        }}
      >
        {renderChatContent()}
      </div>

      {lastQuery && !showFallback && !isEnhancing && (
        <div className={styles.enhancedSearchSection}>
          <p className={styles.enhancedSearchPrompt}>
            Didn&apos;t find what you were looking for?
          </p>
          <button
            onClick={handleManualEnhancedSearch}
            className={styles.enhancedSearchButton}
            type="button"
          >
            Try Enhanced Search
          </button>
        </div>
      )}

      {isEnhancing && (
        <div className={styles.enhancedSearchSection}>
          <div className={styles.enhancingIndicator}>
            <span className={styles.loadingSpinner}></span>
            Searching with enhanced query...
          </div>
        </div>
      )}

      {showFallback && fallbackResults.length > 0 && (() => {
        const uniqueResults = fallbackResults.filter(
          (city, index, self) => self.findIndex(c => c.objectID === city.objectID) === index
        );
        const visibleResults = uniqueResults.slice(0, visibleResultsCount);
        const hasMoreResults = uniqueResults.length > visibleResultsCount;
        
        return (
          <div className={styles.enhancedResultsSection} data-testid="fallback-results">
            <div className={styles.enhancedResultsHeader}>
              <span className={styles.enhancedResultsTitle}>Enhanced Search Results</span>
              <button
                onClick={handleDismissFallback}
                className={styles.enhancedResultsDismiss}
                aria-label="Dismiss enhanced results"
                type="button"
              >
                ×
              </button>
            </div>
            <p className={styles.enhancedResultsDescription}>
              Based on your query, here are some destinations that might match:
            </p>
            {visibleResults.length > 0 && (
              <div className={styles.miniMapWrap}>
                <MiniMap
                  cities={visibleResults}
                  onMarkerClick={onMapCitySelect}
                />
              </div>
            )}
            <div className={styles.enhancedResultsGrid}>
              {visibleResults.map((city) => (
                <CityCard
                  key={city.objectID}
                  city={city}
                  onClick={handleCityClick}
                  onMouseEnter={() =>
                    dispatch({ type: 'SET_HOVERED_CITY', payload: city.objectID })
                  }
                  onMouseLeave={() =>
                    dispatch({ type: 'SET_HOVERED_CITY', payload: null })
                  }
                  isHighlighted={state.hoveredCityId === city.objectID}
                />
              ))}
            </div>
            {hasMoreResults && (
              <button
                onClick={handleShowMoreResults}
                className={styles.showMoreButton}
                type="button"
              >
                Show more results
              </button>
            )}
          </div>
        );
      })()}

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
