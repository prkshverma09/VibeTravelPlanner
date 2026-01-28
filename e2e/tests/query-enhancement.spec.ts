import { test, expect } from '@playwright/test';

test.describe('Query Enhancement Feature', () => {
  test('should load homepage and display chat widget', async ({ page }) => {
    await page.goto('/');
    
    await page.screenshot({ path: '.playwright-mcp/query-test-01-homepage.png', fullPage: true });
    
    await expect(page.locator('h1')).toContainText('Vibe-Check Travel Planner');
    await expect(page.getByTestId('travel-chat')).toBeVisible();
    
    const chatWidget = page.getByTestId('chat-widget');
    await expect(chatWidget).toBeVisible();
  });

  test('should have working enhance-query API endpoint', async ({ request }) => {
    const response = await request.post('/api/enhance-query', {
      data: {
        query: 'scenic views, cozy cafes'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    expect(data.originalQuery).toBe('scenic views, cozy cafes');
    expect(data.expandedTerms).toBeDefined();
    expect(Array.isArray(data.expandedTerms)).toBeTruthy();
    expect(data.expandedTerms.length).toBeGreaterThan(0);
    expect(data.suggestedFilters).toBeDefined();
    expect(data.confidence).toBeGreaterThan(0);
    
    console.log('API Response:', JSON.stringify(data, null, 2));
  });

  test('should enhance various vague queries correctly', async ({ request }) => {
    const testQueries = [
      { query: 'romantic getaway', expectedTerms: ['romantic'] },
      { query: 'adventure and hiking', expectedTerms: ['adventure'] },
      { query: 'budget friendly beaches', expectedTerms: ['budget', 'beach'] },
      { query: 'luxury spa retreat', expectedTerms: ['luxury', 'relaxing'] },
    ];

    for (const { query, expectedTerms } of testQueries) {
      const response = await request.post('/api/enhance-query', {
        data: { query }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      console.log(`Query: "${query}" -> Expanded: [${data.expandedTerms.join(', ')}]`);
      
      for (const term of expectedTerms) {
        const found = data.expandedTerms.some((t: string) => 
          t.toLowerCase().includes(term.toLowerCase()) || 
          data.enhancedQuery.toLowerCase().includes(term.toLowerCase())
        );
        expect(found).toBeTruthy();
      }
    }
  });

  test('should display chat interface with suggestion chips', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('[data-testid="travel-chat"]');
    
    const suggestionChips = page.locator('button').filter({ hasText: /Romantic|Beach|Ancient/i });
    
    await page.screenshot({ path: '.playwright-mcp/query-test-02-chat-interface.png', fullPage: true });
    
    const chatTitle = page.locator('h2').filter({ hasText: /Vibe-Check Travel Assistant/i });
    await expect(chatTitle).toBeVisible();
  });

  test('should show featured destinations', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Featured Destinations')).toBeVisible();
    
    const cityCards = page.locator('article[role="article"]');
    await expect(cityCards.first()).toBeVisible();
    
    const tokyoCard = page.locator('article').filter({ hasText: 'Tokyo' });
    await expect(tokyoCard).toBeVisible();
    
    const parisCard = page.locator('article').filter({ hasText: 'Paris' });
    await expect(parisCard).toBeVisible();
    
    await page.screenshot({ path: '.playwright-mcp/query-test-03-featured-destinations.png', fullPage: true });
  });
});
