'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { InstantSearchProvider } from '@/providers';
import { TravelChat } from '@/components/TravelChat';
import { CityCard } from '@/components/CityCard';
import { DestinationMap } from '@/components/DestinationMap';
import { useTripContext } from '@/context/TripContext';
import { mockCities } from '@vibe-travel/shared';
import type { AlgoliaCity } from '@vibe-travel/shared';

const featuredCities = mockCities.slice(0, 3);

export default function HomePage() {
  const router = useRouter();
  const { state } = useTripContext();
  const [selectedCity, setSelectedCity] = useState<AlgoliaCity | null>(null);
  const [pendingChatQuery, setPendingChatQuery] = useState<string | null>(null);

  const mapDestinations = useMemo(() => {
    if (state.chatResults.length === 0) return mockCities;

    const mockCityMap = new Map(mockCities.map(c => [c.objectID, c]));
    const mockCityNameMap = new Map(mockCities.map(c => [c.city.toLowerCase(), c]));
    const seen = new Set<string>();

    const enriched: AlgoliaCity[] = [];
    for (const chatCity of state.chatResults) {
      const key = (chatCity.city || chatCity.objectID).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      if (chatCity._geoloc?.lat != null && chatCity._geoloc?.lng != null) {
        enriched.push(chatCity);
        continue;
      }
      const byId = mockCityMap.get(chatCity.objectID);
      if (byId?._geoloc) {
        enriched.push({ ...chatCity, _geoloc: byId._geoloc });
        continue;
      }
      const byName = mockCityNameMap.get((chatCity.city || '').toLowerCase());
      if (byName?._geoloc) {
        enriched.push({ ...chatCity, _geoloc: byName._geoloc });
      }
    }

    return enriched.length > 0 ? enriched : mockCities;
  }, [state.chatResults]);

  const handleCityClick = (city: AlgoliaCity) => {
    router.push(`/city/${city.objectID}`);
  };

  const handleCitySelect = (city: AlgoliaCity) => {
    setSelectedCity(city);
  };

  const handleAskInChat = (query: string) => {
    setPendingChatQuery(query);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Vibe-Check Travel Planner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover destinations that match your vibe. Tell our AI assistant what kind of 
            experience you&apos;re looking for, and we&apos;ll find the perfect match.
          </p>
        </header>

        <section className="mb-16" data-testid="travel-chat-placeholder">
          <InstantSearchProvider>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div data-testid="chat-panel">
                <TravelChat
                  onCityClick={handleCityClick}
                  onMapCitySelect={handleCitySelect}
                  pendingChatQuery={pendingChatQuery}
                  onClearPendingChatQuery={() => setPendingChatQuery(null)}
                />
              </div>
              <div className="h-[600px] lg:h-auto min-h-[500px]">
                <DestinationMap
                  destinations={mapDestinations}
                  selectedCity={selectedCity}
                  onCitySelect={handleCitySelect}
                  onCityClick={handleCityClick}
                  onAskInChat={handleAskInChat}
                />
              </div>
            </div>
          </InstantSearchProvider>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Featured Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCities.map((city) => (
              <CityCard 
                key={city.objectID} 
                city={city} 
                onClick={handleCityClick}
              />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
