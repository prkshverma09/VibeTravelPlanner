'use client';

import type { BudgetEstimate } from '@/services/budget.service';
import { formatCurrency } from '@/services/budget.service';
import styles from './BudgetEstimator.module.css';

export interface BudgetEstimatorProps {
  estimate: BudgetEstimate;
  showBreakdown?: boolean;
  showTips?: boolean;
  onAddToTrip?: () => void;
  compact?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  accommodation: '🏨',
  food: '🍽️',
  activities: '🎭',
  transport: '🚌',
  miscellaneous: '📦',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'High confidence estimate',
  medium: 'Moderate confidence estimate',
  low: 'Rough estimate',
};

export function BudgetEstimator({
  estimate,
  showBreakdown = true,
  showTips = true,
  onAddToTrip,
  compact = false,
}: BudgetEstimatorProps) {
  const {
    totalEstimate,
    perPersonTotal,
    breakdown,
    currency,
    travelStyle,
    durationDays,
    travelers,
    cityName,
    confidence,
    tips,
  } = estimate;

  return (
    <div
      className={`${styles.budgetEstimator} ${compact ? styles.compact : ''}`}
      data-testid="budget-estimator"
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon}>💰</span>
          <div>
            <h3 className={styles.title}>Trip Budget</h3>
            <span className={styles.destination}>{cityName}</span>
          </div>
        </div>
        <div
          className={styles.confidence}
          data-testid="confidence-indicator"
          data-confidence={confidence}
        >
          <span className={styles.confidenceDot} />
          <span className={styles.confidenceLabel}>{CONFIDENCE_LABELS[confidence]}</span>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.totalEstimate}>
          <span className={styles.totalLabel}>Total Estimated Cost</span>
          <span className={styles.totalValue}>
            {formatCurrency(totalEstimate, currency)}
          </span>
        </div>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.detailValue}>
              {formatCurrency(perPersonTotal, currency)}/person
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailValue}>{durationDays} days</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailValue}>{travelers} travelers</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.travelStyle}>{travelStyle}</span>
          </div>
        </div>
      </div>

      {showBreakdown && (
        <div className={styles.breakdown}>
          <h4 className={styles.breakdownTitle}>Cost Breakdown</h4>
          <div className={styles.breakdownItems}>
            {Object.entries(breakdown).map(([category, amount]) => (
              <div key={category} className={styles.breakdownItem}>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryIcon}>
                    {CATEGORY_ICONS[category] || '📍'}
                  </span>
                  <span className={styles.categoryName}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </div>
                <span className={styles.categoryAmount}>
                  {formatCurrency(amount, currency)}
                </span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(amount / totalEstimate) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTips && tips.length > 0 && (
        <div className={styles.tips}>
          <h4 className={styles.tipsTitle}>💡 Budget Tips</h4>
          <ul className={styles.tipsList}>
            {tips.map((tip, index) => (
              <li key={index} className={styles.tipItem}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onAddToTrip && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.addButton}
            onClick={onAddToTrip}
          >
            Add to Trip Plan
          </button>
        </div>
      )}
    </div>
  );
}
