'use client';

import Image from 'next/image';
import type { AlgoliaExperience } from '@vibe-travel/shared';
import styles from './ExperienceCard.module.css';

interface ExperienceCardProps {
  experience: AlgoliaExperience;
  onClick?: (experience: AlgoliaExperience) => void;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80';

const CATEGORY_ICONS: Record<string, string> = {
  cultural: '🏛️',
  adventure: '🏔️',
  culinary: '🍽️',
  nature: '🌿',
  wellness: '🧘',
  nightlife: '🎉',
  romantic: '💕',
  family: '👨‍👩‍👧‍👦',
  photography: '📸',
  spiritual: '🕊️'
};

const PHYSICAL_LEVEL_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  challenging: 'bg-orange-100 text-orange-700',
  extreme: 'bg-red-100 text-red-700'
};

function truncateDescription(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  return truncated + '...';
}

export function ExperienceCard({ experience, onClick }: ExperienceCardProps) {
  const displayTags = experience.vibe_tags.slice(0, 3);
  const imageUrl = experience.image_url || PLACEHOLDER_IMAGE;
  const truncatedDescription = truncateDescription(experience.description);
  const categoryIcon = CATEGORY_ICONS[experience.category] || '✨';
  const physicalLevelClass = PHYSICAL_LEVEL_COLORS[experience.physical_level] || 'bg-gray-100 text-gray-700';

  const handleClick = () => {
    if (onClick) {
      onClick(experience);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="article"
      tabIndex={0}
      aria-label={`${experience.name} - Travel experience card`}
    >
      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={experience.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = PLACEHOLDER_IMAGE;
          }}
        />
        <span className={styles.categoryBadge}>
          {categoryIcon} {experience.category}
        </span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{experience.name}</h3>

        <div className={styles.tags}>
          {displayTags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <p className={styles.description}>{truncatedDescription}</p>

        <div className={styles.details}>
          <span className={styles.detailItem}>
            ⏱️ {experience.duration_hours} hours
          </span>
          <span className={styles.detailItem}>
            💰 {experience.price_tier}
          </span>
          <span className={`${styles.detailItem} ${physicalLevelClass} rounded-full px-2`}>
            {experience.physical_level}
          </span>
        </div>

        <div className={styles.footer}>
          <span className={styles.cities}>
            📍 Available in {experience.city_ids.length} cities
          </span>
          <span className={styles.travelers}>
            👥 {experience.min_travelers}-{experience.max_travelers}
          </span>
        </div>
      </div>
    </article>
  );
}
