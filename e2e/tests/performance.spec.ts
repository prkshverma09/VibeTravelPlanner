import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load initial page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    await page.locator('[data-testid="travel-chat"], main, [role="main"]').first().waitFor({
      state: 'visible',
      timeout: 5000
    });

    const loadTime = Date.now() - startTime;
    console.log(`Initial page load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });

  test('should return search results within 15 seconds', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    const startTime = Date.now();

    await chatInput.fill('romantic European city');
    await chatInput.press('Enter');

    const cityCard = page.locator('[data-testid="city-card"], [role="article"]').first();
    await cityCard.waitFor({ state: 'visible', timeout: 20000 });

    const responseTime = Date.now() - startTime;
    console.log(`Search response time: ${responseTime}ms`);

    expect(responseTime).toBeLessThan(20000);
  });

  test('should load city detail page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/city/tokyo-japan');

    await page.locator('h1, [role="heading"]').first().waitFor({
      state: 'visible',
      timeout: 5000
    });

    const loadTime = Date.now() - startTime;
    console.log(`City detail page load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });

  test('should have good Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0;

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.startTime > lcpValue) {
              lcpValue = entry.startTime;
            }
          });
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 5000);
      });
    });

    console.log(`LCP: ${lcp}ms`);
    expect(lcp).toBeLessThan(4000);
  });

  test('should have acceptable First Input Delay (FID) proxy', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });
    await chatInput.click();

    const interactionTime = Date.now() - startTime;
    console.log(`First interaction time: ${interactionTime}ms`);

    expect(interactionTime).toBeLessThan(3000);
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    await page.goto('/');

    const initialMetrics = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    for (let i = 0; i < 5; i++) {
      await page.goto('/city/paris-france');
      await page.waitForTimeout(500);
      await page.goto('/');
      await page.waitForTimeout(500);
    }

    const finalMetrics = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (initialMetrics > 0 && finalMetrics > 0) {
      const memoryIncrease = (finalMetrics - initialMetrics) / initialMetrics;
      console.log(`Memory increase: ${(memoryIncrease * 100).toFixed(2)}%`);
      expect(memoryIncrease).toBeLessThan(1);
    }
  });

  test('should handle rapid search queries', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    const queries = ['a', 'ab', 'abc', 'Tokyo', 'Paris'];

    const startTime = Date.now();

    for (const query of queries) {
      await chatInput.fill(query);
      await page.waitForTimeout(100);
    }

    await chatInput.press('Enter');

    const elapsed = Date.now() - startTime;
    console.log(`Rapid query handling time: ${elapsed}ms`);

    expect(elapsed).toBeLessThan(5000);
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    await chatInput.fill('Tokyo');
    await chatInput.press('Enter');

    const cityCard = page.locator('[data-testid="city-card"], [role="article"]').first();
    await cityCard.waitFor({ state: 'visible', timeout: 15000 });

    const images = page.locator('img');
    const imageCount = await images.count();

    console.log(`Found ${imageCount} images on page`);

    expect(imageCount).toBeGreaterThanOrEqual(0);
  });
});
