'use client';

import { useState } from 'react';
import type { GeneratedItinerary, ItineraryDay, ItineraryActivity } from '@/services/itinerary.service';
import styles from './ItineraryBuilder.module.css';

interface ItineraryBuilderProps {
  itinerary: GeneratedItinerary;
  onEdit?: () => void;
  onExport?: () => void;
}

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌆 Evening',
  night: '🌙 Night',
};

const COST_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: '#10b981' },
  budget: { label: '$', color: '#3b82f6' },
  moderate: { label: '$$', color: '#f59e0b' },
  expensive: { label: '$$$', color: '#ef4444' },
};

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function ActivityCard({ activity }: { activity: ItineraryActivity }) {
  const costInfo = COST_LABELS[activity.cost];

  return (
    <div className={styles.activityCard}>
      <div className={styles.activityHeader}>
        <span className={styles.activityTime}>
          {activity.startTime && `${activity.startTime} · `}
          {TIME_SLOT_LABELS[activity.timeSlot] || activity.timeSlot}
        </span>
        <span
          className={styles.activityCost}
          style={{ color: costInfo.color }}
        >
          {costInfo.label}
        </span>
      </div>
      <h4 className={styles.activityName}>{activity.name}</h4>
      <p className={styles.activityDescription}>{activity.description}</p>
      <div className={styles.activityMeta}>
        <span className={styles.duration}>⏱️ {formatDuration(activity.duration)}</span>
        {activity.vibeTags && activity.vibeTags.length > 0 && (
          <div className={styles.vibeTags}>
            {activity.vibeTags.slice(0, 2).map((tag) => (
              <span key={tag} className={styles.vibeTag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {activity.reservationRequired && (
        <span className={styles.reservationBadge}>Reservation Required</span>
      )}
    </div>
  );
}

function DayPanel({ day, isActive }: { day: ItineraryDay; isActive: boolean }) {
  if (!isActive) return null;

  const groupedActivities = {
    morning: day.activities.filter((a) => a.timeSlot === 'morning'),
    afternoon: day.activities.filter((a) => a.timeSlot === 'afternoon'),
    evening: day.activities.filter((a) => a.timeSlot === 'evening' || a.timeSlot === 'night'),
  };

  return (
    <div
      className={styles.dayPanel}
      role="tabpanel"
      aria-labelledby={`day-tab-${day.dayNumber}`}
      id={`day-panel-${day.dayNumber}`}
    >
      <div className={styles.dayHeader}>
        <h3 className={styles.dayTheme}>{day.theme}</h3>
        {day.date && <span className={styles.dayDate}>{formatDate(day.date)}</span>}
        <span className={styles.dayCost}>~${day.estimatedCost}</span>
      </div>

      {day.transportTips.length > 0 && (
        <div className={styles.transportTips}>
          <h4>🚇 Transport Tips</h4>
          <ul>
            {day.transportTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.activities}>
        {Object.entries(groupedActivities).map(([timeSlot, activities]) => {
          if (activities.length === 0) return null;
          return (
            <div key={timeSlot} className={styles.timeSlotGroup}>
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ItineraryBuilder({ itinerary, onEdit, onExport }: ItineraryBuilderProps) {
  const [selectedDay, setSelectedDay] = useState(1);

  if (itinerary.days.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No itinerary generated yet. Please set up your trip preferences first.</p>
      </div>
    );
  }

  return (
    <div className={styles.itineraryBuilder} data-testid="itinerary-builder">
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>
            Your {itinerary.totalDays}-day itinerary
          </h2>
          <p className={styles.destination}>
            {itinerary.destination.city}, {itinerary.destination.country}
          </p>
        </div>
        <div className={styles.summary}>
          <span className={styles.totalCost}>
            Est. Total: <strong>${itinerary.estimatedTotalCost}</strong>
          </span>
          <span className={styles.style}>Style: {itinerary.travelStyle}</span>
        </div>
        <div className={styles.actions}>
          {onEdit && (
            <button
              type="button"
              className={styles.editButton}
              onClick={onEdit}
              aria-label="Edit itinerary"
            >
              ✏️ Edit
            </button>
          )}
          {onExport && (
            <button
              type="button"
              className={styles.exportButton}
              onClick={onExport}
              aria-label="Export itinerary"
            >
              📥 Export
            </button>
          )}
        </div>
      </header>

      <div className={styles.dayTabs} role="tablist" aria-label="Itinerary days">
        {itinerary.days.map((day) => (
          <button
            key={day.dayNumber}
            role="tab"
            id={`day-tab-${day.dayNumber}`}
            aria-selected={selectedDay === day.dayNumber}
            aria-controls={`day-panel-${day.dayNumber}`}
            className={`${styles.dayTab} ${selectedDay === day.dayNumber ? styles.active : ''}`}
            onClick={() => setSelectedDay(day.dayNumber)}
          >
            <span className={styles.dayNumber}>Day {day.dayNumber}</span>
            <span className={styles.dayThemePreview}>{day.theme}</span>
            {day.date && <span className={styles.dayDatePreview}>{formatDate(day.date)}</span>}
          </button>
        ))}
      </div>

      <div className={styles.dayContent}>
        {itinerary.days.map((day) => (
          <DayPanel
            key={day.dayNumber}
            day={day}
            isActive={selectedDay === day.dayNumber}
          />
        ))}
      </div>
    </div>
  );
}
