'use client';

import { useCallback, useMemo } from 'react';
import styles from './DateRangeStep.module.css';

export interface DateRange {
  start: string;
  end: string;
  flexible?: boolean;
}

interface DateRangeStepProps {
  value?: DateRange;
  onChange: (dates: DateRange) => void;
  bestTimeToVisit?: string;
}

interface QuickDuration {
  label: string;
  days: number;
}

const QUICK_DURATIONS: QuickDuration[] = [
  { label: 'Weekend', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
];

export function DateRangeStep({ value, onChange, bestTimeToVisit }: DateRangeStepProps) {
  const today = new Date().toISOString().split('T')[0];

  const handleStartChange = useCallback(
    (startDate: string) => {
      const start = `${startDate}T00:00:00.000Z`;
      const currentEnd = value?.end?.split('T')[0] || startDate;
      const end = currentEnd >= startDate ? `${currentEnd}T00:00:00.000Z` : start;
      onChange({ start, end, flexible: value?.flexible });
    },
    [value?.end, value?.flexible, onChange]
  );

  const handleEndChange = useCallback(
    (endDate: string) => {
      const start = value?.start || `${endDate}T00:00:00.000Z`;
      const end = `${endDate}T00:00:00.000Z`;
      onChange({ start, end, flexible: value?.flexible });
    },
    [value?.start, value?.flexible, onChange]
  );

  const handleQuickDuration = useCallback(
    (days: number) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);

      onChange({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        flexible: value?.flexible,
      });
    },
    [value?.flexible, onChange]
  );

  const handleFlexibleToggle = useCallback(() => {
    if (value) {
      onChange({ ...value, flexible: !value.flexible });
    }
  }, [value, onChange]);

  const tripDuration = useMemo(() => {
    if (!value?.start || !value?.end) return null;
    const start = new Date(value.start);
    const end = new Date(value.end);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [value?.start, value?.end]);

  const selectedQuickDuration = useMemo(() => {
    if (!tripDuration) return null;
    const match = QUICK_DURATIONS.find((d) => d.days === tripDuration);
    return match?.days || null;
  }, [tripDuration]);

  const startDateValue = value?.start?.split('T')[0] || '';
  const endDateValue = value?.end?.split('T')[0] || '';

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>When are you traveling?</h3>

      {bestTimeToVisit && (
        <div className={styles.bestTime}>
          <span className={styles.bestTimeIcon}>✨</span>
          Best time to visit: {bestTimeToVisit}
        </div>
      )}

      <fieldset className={styles.fieldset} role="group" aria-label="Travel dates">
        <legend className={styles.legend}>Select your travel dates</legend>

        <div className={styles.dateInputs}>
          <div className={styles.inputGroup}>
            <label htmlFor="start-date" className={styles.label}>
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              className={styles.dateInput}
              min={today}
              value={startDateValue}
              onChange={(e) => handleStartChange(e.target.value)}
              aria-describedby="date-hint"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="end-date" className={styles.label}>
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              className={styles.dateInput}
              min={startDateValue || today}
              value={endDateValue}
              onChange={(e) => handleEndChange(e.target.value)}
            />
          </div>
        </div>

        {tripDuration && (
          <p className={styles.duration}>
            <span className={styles.durationIcon}>📅</span>
            {tripDuration} {tripDuration === 1 ? 'day' : 'days'}
          </p>
        )}
      </fieldset>

      <div className={styles.quickOptions}>
        <span className={styles.quickLabel}>Quick select:</span>
        <div className={styles.quickButtons}>
          {QUICK_DURATIONS.map((duration) => (
            <button
              key={duration.days}
              type="button"
              className={`${styles.quickButton} ${
                selectedQuickDuration === duration.days ? styles.quickButtonActive : ''
              }`}
              onClick={() => handleQuickDuration(duration.days)}
              aria-pressed={selectedQuickDuration === duration.days}
            >
              {duration.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.flexibleOption}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={value?.flexible || false}
            onChange={handleFlexibleToggle}
            aria-label="My dates are flexible"
          />
          <span className={styles.checkboxText}>
            My dates are flexible (±3 days)
          </span>
        </label>
        <p className={styles.flexibleHint} id="date-hint">
          Flexible dates help us find better deals and experiences
        </p>
      </div>
    </div>
  );
}
