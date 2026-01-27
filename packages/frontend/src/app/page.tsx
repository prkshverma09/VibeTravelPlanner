'use client';

import { useRouter } from 'next/navigation';
import { InstantSearchProvider } from '@/providers';
import { TravelChat } from '@/components/TravelChat';
import { CityCard } from '@/components/CityCard';
import { mockCities } from '@vibe-travel/shared';
import type { AlgoliaCity } from '@vibe-travel/shared';

const featuredCities = mockCities.slice(0, 3);

export default function HomePage() {
  const router = useRouter();

  const handleCityClick = (city: AlgoliaCity) => {
    router.push(`/city/${city.objectID}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
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
            <TravelChat onCityClick={handleCityClick} />
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

        <section className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Explore All {mockCities.length} Destinations
          </h2>
          <p className="text-gray-600 mb-6">
            From bustling metropolises to serene beach towns, we&apos;ve curated 
            destinations for every type of traveler.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'].map((continent) => (
              <span 
                key={continent}
                className="px-4 py-2 bg-white rounded-full shadow-sm text-gray-700 text-sm"
              >
                {continent}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
