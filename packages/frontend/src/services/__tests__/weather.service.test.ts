import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getWeather,
  generateTravelAdvice,
  suggestActivities,
  getPackingList,
  type WeatherData,
} from '../weather.service';

const mockWeatherData: WeatherData = {
  city: 'Tokyo',
  country: 'Japan',
  temperature: 22,
  feelsLike: 24,
  humidity: 65,
  condition: 'partly_cloudy',
  conditionText: 'Partly Cloudy',
  windSpeed: 12,
  uvIndex: 5,
  visibility: 10,
  forecast: [
    { date: '2026-02-01', high: 24, low: 18, condition: 'sunny', precipChance: 10 },
    { date: '2026-02-02', high: 22, low: 16, condition: 'cloudy', precipChance: 30 },
    { date: '2026-02-03', high: 20, low: 15, condition: 'rainy', precipChance: 80 },
  ],
};

describe('Weather Service', () => {
  describe('getWeather', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    it('should fetch weather data for a city', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      const result = await getWeather('Tokyo', 'Japan');

      expect(result).toBeDefined();
      expect(result.city).toBe('Tokyo');
      expect(result.temperature).toBe(22);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getWeather('InvalidCity', 'XX')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(getWeather('Tokyo', 'Japan')).rejects.toThrow('Network error');
    });
  });

  describe('generateTravelAdvice', () => {
    it('should generate advice for hot weather', () => {
      const hotWeather: WeatherData = { ...mockWeatherData, temperature: 35, condition: 'sunny' };
      const advice = generateTravelAdvice(hotWeather);

      expect(advice).toContain('hot');
      expect(advice.toLowerCase()).toMatch(/hydrat|water|sunscreen|shade/i);
    });

    it('should generate advice for cold weather', () => {
      const coldWeather: WeatherData = { ...mockWeatherData, temperature: 5, condition: 'cloudy' };
      const advice = generateTravelAdvice(coldWeather);

      expect(advice.toLowerCase()).toMatch(/cold|layer|warm|coat/i);
    });

    it('should generate advice for rainy weather', () => {
      const rainyWeather: WeatherData = { ...mockWeatherData, condition: 'rainy' };
      const advice = generateTravelAdvice(rainyWeather);

      expect(advice.toLowerCase()).toMatch(/rain|umbrella|waterproof/i);
    });

    it('should generate advice for pleasant weather', () => {
      const pleasantWeather: WeatherData = { ...mockWeatherData, temperature: 22, condition: 'sunny' };
      const advice = generateTravelAdvice(pleasantWeather);

      expect(advice.toLowerCase()).toMatch(/pleasant|perfect|great|ideal|outdoor/i);
    });
  });

  describe('suggestActivities', () => {
    it('should suggest outdoor activities for sunny weather', () => {
      const sunnyWeather: WeatherData = { ...mockWeatherData, condition: 'sunny', temperature: 25 };
      const activities = suggestActivities(sunnyWeather);

      expect(activities.length).toBeGreaterThan(0);
      expect(activities.some(a => a.toLowerCase().includes('outdoor') || a.toLowerCase().includes('walk') || a.toLowerCase().includes('park'))).toBe(true);
    });

    it('should suggest indoor activities for rainy weather', () => {
      const rainyWeather: WeatherData = { ...mockWeatherData, condition: 'rainy' };
      const activities = suggestActivities(rainyWeather);

      expect(activities.length).toBeGreaterThan(0);
      expect(activities.some(a => a.toLowerCase().includes('museum') || a.toLowerCase().includes('indoor') || a.toLowerCase().includes('cafe'))).toBe(true);
    });

    it('should suggest weather-appropriate activities for hot weather', () => {
      const hotWeather: WeatherData = { ...mockWeatherData, temperature: 38, condition: 'sunny' };
      const activities = suggestActivities(hotWeather);

      expect(activities.length).toBeGreaterThan(0);
    });
  });

  describe('getPackingList', () => {
    it('should include sunscreen for sunny weather', () => {
      const sunnyWeather: WeatherData = { ...mockWeatherData, condition: 'sunny', uvIndex: 8 };
      const packingList = getPackingList(sunnyWeather);

      expect(packingList.some(item => item.toLowerCase().includes('sunscreen') || item.toLowerCase().includes('sun'))).toBe(true);
    });

    it('should include rain gear for rainy weather', () => {
      const rainyWeather: WeatherData = { ...mockWeatherData, condition: 'rainy' };
      const packingList = getPackingList(rainyWeather);

      expect(packingList.some(item => item.toLowerCase().includes('umbrella') || item.toLowerCase().includes('rain'))).toBe(true);
    });

    it('should include warm layers for cold weather', () => {
      const coldWeather: WeatherData = { ...mockWeatherData, temperature: 5 };
      const packingList = getPackingList(coldWeather);

      expect(packingList.some(item => item.toLowerCase().includes('jacket') || item.toLowerCase().includes('layer') || item.toLowerCase().includes('warm'))).toBe(true);
    });

    it('should return an array of items', () => {
      const packingList = getPackingList(mockWeatherData);

      expect(Array.isArray(packingList)).toBe(true);
      expect(packingList.length).toBeGreaterThan(0);
    });
  });
});
