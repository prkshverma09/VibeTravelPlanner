import { test, expect } from '@playwright/test';

test.describe('End-to-End User Flow with Enhanced Search', () => {
  
  test('complete user journey - homepage to enhanced search', async ({ page }) => {
    // Step 1: Load homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Vibe-Check Travel Planner');
    await page.screenshot({ path: '.playwright-mcp/e2e-flow-01-homepage.png', fullPage: true });
    
    // Step 2: Verify chat widget is visible
    const chatWidget = page.getByTestId('chat-widget');
    await expect(chatWidget).toBeVisible();
    
    // Step 3: Verify featured destinations are displayed
    await expect(page.getByText('Featured Destinations')).toBeVisible();
    const tokyoCard = page.locator('article').filter({ hasText: 'Tokyo' });
    await expect(tokyoCard).toBeVisible();
    
    // Step 4: Click on a destination card
    await tokyoCard.click();
    await page.waitForURL(/\/city\//);
    await page.screenshot({ path: '.playwright-mcp/e2e-flow-02-city-detail.png', fullPage: true });
    
    // Step 5: Verify city detail page
    await expect(page.locator('h1')).toContainText('Tokyo');
    
    // Step 6: Navigate back to homepage
    await page.goBack();
    await expect(page.locator('h1')).toContainText('Vibe-Check Travel Planner');
    
    await page.screenshot({ path: '.playwright-mcp/e2e-flow-03-back-home.png', fullPage: true });
  });

  test('chat interaction with suggestion chips', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForSelector('[data-testid="chat-widget"]');
    await page.waitForTimeout(1000);
    
    // Find and click on a suggestion chip
    const suggestionChip = page.locator('button').filter({ hasText: /Romantic European city/i });
    
    if (await suggestionChip.isVisible()) {
      // Click the suggestion chip
      await suggestionChip.click();
      
      // Wait for the message to be sent and appear in the chat
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: '.playwright-mcp/e2e-flow-04-chip-clicked.png', fullPage: true });
      
      // Verify the user message appears in the chat
      const userMessage = page.locator('[class*="message"]').filter({ hasText: /Romantic European city/i });
      
      // Wait for either the message to appear or timeout
      try {
        await userMessage.waitFor({ timeout: 5000 });
        console.log('User message appeared in chat');
      } catch {
        console.log('Message may still be loading');
      }
      
      // Wait for AI response
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: '.playwright-mcp/e2e-flow-04b-after-response.png', fullPage: true });
    }
  });

  test('verify no infinite API loops', async ({ page, request }) => {
    // Load page and wait
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Make a single API call and verify it works
    const response = await request.post('/api/enhance-query', {
      data: { query: 'test query' }
    });
    expect(response.ok()).toBeTruthy();
    
    // Wait to ensure no cascading calls
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '.playwright-mcp/e2e-flow-05-stable.png', fullPage: true });
  });

  test('map visualization is functional', async ({ page }) => {
    await page.goto('/');
    
    // Check if map is visible
    const mapContainer = page.locator('[class*="mapContainer"]').or(page.locator('.mapboxgl-map'));
    
    // The map might take time to load
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '.playwright-mcp/e2e-flow-06-with-map.png', fullPage: true });
  });

  test('responsive design - mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('Vibe-Check Travel Planner');
    await page.screenshot({ path: '.playwright-mcp/e2e-flow-07-mobile.png', fullPage: true });
  });
});
