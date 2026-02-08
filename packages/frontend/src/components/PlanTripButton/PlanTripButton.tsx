'use client';

import { useState, useEffect, useCallback } from 'react';
import { TripSetupWizard } from '@/components/TripSetupWizard';
import type { TripSetup } from '@vibe-travel/shared';
import styles from './PlanTripButton.module.css';

export interface PlanTripDestination {
  objectID: string;
  city: string;
  country: string;
  continent?: string;
  bestTimeToVisit?: string;
}

interface PlanTripButtonProps {
  destination: PlanTripDestination;
  onComplete?: (setup: TripSetup) => void;
  variant?: 'primary' | 'secondary';
  buttonText?: string;
  className?: string;
}

export function PlanTripButton({
  destination,
  onComplete,
  variant = 'primary',
  buttonText = 'Plan My Trip',
  className = '',
}: PlanTripButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  const handleComplete = useCallback(
    (setup: TripSetup) => {
      onComplete?.(setup);
      handleClose();
    },
    [onComplete, handleClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className={`${styles.button} ${styles[variant]} ${className}`}
        onClick={handleOpen}
        aria-haspopup="dialog"
      >
        <span className={styles.icon}>✈️</span>
        {buttonText}
      </button>

      {isOpen && (
        <div
          className={styles.modalOverlay}
          data-testid="wizard-overlay"
          onClick={handleOverlayClick}
        >
          <div
            className={styles.modal}
            data-testid="wizard-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Plan trip to ${destination.city}`}
          >
            <TripSetupWizard
              destination={destination}
              onComplete={handleComplete}
              onCancel={handleClose}
            />
          </div>
        </div>
      )}
    </>
  );
}
