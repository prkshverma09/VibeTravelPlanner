'use client';

import type { WeatherData } from '../../services/weather.service';
import styles from './WeatherCard.module.css';

interface WeatherCardProps {
  weather: WeatherData;
  onClose?: () => void;
}

export function WeatherCard({ weather, onClose }: WeatherCardProps) {
  return (
    <div
      className={styles.container}
      data-testid="weather-card"
      role="region"
      aria-label={`Weather forecast for ${weather.city}, ${weather.country}`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close weather card"
        >
          ×
        </button>
      )}

      <div className={styles.header}>
        <div className={styles.location}>
          <h3 className={styles.city}>{weather.city}</h3>
          <span className={styles.country}>{weather.country}</span>
        </div>
        <div className={styles.currentWeather}>
          <span className={styles.weatherIcon}>{weather.current.weatherIcon}</span>
          <span className={styles.temperature}>{weather.current.temperature}°</span>
          <span className={styles.description}>{weather.current.weatherDescription}</span>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Feels like</span>
          <span className={styles.detailValue}>Feels like {weather.current.feelsLike}°</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Humidity</span>
          <span className={styles.detailValue}>💧 {weather.current.humidity}%</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Wind</span>
          <span className={styles.detailValue}>💨 {weather.current.windSpeed} km/h</span>
        </div>
      </div>

      <div className={styles.forecast}>
        <h4 className={styles.forecastTitle}>5-Day Forecast</h4>
        <div className={styles.forecastDays}>
          {weather.forecast.map((day) => (
            <div key={day.date} className={styles.forecastDay}>
              <span className={styles.dayName}>{day.dayName}</span>
              <span className={styles.dayIcon}>{day.weatherIcon}</span>
              <div className={styles.dayTemps}>
                <span className={styles.tempMax}>{day.tempMax}°</span>
                <span className={styles.tempMin}>{day.tempMin}°</span>
              </div>
              {day.precipitationProbability > 0 && (
                <span className={styles.precipitation}>
                  💧 {day.precipitationProbability}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {weather.packingRecommendations.length > 0 && (
        <div className={styles.recommendations}>
          <h4 className={styles.recommendationsTitle}>🎒 What to Pack</h4>
          <ul className={styles.recommendationsList}>
            {weather.packingRecommendations.map((rec, index) => (
              <li key={index} className={styles.recommendationItem}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {weather.activitySuggestions.length > 0 && (
        <div className={styles.activities}>
          <h4 className={styles.activitiesTitle}>🎯 Activity Ideas</h4>
          <ul className={styles.activitiesList}>
            {weather.activitySuggestions.map((activity, index) => (
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
