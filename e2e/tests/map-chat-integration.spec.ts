import { test, expect } from '@playwright/test';

test.describe('Map-Chat Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show chat panel and map side by side', async ({ page }) => {
    const chatPanel = page.locator('[data-testid="chat-panel"]');
    const map = page.locator('[data-testid="destination-map"]');
    await expect(chatPanel).toBeVisible({ timeout: 10000 });
    await expect(map).toBeVisible({ timeout: 10000 });
  });

  test('should show Ask in Chat button in map popup when marker is clicked', async ({
    page,
  }) => {
    await page.waitForTimeout(3000);
    const markers = page.locator('[data-testid="map-marker"]');
    await expect(markers.first()).toBeVisible({ timeout: 15000 });
    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);

    await markers.first().click();
    const popup = page.locator('[data-testid="map-popup"]');
    await expect(popup).toBeVisible({ timeout: 10000 });

    const askInChatButton = page.locator('[data-testid="popup-ask-in-chat"]');
    await expect(askInChatButton).toBeVisible({ timeout: 5000 });
    await expect(askInChatButton).toContainText('Ask in Chat');
  });

  test('should populate chat input with city query when Ask in Chat is clicked', async ({
    page,
  }) => {
    await page.waitForTimeout(3000);
    const markers = page.locator('[data-testid="map-marker"]');
    await expect(markers.first()).toBeVisible({ timeout: 15000 });
    await markers.first().click();
    const askInChatButton = page.locator('[data-testid="popup-ask-in-chat"]');
    await expect(askInChatButton).toBeVisible({ timeout: 10000 });
    await askInChatButton.click();

    const chatInput = page.locator(
      '[data-testid="chat-widget"] textarea, [data-testid="chat-widget"] input[type="text"]'
    ).first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    const inputValue = await chatInput.inputValue();
    expect(inputValue).toMatch(/Tell me more about .+, .+/);
  });

  test('should add city to itinerary from popup and show itinerary on map', async ({
    page,
  }) => {
    await page.waitForTimeout(3000);
    const markers = page.locator('[data-testid="map-marker"]');
    await expect(markers.first()).toBeVisible({ timeout: 15000 });
    await markers.first().click();
    const addButton = page.locator('[data-testid="popup-add-itinerary"]');
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await expect(addButton).toContainText('Add');
    await addButton.click();

    await expect(addButton).toContainText('Remove', { timeout: 5000 });
    const stopCount = page.locator('[data-testid="itinerary-stop-count"]');
    await expect(stopCount).toBeVisible({ timeout: 5000 });
    await expect(stopCount).toContainText('1 stop');
  });

  test('should show View Details and Ask in Chat and Add in popup', async ({
    page,
  }) => {
    await page.waitForTimeout(3000);
    const markers = page.locator('[data-testid="map-marker"]');
    await expect(markers.first()).toBeVisible({ timeout: 15000 });
    await markers.first().click();

    const popup = page.locator('[data-testid="map-popup"]');
    await expect(popup).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="popup-view-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="popup-ask-in-chat"]')).toBeVisible();
    await expect(page.locator('[data-testid="popup-add-itinerary"]')).toBeVisible();
  });

  test('should display map with markers on load', async ({ page }) => {
    await page.waitForTimeout(3000);
    const map = page.locator('[data-testid="destination-map"]');
    await expect(map).toBeVisible();
    const markers = page.locator('[data-testid="map-marker"]');
    await expect(markers.first()).toBeVisible({ timeout: 15000 });
    const count = await markers.count();
    expect(count).toBeGreaterThan(0);
  });
});
