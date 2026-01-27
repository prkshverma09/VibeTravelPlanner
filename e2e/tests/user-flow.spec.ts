import { test, expect } from '@playwright/test';

test.describe('Complete User Flow', () => {
  test('Vibe Searcher Journey - Find Nightlife City', async ({ page }) => {
    await page.goto('/');

    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible({ timeout: 15000 });

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('I want a city with great nightlife and modern vibes');
    await chatInput.press('Enter');

    const aiResponse = page.locator('[data-testid="ai-message"], [class*="message"], [class*="response"]').first();
    await aiResponse.waitFor({ state: 'visible', timeout: 20000 });

    const cityCards = page.locator('[data-testid="city-card"], [role="article"]');
    await expect(cityCards.first()).toBeVisible({ timeout: 15000 });

    await cityCards.first().click();

    await expect(page).toHaveURL(/\/city\//, { timeout: 10000 });

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const scoreBadges = page.locator('[data-testid="score-badge"], [class*="score"]');
    await expect(scoreBadges.first()).toBeVisible();
  });

  test('Vibe Searcher Journey - Beach Destination', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('beach destination with beautiful scenery');
    await chatInput.press('Enter');

    const cityCards = page.locator('[data-testid="city-card"], [role="article"]');
    await expect(cityCards.first()).toBeVisible({ timeout: 20000 });

    const cardCount = await cityCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('Query Refinement Journey', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('cultural destination');
    await chatInput.press('Enter');

    await page.waitForTimeout(3000);

    await chatInput.fill('make it somewhere in Asia');
    await chatInput.press('Enter');

    await page.waitForTimeout(3000);

    const messages = page.locator('[data-testid="chat-message"], [class*="message"]');
    const messageCount = await messages.count();
    expect(messageCount).toBeGreaterThan(0);
  });

  test('Direct City Detail Page Access', async ({ page }) => {
    await page.goto('/city/paris-france');

    await page.waitForLoadState('networkidle');

    const content = page.locator('main, [role="main"], body');
    await expect(content).toBeVisible();

    const hasTitle = await page.locator('h1').count() > 0;
    expect(hasTitle).toBeTruthy();
  });

  test('Navigation Flow - Home to Detail and Back', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('Rome');
    await chatInput.press('Enter');

    const cityCard = page.locator('[data-testid="city-card"], [role="article"]').first();
    await cityCard.waitFor({ state: 'visible', timeout: 15000 });
    await cityCard.click();

    await expect(page).toHaveURL(/\/city\//, { timeout: 10000 });

    await page.goBack();

    await expect(page).toHaveURL('/');
  });

  test('Multiple Search Queries in Session', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    const queries = ['Tokyo', 'Paris', 'New York'];

    for (const query of queries) {
      await chatInput.fill(query);
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);
    }
  });

  test('Responsive Layout - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible({ timeout: 15000 });

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await expect(chatInput).toBeVisible();
  });
});
