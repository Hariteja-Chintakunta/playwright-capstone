// ABOUTME: End-to-end test for placing an order with Polo T-Shirts and validating the invoice.
// ABOUTME: Logs in, adds products, completes checkout with payment, downloads and reads invoice.

import { test, expect } from '../fixtures/test-fixtures';
import { getLatestAccount } from '../utils/account-store';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Place Order', () => {
  test('Add Polo T-Shirts, checkout, pay, and verify invoice', async ({
    homePage,
    loginPage,
    cartPage,
    checkoutPage,
    productsPage,
    page,
  }) => {
    const account = getLatestAccount();
    console.log(`Logging in as — ${account.name}`);

    // Login
    await homePage.open();
    await homePage.goToLogin();
    await loginPage.login(account.email, account.password);
    await homePage.verifyLoggedIn(account.name);

    // Clear any existing cart items
    await cartPage.open();
    await cartPage.clearAllItems();

    // Navigate to Category > Men > T-Shirts > Polo brand
    await homePage.open();
    await page.locator('a[href="#Men"]').click();
    await page.locator('#Men').waitFor({ state: 'visible' });
    await page.locator('#Men a[href="/category_products/3"]').click();
    await expect(page.locator('.features_items .title')).toContainText('Men - Tshirts');

    await page.locator('.brands-name a[href="/brand_products/Polo"]').click();
    await expect(page.locator('.features_items .title')).toContainText('Polo');

    // Add first three products to cart
    const productCards = page.locator('.features_items .product-image-wrapper');
    await productCards.first().waitFor({ state: 'visible' });
    expect(await productCards.count()).toBeGreaterThanOrEqual(3);

    const addedProducts: string[] = [];
    for (let i = 0; i < 3; i++) {
      const name = await productCards.nth(i).locator('.productinfo p').textContent();
      addedProducts.push((name ?? '').trim());
    }

    const cartModal = page.locator('#cartModal');
    for (let i = 0; i < 3; i++) {
      await productsPage.addProductToCart(i);
      await cartModal.waitFor({ state: 'visible' });

      if (i < 2) {
        await page.locator('button:has-text("Continue Shopping")').click();
        await cartModal.waitFor({ state: 'hidden' });
      } else {
        await page.locator('#cartModal a:has-text("View Cart")').click();
      }
    }

    // Verify cart has all three products
    await cartPage.verifyCartItemCount(3);
    const cartItems = await cartPage.getCartItems();
    expect(cartItems).toHaveLength(3);
    for (const product of addedProducts) {
      await cartPage.verifyItemInCart(product);
    }

    console.log('Cart verified with 3 products:');
    cartItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.name} — ${item.price} x ${item.quantity}`);
    });

    // Proceed to checkout
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.locator('#address_delivery')).toBeVisible();

    // Review order and place it
    await checkoutPage.placeOrder();

    // Enter payment details
    await checkoutPage.fillPaymentDetails({
      nameOnCard: 'Hariteja',
      cardNumber: '4028743400541234',
      cvc: '134',
      expiryMonth: '10',
      expiryYear: '12',
    });

    await checkoutPage.confirmPayment();

    // Verify order placed successfully
    await checkoutPage.verifyOrderPlaced();
    console.log('Order placed successfully');

    // Fetch the invoice URL directly so validation works consistently across browsers.
    const invoiceLink = page.locator('a:has-text("Download Invoice")');
    const invoiceHref = await invoiceLink.getAttribute('href');
    if (!invoiceHref) {
      throw new Error('Download Invoice link does not have a URL');
    }
    const invoiceResponse = await page.request.get(
      new URL(invoiceHref, page.url()).toString()
    );
    expect(invoiceResponse.ok()).toBe(true);
    const invoicePath = path.resolve(__dirname, '../reports/invoice.txt');
    const invoiceContent = await invoiceResponse.text();
    fs.writeFileSync(invoicePath, invoiceContent);
    console.log(`Invoice saved to: ${invoicePath}`);

    // Read and validate invoice
    console.log('--- Invoice Content ---');
    console.log(invoiceContent);
    console.log('--- End Invoice ---');

    expect(invoiceContent).toBeTruthy();
    expect(invoiceContent).toContain('Your total purchase amount');
    expect(invoiceContent).toContain('Thank you');

    // Click Continue after order completion
    await checkoutPage.clickContinue();

    // Verify redirected to Home Page with active session
    await homePage.verifyHomePageVisible();
    await homePage.verifyLoggedIn(account.name);

    console.log('Home page verified — user session still active');
  });
});
