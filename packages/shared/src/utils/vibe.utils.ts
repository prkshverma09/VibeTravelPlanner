import type { City, VibeCategory } from '../types/city';

export const VIBE_COLORS: Record<VibeCategory, string> = {
  adventure: '#FF6B35',
  romantic: '#FF69B4',
  cultural: '#9B59B6',
  beach: '#00CED1',
  nightlife: '#FFD700',
  nature: '#228B22',
};

export const VIBE_LABELS: Record<VibeCategory, string> = {
  adventure: 'Adventure',
  romantic: 'Romantic',
  cultural: 'Cultural',
  beach: 'Beach',
  nightlife: 'Nightlife',
  nature: 'Nature',
};

export const VIBE_ICONS: Record<VibeCategory, string> = {
  adventure: '🧗',
  romantic: '💕',
  cultural: '🎭',
  beach: '🏖️',
  nightlife: '🌙',
  nature: '🌲',
};

const ROMANTIC_KEYWORDS = ['romantic', 'couples', 'honeymoon', 'love', 'elegant', 'charming'];

export function calculatePrimaryVibe(city: Pick<City, 'adventure_score' | 'culture_score' | 'nature_score' | 'beach_score' | 'nightlife_score' | 'vibe_tags'>): VibeCategory {
  const vibeScores: Record<VibeCategory, number> = {
    adventure: city.adventure_score,
    romantic: 0,
    cultural: city.culture_score,
    beach: city.beach_score,
    nightlife: city.nightlife_score,
    nature: city.nature_score,
  };

  const hasRomanticTags = city.vibe_tags.some(tag =>
    ROMANTIC_KEYWORDS.some(keyword => tag.toLowerCase().includes(keyword))
  );

  if (hasRomanticTags) {
    vibeScores.romantic = Math.max(city.culture_score, city.nature_score);
  }

  const sortedVibes = Object.entries(vibeScores)
    .sort(([, a], [, b]) => b - a);

  return sortedVibes[0][0] as VibeCategory;
}

export function getVibeColor(vibe: VibeCategory): string {
  return VIBE_COLORS[vibe];
}

export function getVibeLabel(vibe: VibeCategory): string {
  return VIBE_LABELS[vibe];
}

export function getVibeIcon(vibe: VibeCategory): string {
  return VIBE_ICONS[vibe];
}

export function getAllVibeCategories(): VibeCategory[] {
  return Object.keys(VIBE_COLORS) as VibeCategory[];
}
