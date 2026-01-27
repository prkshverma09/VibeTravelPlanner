'use client';

import type { AlgoliaCity } from '@vibe-travel/shared';
import styles from './ComparisonTable.module.css';

interface ComparisonTableProps {
  cities: AlgoliaCity[];
  focusAttributes?: string[];
  recommendation?: string | null;
  onSelect?: (city: AlgoliaCity) => void;
  onClose?: () => void;
}

const DEFAULT_ATTRIBUTES = [
  'culture_score',
  'adventure_score',
  'nature_score',
  'beach_score',
  'nightlife_score',
];

const ATTRIBUTE_LABELS: Record<string, string> = {
  culture_score: 'Culture',
  adventure_score: 'Adventure',
  nature_score: 'Nature',
  beach_score: 'Beach',
  nightlife_score: 'Nightlife',
  climate_type: 'Climate',
  best_time_to_visit: 'Best Time',
};

const SCORE_ATTRIBUTES = [
  'culture_score',
  'adventure_score',
  'nature_score',
  'beach_score',
  'nightlife_score',
];

export function ComparisonTable({
  cities,
  focusAttributes,
  recommendation,
  onSelect,
  onClose,
}: ComparisonTableProps) {
  const attributes = focusAttributes?.length ? focusAttributes : DEFAULT_ATTRIBUTES;

  const getHighestScoreCity = (attr: string): string | null => {
    if (!SCORE_ATTRIBUTES.includes(attr)) return null;

    let highest = -1;
    let highestId = '';

    cities.forEach((city) => {
      const score = city[attr as keyof AlgoliaCity] as number;
      if (score > highest) {
        highest = score;
        highestId = city.objectID;
      }
    });

    return highestId;
  };

  const renderScoreBar = (score: number, isHighest: boolean) => {
    const percentage = (score / 10) * 100;
    return (
      <div className={styles.scoreContainer}>
        <div className={styles.scoreBar}>
          <div
            className={`${styles.scoreFill} ${isHighest ? styles.highest : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`${styles.scoreValue} ${isHighest ? styles.highestValue : ''}`}>
          {score}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.container} data-testid="comparison-table">
      {onClose && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close comparison"
        >
          ×
        </button>
      )}

      <table className={styles.table} role="table">
        <thead>
          <tr>
            <th className={styles.attributeHeader} role="columnheader">
              Attribute
            </th>
            {cities.map((city) => (
              <th key={city.objectID} className={styles.cityHeader} role="columnheader">
                <div className={styles.cityInfo}>
                  <img
                    src={city.image_url}
                    alt={city.city}
                    className={styles.cityImage}
                  />
                  <span className={styles.cityName}>{city.city}</span>
                  <span className={styles.countryName}>{city.country}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr) => {
            const highestId = getHighestScoreCity(attr);
            const isScoreAttr = SCORE_ATTRIBUTES.includes(attr);

            return (
              <tr key={attr}>
                <td className={styles.attributeCell}>
                  {ATTRIBUTE_LABELS[attr] || attr}
                </td>
                {cities.map((city) => {
                  const value = city[attr as keyof AlgoliaCity];
                  const isHighest = city.objectID === highestId;

                  return (
                    <td
                      key={city.objectID}
                      className={`${styles.valueCell} ${isHighest ? styles.highestCell : ''}`}
                    >
                      {isScoreAttr ? (
                        renderScoreBar(value as number, isHighest)
                      ) : (
                        <span className={styles.textValue}>{String(value)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr>
            <td className={styles.attributeCell}>Vibe Tags</td>
            {cities.map((city) => (
              <td key={city.objectID} className={styles.valueCell}>
                <div className={styles.vibeTags}>
                  {city.vibe_tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={styles.vibeTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {recommendation && (
        <div className={styles.recommendation}>
          <strong>Recommendation:</strong> {recommendation}
        </div>
      )}

      {onSelect && (
        <div className={styles.actions}>
          {cities.map((city) => (
            <button
              key={city.objectID}
              onClick={() => onSelect(city)}
              className={styles.selectButton}
              aria-label={`Choose ${city.city}`}
            >
              Choose {city.city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
