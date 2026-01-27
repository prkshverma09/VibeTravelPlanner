import OpenAI from 'openai';
import pLimit from 'p-limit';
import type { BaseCityData } from '../generators/base-city.generator';

export interface EnrichmentResult {
  description: string;
  vibe_tags: string[];
  keywords: string[];
}

export interface LLMServiceOptions {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface EnrichCitiesOptions {
  concurrency?: number;
  onProgress?: (completed: number, total: number) => void;
}

const DEFAULT_MODEL = 'gpt-4-turbo-preview';
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_CONCURRENCY = 5;

const SYSTEM_PROMPT = `You are a travel content writer specializing in creating vivid, atmospheric descriptions of cities and destinations. Your task is to generate engaging descriptions and vibe tags for travel destinations.

For each city, provide:
1. A description (150-250 words) that captures the city's unique atmosphere, culture, and appeal to travelers. Focus on sensory details, mood, landmarks, local experiences, and what makes the city special for different types of travelers (couples, families, solo travelers, adventurers).

2. 8-12 vibe tags - single words or short phrases that capture the essence and atmosphere of the city. Include tags from these categories:
   - Mood/Atmosphere: romantic, relaxing, adventurous, vibrant, peaceful, energetic, mystical, bohemian
   - Activities: beach, hiking, temples, museums, nightlife, shopping, food, wine, surfing, diving, safari
   - Traveler Type: honeymoon, family-friendly, solo-travel, couples, backpacker, luxury
   - Character: historic, modern, ancient, spiritual, artistic, cultural, cosmopolitan, charming
   - Sensory: scenic, picturesque, colorful, tropical, coastal, mountainous

3. Searchable keywords - 5-8 additional terms people might search for when looking for this type of destination (e.g., "wedding destination", "island getaway", "UNESCO sites", "street food", "cherry blossoms").

Respond ONLY with valid JSON in this exact format:
{
  "description": "Your description here...",
  "vibe_tags": ["tag1", "tag2", "tag3", ...],
  "keywords": ["keyword1", "keyword2", ...]
}`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class LLMService {
  private client: OpenAI;
  private model: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options: LLMServiceOptions) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
    });
    this.model = options.model || DEFAULT_MODEL;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY;
  }

  private createUserPrompt(baseCity: BaseCityData): string {
    return `Generate a travel description and vibe tags for:

City: ${baseCity.city}
Country: ${baseCity.country}
Continent: ${baseCity.continent}
Climate: ${baseCity.climate_type}
Best time to visit: ${baseCity.best_time_to_visit}

Remember to respond with valid JSON only.`;
  }

  private parseResponse(content: string): EnrichmentResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!this.validateEnrichmentOutput(parsed)) {
        throw new Error('Invalid enrichment output structure');
      }

      return {
        description: parsed.description.trim(),
        vibe_tags: parsed.vibe_tags.map((tag: string) =>
          tag.toLowerCase().trim()
        ),
        keywords: (parsed.keywords || []).map((keyword: string) =>
          keyword.toLowerCase().trim()
        ),
      };
    } catch (error) {
      throw new Error(
        `Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async enrichCity(baseCity: BaseCityData): Promise<EnrichmentResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: this.createUserPrompt(baseCity) },
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from LLM');
        }

        return this.parseResponse(content);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const isRateLimitError =
          lastError.message.includes('rate_limit') ||
          lastError.message.includes('429');

        if (isRateLimitError && attempt < this.maxRetries - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          await sleep(delay);
          continue;
        }

        if (attempt === this.maxRetries - 1) {
          throw lastError;
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  async enrichCities(
    cities: BaseCityData[],
    options?: EnrichCitiesOptions
  ): Promise<EnrichmentResult[]> {
    const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY;
    const limit = pLimit(concurrency);
    let completed = 0;

    const tasks = cities.map((city) =>
      limit(async () => {
        const result = await this.enrichCity(city);
        completed++;
        options?.onProgress?.(completed, cities.length);
        return result;
      })
    );

    return Promise.all(tasks);
  }

  validateEnrichmentOutput(output: unknown): output is EnrichmentResult {
    if (!output || typeof output !== 'object') return false;
    const obj = output as Record<string, unknown>;

    if (typeof obj.description !== 'string' || obj.description.length === 0) {
      return false;
    }

    if (!Array.isArray(obj.vibe_tags) || obj.vibe_tags.length === 0) {
      return false;
    }

    if (!obj.vibe_tags.every((tag: unknown) => typeof tag === 'string')) {
      return false;
    }

    return true;
  }
}

export function createMockLLMService(): LLMService {
  const mockService = {
    enrichCity: async (baseCity: BaseCityData): Promise<EnrichmentResult> => {
      return {
        description: `${baseCity.city} is a captivating destination in ${baseCity.country}, known for its unique blend of culture and atmosphere. The city offers visitors an unforgettable experience with its distinctive character and charm.`,
        vibe_tags: ['vibrant', 'cultural', 'historic', 'welcoming', 'scenic'],
        keywords: ['travel', 'vacation', 'tourism', 'holiday'],
      };
    },
    enrichCities: async (
      cities: BaseCityData[],
      options?: EnrichCitiesOptions
    ): Promise<EnrichmentResult[]> => {
      const results: EnrichmentResult[] = [];
      for (let i = 0; i < cities.length; i++) {
        results.push(await mockService.enrichCity(cities[i]));
        options?.onProgress?.(i + 1, cities.length);
      }
      return results;
    },
    validateEnrichmentOutput: (output: unknown): output is EnrichmentResult => {
      if (!output || typeof output !== 'object') return false;
      const obj = output as Record<string, unknown>;
      return (
        typeof obj.description === 'string' &&
        obj.description.length > 0 &&
        Array.isArray(obj.vibe_tags) &&
        obj.vibe_tags.length > 0
      );
    },
  };

  return mockService as unknown as LLMService;
}
