'use client';

import Image from 'next/image';
import type { AlgoliaCity } from '@vibe-travel/shared';
import { WishlistButton } from '@/components/WishlistButton';

interface CityCardProps {
  city: AlgoliaCity;
  onClick?: (city: AlgoliaCity) => void;
  onMouseEnter?: (city: AlgoliaCity) => void;
  onMouseLeave?: () => void;
  isHighlighted?: boolean;
  showWishlistButton?: boolean;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80';

function truncateDescription(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

export function CityCard({
  city,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHighlighted = false,
  showWishlistButton = true,
}: CityCardProps) {
  const displayTags = city.vibe_tags.slice(0, 3);
  const imageUrl = city.image_url || PLACEHOLDER_IMAGE;
  const truncatedDescription = truncateDescription(city.description);

  const handleClick = () => {
    if (onClick) {
      onClick(city);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const articleClass = [
    'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
    isHighlighted ? 'ring-2 ring-purple-500 shadow-lg' : '',
  ].join(' ');

  return (
    <article
      className={articleClass}
      onMouseEnter={() => onMouseEnter?.(city)}
      onMouseLeave={() => onMouseLeave?.()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="article"
      tabIndex={0}
      aria-label={`${city.city}, ${city.country} - Travel destination card`}
    >
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={`${city.city}, ${city.country}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = PLACEHOLDER_IMAGE;
          }}
        />
        {showWishlistButton && (
          <div
            className="absolute top-2 right-2 z-10"
            onClick={handleWishlistClick}
          >
            <WishlistButton city={city} variant="overlay" size="medium" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{city.city}</h3>
          <span className="text-sm text-gray-500">{city.country}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3" data-testid="vibe-tags">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <p
          className="text-sm text-gray-600 mb-4 line-clamp-3"
          data-testid="city-description"
        >
          {truncatedDescription}
        </p>

        <div className="flex gap-4 text-sm" data-testid="score-badges">
          <span className="flex items-center gap-1">
            <span role="img" aria-label="culture">🎭</span>
            <span>Culture: {city.culture_score}</span>
          </span>
          <span className="flex items-center gap-1">
            <span role="img" aria-label="nightlife">🌙</span>
            <span>Nightlife: {city.nightlife_score}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
