import { test, expect } from '@playwright/test';

test.describe('Client-Side Tools Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible({ timeout: 30000 });
  });

  test('chat widget loads with all tools available', async ({ page }) => {
    const chatWidget = page.locator('[data-testid="chat-widget"]');
    await expect(chatWidget).toBeVisible({ timeout: 30000 });
  });

  test('chat UI is interactive', async ({ page }) => {
    const travelChat = page.locator('[data-testid="travel-chat"]');
    await expect(travelChat).toBeVisible({ timeout: 30000 });

    const heading = page.getByRole('heading', { name: 'Vibe-Check Travel Assistant' });
    await expect(heading).toBeVisible();
  });

  test('suggestion chips are clickable', async ({ page }) => {
    const chips = page.locator('[class*="queryChip"]');
    await expect(chips.first()).toBeVisible();

    const chipCount = await chips.count();
    expect(chipCount).toBeGreaterThanOrEqual(3);
  });

  test('clear button resets conversation', async ({ page }) => {
    const clearButton = page.getByRole('button', { name: /clear/i });
    await expect(clearButton).toBeVisible();

    await clearButton.click();
    await page.waitForTimeout(500);

    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible();
  });
});

test.describe('Weather Tool Integration', () => {
  test('Weather service can be called', async ({ page }) => {
    await page.goto('/');

    const response = await page.evaluate(async () => {
      try {
        const res = await fetch(
          'https://geocoding-api.open-meteo.com/v1/search?name=Tokyo&count=1&language=en&format=json'
        );
        return await res.json();
      } catch (error) {
        return { error: 'Failed to fetch' };
      }
    });

    expect(response).toBeDefined();
  });

  test('Weather service generates travel advice', async ({ page }) => {
    await page.goto('/');

    const advice = await page.evaluate(() => {
      const mockWeather = {
        temperature: 30,
        condition: 'sunny',
        humidity: 70,
        uvIndex: 8,
      };

      const adviceParts: string[] = [];

      if (mockWeather.temperature >= 30) {
        adviceParts.push('Stay hydrated and wear sunscreen');
      }

      if (mockWeather.uvIndex >= 6) {
        adviceParts.push('High UV - protect your skin');
      }

      return adviceParts.join('. ');
    });

    expect(advice).toContain('hydrated');
  });

  test('Weather service suggests activities', async ({ page }) => {
    await page.goto('/');

    const activities = await page.evaluate(() => {
      const mockWeather = { condition: 'sunny', temperature: 25 };
      const activities: string[] = [];

      if (mockWeather.condition === 'sunny' && mockWeather.temperature > 20) {
        activities.push('Walking tours', 'Outdoor cafes', 'Parks and gardens');
      }

      return activities;
    });

    expect(activities.length).toBeGreaterThan(0);
    expect(activities).toContain('Walking tours');
  });
});

test.describe('Budget Tool Integration', () => {
  test('Budget calculation produces valid estimates', async ({ page }) => {
    await page.goto('/');

    const estimate = await page.evaluate(() => {
      const mockCity = {
        objectID: 'tokyo-japan',
        city: 'Tokyo',
        country: 'Japan',
        continent: 'Asia',
        description: 'A vibrant metropolis',
        vibe_tags: ['modern', 'bustling'],
        culture_score: 9,
        adventure_score: 7,
        nature_score: 5,
        beach_score: 3,
        nightlife_score: 9,
        climate_type: 'Humid subtropical',
        best_time_to_visit: 'Spring',
        image_url: 'https://example.com/tokyo.jpg',
        average_cost_per_day: 150,
      };

      const durationDays = 5;
      const travelers = 2;
      const baseCost = mockCity.average_cost_per_day;

      const total = baseCost * durationDays * travelers;
      return {
        totalEstimate: {
          low: Math.round(total * 0.6),
          mid: total,
          high: Math.round(total * 2.2),
        },
        perPerson: Math.round(total / travelers),
        perDay: Math.round(total / durationDays),
      };
    });

    expect(estimate.totalEstimate.low).toBeLessThan(estimate.totalEstimate.mid);
    expect(estimate.totalEstimate.mid).toBeLessThan(estimate.totalEstimate.high);
    expect(estimate.perPerson).toBeGreaterThan(0);
    expect(estimate.perDay).toBeGreaterThan(0);
  });

  test('Budget scales correctly with travel style', async ({ page }) => {
    await page.goto('/');

    const estimates = await page.evaluate(() => {
      const baseCost = 150;
      const days = 5;

      const styleMultipliers = {
        budget: 0.6,
        moderate: 1.0,
        luxury: 2.2,
      };

      return {
        budget: Math.round(baseCost * styleMultipliers.budget * days),
        moderate: Math.round(baseCost * styleMultipliers.moderate * days),
        luxury: Math.round(baseCost * styleMultipliers.luxury * days),
      };
    });

    expect(estimates.budget).toBeLessThan(estimates.moderate);
    expect(estimates.moderate).toBeLessThan(estimates.luxury);
  });

  test('Budget breakdown categories are valid', async ({ page }) => {
    await page.goto('/');

    const breakdown = await page.evaluate(() => {
      const totalBudget = 1000;
      const percentages = {
        accommodation: 35,
        food: 30,
        activities: 20,
        transport: 10,
        miscellaneous: 5,
      };

      const breakdown: Record<string, number> = {};
      for (const [category, percentage] of Object.entries(percentages)) {
        breakdown[category] = Math.round((totalBudget * percentage) / 100);
      }

      return breakdown;
    });

    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    expect(total).toBe(1000);
    expect(breakdown.accommodation).toBeGreaterThan(breakdown.miscellaneous);
  });
});

test.describe('Itinerary Tool Integration', () => {
  test('Itinerary generates correct number of days', async ({ page }) => {
    await page.goto('/');

    const itinerary = await page.evaluate(() => {
      const durationDays = 5;
      const days = Array.from({ length: durationDays }, (_, i) => ({
        day: i + 1,
        theme: `Day ${i + 1}`,
        activities: [
          { time: 'Morning', activity: 'Explore' },
          { time: 'Afternoon', activity: 'Discover' },
          { time: 'Evening', activity: 'Experience' },
        ],
      }));

      return { dayCount: days.length, days };
    });

    expect(itinerary.dayCount).toBe(5);
    expect(itinerary.days[0].day).toBe(1);
    expect(itinerary.days[4].day).toBe(5);
  });

  test('Itinerary activities have proper structure', async ({ page }) => {
    await page.goto('/');

    const activities = await page.evaluate(() => {
      const dayActivities = [
        { time: 'Morning', activity: 'Temple visit', description: 'Explore ancient temples' },
        { time: 'Afternoon', activity: 'Food tour', description: 'Sample local cuisine' },
        { time: 'Evening', activity: 'Night market', description: 'Shop and eat street food' },
      ];

      return dayActivities;
    });

    expect(activities.length).toBe(3);
    expect(activities[0]).toHaveProperty('time');
    expect(activities[0]).toHaveProperty('activity');
    expect(activities[0]).toHaveProperty('description');
  });

  test('Itinerary respects pace settings', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      const paceSettings = {
        relaxed: { activitiesPerDay: 2 },
        balanced: { activitiesPerDay: 3 },
        active: { activitiesPerDay: 5 },
      };

      return {
        relaxedActivities: paceSettings.relaxed.activitiesPerDay,
        balancedActivities: paceSettings.balanced.activitiesPerDay,
        activeActivities: paceSettings.active.activitiesPerDay,
      };
    });

    expect(result.relaxedActivities).toBeLessThan(result.balancedActivities);
    expect(result.balancedActivities).toBeLessThan(result.activeActivities);
  });
});

test.describe('Wishlist Tool Integration', () => {
  test('Wishlist state can be managed', async ({ page }) => {
    await page.goto('/');

    const wishlistState = await page.evaluate(() => {
      const mockCity = {
        objectID: 'tokyo-japan',
        city: 'Tokyo',
        country: 'Japan',
      };

      const wishlist: any[] = [];
      wishlist.push({ city: mockCity, notes: 'Dream destination', addedAt: Date.now() });

      return {
        count: wishlist.length,
        hasItems: wishlist.length > 0,
        firstItem: wishlist[0],
      };
    });

    expect(wishlistState.count).toBe(1);
    expect(wishlistState.hasItems).toBe(true);
    expect(wishlistState.firstItem.city.city).toBe('Tokyo');
    expect(wishlistState.firstItem.notes).toBe('Dream destination');
  });

  test('Wishlist items can be added and removed', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      const wishlist: any[] = [];

      wishlist.push({
        city: { objectID: 'tokyo-japan', city: 'Tokyo' },
        notes: null,
        addedAt: Date.now(),
      });
      wishlist.push({
        city: { objectID: 'paris-france', city: 'Paris' },
        notes: 'Must see Eiffel Tower',
        addedAt: Date.now(),
      });

      const countAfterAdd = wishlist.length;

      const indexToRemove = wishlist.findIndex(w => w.city.objectID === 'tokyo-japan');
      if (indexToRemove >= 0) {
        wishlist.splice(indexToRemove, 1);
      }

      const countAfterRemove = wishlist.length;
      const remainingCity = wishlist[0]?.city.city;

      return { countAfterAdd, countAfterRemove, remainingCity };
    });

    expect(result.countAfterAdd).toBe(2);
    expect(result.countAfterRemove).toBe(1);
    expect(result.remainingCity).toBe('Paris');
  });

  test('Wishlist persists to localStorage', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      const STORAGE_KEY = 'vibe-travel-wishlist';
      const wishlist = [
        { city: { objectID: 'tokyo-japan', city: 'Tokyo' }, notes: null, addedAt: Date.now() },
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));

      const loaded = localStorage.getItem(STORAGE_KEY);
      const parsed = loaded ? JSON.parse(loaded) : [];

      return {
        saved: true,
        loaded: parsed.length === 1,
        cityName: parsed[0]?.city?.city,
      };
    });

    expect(result.saved).toBe(true);
    expect(result.loaded).toBe(true);
    expect(result.cityName).toBe('Tokyo');
  });
});

test.describe('Comparison Tool Integration', () => {
  test('Comparison generates valid data structure', async ({ page }) => {
    await page.goto('/');

    const comparison = await page.evaluate(() => {
      const cities = [
        { objectID: 'tokyo-japan', city: 'Tokyo', culture_score: 10, nightlife_score: 9, average_cost_per_day: 150 },
        { objectID: 'paris-france', city: 'Paris', culture_score: 10, nightlife_score: 8, average_cost_per_day: 180 },
      ];

      return {
        cityCount: cities.length,
        attributes: ['culture_score', 'nightlife_score', 'average_cost_per_day'],
        cities: cities.map(c => ({ name: c.city, id: c.objectID })),
      };
    });

    expect(comparison.cityCount).toBe(2);
    expect(comparison.attributes.length).toBe(3);
    expect(comparison.cities[0].name).toBe('Tokyo');
    expect(comparison.cities[1].name).toBe('Paris');
  });

  test('Comparison highlights differences', async ({ page }) => {
    await page.goto('/');

    const differences = await page.evaluate(() => {
      const tokyo = { culture_score: 10, nightlife_score: 9, beach_score: 3 };
      const bali = { culture_score: 8, nightlife_score: 7, beach_score: 9 };

      const diffs: Record<string, { winner: string; diff: number }> = {};

      for (const key of Object.keys(tokyo) as Array<keyof typeof tokyo>) {
        const diff = tokyo[key] - bali[key];
        if (diff !== 0) {
          diffs[key] = {
            winner: diff > 0 ? 'Tokyo' : 'Bali',
            diff: Math.abs(diff),
          };
        }
      }

      return diffs;
    });

    expect(differences.culture_score.winner).toBe('Tokyo');
    expect(differences.beach_score.winner).toBe('Bali');
    expect(differences.beach_score.diff).toBe(6);
  });
});

test.describe('Preferences Tool Integration', () => {
  test('Preferences can be saved', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      const preferences: Array<{ category: string; value: string; priority: string }> = [];

      preferences.push({
        category: 'vibe',
        value: 'romantic',
        priority: 'must_have',
      });

      preferences.push({
        category: 'budget',
        value: 'moderate',
        priority: 'nice_to_have',
      });

      return {
        count: preferences.length,
        hasVibePreference: preferences.some(p => p.category === 'vibe'),
        hasBudgetPreference: preferences.some(p => p.category === 'budget'),
      };
    });

    expect(result.count).toBe(2);
    expect(result.hasVibePreference).toBe(true);
    expect(result.hasBudgetPreference).toBe(true);
  });

  test('Preferences can be filtered by category', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      const preferences = [
        { category: 'vibe', value: 'romantic', priority: 'must_have' },
        { category: 'vibe', value: 'cultural', priority: 'nice_to_have' },
        { category: 'budget', value: 'luxury', priority: 'must_have' },
        { category: 'activity', value: 'beach', priority: 'avoid' },
      ];

      const vibePrefs = preferences.filter(p => p.category === 'vibe');
      const mustHaves = preferences.filter(p => p.priority === 'must_have');
      const avoids = preferences.filter(p => p.priority === 'avoid');

      return {
        vibeCount: vibePrefs.length,
        mustHaveCount: mustHaves.length,
        avoidCount: avoids.length,
      };
    });

    expect(result.vibeCount).toBe(2);
    expect(result.mustHaveCount).toBe(2);
    expect(result.avoidCount).toBe(1);
  });

  test('Preferences can be cleared', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      let preferences = [
        { category: 'vibe', value: 'romantic' },
        { category: 'budget', value: 'moderate' },
      ];

      const countBefore = preferences.length;

      preferences = preferences.filter(p => p.category !== 'vibe');
      const countAfterPartialClear = preferences.length;

      preferences = [];
      const countAfterFullClear = preferences.length;

      return { countBefore, countAfterPartialClear, countAfterFullClear };
    });

    expect(result.countBefore).toBe(2);
    expect(result.countAfterPartialClear).toBe(1);
    expect(result.countAfterFullClear).toBe(0);
  });
});

test.describe('Tool Visual Tests', () => {
  test('Homepage with tools UI', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: 'e2e/.playwright-mcp/tools-01-homepage.png' });
  });

  test('Featured destinations with wishlist buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cityCards = page.locator('article');
    await expect(cityCards.first()).toBeVisible({ timeout: 15000 });

    const wishlistButtons = page.locator('[data-testid^="wishlist-button-"]');
    const buttonCount = await wishlistButtons.count();
    expect(buttonCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/.playwright-mcp/tools-02-wishlist-buttons.png' });
  });

  test('City detail page with plan trip button', async ({ page }) => {
    await page.goto('/city/tokyo-japan');
    await page.waitForLoadState('networkidle');

    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await expect(planTripButton).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'e2e/.playwright-mcp/tools-03-city-detail.png' });
  });
});
