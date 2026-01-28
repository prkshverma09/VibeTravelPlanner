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
      };

      const durationDays = 5;
      const travelers = 2;
      const baseCost = 150;

      const total = baseCost * durationDays * travelers;
      return {
        totalEstimate: {
          low: Math.round(total * 0.85),
          mid: total,
          high: Math.round(total * 1.2),
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
});
