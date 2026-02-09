# Map-Chat Integration Bug Report

**Date**: 2026-02-09
**Tested against**: Manual test scenarios in `docs/MANUAL_TEST_MAP_CHAT_INTEGRATION.md`
**Automated tests**: `e2e/tests/map-chat-integration.spec.ts` (30 tests)

---

## Test Results Summary

| Status | Count |
|--------|-------|
| Passed | 25 |
| Failed (app bugs) | 5 |

---

## Bug 1: Duplicate City Cards Across Chat Turns (Scenario 1b)

**Severity**: Medium
**Scenario**: 1b — At most 2 destination cards, no duplicates
**Test**: `no duplicate city cards across multiple queries`

### Description

When sending multiple queries in the same chat session (e.g. "Romantic European city" followed by "a city with warm weather, cultural landmarks, or scenic views"), the chat can render **duplicate city cards** across turns. In testing, "Lisbon" appeared in both the first and second query's results.

### Root Cause

The deduplication logic in `TravelChat.tsx` uses two mechanisms:
1. `seenBatchKeys` — tracks cities rendered in previous turns
2. `ChatCityCardInner` — checks `seenBatchKeys.has(key)` to skip already-shown cities

However, `clearBuffer()` is called on each new query submission, which merges `currentBatchKeys` into `seenBatchKeys`. The timing issue is that `clearBuffer()` runs synchronously in the form submit handler, but the `bufferCity()` calls from the previous turn may still be pending in the `flushTimer` (600ms debounce). If the flush hasn't run yet when `clearBuffer()` executes, those cities aren't captured in `seenBatchKeys`.

Additionally, the Algolia search tool's `customLayoutComponent` calls `bufferCity()` for the new turn's results, but `seenBatchKeys` may not contain cities from the previous turn's search results if they were rendered via the `itemComponent` path rather than the `layoutComponent` path.

### Steps to Reproduce

1. Open the app
2. Send: "Romantic European city"
3. Wait for city cards to appear
4. Send: "a city with warm weather, cultural landmarks, or scenic views"
5. Observe that "Lisbon" appears in both turns' results

### Expected

Each city should appear at most once across the entire conversation.

### Files

- `packages/frontend/src/components/TravelChat/TravelChat.tsx` — lines 82–131 (buffer logic)

---

## Bug 2: MiniMap Not Rendering in Enhanced Search Results (Scenario 6)

**Severity**: High
**Scenario**: 6 — Inline mini-map in chat
**Test**: `enhanced search results show a mini-map with result cities`

### Description

When the user triggers "Try Enhanced Search", the fallback results section appears with city cards, but the **MiniMap component renders nothing** (returns `null`). The `miniMapWrap` container div exists in the DOM but is empty.

### Root Cause

The `MiniMap` component filters cities by checking for `_geoloc` coordinates:

```tsx
const withCoords = cities.filter(
  (c) => c._geoloc?.lat != null && c._geoloc?.lng != null
);
if (!mapboxToken || withCoords.length === 0) {
  return null;
}
```

The `fallbackResults` passed to `MiniMap` come directly from the Algolia search API. These raw search results **do not include `_geoloc` data** because the Algolia index does not return geo-location fields by default.

Meanwhile, the main map receives `chatResults` via `page.tsx`, which **enriches** them with `_geoloc` from `mockCities`:

```tsx
// page.tsx enrichment (applied to chatResults, NOT fallbackResults)
const byName = mockCityNameMap.get((chatCity.city || '').toLowerCase());
if (byName?._geoloc) {
  enriched.push({ ...chatCity, _geoloc: byName._geoloc });
}
```

The `fallbackResults` bypass this enrichment, so the MiniMap gets cities without coordinates and renders nothing.

### Fix

Enrich `fallbackResults` with `_geoloc` data from `mockCities` before passing to `MiniMap`, or have the `MiniMap` in the fallback section use the enriched `state.chatResults` from TripContext instead.

### Files

- `packages/frontend/src/components/TravelChat/TravelChat.tsx` — line 1176 (MiniMap usage)
- `packages/frontend/src/components/MiniMap/MiniMap.tsx` — line 58 (null return)
- `packages/frontend/src/app/page.tsx` — lines 21–49 (enrichment logic)

---

## Bug 3: Popup Close Button Obscured by Page Header (z-index)

**Severity**: High
**Scenario**: 4a — Add from map popup (multi-city operations)
**Tests**: `adding two cities shows "2 stops"`, `removing a city from popup decrements stop count`, `multiple itinerary operations are consistent`

### Description

The Mapbox popup's close button (×) is **obscured by the page header** (`<header class="text-center mb-12">`). When the map is zoomed to show markers near the top of the viewport, the popup's close button falls behind the header element. Playwright reports:

```
<header class="text-center mb-12">…</header> intercepts pointer events
```

This prevents users from closing popups when the marker is near the top of the map, making it impossible to open a second marker's popup without refreshing.

### Root Cause

The page header at the top of the page has no z-index set, but it naturally stacks above the map content due to DOM order. The Mapbox popup is rendered inside the map container, which doesn't have a z-index high enough to sit above the header.

### Fix

Add `position: relative; z-index: 10;` to the map container or the popup, or ensure the header has a lower z-index than the map's popup layer.

### Files

- `packages/frontend/src/app/page.tsx` — header element
- `packages/frontend/src/components/DestinationMap/DestinationMap.module.css` — map container z-index
- `packages/frontend/src/components/MapPopup/MapPopup.module.css` — popup z-index

---

## Bug 4: Map Marker pinInner Intercepts Pointer Events (Hover)

**Severity**: Medium
**Scenario**: 3 — Hover sync (chat card ↔ map marker)
**Test**: `hovering a map marker applies hover visual state`

### Description

The `MapMarker_pinInner` span element inside each marker **intercepts pointer events**, preventing the `onMouseEnter` callback on the marker button from firing. Playwright reports:

```
<span class="MapMarker_pinInner__2cmMe"></span> from
<div role="img" aria-label="Map marker" ...> subtree intercepts pointer events
```

This means that hovering over a map marker does not trigger the `SET_HOVERED_CITY` dispatch, so the hover sync from map → chat (highlighting the corresponding chat card when hovering a map marker) does not work.

Note: Hover sync from **chat → map** works correctly (hovering a city card in chat highlights the marker). Only the reverse direction (map → chat) is broken.

### Root Cause

The `.pinInner` span is absolutely positioned inside the `.pin` span, and it intercepts pointer events before they reach the parent button. The `onMouseEnter` is set on the `<button>` element, but the inner span captures the hover.

### Fix

Add `pointer-events: none` to the `.pinInner` and `.pin` spans in `MapMarker.module.css`, or move the `onMouseEnter`/`onMouseLeave` handlers to a wrapper that includes the inner elements.

### Files

- `packages/frontend/src/components/MapMarker/MapMarker.module.css` — `.pinInner`, `.pin` classes
- `packages/frontend/src/components/MapMarker/MapMarker.tsx` — hover handlers

---

## Bug 5: TravelChat.tsx `hits` Variable Redefinition (Compilation Warning)

**Severity**: Low (potential runtime error)
**Scenario**: N/A — code quality

### Description

In `TravelChat.tsx`, the `customLayoutComponent` function has a variable `hits` that is **used before being declared**, causing a compilation warning:

```
500 │ if (hasRenderedSearchResultsForCurrentTurn && hits.length === 0) return null;
501 │ const hits = Array.isArray(rawHits) ? (rawHits as AlgoliaCity[]) : [];
              ──┬─
                ╰── `hits` redefined here
```

The `hits` on line 500 references the variable declared on line 501, which is in the temporal dead zone (TDZ). This could cause a `ReferenceError` at runtime if `hasRenderedSearchResultsForCurrentTurn` is `true` and `hits.length` is evaluated before the `const hits` declaration.

### Fix

Move the `if (hasRenderedSearchResultsForCurrentTurn && hits.length === 0)` check to AFTER the `const hits = ...` declaration.

### Files

- `packages/frontend/src/components/TravelChat/TravelChat.tsx` — lines 500–501

---

## Bug 6: Tailwind CSS Content Config Missing `src/providers/`

**Severity**: Low (resilience issue)
**Scenario**: N/A — build configuration

### Description

The `tailwind.config.ts` content paths do not include `src/providers/`:

```ts
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  // Missing: './src/providers/**/*.{js,ts,jsx,tsx,mdx}'
],
```

The `InstantSearchProvider.tsx` in `src/providers/` uses Tailwind classes like `flex`, `items-center`, `justify-center`, `p-8`, `h-8`, `w-8`, `bg-red-50`, etc. These classes happen to work because they're also used in scanned files, but if those classes are removed elsewhere, the loading spinner and error states in `InstantSearchProvider` would break.

### Fix

Add `'./src/providers/**/*.{js,ts,jsx,tsx,mdx}'` to the `content` array, or use a broader pattern like `'./src/**/*.{js,ts,jsx,tsx,mdx}'`.

### Files

- `packages/frontend/tailwind.config.ts` — `content` array

---

## Passing Tests (25/30)

The following scenarios work correctly:

| Scenario | Tests | Status |
|----------|-------|--------|
| Smoke: Map and chat visible on load | 1 | ✅ |
| Smoke: Map displays markers | 1 | ✅ |
| Smoke: Popup buttons (View Details, Ask in Chat, Add) | 1 | ✅ |
| Smoke: Ask in Chat fills input | 1 | ✅ |
| Smoke: Add city shows stop count | 1 | ✅ |
| Smoke: Clear chat resets state | 1 | ✅ |
| Scenario 1: Default markers on load | 1 | ✅ |
| Scenario 1: Enhanced search updates map | 1 | ✅ |
| Scenario 1: Clear returns to defaults | 1 | ✅ |
| Scenario 1b: ≤ 2 unique cards per result | 1 | ✅ |
| Scenario 2: Popup Ask in Chat button | 1 | ✅ |
| Scenario 2: Ask fills input with city name | 1 | ✅ |
| Scenario 2: Ask auto-submits query | 1 | ✅ |
| Scenario 3: Chat card hover highlights marker | 2 | ✅ |
| Scenario 4a: Single city add/remove | 2 | ✅ |
| Scenario 4b: Chat tool updates itinerary | 1 | ✅ |
| Scenario 5: Map bounds after load | 1 | ✅ |
| Scenario 5: Pan keeps map functional | 1 | ✅ |
| Scenario 6: Mini-map markers in results | 1 | ✅ |
| Scenario 6: Compare tool mini-map | 1 | ✅ |
| Cross: Suggestion chip submits query | 1 | ✅ |
| Cross: View Details navigates | 1 | ✅ |

---

## How to Run the Tests

```bash
# Start the dev server
cd packages/frontend && npm run dev

# In another terminal, run the tests
cd e2e
SKIP_WEBSERVER=true npx playwright test tests/map-chat-integration.spec.ts --project=chromium

# Run with UI mode for debugging
SKIP_WEBSERVER=true npx playwright test tests/map-chat-integration.spec.ts --project=chromium --ui

# Run a specific test
SKIP_WEBSERVER=true npx playwright test tests/map-chat-integration.spec.ts --project=chromium --grep "mini-map"
```
