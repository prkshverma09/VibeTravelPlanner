'use client';

import { useCallback } from 'react';
import styles from './PreferenceStep.module.css';

export type BudgetLevel = 'budget' | 'moderate' | 'luxury' | 'unlimited';
export type Pace = 'relaxed' | 'moderate' | 'packed';
export type Mobility = 'full' | 'limited' | 'wheelchair';
export type TripStyleOption =
  | 'Cultural Immersion'
  | 'Adventure & Outdoors'
  | 'Food & Culinary'
  | 'Relaxation & Wellness'
  | 'Nightlife & Entertainment'
  | 'Shopping & Markets'
  | 'Photography & Sightseeing'
  | 'Family-Friendly'
  | 'Romantic Getaway'
  | 'Business + Leisure';

export interface PreferenceData {
  budgetLevel: BudgetLevel;
  tripStyle: TripStyleOption[];
  pace: Pace;
  interests?: string[];
  mobility?: Mobility;
}

interface PreferenceStepProps {
  value?: PreferenceData;
  onChange: (preferences: PreferenceData) => void;
}

const BUDGET_OPTIONS: { value: BudgetLevel; label: string; description: string; icon: string }[] = [
  { value: 'budget', label: 'Budget', description: '$50-100/day', icon: '💰' },
  { value: 'moderate', label: 'Moderate', description: '$100-200/day', icon: '💳' },
  { value: 'luxury', label: 'Luxury', description: '$200-500/day', icon: '✨' },
  { value: 'unlimited', label: 'Unlimited', description: 'No limit', icon: '👑' },
];

const TRIP_STYLES: { value: TripStyleOption; icon: string }[] = [
  { value: 'Cultural Immersion', icon: '🏛️' },
  { value: 'Adventure & Outdoors', icon: '🏔️' },
  { value: 'Food & Culinary', icon: '🍽️' },
  { value: 'Relaxation & Wellness', icon: '🧘' },
  { value: 'Nightlife & Entertainment', icon: '🎭' },
  { value: 'Shopping & Markets', icon: '🛍️' },
  { value: 'Photography & Sightseeing', icon: '📸' },
  { value: 'Family-Friendly', icon: '👨‍👩‍👧‍👦' },
  { value: 'Romantic Getaway', icon: '💑' },
  { value: 'Business + Leisure', icon: '💼' },
];

const PACE_OPTIONS: { value: Pace; label: string; description: string }[] = [
  { value: 'relaxed', label: 'Relaxed', description: '2-3 activities per day' },
  { value: 'moderate', label: 'Moderate Pace', description: '4-5 activities per day' },
  { value: 'packed', label: 'Packed', description: '6-8 activities per day' },
];

const MOBILITY_OPTIONS: { value: Mobility; label: string; description: string }[] = [
  { value: 'full', label: 'Full Mobility', description: 'No restrictions' },
  { value: 'limited', label: 'Limited Mobility', description: 'Prefer minimal walking' },
  { value: 'wheelchair', label: 'Wheelchair Accessible', description: 'Require accessible venues' },
];

const INTERESTS: string[] = [
  'history',
  'architecture',
  'nature',
  'art',
  'music',
  'sports',
  'technology',
  'photography',
  'wildlife',
  'beaches',
  'mountains',
  'local culture',
];

const defaultValue: PreferenceData = {
  budgetLevel: 'moderate',
  tripStyle: [],
  pace: 'moderate',
  interests: [],
  mobility: 'full',
};

export function PreferenceStep({ value = defaultValue, onChange }: PreferenceStepProps) {
  const preferences = value;

  const handleBudgetChange = useCallback(
    (budgetLevel: BudgetLevel) => {
      onChange({ ...preferences, budgetLevel });
    },
    [preferences, onChange]
  );

  const handleStyleToggle = useCallback(
    (style: TripStyleOption) => {
      const currentStyles = preferences.tripStyle || [];
      const newStyles = currentStyles.includes(style)
        ? currentStyles.filter((s) => s !== style)
        : [...currentStyles, style];
      onChange({ ...preferences, tripStyle: newStyles });
    },
    [preferences, onChange]
  );

  const handlePaceChange = useCallback(
    (pace: Pace) => {
      onChange({ ...preferences, pace });
    },
    [preferences, onChange]
  );

  const handleMobilityChange = useCallback(
    (mobility: Mobility) => {
      onChange({ ...preferences, mobility });
    },
    [preferences, onChange]
  );

  const handleInterestToggle = useCallback(
    (interest: string) => {
      const currentInterests = preferences.interests || [];
      const newInterests = currentInterests.includes(interest)
        ? currentInterests.filter((i) => i !== interest)
        : [...currentInterests, interest];
      onChange({ ...preferences, interests: newInterests });
    },
    [preferences, onChange]
  );

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Trip Preferences</h3>

      <fieldset className={styles.section} role="group" aria-label="Budget level">
        <legend className={styles.sectionTitle}>Budget Level</legend>
        <div className={styles.budgetOptions} role="radiogroup" aria-label="Budget level">
          {BUDGET_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.budgetOption} ${
                preferences.budgetLevel === option.value ? styles.budgetActive : ''
              }`}
            >
              <input
                type="radio"
                name="budget"
                value={option.value}
                checked={preferences.budgetLevel === option.value}
                onChange={() => handleBudgetChange(option.value)}
                className={styles.radioInput}
                aria-label={option.label}
              />
              <span className={styles.budgetIcon}>{option.icon}</span>
              <span className={styles.budgetLabel}>{option.label}</span>
              <span className={styles.budgetDescription}>{option.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Trip Style</h4>
        <p className={styles.sectionHint}>Select all that interest you</p>
        <div className={styles.styleOptions}>
          {TRIP_STYLES.map((style) => (
            <label
              key={style.value}
              className={`${styles.styleOption} ${
                preferences.tripStyle?.includes(style.value) ? styles.styleActive : ''
              }`}
            >
              <input
                type="checkbox"
                checked={preferences.tripStyle?.includes(style.value) || false}
                onChange={() => handleStyleToggle(style.value)}
                className={styles.checkboxInput}
                aria-label={style.value}
              />
              <span className={styles.styleIcon}>{style.icon}</span>
              <span className={styles.styleLabel}>{style.value}</span>
            </label>
          ))}
        </div>
      </div>

      <fieldset className={styles.section} role="group" aria-label="Pace">
        <legend className={styles.sectionTitle}>Pace</legend>
        <div className={styles.paceOptions} role="radiogroup" aria-label="Trip pace">
          {PACE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.paceOption} ${
                preferences.pace === option.value ? styles.paceActive : ''
              }`}
            >
              <input
                type="radio"
                name="pace"
                value={option.value}
                checked={preferences.pace === option.value}
                onChange={() => handlePaceChange(option.value)}
                className={styles.radioInput}
                aria-label={option.label}
              />
              <span className={styles.paceLabel}>{option.label}</span>
              <span className={styles.paceDescription}>{option.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Interests</h4>
        <p className={styles.sectionHint}>Help us personalize recommendations</p>
        <div className={styles.interestTags}>
          {INTERESTS.map((interest) => (
            <label
              key={interest}
              className={`${styles.interestTag} ${
                preferences.interests?.includes(interest) ? styles.interestActive : ''
              }`}
            >
              <input
                type="checkbox"
                checked={preferences.interests?.includes(interest) || false}
                onChange={() => handleInterestToggle(interest)}
                className={styles.checkboxInput}
                aria-label={interest}
              />
              {interest}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Accessibility</h4>
        <div className={styles.mobilityOptions} role="radiogroup" aria-label="Mobility options">
          {MOBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.mobilityOption} ${
                preferences.mobility === option.value ? styles.mobilityActive : ''
              }`}
            >
              <input
                type="radio"
                name="mobility"
                value={option.value}
                checked={preferences.mobility === option.value}
                onChange={() => handleMobilityChange(option.value)}
                className={styles.radioInput}
                aria-label={option.label}
              />
              <span className={styles.mobilityLabel}>{option.label}</span>
              <span className={styles.mobilityDescription}>{option.description}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
