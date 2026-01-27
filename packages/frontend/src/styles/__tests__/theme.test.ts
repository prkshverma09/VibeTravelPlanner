import { describe, it, expect } from 'vitest';
import { theme, colors, breakpoints, spacing, borderRadius, fontSizes, fontWeights, shadows } from '../theme';

describe('Theme', () => {
  describe('colors', () => {
    it('should have primary color palette', () => {
      expect(colors.primary).toBeDefined();
      expect(colors.primary['500']).toBeDefined();
      expect(colors.primary['500']).toBe('#a855f7');
    });

    it('should have secondary color palette', () => {
      expect(colors.secondary).toBeDefined();
      expect(colors.secondary['500']).toBeDefined();
    });

    it('should have accent color palette', () => {
      expect(colors.accent).toBeDefined();
      expect(colors.accent['500']).toBeDefined();
    });

    it('should have score level colors', () => {
      expect(colors.score.high).toBeDefined();
      expect(colors.score.medium).toBeDefined();
      expect(colors.score.low).toBeDefined();
    });

    it('should have vibe colors', () => {
      expect(colors.vibe.romantic).toBeDefined();
      expect(colors.vibe.adventure).toBeDefined();
      expect(colors.vibe.culture).toBeDefined();
      expect(colors.vibe.nature).toBeDefined();
      expect(colors.vibe.nightlife).toBeDefined();
      expect(colors.vibe.beach).toBeDefined();
    });
  });

  describe('breakpoints', () => {
    it('should have responsive breakpoints', () => {
      expect(breakpoints.sm).toBeDefined();
      expect(breakpoints.md).toBeDefined();
      expect(breakpoints.lg).toBeDefined();
      expect(breakpoints.xl).toBeDefined();
    });

    it('should have correct breakpoint values', () => {
      expect(breakpoints.sm).toBe('640px');
      expect(breakpoints.md).toBe('768px');
      expect(breakpoints.lg).toBe('1024px');
    });
  });

  describe('spacing', () => {
    it('should have spacing scale', () => {
      expect(spacing['0']).toBe('0');
      expect(spacing['4']).toBe('1rem');
      expect(spacing['8']).toBe('2rem');
    });
  });

  describe('borderRadius', () => {
    it('should have border radius values', () => {
      expect(borderRadius.none).toBe('0');
      expect(borderRadius.lg).toBe('0.5rem');
      expect(borderRadius.full).toBe('9999px');
    });
  });

  describe('fontSizes', () => {
    it('should have font size scale', () => {
      expect(fontSizes.base).toBe('1rem');
      expect(fontSizes.lg).toBe('1.125rem');
      expect(fontSizes['2xl']).toBe('1.5rem');
    });
  });

  describe('fontWeights', () => {
    it('should have font weight values', () => {
      expect(fontWeights.normal).toBe('400');
      expect(fontWeights.bold).toBe('700');
    });
  });

  describe('shadows', () => {
    it('should have shadow values', () => {
      expect(shadows.sm).toBeDefined();
      expect(shadows.md).toBeDefined();
      expect(shadows.lg).toBeDefined();
    });
  });

  describe('theme export', () => {
    it('should export complete theme object', () => {
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.borderRadius).toBeDefined();
      expect(theme.breakpoints).toBeDefined();
      expect(theme.fontSizes).toBeDefined();
      expect(theme.fontWeights).toBeDefined();
      expect(theme.shadows).toBeDefined();
    });
  });
});
