export interface QueryEnhancementResult {
  originalQuery: string;
  enhancedQuery: string;
  expandedTerms: string[];
  suggestedFilters: Record<string, string>;
  confidence: number;
}

export interface QueryEnhancementServiceConfig {
  apiEndpoint?: string;
}

const VIBE_TAG_MAPPINGS: Record<string, string[]> = {
  'scenic': ['scenic', 'views', 'panoramic', 'nature', 'beautiful', 'picturesque'],
  'cozy': ['cozy', 'charming', 'intimate', 'quaint', 'romantic', 'welcoming'],
  'cafe': ['culinary', 'foodie', 'gastronomy', 'european', 'charming'],
  'coffee': ['culinary', 'foodie', 'european', 'charming', 'cozy'],
  'views': ['scenic', 'nature', 'panoramic', 'mountains', 'coastal'],
  'charming': ['romantic', 'historic', 'european', 'quaint', 'charming'],
  'beautiful': ['scenic', 'picturesque', 'photogenic', 'stunning'],
  'quiet': ['peaceful', 'relaxing', 'tranquil', 'serene'],
  'lively': ['vibrant', 'nightlife', 'entertainment', 'energetic'],
  'cheap': ['budget', 'affordable', 'backpacker', 'economical'],
  'expensive': ['luxury', 'upscale', 'premium', 'exclusive'],
  'old': ['historic', 'ancient', 'heritage', 'cultural'],
  'modern': ['contemporary', 'urban', 'cosmopolitan', 'sleek'],
  'food': ['culinary', 'foodie', 'gastronomy', 'cuisine'],
  'art': ['artistic', 'cultural', 'creative', 'galleries'],
  'nature': ['nature', 'outdoor', 'wilderness', 'scenic', 'green'],
  'party': ['nightlife', 'vibrant', 'entertainment', 'clubs'],
  'relax': ['relaxing', 'peaceful', 'tranquil', 'spa', 'wellness'],
  'adventure': ['adventure', 'active', 'outdoor', 'hiking', 'exploration'],
  'romantic': ['romantic', 'couples', 'honeymoon', 'intimate'],
  'family': ['family-friendly', 'safe', 'welcoming', 'fun'],
  'beach': ['beach', 'coastal', 'tropical', 'seaside', 'ocean'],
  'mountain': ['mountains', 'alpine', 'hiking', 'nature', 'scenic'],
  'historic': ['historic', 'heritage', 'cultural', 'ancient', 'museums'],
  'instagram': ['photogenic', 'beautiful', 'stunning', 'picturesque'],
};

const SCORE_MAPPINGS: Record<string, { attribute: string; minValue: number }> = {
  'scenic': { attribute: 'nature_score', minValue: 7 },
  'nature': { attribute: 'nature_score', minValue: 7 },
  'views': { attribute: 'nature_score', minValue: 6 },
  'cultural': { attribute: 'culture_score', minValue: 7 },
  'historic': { attribute: 'culture_score', minValue: 7 },
  'art': { attribute: 'culture_score', minValue: 6 },
  'museums': { attribute: 'culture_score', minValue: 7 },
  'nightlife': { attribute: 'nightlife_score', minValue: 7 },
  'party': { attribute: 'nightlife_score', minValue: 7 },
  'clubs': { attribute: 'nightlife_score', minValue: 6 },
  'beach': { attribute: 'beach_score', minValue: 7 },
  'coastal': { attribute: 'beach_score', minValue: 6 },
  'tropical': { attribute: 'beach_score', minValue: 6 },
  'adventure': { attribute: 'adventure_score', minValue: 7 },
  'hiking': { attribute: 'adventure_score', minValue: 6 },
  'outdoor': { attribute: 'adventure_score', minValue: 6 },
};

function localEnhancement(query: string): QueryEnhancementResult {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/[\s,]+/).filter(w => w.length > 2);
  
  const expandedTerms: Set<string> = new Set();
  const suggestedFilters: Record<string, string> = {};
  
  for (const word of words) {
    if (VIBE_TAG_MAPPINGS[word]) {
      VIBE_TAG_MAPPINGS[word].forEach(term => expandedTerms.add(term));
    }
    
    if (SCORE_MAPPINGS[word]) {
      const { attribute, minValue } = SCORE_MAPPINGS[word];
      if (!suggestedFilters[attribute] || parseInt(suggestedFilters[attribute].split('>')[1]) < minValue) {
        suggestedFilters[attribute] = `>${minValue}`;
      }
    }
    
    for (const [key, mappings] of Object.entries(VIBE_TAG_MAPPINGS)) {
      if (word.includes(key) || key.includes(word)) {
        mappings.forEach(term => expandedTerms.add(term));
      }
    }
  }
  
  const enhancedTermsArray = Array.from(expandedTerms);
  const enhancedQuery = enhancedTermsArray.length > 0 
    ? `${query} ${enhancedTermsArray.join(' ')}`
    : query;
  
  return {
    originalQuery: query,
    enhancedQuery,
    expandedTerms: enhancedTermsArray,
    suggestedFilters,
    confidence: enhancedTermsArray.length > 0 ? 0.7 : 0.3,
  };
}

export class QueryEnhancementService {
  private apiEndpoint: string;

  constructor(config: QueryEnhancementServiceConfig = {}) {
    this.apiEndpoint = config.apiEndpoint || '/api/enhance-query';
  }

  async enhanceQuery(query: string, useLLM: boolean = true): Promise<QueryEnhancementResult> {
    const localResult = localEnhancement(query);
    
    if (!useLLM || localResult.confidence >= 0.8) {
      return localResult;
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.warn('LLM enhancement failed, using local enhancement');
        return localResult;
      }

      const llmResult: QueryEnhancementResult = await response.json();
      
      const mergedTerms = new Set([
        ...localResult.expandedTerms,
        ...llmResult.expandedTerms,
      ]);
      
      return {
        originalQuery: query,
        enhancedQuery: llmResult.enhancedQuery,
        expandedTerms: Array.from(mergedTerms),
        suggestedFilters: {
          ...localResult.suggestedFilters,
          ...llmResult.suggestedFilters,
        },
        confidence: Math.max(localResult.confidence, llmResult.confidence),
      };
    } catch (error) {
      console.error('Query enhancement error:', error);
      return localResult;
    }
  }

  enhanceQuerySync(query: string): QueryEnhancementResult {
    return localEnhancement(query);
  }
}

export const queryEnhancementService = new QueryEnhancementService();
