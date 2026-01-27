import { test, expect } from '@playwright/test';

test('Screenshot Multi-Turn Conversation UI', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ path: '../.playwright-mcp/multi-turn-initial.png', fullPage: true });
  console.log('Took initial screenshot');
  
  // Find and interact with chat
  const chatWidget = page.locator('[data-testid="travel-chat"]');
  await expect(chatWidget).toBeVisible({ timeout: 15000 });
  
  // Take chat widget screenshot
  await chatWidget.screenshot({ path: '../.playwright-mcp/chat-widget.png' });
  console.log('Took chat widget screenshot');
  
  // Find chat input
  const chatInput = page.locator('textarea, input[type="text"]').first();
  await chatInput.waitFor({ state: 'visible', timeout: 10000 });
  
  // Type a query
  await chatInput.fill('romantic beach destination');
  await page.screenshot({ path: '../.playwright-mcp/chat-with-query.png', fullPage: true });
  console.log('Took screenshot with query typed');
});
