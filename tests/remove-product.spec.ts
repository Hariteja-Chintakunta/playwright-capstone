// ABOUTME: Test for removing a product from the cart after adding Polo T-Shirts.
// ABOUTME: Logs in, adds three products, removes one, and verifies two remain.

import { test, expect } from '../fixtures/test-fixtures';
import * as fs from 'fs';
import * as path from 'path';

const CREDENTIALS_FILE = path.resolve(__dirname, '../reports/created-accounts.json');

function getLatestAccount(): { name: string; email: string; password: string } {
  const accounts = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
  return accounts[accounts.length - 1];
}

test.describe('Remove Added Product', () => {
  test('Add three Polo T-Shirts and remove one from cart', async ({
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
    let deleteCount = await deleteButtons.count();
    while (deleteCount > 0) {
      await deleteButtons.first().click();
      deleteCount--;
      if (deleteCount > 0) {
        await expect(deleteButtons).toHaveCount(deleteCount);
      }
    }

    // Navigate to Category > Men > T-Shirts
    await homePage.open();
    await page.locator('a[href="#Men"]').click();
    await page.locator('#Men').waitFor({ state: 'visible' });
    await page.locator('#Men a[href="/category_products/3"]').click();
    await expect(page.locator('.features_items .title')).toContainText('Men - Tshirts');

    // Navigate to Brands > Polo
    await page.locator('.brands-name a[href="/brand_products/Polo"]').click();
    await expect(page.locator('.features_items .title')).toContainText('Polo');

    // Add first three products to cart
    const productCards = page.locator('.features_items .product-image-wrapper');
    await productCards.first().waitFor({ state: 'visible' });

    const addedProducts: string[] = [];
    for (let i = 0; i < 3; i++) {
      const name = await productCards.nth(i).locator('.productinfo p').textContent();
      addedProducts.push((name ?? '').trim());
    }

    for (let i = 0; i < 3; i++) {
      await productCards.nth(i).locator('.productinfo .add-to-cart').click();
      await page.locator('#cartModal').waitFor({ state: 'visible' });

      if (i < 2) {
        await page.locator('button:has-text("Continue Shopping")').click();
        await page.locator('#cartModal').waitFor({ state: 'hidden' });
      } else {
        await page.locator('#cartModal a:has-text("View Cart")').click();
      }
    }

    await cartPage.verifyCartItemCount(3);
    console.log(`Removing product: ${addedProducts[0]}`);

    // Remove the first product from cart
    await page.locator('td.cart_delete a').first().click();
    await cartPage.verifyCartItemCount(2);

    // Verify the removed product is gone and remaining two are still there
    const cartItems = await cartPage.getCartItems();
    expect(cartItems).toHaveLength(2);

    const cartProductNames = cartItems.map(item => item.name.trim());
    expect(cartProductNames).not.toContain(addedProducts[0]);
    expect(cartProductNames).toContain(addedProducts[1]);
    expect(cartProductNames).toContain(addedProducts[2]);

    console.log(`Removed: ${addedProducts[0]}`);
    console.log('Remaining in cart:');
    cartItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.name} — ${item.price} x ${item.quantity}`);
    });
  });
});
