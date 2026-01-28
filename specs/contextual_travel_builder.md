# PRD: "Your Neighborhood" Contextual Travel Builder

## 1. Executive Summary

**Vision:** Transforming a static hotel booking into a living neighborhood experience.
**Problem:** When users book a hotel, they are often overwhelmed by "Top 10" lists for an entire city (e.g., "Best things to do in Paris"). They lack immediate, hyper-local context for what is actually reachable within a 5-10 minute walk of their specific stay.
**Solution:** An Algolia-powered agent that monitors the user's itinerary. When a hotel is added, the agent instantly retrieves and displays a curated "Neighborhood Layer" on the map, featuring highly-rated, contextually relevant points of interest (POIs) within a 1km radius.

---

## 2. Target Audience

* **The Efficient Planner:** Users who want to maximize their time and avoid cross-city commutes.
* **The "Slow Traveler":** Users looking for authentic local cafes and spots near their "home base."

---

## 3. User Workflow (The "Happy Path")

1. **Selection:** User searches for hotels in Paris and clicks "Save to Itinerary" on a hotel in the 7th Arrondissement.
2. **Trigger:** The `save_to_itinerary` event triggers the **Algolia Agent**.
3. **Proactive Retrieval:** The agent identifies the hotel's `_geoloc` coordinates.
4. **Display:** Instead of a pop-up or chat message, the map UI smoothly transitions to show a 1km circular "Neighborhood Glow."
5. **Intelligence:** The map populates with custom icons for:
* **The Morning Routine:** Top-rated bakeries/cafes.
* **The Culture Fix:** Museums or galleries within walking distance.
* **The Logistical Anchor:** The nearest Metro stations or pharmacies.



---

## 4. Functional Requirements

### 4.1. Core Intelligence (Algolia Agent Studio)

* **Agent Logic:** The agent must monitor state changes in the "Itinerary" index.
* **Hybrid Retrieval:** Use **NeuralSearch** to understand "vibe" (e.g., if the hotel is "Luxury/Boutique," prioritize "High-end Dining") combined with **Geo-Search** for physical proximity.
* **Filtering Logic:**
* Radius: Default to `1000m` (1km).
* Ranking: Sort by a custom `weighted_score` (Algolia Ranking Formula: `Ranking = (0.6 * distance) + (0.4 * rating)`).



### 4.2. Data Architecture (Indices)

| Index Name | Description | Key Attributes |
| --- | --- | --- |
| `itinerary_items` | User's saved items. | `objectID`, `type` (hotel), `_geoloc`, `user_id`. |
| `poi_master` | 50,000+ Global POIs. | `name`, `category`, `rating`, `_geoloc`, `description`. |

### 4.3. UI Components

* **"Neighborhood Glow" Layer:** A semi-transparent SVG overlay on the map centered on the hotel.
* **Dynamic Legend:** A sidebar that populates with "While you're staying here..." cards. Each card is an Algolia hit.
* **Proactive Toast:** A subtle notification: *"We've mapped out the best of the 7th Arrondissement for you."*

---

## 5. Technical Implementation (The Algolia Edge)

### Step 1: Triggering the Agent

Use the **Agent Studio SDK** to create a listener on the user's session.

```javascript
// Conceptual Agent Trigger
agent.on('item_added', (item) => {
  if (item.type === 'hotel') {
    runNeighborhoodDiscovery(item._geoloc);
  }
});

```

### Step 2: The Geo-Query

Configure the Agent to perform a `browse` or `search` on the `poi_master` index using the `aroundLatLng` parameter.

* **Parameter:** `aroundLatLng: "48.8584, 2.2945"` (Coordinates for the 7th Arr.).
* **Parameter:** `aroundRadius: 1000`.
* **Contextual Filtering:** Apply a rule: *If hotel.stars > 4, then filters: "price_range:$$ OR price_range:$$$"*.

### Step 3: Observability

Use **Agent Studio Traces** to ensure the agent isn't retrieving irrelevant POIs (e.g., ensuring a "Paris, Texas" POI doesn't appear for a "Paris, France" hotel).

---

## 6. Success Metrics

* **Engagement Rate:** Percentage of users who click a suggested "Neighborhood" POI after saving a hotel.
* **Reduction in Search:** Decrease in manual searches for "cafes" or "transport" within the same session.
* **Conversion:** Number of "Secondary Bookings" (tours/restaurants) made via the proactive suggestions.

---

## 7. Next Steps for the Challenge

1. **Index Setup:** Import a dataset of Paris POIs into Algolia.
2. **Agent Configuration:** Define the "Prompt" in Agent Studio to act as a *Location Strategist* who prioritizes walking distance.
3. **Frontend:** Use the **InstantSearch Geo-Search** widget to render the results on a Google/Mapbox map.

**Would you like me to generate the JSON schema for your `poi_master` index to get your Algolia setup started?**
