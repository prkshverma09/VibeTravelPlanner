import { test, expect } from '@playwright/test';

test.describe('Trip Planning Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/city/dubai-united-arab-emirates');
    await page.waitForLoadState('networkidle');
  });

  test('City detail page shows Plan Trip button', async ({ page }) => {
    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await expect(planTripButton).toBeVisible({ timeout: 10000 });
  });

  test('Opening trip planning wizard', async ({ page }) => {
    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });

    const modal = page.getByTestId('wizard-modal');
    await expect(modal).toBeVisible();
  });

  test('Wizard shows destination name', async ({ page }) => {
    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const destinationText = page.getByText(/Dubai/);
    await expect(destinationText.first()).toBeVisible({ timeout: 5000 });
  });

  test('Closing wizard with cancel button', async ({ page }) => {
    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });

    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    await expect(wizard).not.toBeVisible({ timeout: 3000 });
  });

  test('Closing wizard by clicking overlay', async ({ page }) => {
    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });

    const overlay = page.getByTestId('wizard-overlay');
    await overlay.click({ position: { x: 10, y: 10 } });

    await expect(wizard).not.toBeVisible({ timeout: 3000 });
  });

  test('Closing wizard with Escape key', async ({ page }) => {
    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');

    await expect(wizard).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe('Wizard Step Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/city/dubai-united-arab-emirates');
    await page.waitForLoadState('networkidle');

    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });
  });

  test('Step 1 - Date selection is shown first', async ({ page }) => {
    const dateStep = page.getByTestId('step-dates');
    await expect(dateStep).toBeVisible();

    const dateInput = page.locator('input[type="date"]').first();
    await expect(dateInput).toBeVisible();
  });

  test('Navigate to Step 2 - Travelers', async ({ page }) => {
    const continueButton = page.getByRole('button', { name: /continue/i });
    await continueButton.click();

    const travelersStep = page.getByTestId('step-travelers');
    await expect(travelersStep).toBeVisible({ timeout: 3000 });

    const adultsSection = page.getByText(/adults/i);
    await expect(adultsSection.first()).toBeVisible();
  });

  test('Navigate to Step 3 - Preferences', async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      const continueButton = page.getByRole('button', { name: /continue/i });
      await continueButton.click();
      await page.waitForTimeout(300);
    }

    const preferencesStep = page.getByTestId('step-preferences');
    await expect(preferencesStep).toBeVisible({ timeout: 3000 });

    const budgetSection = page.getByText(/budget/i);
    await expect(budgetSection.first()).toBeVisible();
  });

  test('Navigate to Step 4 - Review', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      const continueButton = page.getByRole('button', { name: /continue/i });
      await continueButton.click();
      await page.waitForTimeout(300);
    }

    const reviewStep = page.getByTestId('step-review');
    await expect(reviewStep).toBeVisible({ timeout: 3000 });

    const startPlanningButton = page.getByTestId('trip-setup-wizard').getByRole('button', { name: 'Start Planning' });
    await expect(startPlanningButton).toBeVisible();
  });

  test('Navigate backwards with Back button', async ({ page }) => {
    const continueButton = page.getByRole('button', { name: /continue/i });
    await continueButton.click();

    const travelersStep = page.getByTestId('step-travelers');
    await expect(travelersStep).toBeVisible({ timeout: 3000 });

    const backButton = page.getByRole('button', { name: /back/i });
    await backButton.click();

    const dateStep = page.getByTestId('step-dates');
    await expect(dateStep).toBeVisible({ timeout: 3000 });
  });

  test('Progress bar updates as user advances', async ({ page }) => {
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '25');

    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(300);
    await expect(progressBar).toHaveAttribute('aria-valuenow', '50');

    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(300);
    await expect(progressBar).toHaveAttribute('aria-valuenow', '75');

    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(300);
    await expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });
});

test.describe('Wizard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/city/tokyo-japan');
    await page.waitForLoadState('networkidle');

    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });
  });

  test('Select dates and see duration', async ({ page }) => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const startInput = page.locator('input[type="date"]').first();
    await startInput.fill(startDate);

    const endInput = page.locator('input[type="date"]').last();
    await endInput.fill(endDate);

    const durationText = page.getByText(/days/i);
    await expect(durationText).toBeVisible();
  });

  test('Increment traveler count', async ({ page }) => {
    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(300);

    const increaseAdults = page.getByRole('button', { name: /increase adults/i });
    await increaseAdults.click();

    const adultCount = page.getByTestId('adult-count');
    await expect(adultCount).toHaveText('3');
  });

  test('Decrement traveler count', async ({ page }) => {
    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(300);

    const decreaseAdults = page.getByRole('button', { name: /decrease adults/i });
    await decreaseAdults.click();

    const adultCount = page.getByTestId('adult-count');
    await expect(adultCount).toHaveText('1');
  });

  test('Select budget level', async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);
    }

    const luxuryOption = page.locator('input[value="luxury"]');
    await luxuryOption.click();

    await expect(luxuryOption).toBeChecked();
  });

  test('Select multiple trip styles', async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(300);
    }

    const adventureLabel = page.getByText('Adventure & Outdoors');
    const culturalLabel = page.getByText('Cultural Immersion');

    await adventureLabel.click();
    await culturalLabel.click();

    const adventureCheckbox = page.locator('input[type="checkbox"]').filter({ has: page.locator('~ span', { hasText: 'Adventure' }) }).first();
    await expect(page.getByLabel('Adventure & Outdoors')).toBeChecked();
    await expect(page.getByLabel('Cultural Immersion')).toBeChecked();
  });
});

test.describe('Complete Trip Planning Journey', () => {
  test('Full wizard flow from start to finish', async ({ page }) => {
    await page.goto('/city/paris-france');
    await page.waitForLoadState('networkidle');

    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });

    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await page.locator('input[type="date"]').first().fill(startDate);
    await page.locator('input[type="date"]').last().fill(endDate);

    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(300);

    const romanticLabel = page.getByText('Romantic Getaway');
    await romanticLabel.click();

    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(300);

    const reviewStep = page.getByTestId('step-review');
    await expect(reviewStep).toBeVisible();

    const parisText = page.getByText(/Paris/);
    await expect(parisText.first()).toBeVisible();

    const startPlanningButton = page.getByTestId('trip-setup-wizard').getByRole('button', { name: 'Start Planning' });
    await expect(startPlanningButton).toBeVisible();
  });

  test('Bottom CTA opens same wizard', async ({ page }) => {
    await page.goto('/city/dubai-united-arab-emirates');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const bottomCTA = page.getByRole('button', { name: /start planning your trip/i });
    await bottomCTA.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Mobile Trip Planning', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Wizard works on mobile viewport', async ({ page }) => {
    await page.goto('/city/dubai-united-arab-emirates');
    await page.waitForLoadState('networkidle');

    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(300);

    const travelersStep = page.getByTestId('step-travelers');
    await expect(travelersStep).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('Wizard modal has proper ARIA attributes', async ({ page }) => {
    await page.goto('/city/dubai-united-arab-emirates');
    await page.waitForLoadState('networkidle');

    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  test('Step tabs have proper navigation', async ({ page }) => {
    await page.goto('/city/dubai-united-arab-emirates');
    await page.waitForLoadState('networkidle');

    const planTripButton = page.getByRole('button', { name: /plan.*trip/i }).first();
    await planTripButton.click();

    const wizard = page.getByTestId('trip-setup-wizard');
    await expect(wizard).toBeVisible({ timeout: 5000 });

    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible();

    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBe(4);
  });
});
