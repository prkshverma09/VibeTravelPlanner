# Manual Test Scenarios: Map–Chat Integration

Use this guide to manually verify that the map and chat UIs work together as intended.

**Prerequisites**
- App running locally: `cd packages/frontend && pnpm dev`
- `NEXT_PUBLIC_MAPBOX_TOKEN` set in `.env.local` (map will not load without it)
- For chat-driven map updates: `NEXT_PUBLIC_ALGOLIA_AGENT_ID` set (optional; otherwise use “Try Enhanced Search” to get results)

---

## Scenario 1: Chat results drive the map

**Goal:** When the chat returns city recommendations, the map shows only those cities and fits the view to them.

| Step | Action | Expected result |
|------|--------|------------------|
| 1 | Open the app and go to the home page. | You see the chat panel (left) and the map (right). Map shows default/mock cities. |
| 2 | In the chat, type a vibe (e.g. “Romantic European city”) and send. | Chat responds (from Algolia agent or enhanced search). |
| 3 | If the chat shows city cards, wait for them to appear. If not, click “Try Enhanced Search” when offered. | Some city cards appear in the chat. |
| 4 | Look at the map. | Map updates to show only the recommended cities (or the enhanced-search results) and zooms/pans to fit them. |
| 5 | Click “Clear” in the chat header. | Chat clears; map can return to showing the default set of cities (or empty, depending on implementation). |

**Pass:** Map destinations change when chat returns new city results and the view fits those cities.

**1b – At most 2 destination cards, no duplicates**

| Step | Action | Expected result |
|------|--------|------------------|
| 1 | Open the app and go to the home page. | Chat panel and map visible. |
| 2 | In the chat, send: "Romantic European city". | Assistant replies; may show city cards. |
| 3 | Send a second message: "a city with warm weather, cultural landmarks, or scenic views". | Assistant replies again. |
| 4 | In the assistant reply(ies), count the destination cards (city cards with name/description). | There are at most 2 destination cards in total for that turn. |
| 5 | Check the city names on those cards. | No duplicate city names (e.g. Lisbon must not appear twice). |

**Pass:** Each assistant turn shows at most 2 unique destination cards (no duplicates).

---

## Scenario 2: Map click → “Ask in Chat”

**Goal:** Clicking a marker and then “Ask in Chat” sends a city-focused query into the chat.

| Step | Action | Expected result |
|------|--------|------------------|
| 1 | On the home page, wait for the map to load and show markers. | Map shows city markers. |
| 2 | Click any map marker. | A popup opens with city name, description, and buttons. |
| 3 | In the popup, find the “Ask in Chat” button. | Button is visible (purple/lavender style). |
| 4 | Click “Ask in Chat”. | Chat input is filled with text like “Tell me more about [City], [Country]” and the message may auto-send (or you can send it). |
| 5 | Check the chat. | A new message is sent (or is in the input) about that city; the assistant may reply with more details. |

**Pass:** Popup “Ask in Chat” fills (and optionally sends) a city-specific query in the chat.

---

## Scenario 3: Hover sync (chat card ↔ map marker)

**Goal:** Hovering a city card in the chat highlights the matching marker on the map, and hovering a marker can highlight the card.

| Step | Action | Expected result |
|------|--------|------------------|
| 1 | Ensure the chat has shown some city results (e.g. from Scenario 1). | At least one city card is visible in the chat. |
| 2 | Hover over a city card in the chat. | The corresponding marker on the map gets a highlight (e.g. pulse/glow). |
| 3 | Move the mouse off the card. | The marker returns to normal. |
| 4 | Hover over a marker on the map. | That marker highlights. |
| 5 | Move the mouse off the marker. | Highlight is removed. |

**Pass:** Hovering chat cards and map markers produces visible highlight feedback on the map.

---

## Scenario 4: Trip plan in sync (chat + map)

**Goal:** Adding a city to the trip from the chat or the map updates the same trip and shows it on the map.

**4a – Add from map popup**

| Step | Action | Expected result |
|------|--------|------------------|
| 1 | Click a map marker to open the popup. | Popup shows “+ Add” (or “Add” to itinerary). |
| 2 | Click “+ Add” (or “Add”). | Button changes to “Remove”; an itinerary strip/panel appears on the map (e.g. “1 stop” and “Clear”). |
| 3 | Add a second city the same way (click another marker, then Add). | “2 stops” (or similar) and a route line between the two cities (if implemented). |
| 4 | Click “Clear” in the itinerary area on the map. | Itinerary clears; “Remove” on popups goes back to “Add” for those cities. |

**4b – Add from chat**

| Step | Action | Expected result |
|------|--------|------------------|
| 1 | In the chat, trigger an action that adds a city to the trip (e.g. “Add Paris to my trip” or use a tool that adds to trip). | Chat confirms the city was added. |
| 2 | Look at the map. | Map shows that city in the itinerary (e.g. “1 stop” or more, route line if multiple stops). |
| 3 | Click that city’s marker and open the popup. | Popup shows “Remove” (already in itinerary). |

**Pass:** Trip is shared between chat and map; adding/removing in either place updates the other and the map itinerary UI.

---

## Scenario 5: Map bounds as chat context (optional)

**Goal:** After panning/zooming the map, the chat can use the visible region to bias recommendations.

| Step | Action | Expected result |
|------|--------|------------------|
| 1 | Pan and zoom the map to a region (e.g. Europe). | Map view updates. |
| 2 | In the chat, ask for recommendations (e.g. “Suggest some cities for me”). | If the agent uses the `get_map_bounds` tool, it may prefer cities in the visible region. |
| 3 | Change the map to another region and ask again. | Recommendations may shift toward the new region (depends on agent configuration). |

**Pass:** (Optional) Recommendations align better with the current map view when the agent uses map bounds.

---

## Scenario 6: Inline mini-map in chat

**Goal:** When the chat shows a set of cities (e.g. enhanced search or compare), a small map appears with those cities.

| Step | Action | Expected result |
|------|--------|------------------|
| 1 | Trigger enhanced search (e.g. type a query, then “Try Enhanced Search” when offered). | A block of results appears with city cards. |
| 2 | Look above or within that results block. | A small map (mini-map) appears showing markers for the result cities. |
| 3 | Click a marker on the mini-map. | The main map pans/zooms to that city and/or selects it. |
| 4 | If the app has “compare cities,” run a comparison. | Comparison view includes a mini-map of the compared cities; clicking a marker there focuses the main map. |

**Pass:** Mini-map appears with chat result cities and clicking its markers updates the main map.

---

## Quick smoke checklist

- [ ] Map and chat both visible on load.
- [ ] Clicking a marker opens a popup with “View Details,” “Ask in Chat,” and “Add.”
- [ ] “Ask in Chat” fills the chat input with a city query.
- [ ] Adding a city from the popup shows “1 stop” (or more) on the map.
- [ ] Chat city results (or enhanced search) update which cities appear on the map.
- [ ] Hovering a city card in the chat highlights the matching map marker.
- [ ] Clearing the chat (or trip) resets map/state as designed.

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| Map is blank or “Map is not available” | `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`. |
| Chat does not respond or no city results | `NEXT_PUBLIC_ALGOLIA_AGENT_ID` and Algolia keys; or use “Try Enhanced Search” after a query. |
| Map never updates when chat returns cities | Ensure you got actual city results (cards or enhanced search list). |
| Hover highlight not visible | Ensure the city on the map has the same identity (e.g. same `objectID`) as the chat card. |
