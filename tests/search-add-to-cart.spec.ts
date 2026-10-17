// ABOUTME: Test for browsing Men's T-Shirts by category and adding to cart.
// ABOUTME: Logs in as the latest user, navigates to Men > T-Shirts, adds three to cart, and verifies.

import { test, expect } from '../fixtures/test-fixtures';
import * as fs from 'fs';
import * as path from 'path';

const CREDENTIALS_FILE = path.resolve(__dirname, '../reports/created-accounts.json');

function getLatestAccount(): { name: string; email: string; password: string } {
  const accounts = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
  return accounts[accounts.length - 1];
}

test.describe('Search and Add Products to Cart', () => {
  test('Browse Men T-Shirts category and add three to cart', async ({
    homePage,
    loginPage,
    cartPage,
    page,
  }) => {
    const account = getLatestAccount();
    console.log(`Logging in as — ${account.name}`);

    await homePage.open();
    await homePage.goToLogin();
    await loginPage.login(account.email, account.password);
    await homePage.verifyLoggedIn(account.name);

    // Clear any existing cart items from previous runs
    await cartPage.open();
    const deleteButtons = page.locator('td.cart_delete a');
    let remainingItems = await deleteButtons.count();
    while (remainingItems > 0) {
      await deleteButtons.first().click();
      remainingItems--;
      await expect(deleteButtons).toHaveCount(remainingItems);
    }

    // Navigate to Category > Men > T-Shirts
    await homePage.open();
    await page.locator('a[href="#Men"]').click();
    await page.locator('#Men').waitFor({ state: 'visible' });
    await page.locator('#Men a[href="/category_products/3"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.features_items .title')).toContainText('Men - Tshirts');

    // Collect the first three product names
    const productCards = page.locator('.features_items .product-image-wrapper');
    await productCards.first().waitFor({ state: 'visible' });
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThanOrEqual(3);

    const addedProducts: string[] = [];
    for (let i = 0; i < 3; i++) {
      const name = await productCards.nth(i).locator('.productinfo p').textContent();
      addedProducts.push((name ?? '').trim());
    }

    // Add first three products to cart
    const cartModal = page.locator('#cartModal');
    for (let i = 0; i < 3; i++) {
      const card = productCards.nth(i);
      await card.scrollIntoViewIfNeeded();
      await card.locator('.productinfo .add-to-cart').click({ force: true });
      await cartModal.waitFor({ state: 'visible' });

      if (i < 2) {
        await page.locator('button:has-text("Continue Shopping")').click();
        await cartModal.waitFor({ state: 'hidden' });
      } else {
        await page.locator('#cartModal a:has-text("View Cart")').click();
      }
    }

    // Verify cart has exactly 3 items
    await cartPage.verifyCartItemCount(3);

    // Verify each product is in the cart with correct details
    const cartItems = await cartPage.getCartItems();
    expect(cartItems).toHaveLength(3);

    const cartProductNames = cartItems.map((item) => item.name.trim());
    for (const name of addedProducts) {
      expect(cartProductNames).toContain(name);
    }
    for (const item of cartItems) {
      expect(item.quantity.trim()).toBe('1');
      expect(item.price).toBeTruthy();
    }

    console.log('Products added to cart:');
    cartItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.name} — ${item.price} x ${item.quantity}`);
    });
  });
});
