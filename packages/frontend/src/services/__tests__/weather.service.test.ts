import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WeatherService, WeatherData } from '../weather.service';

const mockGeocodingResponse = {
  results: [
    {
      name: 'Tokyo',
      latitude: 35.6762,
      longitude: 139.6503,
      country: 'Japan',
      country_code: 'JP',
    },
  ],
};

const mockWeatherResponse = {
  current: {
    temperature_2m: 22.5,
    apparent_temperature: 21.0,
    relative_humidity_2m: 65,
    weather_code: 1,
    wind_speed_10m: 12.5,
    is_day: 1,
  },
  daily: {
    time: ['2026-01-28', '2026-01-29', '2026-01-30', '2026-01-31', '2026-02-01'],
    weather_code: [1, 2, 61, 0, 3],
    temperature_2m_max: [24, 23, 20, 25, 22],
    temperature_2m_min: [18, 17, 15, 19, 16],
    precipitation_probability_max: [10, 20, 70, 5, 30],
  },
};

describe('WeatherService', () => {
  let service: WeatherService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    service = new WeatherService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('geocodeCity', () => {
    it('should return location data for valid city', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeocodingResponse),
      });

      const result = await service.geocodeCity('Tokyo', 'Japan');

      expect(result).toEqual({
        name: 'Tokyo',
        latitude: 35.6762,
        longitude: 139.6503,
        country: 'Japan',
        country_code: 'JP',
      });
    });

    it('should return null for unknown city', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });

      const result = await service.geocodeCity('NonexistentCity');

      expect(result).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await service.geocodeCity('Tokyo');

      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.geocodeCity('Tokyo');

      expect(result).toBeNull();
    });

    it('should include country in query when provided', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeocodingResponse),
      });

      await service.geocodeCity('Paris', 'France');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('Paris%2C%20France')
      );
    });
  });

  describe('getWeather', () => {
    it('should return complete weather data for valid city', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherResponse),
        });

      const result = await service.getWeather('Tokyo', 'Japan');

      expect(result).not.toBeNull();
      expect(result!.city).toBe('Tokyo');
      expect(result!.country).toBe('Japan');
    });

    it('should return current weather with all fields', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherResponse),
        });

      const result = await service.getWeather('Tokyo');

      expect(result!.current).toEqual({
        temperature: 23,
        feelsLike: 21,
        humidity: 65,
        weatherCode: 1,
        weatherDescription: 'Mainly clear',
        weatherIcon: '🌤️',
        windSpeed: 13,
        isDay: true,
      });
    });

    it('should return 5-day forecast', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherResponse),
        });

      const result = await service.getWeather('Tokyo');

      expect(result!.forecast).toHaveLength(5);
      expect(result!.forecast[0]).toHaveProperty('date');
      expect(result!.forecast[0]).toHaveProperty('dayName');
      expect(result!.forecast[0]).toHaveProperty('tempMax');
      expect(result!.forecast[0]).toHaveProperty('tempMin');
      expect(result!.forecast[0]).toHaveProperty('weatherDescription');
      expect(result!.forecast[0]).toHaveProperty('weatherIcon');
      expect(result!.forecast[0]).toHaveProperty('precipitationProbability');
    });

    it('should return null when city not found', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });

      const result = await service.getWeather('NonexistentCity');

      expect(result).toBeNull();
    });

    it('should handle weather API errors gracefully', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const result = await service.getWeather('Tokyo');

      expect(result).toBeNull();
    });

    it('should generate packing recommendations', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherResponse),
        });

      const result = await service.getWeather('Tokyo');

      expect(result!.packingRecommendations).toBeInstanceOf(Array);
      expect(result!.packingRecommendations.length).toBeGreaterThan(0);
      expect(result!.packingRecommendations.length).toBeLessThanOrEqual(5);
    });

    it('should generate activity suggestions', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherResponse),
        });

      const result = await service.getWeather('Tokyo');

      expect(result!.activitySuggestions).toBeInstanceOf(Array);
      expect(result!.activitySuggestions.length).toBeGreaterThan(0);
      expect(result!.activitySuggestions.length).toBeLessThanOrEqual(4);
    });

    it('should recommend rain gear when rain is forecasted', async () => {
      const rainyResponse = {
        ...mockWeatherResponse,
        daily: {
          ...mockWeatherResponse.daily,
          precipitation_probability_max: [80, 90, 70, 60, 50],
        },
      };

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(rainyResponse),
        });

      const result = await service.getWeather('Tokyo');

      expect(result!.packingRecommendations.some(r => 
        r.toLowerCase().includes('rain') || r.toLowerCase().includes('umbrella')
      )).toBe(true);
    });

    it('should recommend warm clothing for cold weather', async () => {
      const coldResponse = {
        current: {
          ...mockWeatherResponse.current,
          temperature_2m: 5,
          apparent_temperature: 2,
        },
        daily: {
          ...mockWeatherResponse.daily,
          temperature_2m_max: [8, 7, 6, 9, 7],
          temperature_2m_min: [0, -1, -2, 1, 0],
        },
      };

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(coldResponse),
        });

      const result = await service.getWeather('Tokyo');

      expect(result!.packingRecommendations.some(r => 
        r.toLowerCase().includes('warm') || r.toLowerCase().includes('winter') || r.toLowerCase().includes('jacket')
      )).toBe(true);
    });
  });

  describe('weather code mapping', () => {
    it('should map clear sky code correctly', async () => {
      const clearResponse = {
        ...mockWeatherResponse,
        current: { ...mockWeatherResponse.current, weather_code: 0 },
      };

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(clearResponse),
        });

      const result = await service.getWeather('Tokyo');

      expect(result!.current.weatherDescription).toBe('Clear sky');
      expect(result!.current.weatherIcon).toBe('☀️');
    });

    it('should map rain code correctly', async () => {
      const rainyResponse = {
        ...mockWeatherResponse,
        current: { ...mockWeatherResponse.current, weather_code: 63 },
      };

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(rainyResponse),
        });

      const result = await service.getWeather('Tokyo');

      expect(result!.current.weatherDescription).toBe('Moderate rain');
      expect(result!.current.weatherIcon).toBe('🌧️');
    });

    it('should map thunderstorm code correctly', async () => {
      const stormResponse = {
        ...mockWeatherResponse,
        current: { ...mockWeatherResponse.current, weather_code: 95 },
      };

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(stormResponse),
        });

      const result = await service.getWeather('Tokyo');

      expect(result!.current.weatherDescription).toBe('Thunderstorm');
      expect(result!.current.weatherIcon).toBe('⛈️');
    });
  });
});
