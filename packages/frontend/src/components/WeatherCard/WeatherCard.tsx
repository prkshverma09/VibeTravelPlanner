'use client';

import type { WeatherData } from '@/services/weather.service';
import {
  generateTravelAdvice,
  suggestActivities,
  getWeatherIcon,
} from '@/services/weather.service';
import styles from './WeatherCard.module.css';

export interface WeatherCardProps {
  weather: WeatherData;
  showAdvice?: boolean;
  showActivities?: boolean;
  showForecast?: boolean;
  compact?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function WeatherCard({
  weather,
  showAdvice = true,
  showActivities = true,
  showForecast = true,
  compact = false,
}: WeatherCardProps) {
  const advice = generateTravelAdvice(weather);
  const activities = suggestActivities(weather);
  const icon = getWeatherIcon(weather.condition);

  return (
    <div
      className={`${styles.weatherCard} ${compact ? styles.compact : ''}`}
      data-testid="weather-card"
    >
      <div className={styles.header}>
        <div className={styles.location}>
          <h3 className={styles.city}>{weather.city}</h3>
          <span className={styles.country}>{weather.country}</span>
        </div>
        <span className={styles.weatherIcon}>{icon}</span>
      </div>

      <div className={styles.currentWeather}>
        <div className={styles.temperature}>
          <span className={styles.tempValue}>{Math.round(weather.temperature)}°</span>
          <span className={styles.tempUnit}>C</span>
        </div>
        <div className={styles.condition}>
          <span className={styles.conditionText}>{weather.conditionText}</span>
          <span className={styles.feelsLike}>
            Feels like {Math.round(weather.feelsLike)}°
          </span>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>💧</span>
          <span className={styles.detailLabel}>Humidity</span>
          <span className={styles.detailValue}>{weather.humidity}%</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>💨</span>
          <span className={styles.detailLabel}>Wind</span>
          <span className={styles.detailValue}>{weather.windSpeed} km/h</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>☀️</span>
          <span className={styles.detailLabel}>UV Index</span>
          <span className={styles.detailValue}>{weather.uvIndex}</span>
        </div>
      </div>

      {showForecast && weather.forecast.length > 0 && (
        <div className={styles.forecast}>
          <h4 className={styles.forecastTitle}>3-Day Forecast</h4>
          <div className={styles.forecastDays}>
            {weather.forecast.map((day) => (
              <div key={day.date} className={styles.forecastDay}>
                <span className={styles.forecastDate}>{formatDate(day.date)}</span>
                <span className={styles.forecastIcon}>{getWeatherIcon(day.condition)}</span>
                <div className={styles.forecastTemps}>
                  <span className={styles.forecastHigh}>{day.high}°</span>
                  <span className={styles.forecastLow}>{day.low}°</span>
                </div>
                {day.precipChance > 30 && (
                  <span className={styles.precipChance}>💧 {day.precipChance}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdvice && (
        <div className={styles.advice} data-testid="travel-advice">
          <h4 className={styles.adviceTitle}>Travel Advice</h4>
          <p className={styles.adviceText}>{advice}</p>
        </div>
      )}

      {showActivities && activities.length > 0 && (
        <div className={styles.activities} data-testid="activity-suggestions">
          <h4 className={styles.activitiesTitle}>Suggested Activities</h4>
          <ul className={styles.activityList}>
            {activities.map((activity, index) => (
              <li key={index} className={styles.activityItem}>
                {activity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
