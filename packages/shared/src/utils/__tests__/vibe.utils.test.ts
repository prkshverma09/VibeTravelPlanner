import { describe, it, expect } from 'vitest';
import {
  calculatePrimaryVibe,
  getVibeColor,
  getVibeLabel,
  getVibeIcon,
  getAllVibeCategories,
  VIBE_COLORS,
  VIBE_LABELS,
  VIBE_ICONS
} from '../vibe.utils';

describe('Vibe Utils', () => {
  describe('calculatePrimaryVibe', () => {
    it('should return adventure for high adventure score', () => {
      const city = {
        adventure_score: 9,
        culture_score: 5,
        nature_score: 6,
        beach_score: 3,
        nightlife_score: 4,
        vibe_tags: ['hiking', 'extreme']
      };

      expect(calculatePrimaryVibe(city)).toBe('adventure');
    });

    it('should return cultural for high culture score', () => {
      const city = {
        adventure_score: 5,
        culture_score: 10,
        nature_score: 4,
        beach_score: 2,
        nightlife_score: 6,
        vibe_tags: ['historic', 'museums']
      };

      expect(calculatePrimaryVibe(city)).toBe('cultural');
    });

    it('should return beach for high beach score', () => {
      const city = {
        adventure_score: 5,
        culture_score: 4,
        nature_score: 6,
        beach_score: 10,
        nightlife_score: 7,
        vibe_tags: ['tropical', 'surfing']
      };

      expect(calculatePrimaryVibe(city)).toBe('beach');
    });

    it('should return nightlife for high nightlife score', () => {
      const city = {
        adventure_score: 5,
        culture_score: 6,
        nature_score: 3,
        beach_score: 4,
        nightlife_score: 10,
        vibe_tags: ['clubs', 'bars']
      };

      expect(calculatePrimaryVibe(city)).toBe('nightlife');
    });

    it('should return nature for high nature score', () => {
      const city = {
        adventure_score: 7,
        culture_score: 4,
        nature_score: 10,
        beach_score: 5,
        nightlife_score: 3,
        vibe_tags: ['forests', 'mountains']
      };

      expect(calculatePrimaryVibe(city)).toBe('nature');
    });

    it('should detect romantic vibe from tags', () => {
      const city = {
        adventure_score: 5,
        culture_score: 9,
        nature_score: 8,
        beach_score: 6,
        nightlife_score: 4,
        vibe_tags: ['romantic', 'elegant', 'charming']
      };

      expect(calculatePrimaryVibe(city)).toBe('romantic');
    });

    it('should detect romantic vibe from honeymoon tag', () => {
      const city = {
        adventure_score: 5,
        culture_score: 7,
        nature_score: 8,
        beach_score: 6,
        nightlife_score: 4,
        vibe_tags: ['honeymoon', 'couples']
      };

      expect(calculatePrimaryVibe(city)).toBe('romantic');
    });
  });

  describe('getVibeColor', () => {
    it('should return correct color for adventure', () => {
      expect(getVibeColor('adventure')).toBe('#FF6B35');
    });

    it('should return correct color for romantic', () => {
      expect(getVibeColor('romantic')).toBe('#FF69B4');
    });

    it('should return correct color for cultural', () => {
      expect(getVibeColor('cultural')).toBe('#9B59B6');
    });

    it('should return correct color for beach', () => {
      expect(getVibeColor('beach')).toBe('#00CED1');
    });

    it('should return correct color for nightlife', () => {
      expect(getVibeColor('nightlife')).toBe('#FFD700');
    });

    it('should return correct color for nature', () => {
      expect(getVibeColor('nature')).toBe('#228B22');
    });
  });

  describe('getVibeLabel', () => {
    it('should return correct labels for all vibes', () => {
      expect(getVibeLabel('adventure')).toBe('Adventure');
      expect(getVibeLabel('romantic')).toBe('Romantic');
      expect(getVibeLabel('cultural')).toBe('Cultural');
      expect(getVibeLabel('beach')).toBe('Beach');
      expect(getVibeLabel('nightlife')).toBe('Nightlife');
      expect(getVibeLabel('nature')).toBe('Nature');
    });
  });

  describe('getVibeIcon', () => {
    it('should return correct icons for all vibes', () => {
      expect(getVibeIcon('adventure')).toBe('🧗');
      expect(getVibeIcon('romantic')).toBe('💕');
      expect(getVibeIcon('cultural')).toBe('🎭');
      expect(getVibeIcon('beach')).toBe('🏖️');
      expect(getVibeIcon('nightlife')).toBe('🌙');
      expect(getVibeIcon('nature')).toBe('🌲');
    });
  });

  describe('getAllVibeCategories', () => {
    it('should return all vibe categories', () => {
      const categories = getAllVibeCategories();
      expect(categories).toHaveLength(6);
      expect(categories).toContain('adventure');
      expect(categories).toContain('romantic');
      expect(categories).toContain('cultural');
      expect(categories).toContain('beach');
      expect(categories).toContain('nightlife');
      expect(categories).toContain('nature');
    });
  });

  describe('VIBE_COLORS constant', () => {
    it('should have all required vibe colors', () => {
      expect(Object.keys(VIBE_COLORS)).toHaveLength(6);
      expect(VIBE_COLORS.adventure).toBeDefined();
      expect(VIBE_COLORS.romantic).toBeDefined();
      expect(VIBE_COLORS.cultural).toBeDefined();
      expect(VIBE_COLORS.beach).toBeDefined();
      expect(VIBE_COLORS.nightlife).toBeDefined();
      expect(VIBE_COLORS.nature).toBeDefined();
    });
  });

  describe('VIBE_LABELS constant', () => {
    it('should have all required vibe labels', () => {
      expect(Object.keys(VIBE_LABELS)).toHaveLength(6);
    });
  });

  describe('VIBE_ICONS constant', () => {
    it('should have all required vibe icons', () => {
      expect(Object.keys(VIBE_ICONS)).toHaveLength(6);
    });
  });
});
