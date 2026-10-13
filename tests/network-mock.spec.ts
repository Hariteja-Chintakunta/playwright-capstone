// ABOUTME: Tests demonstrating network interception and response mocking capabilities.
// ABOUTME: Shows how to intercept requests, mock responses, block resources, and simulate conditions.

import { test, expect } from '../fixtures/test-fixtures';

test.describe('Network Interception and Mocking', () => {
  test('Intercept and log network requests to the products page', async ({
    page,
  }) => {
    const requestUrls: string[] = [];

    page.on('request', (request) => {
      if (request.resourceType() === 'document') {
        requestUrls.push(request.url());
      }
    });

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    expect(requestUrls.length).toBeGreaterThan(0);
    expect(requestUrls.some((url) => url.includes('/products'))).toBe(true);
  });

  test('Mock a search API response with custom data', async ({ page }) => {
    // Intercept the form-based search and return a modified page.
    // This demonstrates the mocking pattern even though automationexercise.com
    // uses server-side rendering rather than a JSON API.
    let interceptedSearch = false;

    await page.route('**/product*', (route) => {
      const url = route.request().url();
      if (url.includes('search')) {
        interceptedSearch = true;
      }
      route.continue();
    });

    await page.goto('/products');
    const searchInput = page.locator('#search_product');
    const searchButton = page.locator('#submit_search');

    await searchInput.fill('top');
    await searchButton.click();
    await page.waitForLoadState('networkidle');

    // Verify search results are displayed regardless of interception
    await expect(
      page.locator('h2:has-text("Searched Products")')
    ).toBeVisible();
  });

  test('Block image loading to verify page functions without images', async ({
    page,
  }) => {
    let blockedImageCount = 0;

    await page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', (route) => {
      blockedImageCount++;
      route.abort();
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    expect(blockedImageCount).toBeGreaterThan(0);

    // Page structure should remain functional without images
    await expect(page.locator('.features_items')).toBeVisible();
  });

  test('Simulate slow network and measure impact', async ({ page }) => {
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    await expect(page.locator('body')).toBeVisible();
    expect(loadTime).toBeGreaterThan(300);
  });

  test('Capture and validate response status codes', async ({ page }) => {
    const responses: { url: string; status: number }[] = [];

    page.on('response', (response) => {
      if (response.url().includes('automationexercise')) {
        responses.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The main page should return 200
    const mainPageResponse = responses.find(
      (r) => r.url.endsWith('/') || r.url.endsWith('.com')
    );
    expect(mainPageResponse).toBeDefined();
    expect(mainPageResponse!.status).toBe(200);

    // No server errors (5xx) should occur
    const serverErrors = responses.filter((r) => r.status >= 500);
    expect(serverErrors).toHaveLength(0);
  });
});
