import { test, expect } from '@playwright/test';

test.describe('Geographic Filtering in Enhanced Search', () => {
  test('European query should only return European cities', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="chat-widget"]');
    await page.waitForTimeout(1500);

    const chatWidget = page.getByTestId('chat-widget');
    const textarea = chatWidget.locator('textarea');

    // Type a query with geographic constraint
    await textarea.click();
    await textarea.fill('Romantic European city');
    await textarea.press('Enter');
    
    await page.waitForTimeout(3000);
    
    // Click Try Enhanced Search
    const enhancedSearchBtn = page.locator('button').filter({ hasText: /Try Enhanced Search/i });
    
    if (await enhancedSearchBtn.isVisible()) {
      await enhancedSearchBtn.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: '.playwright-mcp/geo-test-european.png', fullPage: true });
      
      // Check the fallback results - should only show European cities
      const fallbackSection = page.getByTestId('fallback-results');
      if (await fallbackSection.count() > 0) {
        const resultText = await fallbackSection.textContent();
        console.log('Fallback results:', resultText);
        
        // These should NOT appear for European query
        expect(resultText).not.toContain('Bali');
        expect(resultText).not.toContain('Fiji');
        expect(resultText).not.toContain('Tokyo');
        expect(resultText).not.toContain('Bangkok');
        
        // Should contain European cities
        const hasEuropean = resultText?.includes('Paris') || 
                           resultText?.includes('Barcelona') || 
                           resultText?.includes('Lisbon') ||
                           resultText?.includes('Prague') ||
                           resultText?.includes('Amsterdam');
        expect(hasEuropean).toBe(true);
      }
    }
  });

  test('Asian query should only return Asian cities', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="chat-widget"]');
    await page.waitForTimeout(1500);

    const chatWidget = page.getByTestId('chat-widget');
    const textarea = chatWidget.locator('textarea');

    await textarea.click();
    await textarea.fill('cultural Asian destination');
    await textarea.press('Enter');
    
    await page.waitForTimeout(3000);
    
    const enhancedSearchBtn = page.locator('button').filter({ hasText: /Try Enhanced Search/i });
    
    if (await enhancedSearchBtn.isVisible()) {
      await enhancedSearchBtn.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: '.playwright-mcp/geo-test-asian.png', fullPage: true });
      
      const fallbackSection = page.getByTestId('fallback-results');
      if (await fallbackSection.count() > 0) {
        const resultText = await fallbackSection.textContent();
        console.log('Asian results:', resultText);
        
        // These should NOT appear for Asian query
        expect(resultText).not.toContain('Paris');
        expect(resultText).not.toContain('Barcelona');
        expect(resultText).not.toContain('Lisbon');
        
        // Should contain Asian cities
        const hasAsian = resultText?.includes('Tokyo') || 
                        resultText?.includes('Kyoto') || 
                        resultText?.includes('Bangkok') ||
                        resultText?.includes('Bali') ||
                        resultText?.includes('Singapore');
        expect(hasAsian).toBe(true);
      }
    }
  });
});
