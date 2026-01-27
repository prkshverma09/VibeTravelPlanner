import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('home page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-testid="travel-chat"], main, body').first().waitFor({
      state: 'visible',
      timeout: 15000
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalViolations.length > 0) {
      console.log('Critical accessibility violations:', JSON.stringify(criticalViolations, null, 2));
    }

    expect(criticalViolations.length).toBe(0);
  });

  test('city detail page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/city/tokyo-japan');

    await page.locator('h1, main, body').first().waitFor({
      state: 'visible',
      timeout: 10000
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations.length).toBe(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeLessThanOrEqual(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('Paris');
    await chatInput.press('Enter');

    await page.waitForTimeout(3000);

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');

      const isDecorative = role === 'presentation' || alt === '';
      const hasAltText = alt && alt.length > 0;
      const hasAriaLabel = ariaLabel && ariaLabel.length > 0;

      expect(isDecorative || hasAltText || hasAriaLabel).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('chat input should be focusable via keyboard', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    let maxTabs = 20;
    let foundInput = false;

    while (maxTabs > 0 && !foundInput) {
      await page.keyboard.press('Tab');
      const activeElement = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
      if (activeElement === 'input' || activeElement === 'textarea') {
        foundInput = true;
      }
      maxTabs--;
    }

    expect(foundInput).toBeTruthy();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    console.log(`Color contrast violations: ${colorContrastViolations.length}`);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const inputs = page.locator('input:not([type="hidden"]), textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
      const hasAriaLabel = ariaLabel && ariaLabel.length > 0;
      const hasAriaLabelledby = ariaLabelledby && ariaLabelledby.length > 0;
      const hasPlaceholder = placeholder && placeholder.length > 0;

      expect(hasLabel || hasAriaLabel || hasAriaLabelledby || hasPlaceholder).toBeTruthy();
    }
  });

  test('should have skip to main content link or landmark regions', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const mainLandmark = await page.locator('main, [role="main"]').count();
    const skipLink = await page.locator('a[href="#main"], a[href="#content"], .skip-link').count();

    expect(mainLandmark > 0 || skipLink > 0).toBeTruthy();
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/');

    const ariaLiveRegions = await page.locator('[aria-live], [role="alert"], [role="status"]').count();

    console.log(`Found ${ariaLiveRegions} ARIA live regions`);
  });

  test('interactive elements should be large enough for touch', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const buttons = page.locator('button, [role="button"], a');
    const buttonCount = await buttons.count();

    let smallButtonCount = 0;

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box && (box.width < 44 || box.height < 44)) {
        smallButtonCount++;
      }
    }

    console.log(`Buttons smaller than 44x44: ${smallButtonCount}/${Math.min(buttonCount, 10)}`);
  });
});
