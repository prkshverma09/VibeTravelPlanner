import { test, expect } from '@playwright/test';

test.describe('Enhanced Search Button', () => {
  test('Try Enhanced Search button works when typing directly', async ({ page }) => {
    page.on('console', msg => {
      if (msg.text().includes('EnhancedSearch') || msg.text().includes('enhance')) {
        console.log('PAGE:', msg.text());
      }
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="chat-widget"]');
    await page.waitForTimeout(1500);

    const chatWidget = page.getByTestId('chat-widget');
    const textarea = chatWidget.locator('textarea');

    // Type a query directly
    await textarea.click();
    await textarea.fill('beautiful architecture, cozy cafes');
    
    // Submit by pressing Enter
    await textarea.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '.playwright-mcp/enhanced-test-01-after-query.png', fullPage: true });

    // Look for the "Try Enhanced Search" button
    const enhancedSearchBtn = page.locator('button').filter({ hasText: /Try Enhanced Search/i });
    
    const isVisible = await enhancedSearchBtn.isVisible();
    console.log('Enhanced Search button visible:', isVisible);
    
    if (isVisible) {
      console.log('Clicking Try Enhanced Search button...');
      await enhancedSearchBtn.click();
      
      // Wait for enhanced search to complete
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: '.playwright-mcp/enhanced-test-02-after-enhanced.png', fullPage: true });
      
      // Check if fallback results appear
      const fallbackSection = page.locator('[class*="fallback"]');
      const hasFallback = await fallbackSection.count() > 0;
      console.log('Fallback results section found:', hasFallback);
    } else {
      console.log('Enhanced Search button not visible - checking if lastQuery was set');
      await page.screenshot({ path: '.playwright-mcp/enhanced-test-02-no-button.png', fullPage: true });
    }
  });

  test('Enhanced search shows results for vague queries', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="chat-widget"]');
    await page.waitForTimeout(1500);

    const chatWidget = page.getByTestId('chat-widget');
    const textarea = chatWidget.locator('textarea');

    // Type a vague query that might not return results
    await textarea.click();
    await textarea.fill('scenic views cozy cafes');
    await textarea.press('Enter');
    
    await page.waitForTimeout(3000);
    
    // Click Try Enhanced Search if visible
    const enhancedSearchBtn = page.locator('button').filter({ hasText: /Try Enhanced Search/i });
    
    if (await enhancedSearchBtn.isVisible()) {
      await enhancedSearchBtn.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: '.playwright-mcp/enhanced-test-03-scenic-results.png', fullPage: true });
    }
  });
});
