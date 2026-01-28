import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export interface QueryEnhancementResult {
  originalQuery: string;
  enhancedQuery: string;
  expandedTerms: string[];
  suggestedFilters: Record<string, string>;
  confidence: number;
}

const KNOWN_VIBE_TAGS = [
  'romantic', 'cultural', 'historic', 'artistic', 'foodie', 'culinary',
  'nightlife', 'vibrant', 'relaxing', 'peaceful', 'adventure', 'outdoor',
  'beach', 'coastal', 'tropical', 'nature', 'scenic', 'modern', 'urban',
  'luxury', 'budget', 'family-friendly', 'welcoming', 'charming', 'quaint',
  'photogenic', 'cosmopolitan', 'bohemian', 'spiritual', 'ancient'
];

const SYSTEM_PROMPT = `You are a travel search query enhancement assistant. Your job is to expand vague or short travel queries into more searchable terms.

Given a user's travel query, you should:
1. Identify the travel vibes or preferences they're expressing
2. Map these to common travel destination attributes
3. Suggest relevant search terms that match these vibes

Known vibe tags in our system: ${KNOWN_VIBE_TAGS.join(', ')}

Respond ONLY with valid JSON in this exact format:
{
  "expandedTerms": ["term1", "term2", "term3"],
  "suggestedFilters": {
    "nature_score": ">7",
    "culture_score": ">6"
  },
  "enhancedQuery": "original query plus expanded terms",
  "confidence": 0.85
}

Rules:
- expandedTerms should only include terms from the known vibe tags list
- suggestedFilters should only use: culture_score, adventure_score, nature_score, beach_score, nightlife_score (values 1-10)
- confidence should be between 0.5 and 1.0 based on how well you understand the query
- enhancedQuery should be the original query with the most relevant expanded terms appended`;

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

function parseEnhancementResponse(content: string, originalQuery: string): QueryEnhancementResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    const validTerms = (parsed.expandedTerms || []).filter(
      (term: string) => typeof term === 'string' && term.length > 0
    );
    
    const validFilters: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed.suggestedFilters || {})) {
      if (
        ['culture_score', 'adventure_score', 'nature_score', 'beach_score', 'nightlife_score'].includes(key) &&
        typeof value === 'string' &&
        value.match(/^>[0-9]$/)
      ) {
        validFilters[key] = value;
      }
    }
    
    return {
      originalQuery,
      enhancedQuery: parsed.enhancedQuery || `${originalQuery} ${validTerms.join(' ')}`,
      expandedTerms: validTerms,
      suggestedFilters: validFilters,
      confidence: typeof parsed.confidence === 'number' 
        ? Math.min(1, Math.max(0.5, parsed.confidence))
        : 0.7,
    };
  } catch (error) {
    console.error('Failed to parse LLM response:', error);
    return {
      originalQuery,
      enhancedQuery: originalQuery,
      expandedTerms: [],
      suggestedFilters: {},
      confidence: 0.3,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    
    if (!openai) {
      return NextResponse.json(
        {
          originalQuery: query,
          enhancedQuery: query,
          expandedTerms: [],
          suggestedFilters: {},
          confidence: 0.3,
          warning: 'OpenAI API key not configured',
        },
        { status: 200 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Enhance this travel search query: "${query}"` },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        {
          originalQuery: query,
          enhancedQuery: query,
          expandedTerms: [],
          suggestedFilters: {},
          confidence: 0.3,
        },
        { status: 200 }
      );
    }

    const result = parseEnhancementResponse(content, query);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Query enhancement error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance query' },
      { status: 500 }
    );
  }
}
