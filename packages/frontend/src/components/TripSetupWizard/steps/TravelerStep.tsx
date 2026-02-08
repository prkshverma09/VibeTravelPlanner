'use client';

import { useCallback, useMemo } from 'react';
import styles from './TravelerStep.module.css';

export interface TravelerData {
  adults: number;
  children: number;
  childrenAges?: number[];
}

interface TravelerStepProps {
  value?: TravelerData;
  onChange: (travelers: TravelerData) => void;
}

interface Preset {
  label: string;
  icon: string;
  adults: number;
  children: number;
}

const PRESETS: Preset[] = [
  { label: 'Solo', icon: '🧍', adults: 1, children: 0 },
  { label: 'Couple', icon: '👫', adults: 2, children: 0 },
  { label: 'Family', icon: '👨‍👩‍👧‍👦', adults: 2, children: 2 },
  { label: 'Group', icon: '👥', adults: 4, children: 0 },
];

const MAX_ADULTS = 10;
const MIN_ADULTS = 1;
const MAX_CHILDREN = 6;
const MIN_CHILDREN = 0;
const MAX_CHILD_AGE = 17;

const defaultValue: TravelerData = { adults: 2, children: 0 };

export function TravelerStep({ value = defaultValue, onChange }: TravelerStepProps) {
  const travelers = value;

  const handleAdultsChange = useCallback(
    (delta: number) => {
      const newAdults = Math.max(MIN_ADULTS, Math.min(MAX_ADULTS, travelers.adults + delta));
      if (newAdults !== travelers.adults) {
        onChange({ ...travelers, adults: newAdults });
      }
    },
    [travelers, onChange]
  );

  const handleChildrenChange = useCallback(
    (delta: number) => {
      const newChildren = Math.max(MIN_CHILDREN, Math.min(MAX_CHILDREN, travelers.children + delta));
      if (newChildren !== travelers.children) {
        const currentAges = travelers.childrenAges || [];
        let newAges: number[];

        if (newChildren > travelers.children) {
          newAges = [...currentAges];
          while (newAges.length < newChildren) {
            newAges.push(0);
          }
        } else {
          newAges = currentAges.slice(0, newChildren);
        }

        onChange({ ...travelers, children: newChildren, childrenAges: newAges });
      }
    },
    [travelers, onChange]
  );

  const handleChildAgeChange = useCallback(
    (index: number, age: number) => {
      const currentAges = travelers.childrenAges || Array(travelers.children).fill(0);
      const newAges = [...currentAges];
      newAges[index] = age;
      onChange({ ...travelers, childrenAges: newAges });
    },
    [travelers, onChange]
  );

  const handlePresetSelect = useCallback(
    (preset: Preset) => {
      onChange({ adults: preset.adults, children: preset.children });
    },
    [onChange]
  );

  const totalTravelers = travelers.adults + travelers.children;

  const selectedPreset = useMemo(() => {
    return PRESETS.find(
      (p) => p.adults === travelers.adults && p.children === travelers.children
    );
  }, [travelers.adults, travelers.children]);

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Who's traveling?</h3>

      <div className={styles.presets}>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={`${styles.presetButton} ${
              selectedPreset?.label === preset.label ? styles.presetActive : ''
            }`}
            onClick={() => handlePresetSelect(preset)}
            aria-pressed={selectedPreset?.label === preset.label}
          >
            <span className={styles.presetIcon}>{preset.icon}</span>
            <span className={styles.presetLabel}>{preset.label}</span>
          </button>
        ))}
      </div>

      <fieldset className={styles.fieldset} role="group" aria-label="Number of travelers">
        <legend className={styles.legend}>Select travelers</legend>

        <div className={styles.counters}>
          <div className={styles.counterRow}>
            <div className={styles.counterInfo}>
              <span id="adults-label" className={styles.counterLabel}>
                Adults
              </span>
              <span className={styles.counterDescription}>Ages 18+</span>
            </div>
            <div className={styles.counter}>
              <button
                type="button"
                className={styles.counterBtn}
                onClick={() => handleAdultsChange(-1)}
                disabled={travelers.adults <= MIN_ADULTS}
                aria-label="Decrease adults"
                aria-describedby="adults-label"
              >
                −
              </button>
              <span
                className={styles.counterValue}
                data-testid="adults-count"
                aria-label="Adults"
                aria-live="polite"
              >
                {travelers.adults}
              </span>
              <button
                type="button"
                className={styles.counterBtn}
                onClick={() => handleAdultsChange(1)}
                disabled={travelers.adults >= MAX_ADULTS}
                aria-label="Increase adults"
                aria-describedby="adults-label"
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.counterRow}>
            <div className={styles.counterInfo}>
              <span id="children-label" className={styles.counterLabel}>
                Children
              </span>
              <span className={styles.counterDescription}>Ages 0-17</span>
            </div>
            <div className={styles.counter}>
              <button
                type="button"
                className={styles.counterBtn}
                onClick={() => handleChildrenChange(-1)}
                disabled={travelers.children <= MIN_CHILDREN}
                aria-label="Decrease children"
                aria-describedby="children-label"
              >
                −
              </button>
              <span
                className={styles.counterValue}
                data-testid="children-count"
                aria-label="Children"
                aria-live="polite"
              >
                {travelers.children}
              </span>
              <button
                type="button"
                className={styles.counterBtn}
                onClick={() => handleChildrenChange(1)}
                disabled={travelers.children >= MAX_CHILDREN}
                aria-label="Increase children"
                aria-describedby="children-label"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {travelers.children > 0 && (
          <div className={styles.childrenAges}>
            <h4 className={styles.agesHeading}>Children's ages</h4>
            <p className={styles.agesDescription}>
              This helps us recommend age-appropriate activities
            </p>
            <div className={styles.ageInputs}>
              {Array.from({ length: travelers.children }, (_, i) => (
                <div key={i} className={styles.ageInput}>
                  <label htmlFor={`child-age-${i}`} className={styles.ageLabel}>
                    Child {i + 1} age
                  </label>
                  <select
                    id={`child-age-${i}`}
                    className={styles.ageSelect}
                    value={travelers.childrenAges?.[i] ?? 0}
                    onChange={(e) => handleChildAgeChange(i, parseInt(e.target.value, 10))}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: MAX_CHILD_AGE + 1 }, (_, age) => (
                      <option key={age} value={age}>
                        {age === 0 ? 'Under 1' : age}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <div className={styles.summary}>
        <span className={styles.summaryIcon}>🧳</span>
        <span className={styles.summaryText}>
          {totalTravelers} {totalTravelers === 1 ? 'traveler' : 'travelers'}
        </span>
      </div>
    </div>
  );
}
