export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  windSpeed: number;
  isDay: boolean;
}

export interface ForecastDay {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  precipitationProbability: number;
}

export interface WeatherData {
  city: string;
  country: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
  packingRecommendations: string[];
  activitySuggestions: string[];
}

export interface WeatherServiceConfig {
  geocodingUrl?: string;
  weatherUrl?: string;
}

const WMO_WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Foggy', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌧️' },
  53: { description: 'Moderate drizzle', icon: '🌧️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snow', icon: '🌨️' },
  73: { description: 'Moderate snow', icon: '🌨️' },
  75: { description: 'Heavy snow', icon: '❄️' },
  77: { description: 'Snow grains', icon: '🌨️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌦️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

function getWeatherInfo(code: number): { description: string; icon: string } {
  return WMO_WEATHER_CODES[code] || { description: 'Unknown', icon: '❓' };
}

function getDayName(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function generatePackingRecommendations(weather: CurrentWeather, forecast: ForecastDay[]): string[] {
  const recommendations: string[] = [];
  const avgTemp = (weather.temperature + forecast.reduce((sum, d) => sum + (d.tempMax + d.tempMin) / 2, 0) / forecast.length) / 2;
  const hasRain = forecast.some(d => d.precipitationProbability > 40);
  const hasColdDays = forecast.some(d => d.tempMin < 10);
  const hasHotDays = forecast.some(d => d.tempMax > 28);

  if (avgTemp < 10) {
    recommendations.push('Pack warm layers and a winter jacket');
    recommendations.push('Bring thermal underwear');
  } else if (avgTemp < 18) {
    recommendations.push('Pack light layers and a jacket');
    recommendations.push('Bring a sweater or cardigan');
  } else if (avgTemp < 25) {
    recommendations.push('Pack comfortable light clothing');
    recommendations.push('Bring a light jacket for evenings');
  } else {
    recommendations.push('Pack lightweight, breathable clothing');
    recommendations.push('Bring sunscreen and sunglasses');
  }

  if (hasRain) {
    recommendations.push('Bring a rain jacket or umbrella');
    recommendations.push('Pack waterproof footwear');
  }

  if (hasColdDays && hasHotDays) {
    recommendations.push('Pack for variable weather - layers are key');
  }

  return recommendations.slice(0, 5);
}

function generateActivitySuggestions(weather: CurrentWeather, forecast: ForecastDay[]): string[] {
  const suggestions: string[] = [];
  const avgTemp = weather.temperature;
  const hasGoodWeather = forecast.filter(d => d.weatherCode <= 3 && d.precipitationProbability < 30).length > 2;
  const hasRainyDays = forecast.filter(d => d.precipitationProbability > 50).length > 0;

  if (hasGoodWeather) {
    suggestions.push('Great weather for outdoor sightseeing');
    suggestions.push('Perfect conditions for walking tours');
    if (avgTemp > 20) {
      suggestions.push('Consider outdoor dining and rooftop bars');
      suggestions.push('Beach or park activities recommended');
    }
  }

  if (hasRainyDays) {
    suggestions.push('Plan some indoor activities like museums');
    suggestions.push('Good time for local food markets and cafes');
  }

  if (avgTemp < 10) {
    suggestions.push('Warm cafes and indoor attractions recommended');
    suggestions.push('Consider spa or wellness activities');
  }

  if (weather.weatherCode <= 2 && avgTemp > 15 && avgTemp < 28) {
    suggestions.push('Ideal weather for photography');
  }

  return suggestions.slice(0, 4);
}

export class WeatherService {
  private geocodingUrl: string;
  private weatherUrl: string;

  constructor(config: WeatherServiceConfig = {}) {
    this.geocodingUrl = config.geocodingUrl || 'https://geocoding-api.open-meteo.com/v1/search';
    this.weatherUrl = config.weatherUrl || 'https://api.open-meteo.com/v1/forecast';
  }

  async geocodeCity(cityName: string, country?: string): Promise<GeocodingResult | null> {
    try {
      const query = country ? `${cityName}, ${country}` : cityName;
      const response = await fetch(
        `${this.geocodingUrl}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return null;
      }

      const result = data.results[0];
      return {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country,
        country_code: result.country_code,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async getWeather(cityName: string, country?: string): Promise<WeatherData | null> {
    const location = await this.geocodeCity(cityName, country);
    
    if (!location) {
      return null;
    }

    try {
      const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: '7',
      });

      const response = await fetch(`${this.weatherUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Weather API failed: ${response.status}`);
      }

      const data = await response.json();

      const currentWeatherInfo = getWeatherInfo(data.current.weather_code);
      const current: CurrentWeather = {
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        weatherCode: data.current.weather_code,
        weatherDescription: currentWeatherInfo.description,
        weatherIcon: currentWeatherInfo.icon,
        windSpeed: Math.round(data.current.wind_speed_10m),
        isDay: data.current.is_day === 1,
      };

      const forecast: ForecastDay[] = data.daily.time.slice(0, 5).map((date: string, index: number) => {
        const weatherInfo = getWeatherInfo(data.daily.weather_code[index]);
        return {
          date,
          dayName: getDayName(date),
          tempMax: Math.round(data.daily.temperature_2m_max[index]),
          tempMin: Math.round(data.daily.temperature_2m_min[index]),
          weatherCode: data.daily.weather_code[index],
          weatherDescription: weatherInfo.description,
          weatherIcon: weatherInfo.icon,
          precipitationProbability: data.daily.precipitation_probability_max[index] || 0,
        };
      });

      const packingRecommendations = generatePackingRecommendations(current, forecast);
      const activitySuggestions = generateActivitySuggestions(current, forecast);

      return {
        city: location.name,
        country: location.country,
        current,
        forecast,
        packingRecommendations,
        activitySuggestions,
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  }
}

export const weatherService = new WeatherService();
