import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VibeTag } from '@/components/VibeTag';
import { ScoreBadge } from '@/components/ScoreBadge';
import { PlanTripButton } from '@/components/PlanTripButton';
import type { AlgoliaCity } from '@vibe-travel/shared';

interface CityDetailPageProps {
  params: {
    id: string;
  };
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

async function getCityData(id: string): Promise<AlgoliaCity | null> {
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
    
    if (!appId || !apiKey) {
      console.error('Algolia credentials not configured');
      return null;
    }

    const { liteClient } = await import('algoliasearch/lite');
    const client = liteClient(appId, apiKey);
    
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'travel_destinations';
    
    const response = await client.search({
      requests: [
        {
          indexName,
          query: '',
          filters: `objectID:${id}`,
          hitsPerPage: 1,
        },
      ],
    });
    
    const result = response.results[0];
    if (result && 'hits' in result && Array.isArray(result.hits)) {
      return (result.hits as unknown as AlgoliaCity[])[0] || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch city:', error);
    return null;
  }
}

export default async function CityDetailPage({ params }: CityDetailPageProps) {
  const city = await getCityData(params.id);

  if (!city) {
    notFound();
  }

  const imageUrl = city.image_url || PLACEHOLDER_IMAGE;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="relative h-80 w-full">
        <Image
          src={imageUrl}
          alt={`${city.city}, ${city.country}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <Link 
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm"
          >
            ← Back to search
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{city.city}</h1>
              <p className="text-xl text-white/90">{city.country} • {city.continent}</p>
            </div>
            <PlanTripButton
              destination={{
                objectID: city.objectID,
                city: city.city,
                country: city.country,
                continent: city.continent,
                bestTimeToVisit: city.best_time_to_visit,
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed">{city.description}</p>
        </section>

        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Vibe Tags</h2>
          <div className="flex flex-wrap gap-2" data-testid="vibe-tags">
            {city.vibe_tags.map((tag) => (
              <VibeTag key={tag}>{tag}</VibeTag>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ratings</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-testid="score-badges">
            <ScoreBadge type="culture" score={city.culture_score} />
            <ScoreBadge type="adventure" score={city.adventure_score} />
            <ScoreBadge type="nature" score={city.nature_score} />
            <ScoreBadge type="beach" score={city.beach_score} />
            <ScoreBadge type="nightlife" score={city.nightlife_score} />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Travel Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Climate</span>
              <p className="font-medium" data-testid="climate">{city.climate_type}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Best Time to Visit</span>
              <p className="font-medium" data-testid="best-time">{city.best_time_to_visit}</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Ready to explore {city.city}?</h2>
          <p className="text-white/90 mb-6 max-w-md mx-auto">
            Create your personalized itinerary with AI-powered recommendations tailored to your interests.
          </p>
          <PlanTripButton
            destination={{
              objectID: city.objectID,
              city: city.city,
              country: city.country,
              continent: city.continent,
              bestTimeToVisit: city.best_time_to_visit,
            }}
            buttonText="Start Planning Your Trip"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-blue-50 border-none"
          />
        </section>
      </div>
    </main>
  );
}
