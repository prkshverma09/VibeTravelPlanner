import { test, expect } from '@playwright/test';

test.describe('User Journey - Visual Test', () => {
  test('Complete chat interaction flow with screenshots', async ({ page }) => {
    // Step 1: Navigate to homepage
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '../.playwright-mcp/journey-01-homepage.png', fullPage: true });
    console.log('Step 1: Homepage loaded');

    // Verify chat widget is visible
    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible({ timeout: 15000 });

    // Step 2: Check suggested queries are visible
    const suggestedChips = page.locator('button').filter({ hasText: /Romantic|Beach|Ancient/ });
    await expect(suggestedChips.first()).toBeVisible();
    console.log('Step 2: Suggested queries visible');

    // Step 3: Click on a suggested query chip
    const romanticChip = page.locator('button').filter({ hasText: 'Romantic European city' });
    if (await romanticChip.isVisible()) {
      await romanticChip.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../.playwright-mcp/journey-02-clicked-suggestion.png', fullPage: true });
      console.log('Step 3: Clicked suggestion chip');
    }

    // Step 4: Type a custom query in the chat
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });
    await chatInput.fill('romantic beach destination in Asia');
    await page.screenshot({ path: '../.playwright-mcp/journey-03-typed-query.png', fullPage: true });
    console.log('Step 4: Typed custom query');

    // Step 5: Submit the query
    await chatInput.press('Enter');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../.playwright-mcp/journey-04-submitted-query.png', fullPage: true });
    console.log('Step 5: Submitted query');

    // Step 6: Add a refinement query
    await chatInput.fill('with good nightlife too');
    await chatInput.press('Enter');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../.playwright-mcp/journey-05-refinement.png', fullPage: true });
    console.log('Step 6: Added refinement');

    // Step 7: Request a comparison
    await chatInput.fill('compare Bali and Phuket');
    await chatInput.press('Enter');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../.playwright-mcp/journey-06-comparison-request.png', fullPage: true });
    console.log('Step 7: Requested comparison');

    // Step 8: Request an itinerary
    await chatInput.fill('create a 5 day itinerary for Bali');
    await chatInput.press('Enter');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../.playwright-mcp/journey-07-itinerary-request.png', fullPage: true });
    console.log('Step 8: Requested itinerary');

    // Step 9: Scroll down to see Featured Destinations
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '../.playwright-mcp/journey-08-featured-destinations.png', fullPage: true });
    console.log('Step 9: Scrolled to featured destinations');

    // Step 10: Click on a city card
    const cityCard = page.locator('[role="article"]').first();
    if (await cityCard.isVisible()) {
      await cityCard.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../.playwright-mcp/journey-09-city-detail.png', fullPage: true });
      console.log('Step 10: Clicked city card');
    }

    // Step 11: Go back to homepage
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '../.playwright-mcp/journey-10-back-home.png', fullPage: true });
    console.log('Step 11: Back to homepage');

    // Step 12: Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: '../.playwright-mcp/journey-11-mobile-view.png', fullPage: true });
    console.log('Step 12: Mobile view');

    console.log('User journey test completed successfully!');
  });

  test('Chat UI components close-up', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Screenshot of just the chat widget
    const chatWidget = page.locator('[data-testid="travel-chat"]');
    await expect(chatWidget).toBeVisible({ timeout: 15000 });
    await chatWidget.screenshot({ path: '../.playwright-mcp/ui-chat-widget.png' });
    console.log('Chat widget screenshot taken');

    // Screenshot of suggested queries section
    const suggestedSection = page.locator('text=Try asking:').locator('..');
    if (await suggestedSection.isVisible()) {
      await suggestedSection.screenshot({ path: '../.playwright-mcp/ui-suggestions.png' });
      console.log('Suggestions screenshot taken');
    }

    // Screenshot of a city card
    const cityCard = page.locator('[role="article"]').first();
    if (await cityCard.isVisible()) {
      await cityCard.screenshot({ path: '../.playwright-mcp/ui-city-card.png' });
      console.log('City card screenshot taken');
    }

    console.log('UI component screenshots completed!');
  });
});
