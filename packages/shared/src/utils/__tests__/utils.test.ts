import { describe, it, expect } from 'vitest';
import { generateObjectId, slugify, normalizeScore, truncateDescription } from '../index';

describe('ID Utils', () => {
  describe('generateObjectId', () => {
    it('should generate lowercase hyphenated ID', () => {
      const id = generateObjectId('New York', 'United States');
      expect(id).toBe('new-york-united-states');
    });

    it('should handle special characters', () => {
      const id = generateObjectId('São Paulo', 'Brazil');
      expect(id).toBe('sao-paulo-brazil');
    });

    it('should handle multiple spaces', () => {
      const id = generateObjectId('Rio  de  Janeiro', 'Brazil');
      expect(id).toBe('rio-de-janeiro-brazil');
    });

    it('should handle accented characters', () => {
      const id = generateObjectId('Zürich', 'Switzerland');
      expect(id).toBe('zurich-switzerland');
    });
  });

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('HELLO')).toBe('hello');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('hello@world!')).toBe('helloworld');
    });

    it('should handle accented characters', () => {
      expect(slugify('café résumé')).toBe('cafe-resume');
    });

    it('should handle multiple hyphens', () => {
      expect(slugify('hello   world')).toBe('hello-world');
    });

    it('should trim leading and trailing hyphens', () => {
      expect(slugify(' hello world ')).toBe('hello-world');
    });
  });

  describe('normalizeScore', () => {
    it('should return value within range', () => {
      expect(normalizeScore(5, 1, 10)).toBe(5);
    });

    it('should clamp values above max', () => {
      expect(normalizeScore(15, 1, 10)).toBe(10);
    });

    it('should clamp values below min', () => {
      expect(normalizeScore(-5, 1, 10)).toBe(1);
    });

    it('should round to nearest integer', () => {
      expect(normalizeScore(5.7, 1, 10)).toBe(6);
    });

    it('should round down when closer to lower value', () => {
      expect(normalizeScore(5.3, 1, 10)).toBe(5);
    });

    it('should handle edge case at min', () => {
      expect(normalizeScore(1, 1, 10)).toBe(1);
    });

    it('should handle edge case at max', () => {
      expect(normalizeScore(10, 1, 10)).toBe(10);
    });
  });

  describe('truncateDescription', () => {
    it('should not truncate short text', () => {
      expect(truncateDescription('Hello', 100)).toBe('Hello');
    });

    it('should truncate long text with ellipsis', () => {
      const long = 'A'.repeat(200);
      const result = truncateDescription(long, 100);
      expect(result.length).toBe(103); // 100 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should truncate at word boundary when possible', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const result = truncateDescription(text, 20);
      expect(result).toBe('The quick brown fox...');
    });

    it('should handle text exactly at max length', () => {
      const text = 'Hello';
      const result = truncateDescription(text, 5);
      expect(result).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(truncateDescription('', 100)).toBe('');
    });

    it('should handle single long word', () => {
      const text = 'Supercalifragilisticexpialidocious';
      const result = truncateDescription(text, 10);
      expect(result).toBe('Supercalif...');
    });
  });
});
