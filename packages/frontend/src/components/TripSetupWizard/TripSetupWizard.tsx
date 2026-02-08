'use client';

import { useState, useCallback } from 'react';
import type { TripSetup, TripStyleOption, BudgetLevel, Pace, Mobility } from '@vibe-travel/shared';
import styles from './TripSetupWizard.module.css';

export interface WizardDestination {
  objectID: string;
  city: string;
  country: string;
  continent?: string;
  bestTimeToVisit?: string;
}

interface TripSetupWizardProps {
  destination: WizardDestination;
  onComplete: (setup: TripSetup) => void;
  onCancel?: () => void;
  initialStep?: number;
}

const STEPS = [
  { id: 'dates', title: 'Dates', description: 'When are you traveling?' },
  { id: 'travelers', title: 'Travelers', description: "Who's traveling?" },
  { id: 'preferences', title: 'Style', description: 'Your trip style' },
  { id: 'review', title: 'Review', description: 'Review your choices' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

interface FormData {
  dates: { start: string; end: string } | null;
  travelers: { adults: number; children: number; childrenAges?: number[] };
  budgetLevel: BudgetLevel;
  tripStyle: TripStyleOption[];
  pace: Pace;
  interests: string[];
  mobility: Mobility;
}

const initialFormData: FormData = {
  dates: null,
  travelers: { adults: 2, children: 0 },
  budgetLevel: 'moderate',
  tripStyle: [],
  pace: 'moderate',
  interests: [],
  mobility: 'full',
};

export function TripSetupWizard({
  destination,
  onComplete,
  onCancel,
  initialStep = 0,
}: TripSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [announcement, setAnnouncement] = useState('');

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setAnnouncement(`Step ${step + 1} of ${STEPS.length}: ${STEPS[step].description}`);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleComplete = useCallback(() => {
    if (!formData.dates) return;

    const setup: TripSetup = {
      destinationId: destination.objectID,
      dates: formData.dates,
      travelers: formData.travelers,
      budgetLevel: formData.budgetLevel,
      tripStyle: formData.tripStyle.length > 0 ? formData.tripStyle : ['Cultural Immersion'],
      pace: formData.pace,
      interests: formData.interests,
      mobility: formData.mobility,
    };

    onComplete(setup);
  }, [formData, destination.objectID, onComplete]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className={styles.wizard} data-testid="trip-setup-wizard">
      <header className={styles.header}>
        <h2 className={styles.title}>
          Plan your trip to <span className={styles.destination}>{destination.city}</span>
        </h2>
        {destination.bestTimeToVisit && (
          <p className={styles.hint}>Best time to visit: {destination.bestTimeToVisit}</p>
        )}
      </header>

      <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Step ${currentStep + 1} of ${STEPS.length}`}
      >
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <nav className={styles.steps} data-testid="wizard-steps">
        <div role="tablist" aria-label="Wizard steps">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              role="tab"
              aria-selected={index === currentStep}
              aria-controls={`panel-${step.id}`}
              className={`${styles.stepTab} ${index === currentStep ? styles.active : ''} ${
                index < currentStep ? styles.completed : ''
              }`}
              onClick={() => index < currentStep && goToStep(index)}
              disabled={index > currentStep}
            >
              <span className={styles.stepNumber}>{index + 1}</span>
              <span className={styles.stepTitle}>{step.title}</span>
            </button>
          ))}
        </div>
      </nav>

      <form
        className={styles.form}
        role="form"
        aria-label={`Trip setup wizard for ${destination.city}`}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={styles.stepContent}>
          {currentStep === 0 && (
            <DatesStep
              value={formData.dates}
              bestTime={destination.bestTimeToVisit}
              onChange={(dates) => setFormData((prev) => ({ ...prev, dates }))}
            />
          )}

          {currentStep === 1 && (
            <TravelersStep
              value={formData.travelers}
              onChange={(travelers) => setFormData((prev) => ({ ...prev, travelers }))}
            />
          )}

          {currentStep === 2 && (
            <PreferencesStep
              budgetLevel={formData.budgetLevel}
              tripStyle={formData.tripStyle}
              pace={formData.pace}
              onBudgetChange={(budgetLevel) => setFormData((prev) => ({ ...prev, budgetLevel }))}
              onStyleChange={(tripStyle) => setFormData((prev) => ({ ...prev, tripStyle }))}
              onPaceChange={(pace) => setFormData((prev) => ({ ...prev, pace }))}
            />
          )}

          {currentStep === 3 && (
            <ReviewStep
              destination={destination}
              formData={formData}
              onEdit={goToStep}
            />
          )}
        </div>

        <div className={styles.actions}>
          {onCancel && (
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
          )}
          <div className={styles.navButtons}>
            {currentStep > 0 && (
              <button type="button" className={styles.backButton} onClick={handleBack}>
                Back
              </button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <button type="button" className={styles.nextButton} onClick={handleNext}>
                Continue
              </button>
            ) : (
              <button type="button" className={styles.finishButton} onClick={handleComplete}>
                Start Planning
              </button>
            )}
          </div>
        </div>
      </form>

      <div role="status" aria-live="polite" className={styles.srOnly}>
        {announcement}
      </div>
    </div>
  );
}

interface DatesStepProps {
  value: { start: string; end: string } | null;
  bestTime?: string;
  onChange: (dates: { start: string; end: string }) => void;
}

function DatesStep({ value, bestTime, onChange }: DatesStepProps) {
  const today = new Date().toISOString().split('T')[0];

  const handleStartChange = (start: string) => {
    const end = value?.end || start;
    onChange({ start: `${start}T00:00:00.000Z`, end: end > start ? `${end}T00:00:00.000Z` : `${start}T00:00:00.000Z` });
  };

  const handleEndChange = (end: string) => {
    const start = value?.start?.split('T')[0] || end;
    onChange({ start: `${start}T00:00:00.000Z`, end: `${end}T00:00:00.000Z` });
  };

  return (
    <div className={styles.stepPanel} data-testid="step-dates">
      <h3 className={styles.stepHeading}>When are you traveling?</h3>
      {bestTime && <p className={styles.bestTime}>Recommended: {bestTime}</p>}

      <div className={styles.dateInputs}>
        <label className={styles.inputGroup}>
          <span className={styles.inputLabel}>Start Date</span>
          <input
            type="date"
            className={styles.dateInput}
            min={today}
            value={value?.start?.split('T')[0] || ''}
            onChange={(e) => handleStartChange(e.target.value)}
            aria-label="Start date"
          />
        </label>

        <label className={styles.inputGroup}>
          <span className={styles.inputLabel}>End Date</span>
          <input
            type="date"
            className={styles.dateInput}
            min={value?.start?.split('T')[0] || today}
            value={value?.end?.split('T')[0] || ''}
            onChange={(e) => handleEndChange(e.target.value)}
            aria-label="End date"
          />
        </label>
      </div>

      {value?.start && value?.end && (
        <p className={styles.duration}>
          Trip duration: {calculateDays(value.start, value.end)} days
        </p>
      )}
    </div>
  );
}

function calculateDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

interface TravelersStepProps {
  value: { adults: number; children: number; childrenAges?: number[] };
  onChange: (travelers: { adults: number; children: number; childrenAges?: number[] }) => void;
}

function TravelersStep({ value, onChange }: TravelersStepProps) {
  const handleAdultsChange = (delta: number) => {
    const newAdults = Math.max(1, Math.min(10, value.adults + delta));
    onChange({ ...value, adults: newAdults });
  };

  const handleChildrenChange = (delta: number) => {
    const newChildren = Math.max(0, Math.min(8, value.children + delta));
    onChange({ ...value, children: newChildren });
  };

  return (
    <div className={styles.stepPanel} data-testid="step-travelers">
      <h3 className={styles.stepHeading}>Who's traveling?</h3>

      <div className={styles.travelerInputs}>
        <div className={styles.counterGroup}>
          <span className={styles.counterLabel}>Adults</span>
          <div className={styles.counter}>
            <button
              type="button"
              className={styles.counterBtn}
              onClick={() => handleAdultsChange(-1)}
              disabled={value.adults <= 1}
              aria-label="Decrease adults"
            >
              −
            </button>
            <span className={styles.counterValue} data-testid="adult-count">
              {value.adults}
            </span>
            <button
              type="button"
              className={styles.counterBtn}
              onClick={() => handleAdultsChange(1)}
              disabled={value.adults >= 10}
              aria-label="Increase adults"
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.counterGroup}>
          <span className={styles.counterLabel}>Children</span>
          <div className={styles.counter}>
            <button
              type="button"
              className={styles.counterBtn}
              onClick={() => handleChildrenChange(-1)}
              disabled={value.children <= 0}
              aria-label="Decrease children"
            >
              −
            </button>
            <span className={styles.counterValue} data-testid="children-count">
              {value.children}
            </span>
            <button
              type="button"
              className={styles.counterBtn}
              onClick={() => handleChildrenChange(1)}
              disabled={value.children >= 8}
              aria-label="Increase children"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <p className={styles.travelerSummary}>
        Total travelers: {value.adults + value.children}
      </p>
    </div>
  );
}

interface PreferencesStepProps {
  budgetLevel: BudgetLevel;
  tripStyle: TripStyleOption[];
  pace: Pace;
  onBudgetChange: (budget: BudgetLevel) => void;
  onStyleChange: (styles: TripStyleOption[]) => void;
  onPaceChange: (pace: Pace) => void;
}

const TRIP_STYLES: TripStyleOption[] = [
  'Cultural Immersion',
  'Adventure & Outdoors',
  'Food & Culinary',
  'Relaxation & Wellness',
  'Nightlife & Entertainment',
  'Shopping & Markets',
  'Photography & Sightseeing',
  'Family-Friendly',
  'Romantic Getaway',
  'Business + Leisure',
];

const BUDGET_OPTIONS: { value: BudgetLevel; label: string; description: string }[] = [
  { value: 'budget', label: 'Budget', description: '$50-100/day' },
  { value: 'moderate', label: 'Moderate', description: '$100-200/day' },
  { value: 'luxury', label: 'Luxury', description: '$200-500/day' },
  { value: 'unlimited', label: 'Unlimited', description: 'No limit' },
];

const PACE_OPTIONS: { value: Pace; label: string; description: string }[] = [
  { value: 'relaxed', label: 'Relaxed', description: '2-3 activities/day' },
  { value: 'moderate', label: 'Moderate', description: '4-5 activities/day' },
  { value: 'packed', label: 'Packed', description: '6-8 activities/day' },
];

function PreferencesStep({
  budgetLevel,
  tripStyle,
  pace,
  onBudgetChange,
  onStyleChange,
  onPaceChange,
}: PreferencesStepProps) {
  const toggleStyle = (style: TripStyleOption) => {
    if (tripStyle.includes(style)) {
      onStyleChange(tripStyle.filter((s) => s !== style));
    } else {
      onStyleChange([...tripStyle, style]);
    }
  };

  return (
    <div className={styles.stepPanel} data-testid="step-preferences">
      <h3 className={styles.stepHeading}>Your Trip Style</h3>

      <div className={styles.preferenceSection}>
        <h4 className={styles.sectionTitle}>Budget Level</h4>
        <div className={styles.radioGroup}>
          {BUDGET_OPTIONS.map((option) => (
            <label key={option.value} className={styles.radioOption}>
              <input
                type="radio"
                name="budget"
                value={option.value}
                checked={budgetLevel === option.value}
                onChange={() => onBudgetChange(option.value)}
              />
              <span className={styles.radioContent}>
                <span className={styles.radioLabel}>{option.label}</span>
                <span className={styles.radioDescription}>{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.preferenceSection}>
        <h4 className={styles.sectionTitle}>Trip Interests</h4>
        <p className={styles.sectionHint}>Select all that apply</p>
        <div className={styles.checkboxGroup}>
          {TRIP_STYLES.map((style) => (
            <label key={style} className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={tripStyle.includes(style)}
                onChange={() => toggleStyle(style)}
              />
              <span className={styles.checkboxLabel}>{style}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.preferenceSection}>
        <h4 className={styles.sectionTitle}>Pace</h4>
        <div className={styles.radioGroup}>
          {PACE_OPTIONS.map((option) => (
            <label key={option.value} className={styles.radioOption}>
              <input
                type="radio"
                name="pace"
                value={option.value}
                checked={pace === option.value}
                onChange={() => onPaceChange(option.value)}
              />
              <span className={styles.radioContent}>
                <span className={styles.radioLabel}>{option.label}</span>
                <span className={styles.radioDescription}>{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ReviewStepProps {
  destination: WizardDestination;
  formData: FormData;
  onEdit: (step: number) => void;
}

function ReviewStep({ destination, formData, onEdit }: ReviewStepProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const duration = formData.dates
    ? calculateDays(formData.dates.start, formData.dates.end)
    : 0;

  return (
    <div className={styles.stepPanel} data-testid="step-review">
      <h3 className={styles.stepHeading}>Review Your Trip</h3>

      <div className={styles.reviewSection}>
        <div className={styles.reviewHeader}>
          <h4>Destination</h4>
        </div>
        <p className={styles.reviewValue}>
          {destination.city}, {destination.country}
        </p>
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.reviewHeader}>
          <h4>Dates</h4>
          <button type="button" className={styles.editButton} onClick={() => onEdit(0)}>
            Edit
          </button>
        </div>
        {formData.dates ? (
          <p className={styles.reviewValue}>
            {formatDate(formData.dates.start)} - {formatDate(formData.dates.end)}
            <span className={styles.duration}> ({duration} days)</span>
          </p>
        ) : (
          <p className={styles.reviewMissing}>Please select dates</p>
        )}
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.reviewHeader}>
          <h4>Travelers</h4>
          <button type="button" className={styles.editButton} onClick={() => onEdit(1)}>
            Edit
          </button>
        </div>
        <p className={styles.reviewValue}>
          {formData.travelers.adults} adult{formData.travelers.adults !== 1 ? 's' : ''}
          {formData.travelers.children > 0 &&
            `, ${formData.travelers.children} child${formData.travelers.children !== 1 ? 'ren' : ''}`}
        </p>
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.reviewHeader}>
          <h4>Budget & Style</h4>
          <button type="button" className={styles.editButton} onClick={() => onEdit(2)}>
            Edit
          </button>
        </div>
        <p className={styles.reviewValue}>
          {formData.budgetLevel.charAt(0).toUpperCase() + formData.budgetLevel.slice(1)} budget,{' '}
          {formData.pace} pace
        </p>
        {formData.tripStyle.length > 0 && (
          <div className={styles.reviewTags}>
            {formData.tripStyle.map((style) => (
              <span key={style} className={styles.reviewTag}>
                {style}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
