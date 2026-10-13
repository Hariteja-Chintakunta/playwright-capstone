// ABOUTME: Visual regression tests comparing page screenshots against baselines.
// ABOUTME: Catches unintended UI changes using Playwright's built-in screenshot comparison.

import { test, expect } from '../fixtures/test-fixtures';

test.describe('Visual Regression', () => {
  // Visual baselines are browser-specific, so run only on Chromium for consistency.
  // Dynamic ad content is already blocked by our fixture's route interception.
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Visual tests run on Chromium only for consistent baselines'
  );

  test('Home page matches visual baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('home-page.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: true,
    });
  });

  test('Login page matches visual baseline', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: true,
    });
  });

  test('Products page matches visual baseline', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('products-page.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: true,
    });
  });
});
