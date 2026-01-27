'use client';

import { useTripContext } from '../../context/TripContext';
import styles from './ActivePreferences.module.css';

const categoryIcons: Record<string, string> = {
  vibe: '✨',
  geography: '🌍',
  budget: '💰',
  activity: '🎯',
  travel_style: '👥',
  constraint: '📊',
};

export function ActivePreferences() {
  const { state, dispatch, hasPreferences } = useTripContext();

  if (!hasPreferences) {
    return null;
  }

  const handleRemove = (category: string, value: string) => {
    dispatch({
      type: 'REMOVE_PREFERENCE',
      payload: { category, value },
    });
  };

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_PREFERENCES', payload: { category: 'all' } });
  };

  return (
    <div
      className={styles.container}
      data-testid="active-preferences"
      role="region"
      aria-label="Active search filters"
    >
      <div className={styles.header}>
        <span className={styles.title}>Active Filters</span>
        <button
          onClick={handleClearAll}
          className={styles.clearAll}
          aria-label="Clear all preferences"
        >
          Clear all
        </button>
      </div>
      <div className={styles.tags}>
        {state.preferences.map((pref, index) => (
          <span
            key={`${pref.category}-${pref.value}-${index}`}
            className={`${styles.tag} ${styles[pref.priority]}`}
          >
            <span className={styles.icon} aria-hidden="true">
              {categoryIcons[pref.category] || '📌'}
            </span>
            <span className={styles.value}>{pref.value}</span>
            <button
              onClick={() => handleRemove(pref.category, pref.value)}
              className={styles.remove}
              aria-label={`Remove ${pref.value} filter`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
