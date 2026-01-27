import type { AlgoliaCity } from '@vibe-travel/shared';
import type {
  GenerateItineraryInput,
  GenerateItineraryOutput,
  ItineraryDay,
  ItineraryActivity,
  ToolHandler,
} from './types';

type TravelStyle = 'relaxed' | 'active' | 'balanced';

interface ActivitySlot {
  time: string;
  activities: string[];
}

const ACTIVITY_TEMPLATES: Record<TravelStyle, ActivitySlot[]> = {
  relaxed: [
    { time: 'Morning', activities: ['Late breakfast at local café', 'Leisurely neighborhood stroll'] },
    { time: 'Afternoon', activities: ['Lunch at recommended spot', 'Light sightseeing', 'Relaxing café break'] },
    { time: 'Evening', activities: ['Scenic dinner', 'Sunset viewing spot'] },
  ],
  active: [
    { time: 'Early Morning', activities: ['Sunrise activity', 'Local breakfast'] },
    { time: 'Morning', activities: ['Major attraction visit', 'Walking tour'] },
    { time: 'Afternoon', activities: ['Quick lunch', 'Adventure activity', 'Local experience'] },
    { time: 'Evening', activities: ['Dinner exploration', 'Night activity', 'Nightlife district'] },
  ],
  balanced: [
    { time: 'Morning', activities: ['Breakfast at local spot', 'Cultural site visit'] },
    { time: 'Afternoon', activities: ['Lunch break', 'Exploration time', 'Rest or optional activity'] },
    { time: 'Evening', activities: ['Dinner experience', 'Local evening activity'] },
  ],
};

const THEME_GENERATORS: Record<string, (city: AlgoliaCity) => string[]> = {
  high_culture: (city) => city.culture_score >= 7 ? ['Cultural Exploration', 'Historical Discovery'] : [],
  high_nature: (city) => city.nature_score >= 7 ? ['Nature Discovery', 'Outdoor Adventure'] : [],
  high_beach: (city) => city.beach_score >= 7 ? ['Beach Day', 'Coastal Relaxation'] : [],
  high_adventure: (city) => city.adventure_score >= 7 ? ['Adventure Day', 'Active Exploration'] : [],
  high_nightlife: (city) => city.nightlife_score >= 7 ? ['Nightlife Experience', 'Entertainment Night'] : [],
};

const DEFAULT_THEMES = ['Local Life', 'Hidden Gems', 'Relaxation Day', 'Free Exploration'];

export function createGenerateItineraryHandler(
  fetchCity: (id: string) => Promise<AlgoliaCity | null>
): ToolHandler<GenerateItineraryInput, GenerateItineraryOutput> {
  return async ({ input, addToolResult }) => {
    const { city_id, duration_days, interests, travel_style } = input;

    try {
      const city = await fetchCity(city_id);

      if (!city) {
        addToolResult({
          output: {
            cityId: city_id,
            cityName: 'Unknown',
            days: [],
          },
        });
        return;
      }

      const style: TravelStyle = travel_style || 'balanced';
      const days = generateDays(city, duration_days, style, interests || []);

      addToolResult({
        output: {
          cityId: city.objectID,
          cityName: city.city,
          days,
        },
      });
    } catch (error) {
      addToolResult({
        output: {
          cityId: city_id,
          cityName: 'Unknown',
          days: [],
        },
      });
    }
  };
}

function generateDays(
  city: AlgoliaCity,
  durationDays: number,
  style: TravelStyle,
  interests: string[]
): ItineraryDay[] {
  const template = ACTIVITY_TEMPLATES[style];
  const themes = generateThemes(city, durationDays, interests);
  const days: ItineraryDay[] = [];

  for (let i = 0; i < durationDays; i++) {
    const dayTheme = themes[i % themes.length];
    const activities: ItineraryActivity[] = template.map((slot) => ({
      time: slot.time,
      activity: selectActivity(slot.activities, dayTheme, i),
      description: `Experience ${city.city}'s ${dayTheme.toLowerCase()} atmosphere`,
      vibeMatch: city.vibe_tags.slice(0, 2),
    }));

    days.push({
      day: i + 1,
      theme: dayTheme,
      activities,
    });
  }

  return days;
}

function generateThemes(
  city: AlgoliaCity,
  durationDays: number,
  interests: string[]
): string[] {
  const themes: string[] = [];

  Object.values(THEME_GENERATORS).forEach((generator) => {
    themes.push(...generator(city));
  });

  if (interests.length > 0) {
    interests.forEach((interest) => {
      themes.push(`${capitalizeFirst(interest)} Focus`);
    });
  }

  themes.push(...DEFAULT_THEMES);

  const uniqueThemes = Array.from(new Set(themes));
  
  while (uniqueThemes.length < durationDays) {
    uniqueThemes.push(...DEFAULT_THEMES);
  }

  return uniqueThemes.slice(0, Math.max(durationDays, uniqueThemes.length));
}

function selectActivity(options: string[], theme: string, dayIndex: number): string {
  const index = dayIndex % options.length;
  return options[index];
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
