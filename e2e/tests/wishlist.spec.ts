import { test, expect } from '@playwright/test';

test.describe('Wishlist Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      localStorage.removeItem('vibe-travel-wishlist');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('should display wishlist buttons on city cards', async ({ page }) => {
    const tokyoButton = page.getByTestId('wishlist-button-tokyo-japan');
    await expect(tokyoButton).toBeVisible({ timeout: 15000 });
    await expect(tokyoButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should toggle wishlist state when clicking heart button', async ({ page }) => {
    const tokyoButton = page.getByTestId('wishlist-button-tokyo-japan');
    await expect(tokyoButton).toBeVisible({ timeout: 15000 });
    await expect(tokyoButton).toHaveAttribute('aria-pressed', 'false');

    await tokyoButton.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(1000);

    await expect(tokyoButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should save to localStorage when adding to wishlist', async ({ page }) => {
    const tokyoButton = page.getByTestId('wishlist-button-tokyo-japan');
    await expect(tokyoButton).toBeVisible({ timeout: 15000 });

    await tokyoButton.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(1000);

    const stored = await page.evaluate(() => localStorage.getItem('vibe-travel-wishlist'));
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored || '[]');
    expect(parsed.length).toBe(1);
    expect(parsed[0].city.city).toBe('Tokyo');
  });

  test('should show filled heart when in wishlist', async ({ page }) => {
    const tokyoButton = page.getByTestId('wishlist-button-tokyo-japan');
    await expect(tokyoButton).toBeVisible({ timeout: 15000 });

    const svgBefore = tokyoButton.locator('svg');
    await expect(svgBefore).toHaveAttribute('fill', 'none');

    await tokyoButton.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(1000);

    const svgAfter = tokyoButton.locator('svg');
    await expect(svgAfter).toHaveAttribute('fill', 'currentColor');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const tokyoButton = page.getByTestId('wishlist-button-tokyo-japan');
    await expect(tokyoButton).toBeVisible({ timeout: 15000 });

    await expect(tokyoButton).toHaveAttribute('type', 'button');
    await expect(tokyoButton).toHaveAttribute('aria-pressed', 'false');

    const ariaLabel = await tokyoButton.getAttribute('aria-label');
    expect(ariaLabel).toContain('Tokyo');
    expect(ariaLabel).toContain('wishlist');
  });

  test('should remove city from wishlist when toggling again', async ({ page }) => {
    const tokyoButton = page.getByTestId('wishlist-button-tokyo-japan');
    await expect(tokyoButton).toBeVisible({ timeout: 15000 });

    await tokyoButton.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(1000);
    await expect(tokyoButton).toHaveAttribute('aria-pressed', 'true');

    await tokyoButton.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(1000);
    await expect(tokyoButton).toHaveAttribute('aria-pressed', 'false');
  });

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('wishlist button should be visible on mobile', async ({ page }) => {
      const tokyoButton = page.getByTestId('wishlist-button-tokyo-japan');
      await tokyoButton.scrollIntoViewIfNeeded();
      await expect(tokyoButton).toBeVisible({ timeout: 15000 });

      const box = await tokyoButton.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(28);
        expect(box.height).toBeGreaterThanOrEqual(28);
      }
    });
  });

  test.describe('Screenshots', () => {
    test('capture wishlist states', async ({ page }) => {
      const tokyoButton = page.getByTestId('wishlist-button-tokyo-japan');
      await expect(tokyoButton).toBeVisible({ timeout: 15000 });

      await page.screenshot({ path: 'e2e/.playwright-mcp/wishlist-empty.png', fullPage: false });

      await tokyoButton.click({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'e2e/.playwright-mcp/wishlist-added.png', fullPage: false });
    });
  });
});
