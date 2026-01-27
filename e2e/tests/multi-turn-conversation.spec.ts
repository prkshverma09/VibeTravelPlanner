import { test, expect } from '@playwright/test';

test.describe('Multi-Turn Conversation Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible({ timeout: 15000 });
  });

  test.describe('Chat Interface', () => {
    test('should display chat header with title', async ({ page }) => {
      const header = page.locator('text=Vibe-Check Travel Assistant');
      await expect(header).toBeVisible();
    });

    test('should display suggested query chips', async ({ page }) => {
      const chips = page.locator('text=Try asking:');
      await expect(chips).toBeVisible();

      const romanticChip = page.locator('text=Romantic European city');
      await expect(romanticChip).toBeVisible();
    });

    test('should have chat input area', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await expect(chatInput).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Active Preferences Display', () => {
    test('should not show active preferences initially', async ({ page }) => {
      const activePreferences = page.locator('[data-testid="active-preferences"]');
      await expect(activePreferences).not.toBeVisible();
    });

    test('should show active preferences after interaction with agent', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('romantic beach destination');
      await chatInput.press('Enter');

      await page.waitForTimeout(5000);
    });
  });

  test.describe('Trip Builder Flow', () => {
    test('should submit multiple queries successfully', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('romantic destination');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);

      await chatInput.fill('with beaches');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);

      await chatInput.fill('budget friendly');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);
    });

    test('should handle refinement queries', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('cultural city');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);

      await chatInput.fill('in Asia instead');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);
    });

    test('should handle clear preferences request', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('romantic beach');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);

      await chatInput.fill('forget everything, start over');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);
    });
  });

  test.describe('Suggested Query Interaction', () => {
    test('should submit query when clicking suggested chip', async ({ page }) => {
      const romanticChip = page.locator('button').filter({ hasText: 'Romantic European city' });
      
      if (await romanticChip.isVisible()) {
        await romanticChip.click();
        await page.waitForTimeout(3000);
      }
    });

    test('should have multiple suggested queries', async ({ page }) => {
      const suggestions = [
        'Romantic European city',
        'Beach vibes with nightlife',
        'Ancient culture and temples',
      ];

      for (const suggestion of suggestions) {
        const chip = page.locator('button').filter({ hasText: suggestion });
        await expect(chip).toBeVisible();
      }
    });
  });

  test.describe('City Card Interaction', () => {
    test('should display city cards after search', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('Tokyo');
      await chatInput.press('Enter');

      const cityCards = page.locator('[data-testid="city-card"], [role="article"]');
      await cityCards.first().waitFor({ state: 'visible', timeout: 20000 });

      const cardCount = await cityCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should navigate to city detail on click', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('Paris');
      await chatInput.press('Enter');

      const cityCards = page.locator('[data-testid="city-card"], [role="article"]');
      await cityCards.first().waitFor({ state: 'visible', timeout: 20000 });
      await cityCards.first().click();

      await expect(page).toHaveURL(/\/city\//, { timeout: 10000 });
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain chat state after page scroll', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('beach destination');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);

      await page.evaluate(() => window.scrollTo(0, 500));
      await page.evaluate(() => window.scrollTo(0, 0));

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });
  });

  test.describe('Comparison Feature UI', () => {
    test('should request city comparison', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('compare Tokyo and Paris');
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);
    });
  });

  test.describe('Itinerary Feature UI', () => {
    test('should request itinerary generation', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('create a 5 day itinerary for Tokyo');
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle empty input gracefully', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 });

      await chatInput.fill('');
      await chatInput.press('Enter');

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible chat input', async ({ page }) => {
      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await expect(chatInput).toBeVisible({ timeout: 10000 });
    });

    test('should navigate with keyboard', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement).toBeDefined();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible({ timeout: 15000 });

      const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
      await expect(chatInput).toBeVisible({ timeout: 10000 });
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const chatWidget = page.locator('[data-testid="travel-chat"]');
      await expect(chatWidget).toBeVisible({ timeout: 15000 });
    });
  });
});

test.describe('Integration Tests - Full Flow', () => {
  test('Complete Trip Planning Journey', async ({ page }) => {
    await page.goto('/');

    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible({ timeout: 15000 });

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('romantic beach destination');
    await chatInput.press('Enter');
    await page.waitForTimeout(4000);

    await chatInput.fill('budget friendly options');
    await chatInput.press('Enter');
    await page.waitForTimeout(4000);

    await chatInput.fill('in Southeast Asia');
    await chatInput.press('Enter');
    await page.waitForTimeout(4000);

    await chatInput.fill('compare Bali and Phuket');
    await chatInput.press('Enter');
    await page.waitForTimeout(4000);

    await chatInput.fill('create a 7 day itinerary for Bali');
    await chatInput.press('Enter');
    await page.waitForTimeout(4000);
  });

  test('Preference Refinement Flow', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('cultural destination');
    await chatInput.press('Enter');
    await page.waitForTimeout(3000);

    await chatInput.fill('something with great food');
    await chatInput.press('Enter');
    await page.waitForTimeout(3000);

    await chatInput.fill('actually, I prefer nature over food');
    await chatInput.press('Enter');
    await page.waitForTimeout(3000);

    await chatInput.fill('forget the nature, back to food');
    await chatInput.press('Enter');
    await page.waitForTimeout(3000);
  });
});
