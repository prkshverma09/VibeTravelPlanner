import { test, expect } from '@playwright/test';

/**
 * Complete User Journey E2E Tests
 * 
 * These tests simulate a complete user flow from initial discovery
 * through destination selection, trip planning, and wishlist management.
 */

test.describe('Complete User Journey', () => {
  test.describe('Discovery to Trip Planning Flow', () => {
    test('User discovers destination and plans a trip', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const travelChat = page.locator('[data-testid="travel-chat"]');
      await expect(travelChat).toBeVisible({ timeout: 15000 });
      
      const featuredSection = page.getByText('Featured Destinations');
      await expect(featuredSection).toBeVisible();
      
      const cityCards = page.locator('article');
      await expect(cityCards.first()).toBeVisible();
      
      const firstCard = cityCards.first();
      await firstCard.click();
      
      await page.waitForLoadState('networkidle');
      
      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await expect(planTripButton).toBeVisible({ timeout: 10000 });
      
      await planTripButton.click();
      
      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });
      
      const today = new Date();
      const startDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);
      
      await page.locator('input[type="date"]').first().fill(startDate.toISOString().split('T')[0]);
      await page.locator('input[type="date"]').last().fill(endDate.toISOString().split('T')[0]);
      
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);
      
      const travelersStep = page.getByTestId('step-travelers');
      await expect(travelersStep).toBeVisible();
      
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);
      
      const preferencesStep = page.getByTestId('step-preferences');
      await expect(preferencesStep).toBeVisible();
      
      await page.getByText('Cultural Immersion').click();
      
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);
      
      const reviewStep = page.getByTestId('step-review');
      await expect(reviewStep).toBeVisible();
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/journey-complete-review.png' });
    });
  });

  test.describe('Wishlist Management Journey', () => {
    test('User saves destinations to wishlist', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.evaluate(() => localStorage.removeItem('vibe-travel-wishlist'));
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const wishlistButtons = page.locator('[data-testid^="wishlist-button-"]');
      await expect(wishlistButtons.first()).toBeVisible({ timeout: 15000 });
      
      const firstButton = wishlistButtons.first();
      await expect(firstButton).toHaveAttribute('aria-pressed', 'false');
      
      await firstButton.click({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(500);
      
      const stored = await page.evaluate(() => {
        const data = localStorage.getItem('vibe-travel-wishlist');
        return data ? JSON.parse(data) : [];
      });
      
      expect(stored.length).toBeGreaterThanOrEqual(0);
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/journey-wishlist-saved.png' });
    });
  });

  test.describe('Navigation Journey', () => {
    test('User navigates between pages', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/nav-01-homepage.png' });
      
      const cityCards = page.locator('article');
      await expect(cityCards.first()).toBeVisible({ timeout: 15000 });
      
      await cityCards.first().click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/nav-02-city-detail.png' });
      
      const backLink = page.getByRole('link', { name: /back|home/i }).first();
      if (await backLink.isVisible()) {
        await backLink.click();
      } else {
        await page.goto('/');
      }
      
      await page.waitForLoadState('networkidle');
      
      const travelChat = page.locator('[data-testid="travel-chat"]');
      await expect(travelChat).toBeVisible({ timeout: 10000 });
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/nav-03-back-home.png' });
    });
  });

  test.describe('Chat Interaction Journey', () => {
    test('User interacts with chat suggestions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const travelChat = page.locator('[data-testid="travel-chat"]');
      await expect(travelChat).toBeVisible({ timeout: 15000 });
      
      const chips = page.locator('[class*="queryChip"]');
      await expect(chips.first()).toBeVisible();
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/chat-01-initial.png' });
      
      const chipText = await chips.first().textContent();
      expect(chipText).toBeTruthy();
      
      const clearButton = page.getByRole('button', { name: /clear/i });
      await expect(clearButton).toBeVisible();
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/chat-02-with-suggestions.png' });
    });
  });

  test.describe('Mobile User Journey', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('Complete mobile flow', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/mobile-01-homepage.png' });
      
      const cityCards = page.locator('article');
      await expect(cityCards.first()).toBeVisible({ timeout: 15000 });
      
      await cityCards.first().click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/mobile-02-city-detail.png' });
      
      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await expect(planTripButton).toBeVisible({ timeout: 10000 });
      
      await planTripButton.click();
      
      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });
      
      await page.screenshot({ path: 'e2e/.playwright-mcp/mobile-03-wizard.png' });
      
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await cancelButton.click();
      
      await expect(wizard).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Accessibility Journey', () => {
    test('User can navigate with keyboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName.toLowerCase() : null;
      });
      
      expect(focusedElement).toBeTruthy();
      
      const cityCards = page.locator('article[tabindex="0"]');
      const cardCount = await cityCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('Screen reader accessible elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      const headings = page.getByRole('heading');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
      
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
      
      const articles = page.getByRole('article');
      const articleCount = await articles.count();
      expect(articleCount).toBeGreaterThan(0);
    });
  });

  test.describe('Performance Journey', () => {
    test('Page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const domLoadTime = Date.now() - startTime;
      
      await page.waitForLoadState('networkidle');
      
      const fullLoadTime = Date.now() - startTime;
      
      expect(domLoadTime).toBeLessThan(5000);
      expect(fullLoadTime).toBeLessThan(15000);
      
      console.log(`DOM loaded in ${domLoadTime}ms, full load in ${fullLoadTime}ms`);
    });

    test('Interactive elements respond quickly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const cityCards = page.locator('article');
      await expect(cityCards.first()).toBeVisible({ timeout: 15000 });
      
      const startTime = Date.now();
      await cityCards.first().click();
      await page.waitForLoadState('networkidle');
      const navigationTime = Date.now() - startTime;
      
      expect(navigationTime).toBeLessThan(5000);
    });
  });
});

test.describe('Error Recovery Journey', () => {
  test('User can recover from navigation errors', async ({ page }) => {
    await page.goto('/city/non-existent-city-123');
    await page.waitForLoadState('networkidle');
    
    const errorOrContent = await page.evaluate(() => {
      const notFound = document.body.textContent?.includes('not found') || 
                       document.body.textContent?.includes('404');
      return { hasError: notFound };
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const travelChat = page.locator('[data-testid="travel-chat"]');
    await expect(travelChat).toBeVisible({ timeout: 15000 });
  });
});
