import { describe, it, expect } from 'vitest';
import { ImageService } from '../image.service';

describe('Image Service', () => {
  it('should generate picsum.photos URL format', () => {
    const service = new ImageService();
    const url = service.getImageUrl('Paris', 'France');

    expect(url).toMatch(/^https:\/\/picsum\.photos\/seed\/\d+\/\d+\/\d+$/);
  });

  it('should handle city names with spaces', () => {
    const service = new ImageService();
    const url = service.getImageUrl('New York', 'United States');

    expect(service.validateUrl(url)).toBe(true);
    expect(url).toMatch(/^https:\/\/picsum\.photos\/seed\/\d+\/\d+\/\d+$/);
  });

  it('should handle city names with special characters', () => {
    const service = new ImageService();
    const url = service.getImageUrl("São Paulo", "Brazil");

    expect(service.validateUrl(url)).toBe(true);
    expect(url).toMatch(/^https:\/\/picsum\.photos\/seed\/\d+\/\d+\/\d+$/);
  });

  it('should return valid URLs', () => {
    const service = new ImageService();
    const url = service.getImageUrl('Tokyo', 'Japan');

    expect(service.validateUrl(url)).toBe(true);
    expect(url.startsWith('https://')).toBe(true);
  });

  it('should return default fallback URL', () => {
    const service = new ImageService();
    const fallbackUrl = service.getFallbackUrl();

    expect(fallbackUrl).toContain('picsum.photos');
    expect(service.validateUrl(fallbackUrl)).toBe(true);
  });

  it('should use default dimensions', () => {
    const service = new ImageService();
    const url = service.getImageUrl('Paris', 'France');

    expect(url).toContain('/800/600');
  });

  it('should use custom dimensions when provided', () => {
    const service = new ImageService({ width: 1200, height: 800 });
    const url = service.getImageUrl('Paris', 'France');

    expect(url).toContain('/1200/800');
  });

  it('should generate deterministic URLs for same city', () => {
    const service = new ImageService();
    const url1 = service.getImageUrl('Paris', 'France');
    const url2 = service.getImageUrl('Paris', 'France');

    expect(url1).toBe(url2);
  });

  it('should use city-specific keywords when available', () => {
    const service = new ImageService();
    const keywords = service.getCitySpecificKeywords('Tokyo');

    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain('shibuya');
  });

  it('should return empty array for unknown cities', () => {
    const service = new ImageService();
    const keywords = service.getCitySpecificKeywords('Unknown City');

    expect(keywords).toEqual([]);
  });

  it('should generate different URLs for different cities', () => {
    const service = new ImageService();
    const parisUrl = service.getImageUrl('Paris', 'France');
    const tokyoUrl = service.getImageUrl('Tokyo', 'Japan');

    expect(parisUrl).not.toBe(tokyoUrl);
  });

  it('should validate valid URLs', () => {
    const service = new ImageService();

    expect(service.validateUrl('https://example.com/image.jpg')).toBe(true);
    expect(service.validateUrl('http://example.com/image.jpg')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    const service = new ImageService();

    expect(service.validateUrl('not-a-url')).toBe(false);
    expect(service.validateUrl('')).toBe(false);
    expect(service.validateUrl('ftp://example.com/file')).toBe(false);
  });

  it('should use placeholder provider when specified', () => {
    const service = new ImageService({ provider: 'placeholder' });
    const url = service.getImageUrl('Paris', 'France');

    expect(url).toContain('via.placeholder.com');
    expect(url).toContain('Paris');
  });

  it('should get placeholder fallback when using placeholder provider', () => {
    const service = new ImageService({ provider: 'placeholder' });
    const fallbackUrl = service.getFallbackUrl();

    expect(fallbackUrl).toContain('via.placeholder.com');
    expect(fallbackUrl).toContain('travel');
  });

  it('should return result with isFallback flag', () => {
    const service = new ImageService();
    const result = service.getImageUrlWithResult('Paris', 'France');

    expect(result.url).toBeTruthy();
    expect(result.isFallback).toBe(false);
  });

  it('should batch generate URLs for multiple cities', () => {
    const service = new ImageService();
    const cities = [
      { city: 'Paris', country: 'France' },
      { city: 'Tokyo', country: 'Japan' },
      { city: 'Rome', country: 'Italy' },
    ];

    const urlMap = service.getImageUrlForCities(cities);

    expect(urlMap.size).toBe(3);
    expect(urlMap.get('Paris-France')).toBeTruthy();
    expect(urlMap.get('Tokyo-Japan')).toBeTruthy();
    expect(urlMap.get('Rome-Italy')).toBeTruthy();
  });

  it('should generate unique seeds based on city and country', () => {
    const service = new ImageService();

    const parisUrl = service.getImageUrl('Paris', 'France');
    const tokyoUrl = service.getImageUrl('Tokyo', 'Japan');
    const sydneyUrl = service.getImageUrl('Sydney', 'Australia');

    const parisSeed = parisUrl.match(/seed\/(\d+)/)?.[1];
    const tokyoSeed = tokyoUrl.match(/seed\/(\d+)/)?.[1];
    const sydneySeed = sydneyUrl.match(/seed\/(\d+)/)?.[1];

    expect(parisSeed).not.toBe(tokyoSeed);
    expect(tokyoSeed).not.toBe(sydneySeed);
    expect(parisSeed).not.toBe(sydneySeed);
  });
});
