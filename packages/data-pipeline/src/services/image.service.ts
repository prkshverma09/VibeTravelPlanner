export interface ImageServiceOptions {
  width?: number;
  height?: number;
  provider?: 'unsplash' | 'placeholder';
}

export interface ImageUrlResult {
  url: string;
  isFallback: boolean;
}

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

const CITY_IMAGE_KEYWORDS: Record<string, string[]> = {
  'tokyo': ['shibuya', 'neon', 'skyline'],
  'kyoto': ['temple', 'garden', 'traditional'],
  'paris': ['eiffel', 'architecture', 'cafe'],
  'london': ['tower-bridge', 'big-ben', 'city'],
  'rome': ['colosseum', 'ancient', 'architecture'],
  'barcelona': ['gaudi', 'beach', 'architecture'],
  'new york': ['manhattan', 'skyline', 'times-square'],
  'dubai': ['burj-khalifa', 'modern', 'desert'],
  'bali': ['temple', 'beach', 'rice-terrace'],
  'sydney': ['opera-house', 'harbour', 'beach'],
  'cape town': ['table-mountain', 'beach', 'vineyard'],
  'reykjavik': ['aurora', 'geothermal', 'landscape'],
  'santorini': ['whitewash', 'sunset', 'aegean'],
  'marrakech': ['souk', 'medina', 'architecture'],
  'cusco': ['machu-picchu', 'inca', 'mountains'],
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function buildImageUrl(
  city: string,
  country: string,
  width: number,
  height: number
): string {
  const seed = hashCode(`${city}-${country}`);
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

export class ImageService {
  private width: number;
  private height: number;
  private provider: 'unsplash' | 'placeholder';

  constructor(options?: ImageServiceOptions) {
    this.width = options?.width ?? DEFAULT_WIDTH;
    this.height = options?.height ?? DEFAULT_HEIGHT;
    this.provider = options?.provider ?? 'unsplash';
  }

  getImageUrl(city: string, country: string): string {
    if (this.provider === 'placeholder') {
      return this.getPlaceholderUrl(city);
    }

    return buildImageUrl(city, country, this.width, this.height);
  }

  getImageUrlWithResult(city: string, country: string): ImageUrlResult {
    return {
      url: this.getImageUrl(city, country),
      isFallback: false,
    };
  }

  getFallbackUrl(): string {
    if (this.provider === 'placeholder') {
      return this.getPlaceholderUrl('travel');
    }
    return `https://picsum.photos/seed/travel-fallback/${this.width}/${this.height}`;
  }

  private getPlaceholderUrl(text: string): string {
    const encodedText = encodeURIComponent(text);
    return `https://via.placeholder.com/${this.width}x${this.height}?text=${encodedText}`;
  }

  getCitySpecificKeywords(city: string): string[] {
    const cityLower = city.toLowerCase();
    return CITY_IMAGE_KEYWORDS[cityLower] || [];
  }

  validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }

  getImageUrlForCities(
    cities: Array<{ city: string; country: string }>
  ): Map<string, string> {
    const urlMap = new Map<string, string>();
    for (const { city, country } of cities) {
      const key = `${city}-${country}`;
      urlMap.set(key, this.getImageUrl(city, country));
    }
    return urlMap;
  }
}
