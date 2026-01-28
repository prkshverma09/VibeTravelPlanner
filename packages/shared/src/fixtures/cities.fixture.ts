import type { AlgoliaCity } from '../types/city';

export const mockCities: AlgoliaCity[] = [
  {
    objectID: 'tokyo-japan',
    city: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    description: 'A mesmerizing blend of ultramodern and traditional, Tokyo pulses with neon-lit streets, ancient temples, and world-class cuisine. From the serene Meiji Shrine to the electric chaos of Shibuya, this metropolis offers an endless array of experiences.',
    vibe_tags: ['neon', 'futuristic', 'bustling', 'culinary', 'tech-forward'],
    culture_score: 10,
    adventure_score: 7,
    nature_score: 5,
    beach_score: 3,
    nightlife_score: 9,
    climate_type: 'Humid subtropical',
    best_time_to_visit: 'Spring (March-May) or Fall (September-November)',
    image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    _geoloc: { lat: 35.6762, lng: 139.6503 },
    primary_vibe: 'cultural'
  },
  {
    objectID: 'paris-france',
    city: 'Paris',
    country: 'France',
    continent: 'Europe',
    description: 'The City of Light captivates with its romantic boulevards, world-renowned museums, and charming cafés. From the iconic Eiffel Tower to the artistic Montmartre, Paris embodies elegance, art, and joie de vivre.',
    vibe_tags: ['romantic', 'artistic', 'historic', 'elegant', 'culinary'],
    culture_score: 10,
    adventure_score: 5,
    nature_score: 4,
    beach_score: 1,
    nightlife_score: 8,
    climate_type: 'Oceanic',
    best_time_to_visit: 'Spring (April-June) or Fall (September-November)',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    _geoloc: { lat: 48.8566, lng: 2.3522 },
    primary_vibe: 'romantic'
  },
  {
    objectID: 'cape-town-south-africa',
    city: 'Cape Town',
    country: 'South Africa',
    continent: 'Africa',
    description: 'Nestled between Table Mountain and the Atlantic Ocean, Cape Town offers breathtaking landscapes, vibrant culture, and world-class wine regions. Adventure awaits around every corner, from shark diving to mountain hiking.',
    vibe_tags: ['adventurous', 'scenic', 'diverse', 'wine-country', 'coastal'],
    culture_score: 8,
    adventure_score: 10,
    nature_score: 10,
    beach_score: 9,
    nightlife_score: 7,
    climate_type: 'Mediterranean',
    best_time_to_visit: 'November to March',
    image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    _geoloc: { lat: -33.9249, lng: 18.4241 },
    primary_vibe: 'adventure'
  },
  {
    objectID: 'new-york-united-states',
    city: 'New York',
    country: 'United States',
    continent: 'North America',
    description: 'The city that never sleeps buzzes with energy, from the bright lights of Times Square to the peaceful paths of Central Park. NYC is a melting pot of cultures, cuisines, and creative expression.',
    vibe_tags: ['cosmopolitan', 'artistic', 'diverse', 'ambitious', 'iconic'],
    culture_score: 10,
    adventure_score: 6,
    nature_score: 3,
    beach_score: 4,
    nightlife_score: 10,
    climate_type: 'Humid subtropical',
    best_time_to_visit: 'April to June or September to November',
    image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    _geoloc: { lat: 40.7128, lng: -74.0060 },
    primary_vibe: 'nightlife'
  },
  {
    objectID: 'bali-indonesia',
    city: 'Bali',
    country: 'Indonesia',
    continent: 'Asia',
    description: 'A tropical paradise where ancient Hindu temples meet lush rice terraces and world-class surf breaks. Bali offers spiritual retreats, vibrant nightlife, and some of the most stunning sunsets on Earth.',
    vibe_tags: ['spiritual', 'tropical', 'zen', 'surfing', 'bohemian'],
    culture_score: 6,
    adventure_score: 8,
    nature_score: 9,
    beach_score: 10,
    nightlife_score: 7,
    climate_type: 'Tropical',
    best_time_to_visit: 'April to October',
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    _geoloc: { lat: -8.3405, lng: 115.0920 },
    primary_vibe: 'beach'
  },
  {
    objectID: 'buenos-aires-argentina',
    city: 'Buenos Aires',
    country: 'Argentina',
    continent: 'South America',
    description: 'The birthplace of tango pulses with passion and creativity. Buenos Aires combines European elegance with Latin American fire, offering world-class steakhouses, vibrant neighborhoods, and legendary nightlife.',
    vibe_tags: ['passionate', 'tango', 'artistic', 'foodie', 'nocturnal'],
    culture_score: 9,
    adventure_score: 5,
    nature_score: 3,
    beach_score: 2,
    nightlife_score: 10,
    climate_type: 'Humid subtropical',
    best_time_to_visit: 'March to May or September to November',
    image_url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
    _geoloc: { lat: -34.6037, lng: -58.3816 },
    primary_vibe: 'nightlife'
  },
  {
    objectID: 'sydney-australia',
    city: 'Sydney',
    country: 'Australia',
    continent: 'Oceania',
    description: 'Where urban sophistication meets natural beauty, Sydney dazzles with its iconic harbor, world-famous beaches, and laid-back lifestyle. From the Opera House to Bondi Beach, adventure is always calling.',
    vibe_tags: ['coastal', 'active', 'modern', 'scenic', 'laid-back'],
    culture_score: 8,
    adventure_score: 9,
    nature_score: 8,
    beach_score: 10,
    nightlife_score: 8,
    climate_type: 'Humid subtropical',
    best_time_to_visit: 'September to November or March to May',
    image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    _geoloc: { lat: -33.8688, lng: 151.2093 },
    primary_vibe: 'beach'
  },
  {
    objectID: 'marrakech-morocco',
    city: 'Marrakech',
    country: 'Morocco',
    continent: 'Africa',
    description: 'A sensory feast of spices, colors, and sounds, Marrakech enchants with its labyrinthine medina, ornate palaces, and vibrant souks. The Red City offers an exotic escape into a world of ancient traditions.',
    vibe_tags: ['exotic', 'mystical', 'colorful', 'traditional', 'sensory'],
    culture_score: 9,
    adventure_score: 7,
    nature_score: 5,
    beach_score: 1,
    nightlife_score: 5,
    climate_type: 'Semi-arid',
    best_time_to_visit: 'March to May or September to November',
    image_url: 'https://images.unsplash.com/photo-1597212720153-fa53c7dae73b?w=800',
    _geoloc: { lat: 31.6295, lng: -7.9811 },
    primary_vibe: 'cultural'
  },
  {
    objectID: 'reykjavik-iceland',
    city: 'Reykjavik',
    country: 'Iceland',
    continent: 'Europe',
    description: 'The worlds northernmost capital sits amid dramatic volcanic landscapes, geothermal wonders, and the ethereal Northern Lights. Reykjavik blends Viking heritage with cutting-edge design and a thriving music scene.',
    vibe_tags: ['otherworldly', 'minimalist', 'nature-focused', 'artistic', 'sustainable'],
    culture_score: 5,
    adventure_score: 10,
    nature_score: 10,
    beach_score: 2,
    nightlife_score: 6,
    climate_type: 'Subpolar oceanic',
    best_time_to_visit: 'June to August or September to March for Northern Lights',
    image_url: 'https://images.unsplash.com/photo-1504233529578-6d46baba6d34?w=800',
    _geoloc: { lat: 64.1466, lng: -21.9426 },
    primary_vibe: 'nature'
  },
  {
    objectID: 'barcelona-spain',
    city: 'Barcelona',
    country: 'Spain',
    continent: 'Europe',
    description: 'Gaudís architectural masterpieces dance alongside Gothic cathedrals and sun-soaked beaches. Barcelona thrives on art, tapas, and late-night revelry, embodying the spirit of Mediterranean living.',
    vibe_tags: ['artistic', 'beachy', 'festive', 'architectural', 'mediterranean'],
    culture_score: 9,
    adventure_score: 6,
    nature_score: 5,
    beach_score: 8,
    nightlife_score: 9,
    climate_type: 'Mediterranean',
    best_time_to_visit: 'May to June or September to October',
    image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    _geoloc: { lat: 41.3851, lng: 2.1734 },
    primary_vibe: 'cultural'
  },
  {
    objectID: 'kyoto-japan',
    city: 'Kyoto',
    country: 'Japan',
    continent: 'Asia',
    description: 'The cultural heart of Japan whispers of ancient traditions through its serene temples, pristine gardens, and geisha districts. Kyoto offers a contemplative escape into Japans rich spiritual heritage.',
    vibe_tags: ['serene', 'traditional', 'spiritual', 'historic', 'contemplative'],
    culture_score: 10,
    adventure_score: 4,
    nature_score: 7,
    beach_score: 1,
    nightlife_score: 4,
    climate_type: 'Humid subtropical',
    best_time_to_visit: 'March to May or October to November',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    _geoloc: { lat: 35.0116, lng: 135.7681 },
    primary_vibe: 'cultural'
  },
  {
    objectID: 'rio-de-janeiro-brazil',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    continent: 'South America',
    description: 'Where dramatic mountains meet golden beaches, Rio pulses with samba rhythms and Carnival spirit. The Marvelous City captivates with its natural beauty, vibrant culture, and infectious energy.',
    vibe_tags: ['festive', 'beachy', 'energetic', 'musical', 'dramatic'],
    culture_score: 8,
    adventure_score: 8,
    nature_score: 8,
    beach_score: 10,
    nightlife_score: 10,
    climate_type: 'Tropical',
    best_time_to_visit: 'December to March for summer, June to September for mild weather',
    image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    _geoloc: { lat: -22.9068, lng: -43.1729 },
    primary_vibe: 'beach'
  }
];

export function getMockCityByName(name: string): AlgoliaCity | undefined {
  return mockCities.find(
    city => city.city.toLowerCase() === name.toLowerCase()
  );
}

export function getRandomMockCities(count: number): AlgoliaCity[] {
  const shuffled = [...mockCities].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, mockCities.length));
}

export function getMockCitiesByContinent(continent: string): AlgoliaCity[] {
  return mockCities.filter(city => city.continent === continent);
}

export function getMockCitiesByMinScore(
  scoreType: keyof Pick<AlgoliaCity, 'culture_score' | 'adventure_score' | 'nature_score' | 'beach_score' | 'nightlife_score'>,
  minScore: number
): AlgoliaCity[] {
  return mockCities.filter(city => city[scoreType] >= minScore);
}
