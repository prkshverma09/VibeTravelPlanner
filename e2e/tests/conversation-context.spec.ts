import { test, expect } from '@playwright/test';

test.describe('Conversation Context Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Context Preservation', () => {
    test('should maintain conversation context across multiple queries', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      const queries = [
        'I want a romantic destination',
        'with beautiful beaches',
        'and good nightlife',
        'in Asia',
        'budget friendly',
      ];

      for (const query of queries) {
        await chatInput.fill(query);
        await chatInput.press('Enter');
        await page.waitForTimeout(2500);
      }

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });

    test('should handle preference override commands', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('beach destination in Europe');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);

      await chatInput.fill('actually, make it Asia instead');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });

    test('should handle reset commands', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('romantic beach');
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);

      await chatInput.fill('cultural museums');
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);

      await chatInput.fill('start over');
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);

      await chatInput.fill('adventure destination');
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);
    });
  });

  test.describe('Comparison Mode', () => {
    test('should request comparison between two cities', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('compare Paris and Tokyo');
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });

    test('should request comparison between multiple cities', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('compare Bali, Phuket, and Maldives');
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });

    test('should compare based on specific attributes', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('compare Tokyo and Seoul for nightlife and culture');
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);
    });
  });

  test.describe('Trip Planning', () => {
    test('should add destination to trip plan', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('add Tokyo to my trip for 5 days');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });

    test('should add multiple destinations', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      const destinations = [
        'add Tokyo to my trip for 3 days',
        'add Kyoto for 2 days',
        'add Osaka for 2 days',
      ];

      for (const dest of destinations) {
        await chatInput.fill(dest);
        await chatInput.press('Enter');
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Itinerary Generation', () => {
    test('should generate basic itinerary', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('create a 3 day itinerary for Paris');
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });

    test('should generate itinerary with specific interests', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('create a 5 day itinerary for Tokyo focusing on food and culture');
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);
    });

    test('should generate itinerary with travel style', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('create a relaxed 4 day itinerary for Bali');
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);
    });
  });

  test.describe('Complex Conversation Flows', () => {
    test('Full trip planning conversation', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      const conversationFlow = [
        'I want to plan a 2 week trip',
        'romantic destinations',
        'in Asia',
        'with beaches',
        'compare Bali and Phuket',
        'I like Bali better',
        'add Bali for 7 days',
        'now add a cultural destination',
        'add Kyoto for 5 days',
        'create an itinerary for Bali',
      ];

      for (const message of conversationFlow) {
        await chatInput.fill(message);
        await chatInput.press('Enter');
        await page.waitForTimeout(2500);
      }

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });

    test('Preference evolution conversation', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      const evolutionFlow = [
        'I want adventure',
        'somewhere warm',
        'actually I prefer culture over adventure',
        'in Europe',
        'wait, make it budget friendly',
        'forget budget, I want luxury',
        'in Southeast Asia instead',
      ];

      for (const message of evolutionFlow) {
        await chatInput.fill(message);
        await chatInput.press('Enter');
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle rapid sequential queries', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      const queries = ['beach', 'mountain', 'city', 'island'];

      for (const query of queries) {
        await chatInput.fill(query);
        await chatInput.press('Enter');
        await page.waitForTimeout(500);
      }

      await page.waitForTimeout(3000);
      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });

    test('should handle special characters in queries', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      const specialQueries = [
        "destinations with great café culture",
        'somewhere with 5-star hotels',
        'romantic "paris-like" city',
      ];

      for (const query of specialQueries) {
        await chatInput.fill(query);
        await chatInput.press('Enter');
        await page.waitForTimeout(2000);
      }
    });

    test('should handle very long queries', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      const longQuery = 'I am looking for a romantic destination with beautiful beaches, great food, vibrant nightlife, rich culture, friendly locals, good weather, affordable prices, and easy transportation options, preferably in Southeast Asia or Southern Europe';
      
      await chatInput.fill(longQuery);
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });
  });
});
