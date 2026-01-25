# PRD: "Vibe-Check" Travel & Experience Planner

## 1. Project Overview

**Vibe-Check** is an AI-powered travel concierge that allows users to discover destinations and experiences using natural, emotive language. Instead of traditional filters, it utilizes **Algolia NeuralSearch** and **Agent Studio** to map abstract "vibes" (e.g., *"moody architecture and quiet coffee shops"*) to real-world locations and data.

### Core Value Proposition

* **Aesthetic-First Discovery:** Moves beyond geolocation to "atmosphere" matching.
* **Conversational Precision:** Uses LLMs to turn chat into structured Algolia queries.
* **Seamless UI:** Renders rich destination cards directly in the chat via the React InstantSearch `<Chat>` widget.

---

## 2. Technical Stack

| Component | Tool / Tech | Purpose | Status |
| --- | --- | --- | --- |
| **Orchestration** | **Algolia Agent Studio** | Manages conversation flow and translates "vibe" intent into search parameters | Beta |
| **Search Engine** | **NeuralSearch** | Combines **Keyword Search** (exact matches) and **Vector Search** (semantic vibe matching) | Requires events |
| **UI Framework** | **React InstantSearch `<Chat>` Widget** | Interactive conversational interface for React/Next.js | Stable |
| **Events Tracking** | **Algolia Insights API** | Click and conversion tracking for NeuralSearch training | Required |
| **Primary Data** | **Custom Travel Cities Dataset** | Cities with thematic ratings and descriptive atmospheres | See Section 3 |

---

## 3. Data Strategy

### 3.1 Dataset Options

The project requires a travel cities dataset with thematic ratings. Recommended options:

1. **UCI Travel Review Ratings Dataset** - 5,456 instances with ratings across 24 categories including beaches, museums, parks, nightlife venues
2. **Nomadlist Cities Dataset** - Digital nomad city rankings with quality of life metrics
3. **Custom Synthetic Dataset** - Generate using LLM-assisted data enrichment from multiple sources

### 3.2 Required Data Schema

Each record in the Algolia index must include:

| Attribute | Type | Purpose |
| --- | --- | --- |
| `objectID` | string | Unique identifier (required by Algolia) |
| `city` | string | City name |
| `country` | string | Country name |
| `continent` | string | Geographic region for filtering |
| `description` | string | Paragraph describing the city's mood and unique features |
| `vibe_tags` | array | Semantic tags (e.g., `["minimalist", "neon", "ancient"]`) |
| `culture_score` | number (1-10) | Cultural attractions rating |
| `adventure_score` | number (1-10) | Adventure activities rating |
| `nature_score` | number (1-10) | Natural scenery rating |
| `beach_score` | number (1-10) | Beach quality rating |
| `nightlife_score` | number (1-10) | Nightlife rating |
| `climate_type` | string | Climate classification |
| `best_time_to_visit` | string | Recommended travel season |
| `image_url` | string | Representative city image |

---

## 4. Prerequisites & Constraints

### 4.1 Algolia Account Requirements

* **Pricing Plan:** NeuralSearch and Agent Studio may require Premium or Elevate plan
* **API Keys Required:**
  * **Application ID:** For all Algolia operations
  * **Search-only API Key:** For frontend/client-side queries
  * **Admin API Key:** For indexing operations (server-side only, never expose)
  * **Agent ID:** Retrieved from Agent Studio dashboard for Chat widget

### 4.2 NeuralSearch Activation Prerequisites

NeuralSearch requires event data to train its semantic model:

* **Minimum Events:** 1,000 click events OR 100 conversion events within a 30-day window
* **Required Event Types:**
  * `clickedObjectIDsAfterSearch` - When user clicks a destination
  * `convertedObjectIDsAfterSearch` - When user completes a desired action
* **Launch Strategy:** Initial release uses keyword search only; NeuralSearch activates after collecting sufficient events

### 4.3 Agent Studio Constraints

> **Note:** Agent Studio is currently a **beta feature** per Algolia's Terms of Service ("Beta Services").

* Requires LLM provider configuration (OpenAI, Gemini, or other supported providers)
* LLM token costs are billed separately by the provider
* Search requests made by agents count toward Algolia search usage
* Completions are cached by default to minimize LLM costs

---

## 5. Indexing & Search Configuration

### 5.1 Indexing Workflow

1. **Data Sourcing:** Obtain or generate travel city dataset matching the schema in Section 3.2
2. **Preprocessing:** Convert source data to JSON array format
3. **Enrichment:** Use LLM script to generate `vibe_tags` and enhance `description` fields
4. **Validation:** Ensure all records have required fields and valid data types
5. **Upload:** Push JSON objects to index named `travel_destinations`

### 5.2 Index Settings Configuration

```json
{
  "searchableAttributes": [
    "city",
    "country",
    "description",
    "vibe_tags"
  ],
  "attributesForFaceting": [
    "filterOnly(continent)",
    "searchable(climate_type)",
    "culture_score",
    "adventure_score",
    "nature_score",
    "beach_score",
    "nightlife_score"
  ],
  "customRanking": [
    "desc(culture_score)",
    "desc(nightlife_score)"
  ],
  "ranking": [
    "typo",
    "geo",
    "words",
    "filters",
    "proximity",
    "attribute",
    "exact",
    "custom"
  ]
}
```

### 5.3 NeuralSearch Configuration

* **Activation:** Enable via Algolia Dashboard → Search → [Index] → Configure → NeuralSearch
* **Mode Parameter:** `mode: "neuralSearch"` (after activation)
* **How It Works:** NeuralSearch performs hybrid keyword + vector search, merging results based on a unified neural score
* **Fallback:** Until events threshold is met, searches use `mode: "keywordSearch"`

---

## 6. Agent Studio Implementation

### 6.1 LLM Provider Setup

1. Navigate to Agent Studio dashboard
2. Configure LLM provider (recommended: OpenAI GPT-4 or Gemini Pro)
3. Add provider API key
4. Set token limits and caching preferences

### 6.2 Agent Configuration

**System Prompt Example:**
```
You are a travel concierge specializing in "vibe-based" destination discovery. 
Your role is to understand the emotional and aesthetic preferences users describe 
and translate them into search queries against our travel destinations index.

When a user describes a vibe:
1. Extract any explicit constraints (continent, climate, scores)
2. Identify semantic keywords that capture the mood
3. Execute a search combining filters and semantic query
4. Present results with engaging descriptions emphasizing the "vibe match"

Always maintain conversation context to refine recommendations across turns.
```

### 6.3 Intent Extraction Rules

| User Input Pattern | Agent Action |
| --- | --- |
| "beach vibe with culture" | Set `beach_score > 4`, `culture_score > 4`, search "beach culture" |
| "somewhere in Europe" | Add filter `continent:Europe` to existing query |
| "not too touristy" | Deprioritize high `culture_score`, emphasize "hidden gem" in query |
| "good nightlife" | Set `nightlife_score > 6`, add "nightlife" to semantic query |

### 6.4 Tools Configuration

Configure Algolia Search tool in Agent Studio:
* **Index:** `travel_destinations`
* **Searchable attributes:** As defined in index settings
* **Filters:** Enable dynamic filter application from extracted constraints

---

## 7. Frontend Implementation

### 7.1 React InstantSearch Setup

```jsx
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, Chat } from 'react-instantsearch';

const searchClient = algoliasearch('YOUR_APP_ID', 'YOUR_SEARCH_API_KEY');

function App() {
  return (
    <InstantSearch indexName="travel_destinations" searchClient={searchClient}>
      <Chat 
        agentId="YOUR_AGENT_ID"
        itemComponent={CityCard}
        translations={{
          header: { title: "Vibe-Check Travel Assistant" }
        }}
      />
    </InstantSearch>
  );
}
```

### 7.2 Custom City Card Component

```jsx
function CityCard({ item }) {
  return (
    <div className="city-card">
      <img src={item.image_url} alt={item.city} />
      <h3>{item.city}, {item.country}</h3>
      <div className="vibe-tags">
        {item.vibe_tags?.slice(0, 3).map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <p>{item.description?.substring(0, 150)}...</p>
      <div className="scores">
        <span>🎭 Culture: {item.culture_score}</span>
        <span>🌙 Nightlife: {item.nightlife_score}</span>
      </div>
    </div>
  );
}
```

### 7.3 Insights Integration (Required for NeuralSearch)

```jsx
import { createInsightsMiddleware } from 'instantsearch.js/es/middlewares';
import aa from 'search-insights';

aa('init', { appId: 'YOUR_APP_ID', apiKey: 'YOUR_SEARCH_API_KEY' });

// Add to InstantSearch
<InstantSearch
  indexName="travel_destinations"
  searchClient={searchClient}
  insights={{ insightsClient: aa }}
>
```

### 7.4 Click Event Tracking

```jsx
function CityCard({ item, sendEvent }) {
  return (
    <div 
      className="city-card"
      onClick={() => sendEvent('click', item, 'City Card Clicked')}
    >
      {/* ... card content ... */}
    </div>
  );
}
```

---

## 8. Key User Stories

1. **The Vibe Searcher:** *"I want a neon-punk city with great nightlife."* → Agent queries for "neon nightlife" and returns Tokyo and Seoul.
2. **The Budget Conscious:** *"Find me a cozy nature retreat that isn't too expensive."* → Agent filters by `nature_score` and searches for "cozy."
3. **The Visual Planner:** The user sees a card for "Lisbon" in the chat, clicks it, and is taken to a detailed "Vibe Profile" for that city.
4. **The Refiner:** *"Actually, make it somewhere in Europe"* → Agent adds geographic filter while maintaining previous vibe preferences.

---

## 9. Success Metrics

| Metric | Description | Target |
| --- | --- | --- |
| **Semantic Accuracy** | How well NeuralSearch handles abstract queries ("Gothic", "Cyberpunk") | >80% relevance |
| **Conversation Completion** | Users who click a destination card after starting chat | >40% |
| **Time to First Result** | From "Hello" to first destination card displayed | <10 seconds |
| **Query Refinement Rate** | Users who refine their initial query | >60% |
| **Event Collection** | Click events collected for NeuralSearch training | 1,000+ in 30 days |

---

## 10. Implementation Roadmap

### Phase 1: Data & Index Setup
- [ ] Source or create travel destination dataset
- [ ] Validate data against required schema (Section 3.2)
- [ ] Transform data to JSON format
- [ ] Generate `vibe_tags` using LLM enrichment script
- [ ] Create Algolia index `travel_destinations`
- [ ] Configure index settings and facets

### Phase 2: Search Configuration
- [ ] Configure ranking rules in Algolia Dashboard
- [ ] Set up synonyms for common travel terms
- [ ] Configure typo tolerance settings
- [ ] Test keyword search with sample queries
- [ ] **Note:** NeuralSearch activation deferred until event threshold met

### Phase 3: Agent Studio Setup
- [ ] Configure LLM provider (OpenAI/Gemini) with API key
- [ ] Create Agent with travel curation system prompt
- [ ] Define intent extraction patterns
- [ ] Configure Algolia Search tool connection
- [ ] Test agent responses in Agent Studio playground
- [ ] Enable completion caching for cost optimization

### Phase 4: Frontend Integration
- [ ] Initialize Next.js project
- [ ] Install React InstantSearch dependencies
- [ ] Implement `<Chat>` widget with Agent ID
- [ ] Create custom `CityCard` component
- [ ] Integrate Algolia Insights for event tracking
- [ ] Style chat interface and city cards
- [ ] Implement "View Details" navigation

### Phase 5: Testing & Optimization
- [ ] End-to-end testing of conversation flows
- [ ] Verify event tracking is working
- [ ] Test fallback behavior when no results found
- [ ] Performance optimization (lazy loading, caching)

### Phase 6: NeuralSearch Activation (Post-Launch)
- [ ] Monitor event collection via Algolia Analytics
- [ ] Activate NeuralSearch once 1,000+ events collected
- [ ] A/B test keyword vs. NeuralSearch performance
- [ ] Fine-tune based on semantic accuracy metrics

---

## 11. Technical References

* [Agent Studio Documentation](https://www.algolia.com/doc/guides/algolia-ai/agent-studio)
* [React InstantSearch Chat Widget](https://www.algolia.com/doc/api-reference/widgets/chat/react)
* [NeuralSearch Getting Started](https://www.algolia.com/doc/guides/ai-relevance/neuralsearch/get-started)
* [Algolia Insights API](https://www.algolia.com/doc/guides/sending-events/getting-started)
* [Index Settings Reference](https://www.algolia.com/doc/api-reference/settings-api-parameters)
