'use client';

import { useMemo } from 'react';
import styles from './ReviewStep.module.css';
import type { BudgetLevel, Pace, Mobility, TripStyleOption } from './PreferenceStep';

export interface ReviewData {
  destination: {
    objectID: string;
    city: string;
    country: string;
  };
  dates: {
    start: string;
    end: string;
    flexible?: boolean;
  } | null;
  travelers: {
    adults: number;
    children: number;
    childrenAges?: number[];
  };
  preferences: {
    budgetLevel: BudgetLevel;
    tripStyle: TripStyleOption[];
    pace: Pace;
    interests?: string[];
    mobility?: Mobility;
  };
}

interface ReviewStepProps {
  data: ReviewData;
  onEdit: (step: number) => void;
}

const BUDGET_DESCRIPTIONS: Record<BudgetLevel, string> = {
  budget: '$50-100/day',
  moderate: '$100-200/day',
  luxury: '$200-500/day',
  unlimited: 'No limit',
};

const PACE_LABELS: Record<Pace, string> = {
  relaxed: 'Relaxed',
  moderate: 'Moderate',
  packed: 'Packed',
};

export function ReviewStep({ data, onEdit }: ReviewStepProps) {
  const { destination, dates, travelers, preferences } = data;

  const tripDuration = useMemo(() => {
    if (!dates?.start || !dates?.end) return null;
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [dates?.start, dates?.end]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalTravelers = travelers.adults + travelers.children;

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Review Your Trip</h3>

      <div className={styles.summary}>
        <div className={styles.summaryIcon}>✈️</div>
        <div className={styles.summaryText}>
          <span className={styles.summaryDestination}>{destination.city}</span>
          {tripDuration && (
            <span className={styles.summaryDuration}>{tripDuration} days</span>
          )}
        </div>
      </div>

      <section className={styles.section} role="region" aria-label="Destination">
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Destination</h4>
        </div>
        <div className={styles.sectionContent}>
          <p className={styles.destination}>
            <span className={styles.city}>{destination.city}</span>
            <span className={styles.country}>{destination.country}</span>
          </p>
        </div>
      </section>

      <section
        className={`${styles.section} ${!dates ? styles.sectionWarning : ''}`}
        role="region"
        aria-label="Dates"
        data-warning={!dates}
      >
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Travel Dates</h4>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => onEdit(0)}
            aria-label="Edit dates"
          >
            Edit
          </button>
        </div>
        <div className={styles.sectionContent}>
          {dates ? (
            <div className={styles.dateRange}>
              <span className={styles.dateStart}>{formatDate(dates.start)}</span>
              <span className={styles.dateSeparator}>→</span>
              <span className={styles.dateEnd}>{formatDate(dates.end)}</span>
              {tripDuration && (
                <span className={styles.dateDuration}>({tripDuration} days)</span>
              )}
              {dates.flexible && (
                <span className={styles.flexible}>± Flexible</span>
              )}
            </div>
          ) : (
            <p className={styles.warning}>Please select dates</p>
          )}
        </div>
      </section>

      <section className={styles.section} role="region" aria-label="Travelers">
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Travelers</h4>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => onEdit(1)}
            aria-label="Edit travelers"
          >
            Edit
          </button>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.travelers}>
            <span className={styles.travelerCount}>
              {travelers.adults} {travelers.adults === 1 ? 'adult' : 'adults'}
            </span>
            {travelers.children > 0 && (
              <>
                <span className={styles.travelerSeparator}>•</span>
                <span className={styles.travelerCount}>
                  {travelers.children} {travelers.children === 1 ? 'child' : 'children'}
                </span>
              </>
            )}
          </div>
          {travelers.children > 0 && travelers.childrenAges && travelers.childrenAges.length > 0 && (
            <div className={styles.childrenAges}>
              {travelers.childrenAges.map((age, i) => (
                <span key={i} className={styles.childAge}>
                  Age {age}
                </span>
              ))}
            </div>
          )}
          <p className={styles.totalTravelers}>
            {totalTravelers} {totalTravelers === 1 ? 'traveler' : 'travelers'} total
          </p>
        </div>
      </section>

      <section className={styles.section} role="region" aria-label="Preferences">
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Trip Preferences</h4>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => onEdit(2)}
            aria-label="Edit preferences"
          >
            Edit
          </button>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.preferenceRow}>
            <span className={styles.preferenceLabel}>Budget</span>
            <span className={styles.preferenceValue}>
              {preferences.budgetLevel.charAt(0).toUpperCase() + preferences.budgetLevel.slice(1)}
              <span className={styles.budgetRange}>
                {BUDGET_DESCRIPTIONS[preferences.budgetLevel]}
              </span>
            </span>
          </div>

          <div className={styles.preferenceRow}>
            <span className={styles.preferenceLabel}>Pace</span>
            <span className={styles.preferenceValue}>
              {PACE_LABELS[preferences.pace]}
            </span>
          </div>

          {preferences.tripStyle.length > 0 && (
            <div className={styles.styleTags}>
              {preferences.tripStyle.map((style) => (
                <span key={style} className={styles.styleTag}>
                  {style}
                </span>
              ))}
            </div>
          )}

          {preferences.interests && preferences.interests.length > 0 && (
            <div className={styles.interests}>
              <span className={styles.interestLabel}>Interests:</span>
              {preferences.interests.map((interest) => (
                <span key={interest} className={styles.interestTag}>
                  {interest}
                </span>
              ))}
            </div>
          )}

          {preferences.mobility && preferences.mobility !== 'full' && (
            <div className={styles.accessibility}>
              <span className={styles.accessibilityIcon}>♿</span>
              <span className={styles.accessibilityLabel}>
                {preferences.mobility === 'wheelchair'
                  ? 'Wheelchair accessible'
                  : 'Limited mobility'}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
