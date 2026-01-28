import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherCard } from '../WeatherCard';
import type { WeatherData } from '../../../services/weather.service';

const mockWeatherData: WeatherData = {
  city: 'Tokyo',
  country: 'Japan',
  current: {
    temperature: 22,
    feelsLike: 21,
    humidity: 65,
    weatherCode: 1,
    weatherDescription: 'Mainly clear',
    weatherIcon: '🌤️',
    windSpeed: 12,
    isDay: true,
  },
  forecast: [
    {
      date: '2026-01-28',
      dayName: 'Today',
      tempMax: 24,
      tempMin: 18,
      weatherCode: 1,
      weatherDescription: 'Mainly clear',
      weatherIcon: '🌤️',
      precipitationProbability: 10,
    },
    {
      date: '2026-01-29',
      dayName: 'Tomorrow',
      tempMax: 23,
      tempMin: 17,
      weatherCode: 2,
      weatherDescription: 'Partly cloudy',
      weatherIcon: '⛅',
      precipitationProbability: 20,
    },
    {
      date: '2026-01-30',
      dayName: 'Wed',
      tempMax: 20,
      tempMin: 15,
      weatherCode: 61,
      weatherDescription: 'Slight rain',
      weatherIcon: '🌧️',
      precipitationProbability: 70,
    },
    {
      date: '2026-01-31',
      dayName: 'Thu',
      tempMax: 25,
      tempMin: 19,
      weatherCode: 0,
      weatherDescription: 'Clear sky',
      weatherIcon: '☀️',
      precipitationProbability: 5,
    },
    {
      date: '2026-02-01',
      dayName: 'Fri',
      tempMax: 22,
      tempMin: 16,
      weatherCode: 3,
      weatherDescription: 'Overcast',
      weatherIcon: '☁️',
      precipitationProbability: 30,
    },
  ],
  packingRecommendations: [
    'Pack comfortable light clothing',
    'Bring a light jacket for evenings',
    'Bring a rain jacket or umbrella',
  ],
  activitySuggestions: [
    'Great weather for outdoor sightseeing',
    'Perfect conditions for walking tours',
    'Plan some indoor activities like museums',
  ],
};

describe('WeatherCard', () => {
  it('should render city and country name', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  it('should display current temperature', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getAllByText('22°').length).toBeGreaterThan(0);
  });

  it('should display weather description and icon', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText('Mainly clear')).toBeInTheDocument();
    expect(screen.getAllByText('🌤️').length).toBeGreaterThan(0);
  });

  it('should display feels like temperature', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText(/Feels like 21°/)).toBeInTheDocument();
  });

  it('should display humidity', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText(/65%/)).toBeInTheDocument();
  });

  it('should display wind speed', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  it('should render 5-day forecast', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
  });

  it('should display forecast temperatures', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText('24°')).toBeInTheDocument();
    expect(screen.getByText('18°')).toBeInTheDocument();
  });

  it('should display packing recommendations', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText('Pack comfortable light clothing')).toBeInTheDocument();
    expect(screen.getByText('Bring a light jacket for evenings')).toBeInTheDocument();
  });

  it('should display activity suggestions', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText('Great weather for outdoor sightseeing')).toBeInTheDocument();
  });

  it('should have proper test id', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByTestId('weather-card')).toBeInTheDocument();
  });

  it('should display precipitation probability in forecast', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    expect(screen.getByText('💧 70%')).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(<WeatherCard weather={mockWeatherData} />);

    const card = screen.getByTestId('weather-card');
    expect(card).toHaveAttribute('role', 'region');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Tokyo'));
  });
});
