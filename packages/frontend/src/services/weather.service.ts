export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy';

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  precipChance: number;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: WeatherCondition;
  conditionText: string;
  windSpeed: number;
  uvIndex: number;
  visibility: number;
  forecast: ForecastDay[];
}

const WEATHER_API_URL = process.env.NEXT_PUBLIC_WEATHER_API_URL || '/api/weather';

export async function getWeather(city: string, country?: string): Promise<WeatherData> {
  const params = new URLSearchParams({ city });
  if (country) {
    params.append('country', country);
  }
  const response = await fetch(`${WEATHER_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return response.json();
}

export function generateTravelAdvice(weather: WeatherData): string {
  const { temperature, condition, humidity, uvIndex } = weather;

  const adviceParts: string[] = [];

  if (temperature >= 30) {
    adviceParts.push(
      `It's quite hot at ${temperature}°C. Stay hydrated, wear sunscreen, and seek shade during peak hours.`
    );
  } else if (temperature >= 25) {
    adviceParts.push(
      `Pleasant warm weather at ${temperature}°C. Great for outdoor activities!`
    );
  } else if (temperature >= 15) {
    adviceParts.push(
      `Comfortable temperature at ${temperature}°C. Perfect weather for exploring!`
    );
  } else if (temperature >= 5) {
    adviceParts.push(
      `It's cool at ${temperature}°C. Bring a light jacket or layers.`
    );
  } else {
    adviceParts.push(
      `Cold weather at ${temperature}°C. Pack warm layers, a coat, and consider gloves.`
    );
  }

  if (condition === 'rainy' || condition === 'stormy') {
    adviceParts.push('Rain is expected. Pack an umbrella and waterproof jacket.');
  } else if (condition === 'snowy') {
    adviceParts.push('Snow is expected. Bring waterproof boots and warm gear.');
  } else if (condition === 'sunny' && uvIndex >= 6) {
    adviceParts.push(`High UV index (${uvIndex}). Wear sunscreen and sunglasses.`);
  }

  if (humidity >= 80) {
    adviceParts.push('High humidity - wear breathable fabrics.');
  }

  return adviceParts.join(' ');
}

export function suggestActivities(weather: WeatherData): string[] {
  const { temperature, condition } = weather;
  const activities: string[] = [];

  const isGoodOutdoorWeather =
    (condition === 'sunny' || condition === 'partly_cloudy') &&
    temperature >= 15 &&
    temperature <= 32;

  if (isGoodOutdoorWeather) {
    activities.push(
      'Walking tours and city exploration',
      'Visit outdoor parks and gardens',
      'Open-air markets and street food tours',
      'Outdoor cafes and terraces',
      'Photography walks'
    );
  }

  if (condition === 'rainy' || condition === 'stormy') {
    activities.push(
      'Visit museums and galleries',
      'Indoor food markets and malls',
      'Cozy cafe hopping',
      'Spa and wellness experiences',
      'Indoor cultural experiences'
    );
  }

  if (temperature >= 30) {
    activities.push(
      'Visit air-conditioned museums',
      'Swimming pools or beaches (early/late)',
      'Indoor shopping centers',
      'Evening outdoor dining'
    );
  }

  if (temperature <= 10) {
    activities.push(
      'Hot spring or onsen visits',
      'Indoor museums and attractions',
      'Warm local cuisine experiences',
      'Theater or concert venues'
    );
  }

  if (condition === 'snowy') {
    activities.push(
      'Winter sports activities',
      'Hot chocolate at local cafes',
      'Scenic winter walks',
      'Indoor thermal baths'
    );
  }

  if (activities.length === 0) {
    activities.push(
      'Local sightseeing',
      'Restaurant and food tours',
      'Shopping districts',
      'Cultural attractions'
    );
  }

  return activities.slice(0, 5);
}

export function getPackingList(weather: WeatherData): string[] {
  const { temperature, condition, uvIndex, humidity } = weather;
  const items: string[] = [];

  items.push('Comfortable walking shoes');

  if (temperature >= 25) {
    items.push('Light, breathable clothing', 'Shorts and t-shirts');
  } else if (temperature >= 15) {
    items.push('Light layers', 'Long pants and shirts');
  } else if (temperature >= 5) {
    items.push('Warm jacket or coat', 'Layers for varying temperatures', 'Long pants');
  } else {
    items.push(
      'Heavy winter coat',
      'Warm layers (thermal wear)',
      'Gloves and scarf',
      'Warm hat'
    );
  }

  if (condition === 'sunny' || uvIndex >= 5) {
    items.push('Sunscreen (SPF 30+)', 'Sunglasses', 'Hat or cap');
  }

  if (condition === 'rainy' || condition === 'stormy') {
    items.push('Umbrella', 'Rain jacket or poncho', 'Waterproof bag cover');
  }

  if (condition === 'snowy') {
    items.push('Waterproof boots', 'Thick socks', 'Hand warmers');
  }

  if (humidity >= 70) {
    items.push('Moisture-wicking fabrics', 'Extra change of clothes');
  }

  return Array.from(new Set(items));
}

export function getWeatherIcon(condition: WeatherCondition): string {
  const icons: Record<WeatherCondition, string> = {
    sunny: '☀️',
    partly_cloudy: '⛅',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
    snowy: '❄️',
    foggy: '🌫️',
    windy: '💨',
  };

  return icons[condition] || '🌡️';
}

export const weatherService = {
  getWeather,
  generateTravelAdvice,
  suggestActivities,
  getPackingList,
  getWeatherIcon,
};
