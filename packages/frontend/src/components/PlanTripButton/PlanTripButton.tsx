'use client';

import { useState, useEffect, useCallback } from 'react';
import { TripSetupWizard } from '@/components/TripSetupWizard';
import { ItineraryBuilder } from '@/components/ItineraryBuilder';
import { generateItinerary } from '@/services/itinerary.service';
import type { CityData, GeneratedItinerary } from '@/services/itinerary.service';
import type { TripSetup } from '@vibe-travel/shared';
import styles from './PlanTripButton.module.css';

export interface PlanTripDestination {
  objectID: string;
  city: string;
  country: string;
  continent?: string;
  bestTimeToVisit?: string;
}

type ModalView = 'wizard' | 'itinerary';

const PACE_TO_TRAVEL_STYLE: Record<string, 'relaxed' | 'balanced' | 'active'> = {
  relaxed: 'relaxed',
  moderate: 'balanced',
  packed: 'active',
};

function calculateDurationDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
  const [view, setView] = useState<ModalView>('wizard');
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(null);

  const handleOpen = useCallback(() => {
    setView('wizard');
    setGeneratedItinerary(null);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setView('wizard');
    setGeneratedItinerary(null);
    document.body.style.overflow = '';
  }, []);

  const handleComplete = useCallback(
    (setup: TripSetup) => {
      onComplete?.(setup);

      const durationDays = calculateDurationDays(setup.dates.start, setup.dates.end);
      const cityData: CityData = {
        objectID: destination.objectID,
        city: destination.city,
        country: destination.country,
        continent: destination.continent,
        best_time_to_visit: destination.bestTimeToVisit,
      };
      const travelStyle = PACE_TO_TRAVEL_STYLE[setup.pace] ?? 'balanced';
      const interests = setup.tripStyle.length > 0
        ? setup.tripStyle
        : ['Cultural Immersion'];
      const itinerary = generateItinerary({
        city: cityData,
        durationDays,
        interests,
        travelStyle,
        pace: setup.pace,
        startDate: setup.dates.start,
      });
      setGeneratedItinerary(itinerary);
      setView('itinerary');
    },
    [destination, onComplete]
  );

  const handleBackToEdit = useCallback(() => {
    setGeneratedItinerary(null);
    setView('wizard');
  }, []);

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
            aria-label={view === 'itinerary' ? `Your ${destination.city} itinerary` : `Plan trip to ${destination.city}`}
          >
            {view === 'wizard' && (
              <TripSetupWizard
                destination={destination}
                onComplete={handleComplete}
                onCancel={handleClose}
              />
            )}
            {view === 'itinerary' && generatedItinerary && (
              <div className={styles.itineraryView}>
                <div className={styles.itineraryActions}>
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBackToEdit}
                    data-testid="itinerary-back-to-edit"
                  >
                    Back to edit
                  </button>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={handleClose}
                    data-testid="itinerary-close"
                  >
                    Close
                  </button>
                </div>
                <ItineraryBuilder itinerary={generatedItinerary} onEdit={handleBackToEdit} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
