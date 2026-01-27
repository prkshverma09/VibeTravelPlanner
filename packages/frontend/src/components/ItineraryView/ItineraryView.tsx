'use client';

import { useState } from 'react';
import type { ItineraryDay, ItineraryActivity } from '../../tools/types';
import styles from './ItineraryView.module.css';

interface ItineraryViewProps {
  cityName: string;
  days: ItineraryDay[];
  onAddToTrip?: () => void;
}

export function ItineraryView({ cityName, days, onAddToTrip }: ItineraryViewProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    new Set(days.map((d) => d.day))
  );

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNum)) {
        next.delete(dayNum);
      } else {
        next.add(dayNum);
      }
      return next;
    });
  };

  if (days.length === 0) {
    return (
      <div
        className={styles.container}
        data-testid="itinerary-view"
        role="region"
        aria-label={`${cityName} itinerary`}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span className={styles.cityName}>{cityName}</span> Itinerary
          </h3>
        </div>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📅</span>
          <p>No itinerary generated yet</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      data-testid="itinerary-view"
      role="region"
      aria-label={`${cityName} itinerary`}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>
            <span className={styles.cityName}>{cityName}</span> Itinerary
          </h3>
          <span className={styles.duration}>{days.length} days</span>
        </div>
        {onAddToTrip && (
          <button
            onClick={onAddToTrip}
            className={styles.addButton}
            aria-label="Add to trip plan"
          >
            Add to Trip
          </button>
        )}
      </div>

      <div className={styles.days}>
        {days.map((day) => (
          <div key={day.day} className={styles.day}>
            <button
              className={styles.dayHeader}
              onClick={() => toggleDay(day.day)}
              aria-expanded={expandedDays.has(day.day)}
            >
              <div className={styles.dayInfo}>
                <span className={styles.dayNumber}>Day {day.day}</span>
                <span className={styles.dayTheme}>{day.theme}</span>
              </div>
              <span className={styles.expandIcon}>
                {expandedDays.has(day.day) ? '−' : '+'}
              </span>
            </button>

            {expandedDays.has(day.day) && (
              <div className={styles.activities}>
                {day.activities.map((activity, index) => (
                  <ActivityCard key={`${day.day}-${index}`} activity={activity} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: ItineraryActivity }) {
  return (
    <div className={styles.activity}>
      <div className={styles.activityTime}>
        <span className={styles.timeLabel}>{activity.time}</span>
      </div>
      <div className={styles.activityContent}>
        <h4 className={styles.activityName}>{activity.activity}</h4>
        <p className={styles.activityDescription}>{activity.description}</p>
        {activity.vibeMatch.length > 0 && (
          <div className={styles.vibeTags}>
            {activity.vibeMatch.map((vibe) => (
              <span key={vibe} className={styles.vibeTag}>
                {vibe}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
