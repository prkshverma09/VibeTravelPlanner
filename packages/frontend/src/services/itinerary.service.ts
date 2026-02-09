import type { Pace } from '@vibe-travel/shared';

export interface CityData {
  objectID: string;
  city: string;
  country: string;
  continent?: string;
  description?: string;
  vibe_tags?: string[];
  culture_score?: number;
  adventure_score?: number;
  nature_score?: number;
  beach_score?: number;
  nightlife_score?: number;
  climate_type?: string;
  best_time_to_visit?: string;
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type ActivityCost = 'free' | 'budget' | 'moderate' | 'expensive';
export type TravelStyle = 'relaxed' | 'balanced' | 'active';

export interface ItineraryActivity {
  id: string;
  name: string;
  description: string;
  timeSlot: TimeSlot;
  startTime?: string;
  duration: number;
  cost: ActivityCost;
  category: string;
  location?: string;
  vibeTags?: string[];
  reservationRequired?: boolean;
  bookingUrl?: string;
}

export interface MealSuggestion {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  suggestion: string;
  cuisineType: string;
  priceRange: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string;
  theme: string;
  activities: ItineraryActivity[];
  meals: MealSuggestion[];
  transportTips: string[];
  estimatedCost: number;
}

export interface GeneratedItinerary {
  destination: {
    city: string;
    country: string;
    objectID: string;
  };
  totalDays: number;
  interests: string[];
  travelStyle: TravelStyle;
  days: ItineraryDay[];
  estimatedTotalCost: number;
  currency: string;
  generatedAt: string;
}

export interface ItineraryInput {
  city: CityData;
  durationDays: number;
  interests: string[];
  travelStyle: TravelStyle;
  pace: Pace;
  startDate?: string;
}

const COST_VALUES: Record<ActivityCost, number> = {
  free: 0,
  budget: 15,
  moderate: 40,
  expensive: 100,
};

const PACE_ACTIVITY_COUNT: Record<Pace, { min: number; max: number }> = {
  relaxed: { min: 2, max: 3 },
  moderate: { min: 3, max: 5 },
  packed: { min: 5, max: 7 },
};

const THEMES: Record<string, string[]> = {
  culture: ['Cultural Exploration', 'History & Heritage', 'Arts & Museums'],
  adventure: ['Adventure Day', 'Active Exploration', 'Outdoor Adventures'],
  food: ['Culinary Journey', 'Food & Flavors', 'Local Gastronomy'],
  nature: ['Nature & Scenery', 'Parks & Gardens', 'Natural Wonders'],
  nightlife: ['Evening Entertainment', 'Nightlife Discovery', 'After Dark'],
  beach: ['Beach & Relaxation', 'Coastal Day', 'Seaside Escape'],
  shopping: ['Shopping & Markets', 'Local Finds', 'Retail Exploration'],
};

const ACTIVITY_TEMPLATES: Record<string, ItineraryActivity[]> = {
  culture_morning: [
    {
      id: 'temple-visit',
      name: 'Temple or Shrine Visit',
      description: 'Start the day with a peaceful visit to a historic temple or shrine',
      timeSlot: 'morning',
      startTime: '08:00',
      duration: 90,
      cost: 'budget',
      category: 'culture',
      vibeTags: ['Cultural', 'Spiritual', 'Historic'],
    },
    {
      id: 'museum-morning',
      name: 'Museum Exploration',
      description: 'Explore local art and history at a renowned museum',
      timeSlot: 'morning',
      startTime: '09:30',
      duration: 120,
      cost: 'moderate',
      category: 'culture',
      vibeTags: ['Cultural', 'Art', 'Educational'],
    },
    {
      id: 'walking-tour',
      name: 'Historic District Walking Tour',
      description: 'Guided walking tour through the old town',
      timeSlot: 'morning',
      startTime: '10:00',
      duration: 150,
      cost: 'moderate',
      category: 'culture',
      vibeTags: ['Cultural', 'Historic', 'Local'],
      reservationRequired: true,
    },
  ],
  culture_afternoon: [
    {
      id: 'gallery-visit',
      name: 'Art Gallery Visit',
      description: 'Contemporary and traditional art collections',
      timeSlot: 'afternoon',
      startTime: '14:00',
      duration: 90,
      cost: 'budget',
      category: 'culture',
      vibeTags: ['Art', 'Cultural'],
    },
    {
      id: 'historic-site',
      name: 'Historic Landmark Visit',
      description: 'Explore an iconic historic site',
      timeSlot: 'afternoon',
      startTime: '15:00',
      duration: 120,
      cost: 'moderate',
      category: 'culture',
      vibeTags: ['Historic', 'Architecture'],
    },
  ],
  culture_evening: [
    {
      id: 'traditional-show',
      name: 'Traditional Performance',
      description: 'Experience local traditional arts and performance',
      timeSlot: 'evening',
      startTime: '19:00',
      duration: 120,
      cost: 'moderate',
      category: 'culture',
      vibeTags: ['Cultural', 'Entertainment'],
      reservationRequired: true,
    },
  ],
  food_morning: [
    {
      id: 'food-market',
      name: 'Local Food Market Tour',
      description: 'Explore vibrant local markets and taste fresh produce',
      timeSlot: 'morning',
      startTime: '08:00',
      duration: 120,
      cost: 'budget',
      category: 'food',
      vibeTags: ['Food Paradise', 'Local', 'Authentic'],
    },
    {
      id: 'cooking-class',
      name: 'Morning Cooking Class',
      description: 'Learn to cook local dishes with expert chefs',
      timeSlot: 'morning',
      startTime: '09:00',
      duration: 180,
      cost: 'moderate',
      category: 'food',
      vibeTags: ['Food Paradise', 'Cultural', 'Hands-on'],
      reservationRequired: true,
    },
  ],
  food_afternoon: [
    {
      id: 'food-tour',
      name: 'Street Food Walking Tour',
      description: 'Sample the best street food the city has to offer',
      timeSlot: 'afternoon',
      startTime: '14:00',
      duration: 180,
      cost: 'moderate',
      category: 'food',
      vibeTags: ['Food Paradise', 'Local', 'Adventure'],
    },
    {
      id: 'tea-ceremony',
      name: 'Traditional Tea Experience',
      description: 'Participate in a traditional tea ceremony',
      timeSlot: 'afternoon',
      startTime: '15:00',
      duration: 90,
      cost: 'moderate',
      category: 'food',
      vibeTags: ['Cultural', 'Relaxing'],
    },
  ],
  food_evening: [
    {
      id: 'fine-dining',
      name: 'Local Fine Dining',
      description: 'Savor exquisite local cuisine at a top restaurant',
      timeSlot: 'evening',
      startTime: '19:00',
      duration: 150,
      cost: 'expensive',
      category: 'food',
      vibeTags: ['Food Paradise', 'Luxury'],
      reservationRequired: true,
    },
    {
      id: 'night-market',
      name: 'Night Market Exploration',
      description: 'Experience the vibrant night food scene',
      timeSlot: 'evening',
      startTime: '19:30',
      duration: 120,
      cost: 'budget',
      category: 'food',
      vibeTags: ['Food Paradise', 'Nightlife', 'Local'],
    },
  ],
  adventure_morning: [
    {
      id: 'hiking',
      name: 'Morning Hike',
      description: 'Scenic hiking trail with panoramic views',
      timeSlot: 'morning',
      startTime: '07:00',
      duration: 180,
      cost: 'free',
      category: 'adventure',
      vibeTags: ['Adventure', 'Nature', 'Active'],
    },
    {
      id: 'bike-tour',
      name: 'Cycling Tour',
      description: 'Explore the city on two wheels',
      timeSlot: 'morning',
      startTime: '08:00',
      duration: 150,
      cost: 'moderate',
      category: 'adventure',
      vibeTags: ['Adventure', 'Active', 'Eco-friendly'],
    },
  ],
  adventure_afternoon: [
    {
      id: 'water-activity',
      name: 'Water Sports',
      description: 'Kayaking, paddleboarding, or similar activities',
      timeSlot: 'afternoon',
      startTime: '14:00',
      duration: 180,
      cost: 'moderate',
      category: 'adventure',
      vibeTags: ['Adventure', 'Active', 'Water'],
    },
    {
      id: 'zipline',
      name: 'Adventure Park',
      description: 'Zipline, climbing, and other thrilling activities',
      timeSlot: 'afternoon',
      startTime: '15:00',
      duration: 180,
      cost: 'expensive',
      category: 'adventure',
      vibeTags: ['Adventure', 'Thrilling'],
      reservationRequired: true,
    },
  ],
  nature_morning: [
    {
      id: 'park-walk',
      name: 'Morning Park Walk',
      description: 'Peaceful walk through beautiful gardens',
      timeSlot: 'morning',
      startTime: '07:30',
      duration: 90,
      cost: 'free',
      category: 'nature',
      vibeTags: ['Nature', 'Relaxing', 'Scenic'],
    },
    {
      id: 'botanical-garden',
      name: 'Botanical Garden Visit',
      description: 'Explore diverse plant collections and serene landscapes',
      timeSlot: 'morning',
      startTime: '09:00',
      duration: 120,
      cost: 'budget',
      category: 'nature',
      vibeTags: ['Nature', 'Relaxing', 'Educational'],
    },
  ],
  nature_afternoon: [
    {
      id: 'scenic-viewpoint',
      name: 'Scenic Viewpoint',
      description: 'Visit a famous viewpoint for stunning panoramas',
      timeSlot: 'afternoon',
      startTime: '16:00',
      duration: 90,
      cost: 'free',
      category: 'nature',
      vibeTags: ['Nature', 'Scenic', 'Photography'],
    },
  ],
  nightlife_evening: [
    {
      id: 'rooftop-bar',
      name: 'Rooftop Bar Experience',
      description: 'Sunset drinks with city views',
      timeSlot: 'evening',
      startTime: '18:00',
      duration: 120,
      cost: 'moderate',
      category: 'nightlife',
      vibeTags: ['Nightlife', 'Trendy', 'Views'],
    },
    {
      id: 'live-music',
      name: 'Live Music Venue',
      description: 'Experience local music scene',
      timeSlot: 'evening',
      startTime: '21:00',
      duration: 180,
      cost: 'moderate',
      category: 'nightlife',
      vibeTags: ['Nightlife', 'Entertainment', 'Music'],
    },
    {
      id: 'club-night',
      name: 'Nightclub Experience',
      description: 'Dance the night away at a popular club',
      timeSlot: 'evening',
      startTime: '23:00',
      duration: 240,
      cost: 'expensive',
      category: 'nightlife',
      vibeTags: ['Nightlife', 'Dancing', 'Party'],
    },
  ],
  general_morning: [
    {
      id: 'neighborhood-explore',
      name: 'Neighborhood Exploration',
      description: 'Wander through a charming local neighborhood',
      timeSlot: 'morning',
      startTime: '09:00',
      duration: 120,
      cost: 'free',
      category: 'exploration',
      vibeTags: ['Local', 'Authentic'],
    },
  ],
  general_afternoon: [
    {
      id: 'shopping-district',
      name: 'Shopping District Visit',
      description: 'Browse local shops and boutiques',
      timeSlot: 'afternoon',
      startTime: '14:00',
      duration: 150,
      cost: 'free',
      category: 'shopping',
      vibeTags: ['Shopping', 'Local'],
    },
    {
      id: 'cafe-hopping',
      name: 'Café Hopping',
      description: 'Discover cozy local cafés',
      timeSlot: 'afternoon',
      startTime: '15:00',
      duration: 90,
      cost: 'budget',
      category: 'food',
      vibeTags: ['Relaxing', 'Local', 'Trendy'],
    },
  ],
  general_evening: [
    {
      id: 'sunset-spot',
      name: 'Sunset Viewing',
      description: 'Watch the sunset from a scenic location',
      timeSlot: 'evening',
      startTime: '17:30',
      duration: 60,
      cost: 'free',
      category: 'nature',
      vibeTags: ['Romantic', 'Scenic', 'Relaxing'],
    },
    {
      id: 'dinner-local',
      name: 'Local Restaurant Dinner',
      description: 'Enjoy dinner at a well-reviewed local restaurant',
      timeSlot: 'evening',
      startTime: '19:00',
      duration: 120,
      cost: 'moderate',
      category: 'food',
      vibeTags: ['Food Paradise', 'Local'],
    },
  ],
};

const TRANSPORT_TIPS: Record<string, string[]> = {
  Asia: [
    'Consider purchasing a day pass for public transit',
    'Download local transport apps for real-time schedules',
    'Taxis are affordable but agree on fare before starting',
    'Many cities have excellent metro systems',
  ],
  Europe: [
    'Walking is often the best way to explore city centers',
    'Consider a multi-day transit pass for savings',
    'Trains are reliable and comfortable for day trips',
    'Bike-sharing programs are widely available',
  ],
  'North America': [
    'Ride-sharing apps are widely available',
    'Consider renting a car for flexibility outside city centers',
    'Public transit varies by city - research ahead',
    'Many downtown areas are walkable',
  ],
  default: [
    'Research local transport options before arriving',
    'Keep some local currency for transport',
    'Download offline maps for navigation',
    'Consider walking for short distances',
  ],
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getCityTopCategories(city: CityData): string[] {
  const scores: { category: string; score: number }[] = [
    { category: 'culture', score: city.culture_score || 0 },
    { category: 'adventure', score: city.adventure_score || 0 },
    { category: 'nature', score: city.nature_score || 0 },
    { category: 'beach', score: city.beach_score || 0 },
    { category: 'nightlife', score: city.nightlife_score || 0 },
  ];

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.category);
}

export function getDayTheme(city: CityData, dayNumber: number, interests: string[]): string {
  const cityCategories = getCityTopCategories(city);
  const categories = interests.length > 0 ? [...interests, ...cityCategories] : cityCategories;

  const uniqueCategories = Array.from(new Set(categories));
  const categoryIndex = (dayNumber - 1) % uniqueCategories.length;
  const category = uniqueCategories[categoryIndex];

  const themes = THEMES[category] || THEMES['culture'];
  const themeIndex = (dayNumber - 1) % themes.length;

  return themes[themeIndex];
}

export function getActivitiesForTimeSlot(
  city: CityData,
  timeSlot: TimeSlot,
  interests: string[]
): ItineraryActivity[] {
  const cityCategories = getCityTopCategories(city);
  const categories = interests.length > 0 ? [...interests, ...cityCategories] : cityCategories;

  const activities: ItineraryActivity[] = [];

  for (const category of categories) {
    const key = `${category}_${timeSlot}`;
    if (ACTIVITY_TEMPLATES[key]) {
      activities.push(
        ...ACTIVITY_TEMPLATES[key].map((a) => ({
          ...a,
          id: `${a.id}-${generateId()}`,
        }))
      );
    }
  }

  const generalKey = `general_${timeSlot}`;
  if (ACTIVITY_TEMPLATES[generalKey]) {
    activities.push(
      ...ACTIVITY_TEMPLATES[generalKey].map((a) => ({
        ...a,
        id: `${a.id}-${generateId()}`,
      }))
    );
  }

  return activities.filter(
    (activity, index, self) =>
      index === self.findIndex((a) => a.name === activity.name)
  );
}

export function calculateDayCost(day: ItineraryDay): number {
  return day.activities.reduce((total, activity) => {
    return total + COST_VALUES[activity.cost];
  }, 0);
}

function getTransportTips(city: CityData): string[] {
  const continent = city.continent || 'default';
  return TRANSPORT_TIPS[continent] || TRANSPORT_TIPS['default'];
}

function selectActivitiesForDay(
  city: CityData,
  dayNumber: number,
  interests: string[],
  pace: Pace
): ItineraryActivity[] {
  const { min, max } = PACE_ACTIVITY_COUNT[pace];
  const targetCount = Math.floor(Math.random() * (max - min + 1)) + min;

  const morningActivities = getActivitiesForTimeSlot(city, 'morning', interests);
  const afternoonActivities = getActivitiesForTimeSlot(city, 'afternoon', interests);
  const eveningActivities = getActivitiesForTimeSlot(city, 'evening', interests);

  const selected: ItineraryActivity[] = [];

  if (morningActivities.length > 0) {
    const idx = dayNumber % morningActivities.length;
    selected.push(morningActivities[idx]);
  }

  if (afternoonActivities.length > 0 && selected.length < targetCount) {
    const idx = dayNumber % afternoonActivities.length;
    selected.push(afternoonActivities[idx]);

    if (pace === 'packed' && afternoonActivities.length > 1 && selected.length < targetCount) {
      const idx2 = (dayNumber + 1) % afternoonActivities.length;
      if (idx2 !== idx) {
        selected.push(afternoonActivities[idx2]);
      }
    }
  }

  if (eveningActivities.length > 0 && selected.length < targetCount) {
    const idx = dayNumber % eveningActivities.length;
    selected.push(eveningActivities[idx]);
  }

  while (selected.length < targetCount) {
    const allActivities = [...morningActivities, ...afternoonActivities, ...eveningActivities];
    const remaining = allActivities.filter(
      (a) => !selected.some((s) => s.name === a.name)
    );
    if (remaining.length === 0) break;

    const idx = (dayNumber + selected.length) % remaining.length;
    selected.push(remaining[idx]);
  }

  return selected.slice(0, max);
}

function generateDayMeals(): MealSuggestion[] {
  return [
    {
      mealType: 'breakfast',
      suggestion: 'Local café or hotel breakfast',
      cuisineType: 'Local',
      priceRange: '$10-20',
    },
    {
      mealType: 'lunch',
      suggestion: 'Try a local restaurant near your activities',
      cuisineType: 'Local',
      priceRange: '$15-30',
    },
    {
      mealType: 'dinner',
      suggestion: 'Explore the local dining scene',
      cuisineType: 'Local',
      priceRange: '$20-50',
    },
  ];
}

export function generateItinerary(input: ItineraryInput): GeneratedItinerary {
  const { city, durationDays, interests, travelStyle, pace, startDate } = input;

  const days: ItineraryDay[] = [];

  for (let i = 1; i <= durationDays; i++) {
    const theme = getDayTheme(city, i, interests);
    const activities = selectActivitiesForDay(city, i, interests, pace);
    const meals = generateDayMeals();
    const transportTips = i === 1 ? getTransportTips(city) : [];

    const day: ItineraryDay = {
      dayNumber: i,
      date: startDate
        ? new Date(new Date(startDate).getTime() + (i - 1) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        : undefined,
      theme,
      activities,
      meals,
      transportTips,
      estimatedCost: 0,
    };

    day.estimatedCost = calculateDayCost(day);
    days.push(day);
  }

  const estimatedTotalCost = days.reduce((total, day) => total + day.estimatedCost, 0);

  return {
    destination: {
      city: city.city,
      country: city.country,
      objectID: city.objectID,
    },
    totalDays: durationDays,
    interests,
    travelStyle,
    days,
    estimatedTotalCost,
    currency: 'USD',
    generatedAt: new Date().toISOString(),
  };
}
