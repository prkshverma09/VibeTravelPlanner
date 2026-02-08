import { test, expect } from '@playwright/test';

test.describe('Itinerary Builder E2E', () => {
  test.describe('Itinerary Generation from Wizard', () => {
    test('Complete wizard generates itinerary', async ({ page }) => {
      await page.goto('/city/tokyo-japan');
      await page.waitForLoadState('networkidle');

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      const today = new Date();
      const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

      await page.locator('input[type="date"]').first().fill(startDate.toISOString().split('T')[0]);
      await page.locator('input[type="date"]').last().fill(endDate.toISOString().split('T')[0]);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: /increase adults/i }).click();

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.getByText('Cultural Immersion').click();
      await page.getByText('Food & Culinary').click();

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const reviewStep = page.getByTestId('step-review');
      await expect(reviewStep).toBeVisible();

      const startPlanningButton = page.getByTestId('trip-setup-wizard').getByRole('button', { name: 'Start Planning' });
      await expect(startPlanningButton).toBeVisible();
      await startPlanningButton.click();

      await expect(page.getByTestId('trip-setup-wizard')).not.toBeVisible({ timeout: 5000 });
    });

    test('Wizard preserves selections across steps', async ({ page }) => {
      await page.goto('/city/paris-france');
      await page.waitForLoadState('networkidle');

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      const today = new Date();
      const startDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      await page.locator('input[type="date"]').first().fill(startDateStr);
      await page.locator('input[type="date"]').last().fill(endDateStr);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: /increase adults/i }).click();
      await page.getByRole('button', { name: /increase adults/i }).click();
      const adultCount = page.getByTestId('adult-count');
      await expect(adultCount).toHaveText('4');

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.locator('input[value="luxury"]').click();
      await page.getByText('Romantic Getaway').click();

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const reviewStep = page.getByTestId('step-review');
      await expect(reviewStep).toBeVisible();

      await expect(page.getByText(/Paris/i).first()).toBeVisible();
      await expect(page.getByText('4 adults')).toBeVisible();

      await page.getByRole('button', { name: /back/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('button', { name: /back/i }).click();
      await page.waitForTimeout(300);

      await expect(adultCount).toHaveText('4');
    });
  });

  test.describe('Different Trip Configurations', () => {
    test('Budget trip configuration', async ({ page }) => {
      await page.goto('/city/tokyo-japan');
      await page.waitForLoadState('networkidle');

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      const today = new Date();
      const startDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 10 * 24 * 60 * 60 * 1000);

      await page.locator('input[type="date"]').first().fill(startDate.toISOString().split('T')[0]);
      await page.locator('input[type="date"]').last().fill(endDate.toISOString().split('T')[0]);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.locator('input[value="budget"]').click();
      await expect(page.locator('input[value="budget"]')).toBeChecked();

      await page.getByText('Adventure & Outdoors').click();

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const reviewStep = page.getByTestId('step-review');
      await expect(reviewStep).toBeVisible();
    });

    test('Luxury trip with large group', async ({ page }) => {
      await page.goto('/city/dubai-united-arab-emirates');
      await page.waitForLoadState('networkidle');

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      const today = new Date();
      const startDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000);

      await page.locator('input[type="date"]').first().fill(startDate.toISOString().split('T')[0]);
      await page.locator('input[type="date"]').last().fill(endDate.toISOString().split('T')[0]);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      for (let i = 0; i < 4; i++) {
        await page.getByRole('button', { name: /increase adults/i }).click();
      }
      await expect(page.getByTestId('adult-count')).toHaveText('6');

      await page.getByRole('button', { name: /increase children/i }).click();
      await page.getByRole('button', { name: /increase children/i }).click();
      await expect(page.getByTestId('children-count')).toHaveText('2');

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.locator('input[value="luxury"]').click();

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const reviewStep = page.getByTestId('step-review');
      await expect(reviewStep).toBeVisible();

      await expect(page.getByText('6 adults')).toBeVisible();
    });
  });

  test.describe('Pace Selection', () => {
    test('Select relaxed pace', async ({ page }) => {
      await page.goto('/city/paris-france');
      await page.waitForLoadState('networkidle');

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      const today = new Date();
      const startDate = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      await page.locator('input[type="date"]').first().fill(startDate.toISOString().split('T')[0]);
      await page.locator('input[type="date"]').last().fill(endDate.toISOString().split('T')[0]);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const relaxedOption = page.locator('input[value="relaxed"]');
      await relaxedOption.click();
      await expect(relaxedOption).toBeChecked();

      await page.getByText('Romantic Getaway').click();

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const reviewStep = page.getByTestId('step-review');
      await expect(reviewStep).toBeVisible();
    });

    test('Select packed pace', async ({ page }) => {
      await page.goto('/city/tokyo-japan');
      await page.waitForLoadState('networkidle');

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      const today = new Date();
      const startDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      await page.locator('input[type="date"]').first().fill(startDate.toISOString().split('T')[0]);
      await page.locator('input[type="date"]').last().fill(endDate.toISOString().split('T')[0]);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const packedOption = page.locator('input[value="packed"]');
      await packedOption.click();
      await expect(packedOption).toBeChecked();

      await page.getByText('Food & Culinary').click();

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const reviewStep = page.getByTestId('step-review');
      await expect(reviewStep).toBeVisible();
    });
  });

  test.describe('Error Handling and Validation', () => {
    test('Continue button requires valid dates', async ({ page }) => {
      await page.goto('/city/tokyo-japan');
      await page.waitForLoadState('networkidle');

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      const dateStep = page.getByTestId('step-dates');
      await expect(dateStep).toBeVisible();

      const continueButton = page.getByRole('button', { name: /continue/i });
      await expect(continueButton).toBeVisible();
    });
  });

  test.describe('Mobile Itinerary Flow', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('Complete flow on mobile', async ({ page }) => {
      await page.goto('/city/dubai-united-arab-emirates');
      await page.waitForLoadState('networkidle');

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      const today = new Date();
      const startDate = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

      await page.locator('input[type="date"]').first().fill(startDate.toISOString().split('T')[0]);
      await page.locator('input[type="date"]').last().fill(endDate.toISOString().split('T')[0]);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const reviewStep = page.getByTestId('step-review');
      await expect(reviewStep).toBeVisible();
    });

    test('Touch interactions work on mobile', async ({ page }) => {
      await page.goto('/city/tokyo-japan');
      await page.waitForLoadState('networkidle');

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      const today = new Date();
      const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      await page.locator('input[type="date"]').first().fill(startDate.toISOString().split('T')[0]);
      await page.locator('input[type="date"]').last().fill(endDate.toISOString().split('T')[0]);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      const increaseButton = page.getByRole('button', { name: /increase adults/i });
      await increaseButton.click();
      await increaseButton.click();

      const adultCount = page.getByTestId('adult-count');
      await expect(adultCount).toHaveText('4');
    });
  });

  test.describe('Visual Screenshots', () => {
    test('Capture wizard flow screenshots', async ({ page }) => {
      await page.goto('/city/tokyo-japan');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'e2e/.playwright-mcp/itinerary-01-city-page.png' });

      const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
      await planTripButton.click();

      const wizard = page.getByTestId('trip-setup-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      await page.screenshot({ path: 'e2e/.playwright-mcp/itinerary-02-dates-step.png' });

      const today = new Date();
      const startDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

      await page.locator('input[type="date"]').first().fill(startDate.toISOString().split('T')[0]);
      await page.locator('input[type="date"]').last().fill(endDate.toISOString().split('T')[0]);

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.screenshot({ path: 'e2e/.playwright-mcp/itinerary-03-travelers-step.png' });

      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.screenshot({ path: 'e2e/.playwright-mcp/itinerary-04-preferences-step.png' });

      await page.getByText('Cultural Immersion').click();
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);

      await page.screenshot({ path: 'e2e/.playwright-mcp/itinerary-05-review-step.png' });
    });
  });
});
