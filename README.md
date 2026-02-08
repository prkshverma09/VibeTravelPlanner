# Vibe Travel Planner

An AI-powered travel planning application that helps users discover destinations based on their desired travel vibe and preferences.

## Features

### Core Features
- **Vibe-Based Discovery** - Find destinations that match your mood and preferences
- **AI Chat Assistant** - Conversational interface powered by Algolia Agent Studio
- **Featured Destinations** - Browse curated travel destinations with rich details

### Trip Planning Tools
- **Weather Lookup** - Check current weather and forecasts for any destination
- **Budget Estimator** - Calculate trip costs based on duration, style, and travelers
- **Itinerary Generator** - Create day-by-day trip plans tailored to your interests
- **City Comparison** - Compare destinations side-by-side on key attributes

### Personalization
- **Wishlist** - Save destinations for later with notes
- **Preferences** - AI remembers your travel preferences during the session
- **Trip Context** - Build multi-city trip plans with duration and notes

### Map & Visualization
- **Interactive Map** - View destinations on a Mapbox-powered map
- **Geo Clusters** - See destination clusters by region

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Search**: Algolia (InstantSearch, Agent Studio)
- **Maps**: Mapbox GL
- **Styling**: Tailwind CSS, CSS Modules
- **Testing**: Vitest, Playwright, React Testing Library

## Project Structure

```
packages/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/        # Next.js app router pages
│   │   ├── components/ # React components
│   │   ├── context/    # React context providers
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # Business logic services
│   │   ├── config/     # Configuration and schemas
│   │   └── lib/        # Utility libraries
├── shared/             # Shared types and utilities
│   ├── src/
│   │   ├── types/      # TypeScript type definitions
│   │   └── fixtures/   # Mock data and fixtures
├── data-pipeline/      # Data ingestion scripts
│   └── src/            # ETL scripts for Algolia
e2e/                    # End-to-end tests
└── specs/              # Documentation and specs
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

```bash
# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
NEXT_PUBLIC_ALGOLIA_AGENT_ID=your_agent_id

# Mapbox (optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run E2E tests
cd e2e && npx playwright test
```

## Client-Side Tools

The chat interface supports the following AI-triggered tools:

| Tool | Description | Trigger Examples |
|------|-------------|------------------|
| `check_weather` | Weather lookup | "What's the weather like in Tokyo?" |
| `estimate_budget` | Cost calculator | "How much for 5 days in Paris?" |
| `generate_itinerary` | Trip planner | "Create a 3-day itinerary for Barcelona" |
| `compare_cities` | Comparison | "Compare Tokyo and Seoul" |
| `add_to_wishlist` | Save destination | "Save this for later" |
| `save_preference` | Remember preference | "I prefer beach destinations" |

## Testing

### Unit Tests
```bash
pnpm test                    # Run all tests
pnpm test:watch              # Watch mode
```

### E2E Tests
```bash
cd e2e
npx playwright install       # Install browsers (first time)
npx playwright test          # Run all E2E tests
npx playwright test --ui     # Interactive UI mode
```

## Documentation

- [PRD](./specs/PRD.md) - Product Requirements Document
- [Implementation Plan](./specs/IMPROVEMENT_5_IMPLEMENTATION_PLAN.md) - Detailed implementation guide
- [Agent Studio System Prompt](./specs/AGENT_STUDIO_SYSTEM_PROMPT.md) - AI configuration
- [Agent Studio Configuration Guide](./specs/AGENT_STUDIO_CONFIGURATION_GUIDE.md) - Setup instructions

## License

MIT
