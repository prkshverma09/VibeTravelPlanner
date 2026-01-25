# PRD: "Vibe-Check" Travel & Experience Planner

## 1. Project Overview

**Vibe-Check** is an AI-powered travel concierge that allows users to discover destinations and experiences using natural, emotive language. Instead of traditional filters, it utilizes **Algolia NeuralSearch** and **Agent Studio** to map abstract "vibes" (e.g., *"moody architecture and quiet coffee shops"*) to real-world locations and data.

### Core Value Proposition

* **Aesthetic-First Discovery:** Moves beyond geolocation to "atmosphere" matching.
* **Conversational Precision:** Uses LLMs to turn chat into structured Algolia queries.
* **Seamless UI:** Renders rich destination cards directly in the chat via the InstantSearch widget.

---

## 2. Technical Stack

| Component | Tool / Tech | Purpose |
| --- | --- | --- |
| **Orchestration** | **Algolia Agent Studio** | Manages conversation flow and translates "vibe" intent into Search parameters. |
| **Search Engine** | **NeuralSearch** | Combines **Keyword Search** (exact matches) and **Vector Search** (semantic vibe matching). |
| **UI Framework** | **InstantSearch Chat Widget** | Interactive conversational interface for React/Next.js. |
| **Primary Data** | **Worldwide Travel Cities (Kaggle)** | 560+ cities with thematic ratings and descriptive "atmospheres." |

---

## 3. Data Strategy: The Kaggle Dataset

We will utilize the **"Worldwide Travel Cities (Ratings and Climate)"** dataset from Kaggle as our core index.

### 3.1 Data Attributes

Each record in the Algolia index will include:

* **Identifying Info:** `city`, `country`.
* **Thematic Ratings (Facets):** `culture_score`, `adventure_score`, `nature_score`, `beach_score`, `nightlife_score`.
* **Vibe Source:** `description` (A paragraph summarizing the city's mood and unique features).
* **Metadata:** `climate_type`, `best_time_to_visit`.

---

## 4. Indexing & Search Configuration

### 4.1 Indexing Workflow

1. **Preprocessing:** Convert the Kaggle CSV to a JSON array.
2. **Enrichment (Optional):** Use an LLM script to append a `vibe_tags` array (e.g., `["minimalist", "neon", "ancient"]`) to each city based on its description.
3. **Algolia Upload:** Push the JSON objects to an index named `travel_destinations`.

### 4.2 Search Configuration

* **Searchable Attributes:** `city`, `country`, `description`, `vibe_tags`.
* **Attributes for Faceting:** `culture_score`, `nightlife_score`, `climate_type`.
* **NeuralSearch Setup:** Enable NeuralSearch on the `description` field. This allows a user asking for "a place that feels like a fantasy novel" to match with cities like Edinburgh or Prague, even if the word "fantasy" isn't in the text.

---

## 5. Functional Requirements

### 5.1 Agent Studio Implementation

* **Intent Extraction:** The Agent is programmed to extract constraints. If a user says *"I want a beach vibe but with lots of culture,"* the Agent should:
* Set `beach_score > 4`.
* Set `culture_score > 4`.
* Search for "beach vibe."


* **Memory:** Maintain context across turns (e.g., *"Actually, make it somewhere in Europe"* updates the previous query with a geographical filter).

### 5.2 Frontend (InstantSearch Chat Widget)

* **Custom Templates:** Use the `itemComponent` to render a "City Card" that includes the city name, a "Top Vibe" badge, and a summary.
* **Fallback Logic:** If the "vibe" search returns no direct hits, the widget should trigger a "broaden search" suggestion to the user.

---

## 6. Key User Stories

1. **The Vibe Searcher:** *"I want a neon-punk city with great nightlife."* → Agent queries for "neon nightlife" and returns Tokyo and Seoul.
2. **The Budget Conscious:** *"Find me a cozy nature retreat that isn't too expensive."* → Agent filters by `nature_score` and searches for "cozy."
3. **The Visual Planner:** The user sees a card for "Lisbon" in the chat, clicks it, and is taken to a detailed "Vibe Profile" for that city.

---

## 7. Success Metrics for the Challenge

1. **Semantic Accuracy:** Measuring how well NeuralSearch handles abstract queries (e.g., "Gothic" or "Cyberpunk").
2. **Conversion Speed:** Time taken from the first "Hello" to a user clicking a destination card.
3. **Integration Depth:** Successful use of the **InstantSearch Chat Widget** as the primary UI.

---

## 8. Implementation Roadmap

* **Phase 1:** Clean and upload the Kaggle dataset to Algolia.
* **Phase 2:** Configure NeuralSearch and ranking rules in the Algolia Dashboard.
* **Phase 3:** Create the Agent in **Agent Studio** with specific system instructions for travel curation.
* **Phase 4:** Embed the **InstantSearch Chat Widget** into a Next.js frontend and connect to the Agent API.
