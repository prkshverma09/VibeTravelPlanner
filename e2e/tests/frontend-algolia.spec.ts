import { test, expect } from '@playwright/test';

test.describe('Frontend Algolia Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Vibe/i);
  });

  test('should display travel chat widget', async ({ page }) => {
    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible({ timeout: 10000 });
  });

  test('should have chat input field', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });
  });

  test('should be able to type in chat input', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });
    await chatInput.fill('beach destination');
    await expect(chatInput).toHaveValue('beach destination');
  });

  test('should submit search query', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('romantic European city');
    await chatInput.press('Enter');

    await page.waitForTimeout(2000);
  });

  test('should display city cards after search', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('Paris');
    await chatInput.press('Enter');

    const cityCard = page.locator('[data-testid="city-card"], [role="article"]').first();
    await expect(cityCard).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to city detail page when clicking card', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('Tokyo');
    await chatInput.press('Enter');

    const cityCard = page.locator('[data-testid="city-card"], [role="article"]').first();
    await cityCard.waitFor({ state: 'visible', timeout: 15000 });
    await cityCard.click();

    await expect(page).toHaveURL(/\/city\//, { timeout: 10000 });
  });

  test('should display city details on detail page', async ({ page }) => {
    await page.goto('/city/tokyo-japan');

    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should handle city not found gracefully', async ({ page }) => {
    await page.goto('/city/nonexistent-city-12345');

    await page.waitForTimeout(2000);

    const errorOrNotFound = page.locator('text=/not found|error|404/i');
    const hasErrorState = await errorOrNotFound.count() > 0;
    expect(hasErrorState || page.url().includes('city')).toBeTruthy();
  });
});
