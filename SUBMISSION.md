*This is a submission for the [Algolia Agent Studio Challenge](https://dev.to/challenges/algolia): Consumer-Facing Conversational Experiences*

## What I Built

**Vibe Travel Planner** is an AI-powered travel discovery app that replaces traditional filter-based search with a conversational, vibe-driven experience. Instead of checking boxes for "beach" or "budget," users simply describe the feeling they want from their trip -- "a romantic European getaway with cobblestone streets and great wine" -- and the AI agent finds matching destinations by searching an Algolia index of cities scored across culture, adventure, nature, beach, and nightlife dimensions.

The app goes beyond simple search. Through a rich conversational interface, users can:

- **Discover destinations by vibe** -- describe a mood, atmosphere, or experience and get matched destinations
- **Compare cities side-by-side** -- ask the agent to compare options across scores, climate, and practical details
- **Check weather** -- get real-time weather data and packing suggestions for any destination
- **Estimate budgets** -- calculate trip costs based on duration, travel style (budget/moderate/luxury), and number of travelers
- **Generate itineraries** -- get day-by-day trip plans tailored to interests and travel pace
- **Build trip plans** -- add destinations to a multi-city trip plan with duration and notes
- **Save to wishlist** -- bookmark destinations for future consideration

All of this is orchestrated through a single chat interface, with an interactive Mapbox-powered map that updates in real-time as the conversation progresses, showing destinations with clustering, popups, and route visualization.

## Demo

**Demo Video**: [Watch on YouTube](https://youtu.be/OhLubRJe6vE)

**GitHub**: [github.com/prkshverma09/VibeTravelPlanner](https://github.com/prkshverma09/VibeTravelPlanner)

### Key Screens

**Home Page** -- Split-view with the AI chat on the left and an interactive map on the right. As users chat, the map updates to show recommended destinations.

**City Detail Page** -- Rich destination pages with hero images, vibe tags, score badges (culture, adventure, nature, beach, nightlife), and a Plan Trip wizard.

**In-Chat Tools** -- The agent renders rich UI components inline: comparison tables, weather cards, budget breakdowns, and itinerary views all appear directly in the conversation.

## How I Used Algolia Agent Studio

### Data Indexed

The Algolia `travel_destinations` index contains city records with:

- **Text fields**: city name, country, continent, a vivid 150-250 word description, vibe tags (e.g., "romantic," "bustling," "hidden gem"), and searchable keywords
- **Numeric scores** (1-10): culture, adventure, nature, beach, nightlife -- enabling the agent to reason about which destinations best match a user's vibe
- **Practical data**: average cost per day, currency, safety rating, ideal trip length, language, timezone, accessibility flags (LGBTQ-friendly, family-friendly, solo-traveler-friendly, digital-nomad-friendly)
- **Geolocation**: `_geoloc` for map visualization and geo-search
- **Seasonal data**: best months to visit, cuisine variety, airport codes

The data pipeline (`packages/data-pipeline/`) generates city data enriched through OpenAI for atmospheric descriptions and vibe tags, then uploads to Algolia in batches with 22 synonym sets (e.g., "romantic" maps to "honeymoon, couples, love, anniversary") for broader query matching.

### Retrieval-Enhanced Dialogue

The Agent Studio configuration connects the chat to the Algolia index so the agent can search and retrieve city data during conversation. The system prompt (configured in Agent Studio) positions the AI as a "travel concierge specializing in vibe-based destination discovery" with specific instructions to:

1. **Extract vibe keywords** from natural language (e.g., "romantic" expands to "romantic, couples, intimate")
2. **Consider practical constraints** -- budget, dates, group composition, duration
3. **Provide rich contextual responses** -- explain *why* each destination matches their vibe, not just list results

### Targeted Prompting Approach

The system prompt is engineered with detailed tool-usage guidelines. For each of the 9 custom client-side tools, the prompt specifies:

- **When to use** each tool (trigger conditions)
- **Example phrases** that should activate each tool
- **Proactive suggestions** -- after showing search results, the agent should offer to check weather, estimate budgets, or generate itineraries
- **Tool chaining** -- combine weather + budget for trip planning, or comparison + itinerary when deciding between destinations
- **Context awareness** -- if a user mentions dates, proactively offer weather info; if they mention budget concerns, offer estimates

The frontend implements custom `layoutComponent` renderers for the search results, displaying city cards with images, vibe tags, and score badges directly in the chat -- making the conversation visually rich rather than text-only.

### Frontend Integration

The app uses Algolia's `<Chat>` component from `react-instantsearch`, wrapped in an `InstantSearchProvider` with Insights tracking enabled. Custom tools are registered client-side with `onToolCall` handlers and `layoutComponent` renderers. A city-card buffering system deduplicates results and syncs chat findings to the map in real-time.

## Why Fast Retrieval Matters

In a conversational travel planning session, **latency kills the vibe**. When someone says "I want a romantic beach getaway in Europe with great food," they expect destinations immediately -- not after a loading spinner. Algolia's sub-100ms search latency means the agent can:

1. **Search and respond in one conversational turn** -- the agent retrieves matching cities, reasons about them, and presents recommendations without noticeable delay
2. **Support multi-step tool chains smoothly** -- a user asking to "compare Santorini and Amalfi Coast, then show me the budget for the cheaper one" triggers multiple Algolia lookups (fetch both cities, compare scores, fetch cost data). Fast retrieval keeps these chains feeling like a natural conversation rather than a series of loading states
3. **Enable real-time map updates** -- as the agent finds destinations, the map immediately reflects results with markers and clustering. Slow retrieval would create a jarring disconnect between the chat and map
4. **Power fallback search gracefully** -- when the agent's initial query doesn't yield ideal results, the app runs enhanced search with query expansion (vibe tag mapping, continent filtering, synonym matching). Fast retrieval makes this multi-strategy approach invisible to the user

The combination of Algolia's fast retrieval with rich faceting (22 synonym sets, numeric score filters, geo-search, continent filtering) means the conversational agent can perform sophisticated, contextual searches that feel effortless -- turning what would traditionally be a complex multi-filter search experience into a simple chat about travel vibes.
