// ABOUTME: Tests for shopping cart add, remove, and verification operations.
// ABOUTME: Validates cart state consistency after product additions and removals.

import { test, expect } from '../fixtures/test-fixtures';

test.describe('Shopping Cart', () => {
  test('Add multiple products to cart and verify count', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.open();

    await productsPage.addProductToCart(0);
    await productsPage.continueShopping();

    await productsPage.addProductToCart(1);
    await productsPage.viewCartFromModal();

    await cartPage.verifyCartItemCount(2);
  });

  test('Remove a product from cart', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.open();

    await productsPage.addProductToCart(0);
    await productsPage.continueShopping();
    await productsPage.addProductToCart(1);
    await productsPage.viewCartFromModal();

    await cartPage.verifyCartItemCount(2);

    await cartPage.removeItem(0);

    // Playwright auto-retries this assertion until the DOM updates
    await cartPage.verifyCartItemCount(1);
  });

  test('Verify product details in cart', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.open();

    const productNames = await productsPage.getProductNames();
    const firstProductName = productNames[0];

    await productsPage.addProductToCart(0);
    await productsPage.viewCartFromModal();

    await cartPage.verifyItemInCart(firstProductName);

    const items = await cartPage.getCartItems();
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeTruthy();
    expect(items[0].quantity).toBeTruthy();
    expect(items[0].total).toBeTruthy();
  });

  test('Add product with specific quantity from detail page', async ({
    productsPage,
    productDetailPage,
    cartPage,
  }) => {
    await productsPage.open();
    await productsPage.viewProductDetails(0);

    await productDetailPage.setQuantity(4);
    await productDetailPage.addToCart();
    await productDetailPage.viewCartFromModal();

    const items = await cartPage.getCartItems();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe('4');
  });
});
