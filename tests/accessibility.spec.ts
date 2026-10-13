// ABOUTME: Accessibility validation tests using the axe-core engine.
// ABOUTME: Scans key pages for WCAG 2.0 A/AA violations and reports them as test failures.

import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/test-fixtures';

test.describe('Accessibility', () => {
  test('Home page has no critical accessibility violations', async ({
    page,
  }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (critical.length > 0) {
      console.log('Accessibility violations on Home page:');
      critical.forEach((v) => {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        console.log(`    Help: ${v.helpUrl}`);
        console.log(`    Nodes: ${v.nodes.length}`);
      });
    }

    expect(critical).toHaveLength(0);
  });

  test('Login page has no critical accessibility violations', async ({
    page,
  }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (critical.length > 0) {
      console.log('Accessibility violations on Login page:');
      critical.forEach((v) => {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
      });
    }

    expect(critical).toHaveLength(0);
  });

  test('Products page has no critical accessibility violations', async ({
    page,
  }) => {
    await page.goto('/products');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (critical.length > 0) {
      console.log('Accessibility violations on Products page:');
      critical.forEach((v) => {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
      });
    }

    expect(critical).toHaveLength(0);
  });
});
