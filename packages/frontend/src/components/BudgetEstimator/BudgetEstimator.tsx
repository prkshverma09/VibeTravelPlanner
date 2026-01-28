'use client';

import type { BudgetEstimate, TravelStyle } from '../../services/budget.service';
import styles from './BudgetEstimator.module.css';

interface BudgetEstimatorProps {
  estimate: BudgetEstimate;
  onAddToTrip?: (estimate: BudgetEstimate) => void;
  onClose?: () => void;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

const STYLE_LABELS: Record<TravelStyle, { label: string; emoji: string }> = {
  budget: { label: 'Budget', emoji: '💰' },
  'mid-range': { label: 'Mid-Range', emoji: '✨' },
  luxury: { label: 'Luxury', emoji: '💎' },
};

const BREAKDOWN_ICONS: Record<string, string> = {
  accommodation: '🏨',
  food: '🍽️',
  transportation: '🚇',
  activities: '🎭',
  miscellaneous: '📦',
};

export function BudgetEstimator({ estimate, onAddToTrip, onClose }: BudgetEstimatorProps) {
  const styleInfo = STYLE_LABELS[estimate.travelStyle];

  return (
    <div
      className={styles.container}
      data-testid="budget-estimator"
      role="region"
      aria-label={`Budget estimate for ${estimate.cityName}`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close budget estimator"
        >
          ×
        </button>
      )}

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.cityName}>{estimate.cityName}</h3>
          <span className={styles.styleBadge}>
            {styleInfo.emoji} {styleInfo.label}
          </span>
        </div>
        <div className={styles.tripDetails}>
          {estimate.durationDays} days • {estimate.travelers} travelers
        </div>
      </div>

      <div className={styles.totalSection}>
        <div className={styles.mainTotal}>
          <span className={styles.totalLabel}>Estimated Total</span>
          <span className={styles.totalAmount}>{formatCurrency(estimate.totalEstimate.mid)}</span>
        </div>
        <div className={styles.rangeRow}>
          <span className={styles.rangeLabel}>Range:</span>
          <span className={styles.rangeValue}>
            {formatCurrency(estimate.totalEstimate.low)} - {formatCurrency(estimate.totalEstimate.high)}
          </span>
        </div>
      </div>

      <div className={styles.perStats}>
        <div className={styles.perStat}>
          <span className={styles.perValue}>{formatCurrency(estimate.perPerson)}</span>
          <span className={styles.perLabel}>per person</span>
        </div>
        <div className={styles.perDivider} />
        <div className={styles.perStat}>
          <span className={styles.perValue}>{formatCurrency(estimate.perDay)}</span>
          <span className={styles.perLabel}>per day</span>
        </div>
      </div>

      <div className={styles.breakdownSection}>
        <h4 className={styles.sectionTitle}>💳 Cost Breakdown</h4>
        <div className={styles.breakdownList}>
          {Object.entries(estimate.breakdown).map(([key, value]) => (
            <div key={key} className={styles.breakdownItem}>
              <div className={styles.breakdownLabel}>
                <span className={styles.breakdownIcon}>{BREAKDOWN_ICONS[key]}</span>
                <span className={styles.breakdownName}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </div>
              <span className={styles.breakdownAmount}>{formatCurrency(value.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {estimate.budgetTips.length > 0 && (
        <div className={styles.tipsSection}>
          <h4 className={styles.sectionTitle}>💡 Budget Tips</h4>
          <ul className={styles.tipsList}>
            {estimate.budgetTips.map((tip, index) => (
              <li key={index} className={styles.tipItem}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onAddToTrip && (
        <button
          onClick={() => onAddToTrip(estimate)}
          className={styles.addButton}
          aria-label="Add to trip plan"
        >
          Add to Trip
        </button>
      )}
    </div>
  );
}
