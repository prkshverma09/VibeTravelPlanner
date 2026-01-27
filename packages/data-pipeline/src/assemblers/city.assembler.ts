import type { BaseCityData, AlgoliaCity } from '@vibe-travel/shared';
import { generateObjectId, slugify } from '@vibe-travel/shared';
import { generateScores } from '../generators/score.generator';
import type { LLMService, EnrichmentResult } from '../services/llm.service';
import type { ImageService } from '../services/image.service';

export type AssembledCity = AlgoliaCity;

export { generateObjectId, slugify };

export interface CityAssemblerDependencies {
  llmService: Pick<LLMService, 'enrichCity'>;
  imageService: Pick<ImageService, 'getImageUrl'>;
}

export interface AssembleOptions {
  skipEnrichment?: boolean;
  onProgress?: (message: string) => void;
}

export function validateAssembledCity(city: unknown): city is AssembledCity {
  if (!city || typeof city !== 'object') return false;

  const c = city as Record<string, unknown>;

  const hasRequiredStringFields =
    typeof c.objectID === 'string' &&
    c.objectID.length > 0 &&
    typeof c.city === 'string' &&
    c.city.length > 0 &&
    typeof c.country === 'string' &&
    c.country.length > 0 &&
    typeof c.continent === 'string' &&
    c.continent.length > 0 &&
    typeof c.description === 'string' &&
    c.description.length > 0 &&
    typeof c.climate_type === 'string' &&
    c.climate_type.length > 0 &&
    typeof c.best_time_to_visit === 'string' &&
    c.best_time_to_visit.length > 0 &&
    typeof c.image_url === 'string' &&
    c.image_url.length > 0;

  if (!hasRequiredStringFields) return false;

  const hasVibeTags =
    Array.isArray(c.vibe_tags) &&
    c.vibe_tags.length > 0 &&
    c.vibe_tags.every((tag: unknown) => typeof tag === 'string');

  if (!hasVibeTags) return false;

  const scoreFields = [
    'culture_score',
    'adventure_score',
    'nature_score',
    'beach_score',
    'nightlife_score',
  ];

  const hasValidScores = scoreFields.every(
    (field) =>
      typeof c[field] === 'number' &&
      Number.isInteger(c[field]) &&
      (c[field] as number) >= 1 &&
      (c[field] as number) <= 10
  );

  return hasValidScores;
}

const DEFAULT_ENRICHMENT: EnrichmentResult = {
  description: 'A vibrant travel destination with unique culture and attractions.',
  vibe_tags: ['cultural', 'scenic', 'welcoming'],
  keywords: ['travel', 'vacation', 'tourism'],
};

export class CityAssembler {
  private llmService: Pick<LLMService, 'enrichCity'>;
  private imageService: Pick<ImageService, 'getImageUrl'>;

  constructor(dependencies: CityAssemblerDependencies) {
    this.llmService = dependencies.llmService;
    this.imageService = dependencies.imageService;
  }

  async assemble(
    baseCity: BaseCityData,
    options?: AssembleOptions
  ): Promise<AssembledCity> {
    options?.onProgress?.(`Assembling ${baseCity.city}...`);

    const objectID = generateObjectId(baseCity.city, baseCity.country);
    const scores = generateScores(baseCity);
    const imageUrl = this.imageService.getImageUrl(baseCity.city, baseCity.country);

    let enrichment: EnrichmentResult;

    if (options?.skipEnrichment) {
      enrichment = {
        description: `${baseCity.city}, ${baseCity.country} - ${DEFAULT_ENRICHMENT.description}`,
        vibe_tags: DEFAULT_ENRICHMENT.vibe_tags,
        keywords: DEFAULT_ENRICHMENT.keywords,
      };
    } else {
      try {
        enrichment = await this.llmService.enrichCity(baseCity);
      } catch (error) {
        options?.onProgress?.(
          `Warning: LLM enrichment failed for ${baseCity.city}, using fallback`
        );
        enrichment = {
          description: `${baseCity.city} is a captivating destination in ${baseCity.country}. ${DEFAULT_ENRICHMENT.description}`,
          vibe_tags: DEFAULT_ENRICHMENT.vibe_tags,
          keywords: DEFAULT_ENRICHMENT.keywords,
        };
      }
    }

    const assembled: AssembledCity = {
      objectID,
      city: baseCity.city,
      country: baseCity.country,
      continent: baseCity.continent,
      description: enrichment.description,
      vibe_tags: enrichment.vibe_tags,
      keywords: enrichment.keywords || [],
      culture_score: scores.culture_score,
      adventure_score: scores.adventure_score,
      nature_score: scores.nature_score,
      beach_score: scores.beach_score,
      nightlife_score: scores.nightlife_score,
      climate_type: baseCity.climate_type,
      best_time_to_visit: baseCity.best_time_to_visit,
      image_url: imageUrl,
    };

    if (!validateAssembledCity(assembled)) {
      throw new Error(`Invalid assembled city: ${baseCity.city}`);
    }

    return assembled;
  }

  async assembleBatch(
    cities: BaseCityData[],
    options?: AssembleOptions & { concurrency?: number }
  ): Promise<AssembledCity[]> {
    const results: AssembledCity[] = [];

    for (const city of cities) {
      const assembled = await this.assemble(city, options);
      results.push(assembled);
    }

    return results;
  }

  assembleSync(
    baseCity: BaseCityData,
    enrichment: EnrichmentResult
  ): AssembledCity {
    const objectID = generateObjectId(baseCity.city, baseCity.country);
    const scores = generateScores(baseCity);
    const imageUrl = this.imageService.getImageUrl(baseCity.city, baseCity.country);

    return {
      objectID,
      city: baseCity.city,
      country: baseCity.country,
      continent: baseCity.continent,
      description: enrichment.description,
      vibe_tags: enrichment.vibe_tags,
      keywords: enrichment.keywords || [],
      culture_score: scores.culture_score,
      adventure_score: scores.adventure_score,
      nature_score: scores.nature_score,
      beach_score: scores.beach_score,
      nightlife_score: scores.nightlife_score,
      climate_type: baseCity.climate_type,
      best_time_to_visit: baseCity.best_time_to_visit,
      image_url: imageUrl,
    };
  }
}
