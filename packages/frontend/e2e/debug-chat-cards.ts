/**
 * One-off debug script: run with
 * npx playwright test e2e/debug-chat-cards.ts --project=chromium
 * or: node -e "
 *   const { chromium } = require('@playwright/test');
 *   require('./e2e/debug-chat-cards.ts').run(chromium);
 * "
 * Requires dev server on http://localhost:3000
 */
import { test as base } from '@playwright/test';
import * as fs from 'fs';

const test = base.extend({});

test('debug chat cards: send message, capture tool message and DOM', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="travel-chat-placeholder"]').waitFor({ state: 'visible', timeout: 15000 });
  const chatWidget = page.locator('[data-testid="chat-widget"]');
  await chatWidget.waitFor({ state: 'visible', timeout: 35000 });

  const textarea = chatWidget.locator('textarea');
  await textarea.waitFor({ state: 'visible', timeout: 10000 });

  await textarea.fill('Beach vibes with nightlife');
  await textarea.press('Enter');

  await page.waitForTimeout(55000);

  const message = await page.evaluate(() => (window as any).__lastSearchToolMessage);
  const debugPath = 'test-results/debug-search-tool-message.json';
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync(debugPath, JSON.stringify(message, null, 2), 'utf8');
  console.log('Wrote', debugPath);

  await page.screenshot({ path: 'test-results/debug-chat-after-response.png', fullPage: true });

  const toolDivs = await page.locator('.ais-ChatMessage-tool').count();
  const grids = await page.locator('[data-testid="chat-carousel-grid"]').count();
  const cards = await page.locator('[data-testid="chat-widget"] [data-testid="city-description"]').count();
  const chatHtml = await chatWidget.evaluate((el) => el.innerHTML);
  fs.writeFileSync('test-results/debug-chat-widget-inner.html', chatHtml, 'utf8');

  console.log('Tool divs:', toolDivs, 'Grids:', grids, 'City cards:', cards);
});
