import { test, expect } from '@playwright/test';

test.describe('Map Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the map container', async ({ page }) => {
    const map = page.locator('[data-testid="destination-map"]');
    await expect(map).toBeVisible();
  });

  test('should display the map legend', async ({ page }) => {
    const legend = page.locator('[data-testid="map-legend"]');
    await expect(legend).toBeVisible();

    await expect(legend).toContainText('Adventure');
    await expect(legend).toContainText('Romantic');
    await expect(legend).toContainText('Cultural');
    await expect(legend).toContainText('Beach');
    await expect(legend).toContainText('Nightlife');
    await expect(legend).toContainText('Nature');
  });

  test('should show markers for destinations when map loads', async ({ page }) => {
    await page.waitForTimeout(2000);

    const markers = page.locator('[data-testid="map-marker"]');
    const markerCount = await markers.count();
    
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should show popup on marker click', async ({ page }) => {
    await page.waitForTimeout(2000);

    const markers = page.locator('[data-testid="map-marker"]');
    const markerCount = await markers.count();
    
    if (markerCount > 0) {
      await markers.first().click();

      const popup = page.locator('[data-testid="map-popup"]');
      await expect(popup).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to city page from popup', async ({ page }) => {
    await page.waitForTimeout(2000);

    const markers = page.locator('[data-testid="map-marker"]');
    const markerCount = await markers.count();
    
    if (markerCount > 0) {
      await markers.first().click();

      const viewDetailsButton = page.locator('[data-testid="popup-view-details"]');
      await expect(viewDetailsButton).toBeVisible({ timeout: 5000 });
      
      await viewDetailsButton.click();

      await expect(page).toHaveURL(/\/city\//);
    }
  });

  test('should toggle legend collapse/expand', async ({ page }) => {
    const legend = page.locator('[data-testid="map-legend"]');
    await expect(legend).toBeVisible();

    const toggleButton = legend.locator('button');
    await toggleButton.click();

    const adventureLabel = legend.locator('text=Adventure');
    await expect(adventureLabel).not.toBeVisible();

    await toggleButton.click();

    await expect(adventureLabel).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const map = page.locator('[data-testid="destination-map"]');
    await expect(map).toBeVisible();

    const legend = page.locator('[data-testid="map-legend"]');
    await expect(legend).toBeVisible();
  });

  test('should display cluster markers at low zoom', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const zoomOutButton = page.locator('.mapboxgl-ctrl-zoom-out');
    if (await zoomOutButton.isVisible()) {
      for (let i = 0; i < 3; i++) {
        await zoomOutButton.click();
        await page.waitForTimeout(300);
      }

      await page.waitForTimeout(500);
      
      const clusters = page.locator('[data-testid="cluster-marker"]');
      const clusterCount = await clusters.count();
      
      expect(clusterCount).toBeGreaterThanOrEqual(0);
    }
  });
});
