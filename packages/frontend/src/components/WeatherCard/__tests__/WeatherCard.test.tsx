import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherCard } from '../WeatherCard';
import type { WeatherData } from '@/services/weather.service';

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

describe('WeatherCard', () => {
  describe('Current Weather Display', () => {
    it('should display city name', () => {
      render(<WeatherCard weather={mockWeatherData} />);
      expect(screen.getByText(/Tokyo/)).toBeInTheDocument();
    });

    it('should display current temperature', () => {
      render(<WeatherCard weather={mockWeatherData} />);
      const tempElement = screen.getByTestId('weather-card').querySelector('[class*="tempValue"]');
      expect(tempElement?.textContent).toBe('22°');
    });

    it('should display condition text', () => {
      render(<WeatherCard weather={mockWeatherData} />);
      expect(screen.getByText(/Partly Cloudy/i)).toBeInTheDocument();
    });

    it('should display feels like temperature', () => {
      render(<WeatherCard weather={mockWeatherData} />);
      expect(screen.getByText(/feels like.*24/i)).toBeInTheDocument();
    });

    it('should display humidity', () => {
      render(<WeatherCard weather={mockWeatherData} />);
      expect(screen.getByText(/65%/)).toBeInTheDocument();
    });

    it('should display wind speed', () => {
      render(<WeatherCard weather={mockWeatherData} />);
      expect(screen.getByText(/12.*km\/h/i)).toBeInTheDocument();
    });
  });

  describe('Forecast Display', () => {
    it('should display forecast days', () => {
      render(<WeatherCard weather={mockWeatherData} />);
      expect(screen.getAllByText(/°/).length).toBeGreaterThan(1);
    });

    it('should display forecast section', () => {
      render(<WeatherCard weather={mockWeatherData} />);
      expect(screen.getByText(/3-Day Forecast/i)).toBeInTheDocument();
    });
  });

  describe('Travel Advice', () => {
    it('should show travel advice when showAdvice is true', () => {
      render(<WeatherCard weather={mockWeatherData} showAdvice={true} />);
      expect(screen.getByTestId('travel-advice')).toBeInTheDocument();
    });

    it('should not show travel advice when showAdvice is false', () => {
      render(<WeatherCard weather={mockWeatherData} showAdvice={false} />);
      expect(screen.queryByTestId('travel-advice')).not.toBeInTheDocument();
    });
  });

  describe('Activity Suggestions', () => {
    it('should show activities when showActivities is true', () => {
      render(<WeatherCard weather={mockWeatherData} showActivities={true} />);
      expect(screen.getByTestId('activity-suggestions')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible weather information', () => {
      render(<WeatherCard weather={mockWeatherData} />);
      const card = screen.getByTestId('weather-card');
      expect(card).toBeInTheDocument();
    });
  });
});
