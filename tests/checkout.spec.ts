// ABOUTME: End-to-end test for the complete checkout and order placement flow.
// ABOUTME: Covers registration, cart population, address verification, payment, and confirmation.

import { test, expect } from '../fixtures/test-fixtures';
import { getUsers, getCheckoutData } from '../utils/data-reader';

const users = getUsers();
const checkout = getCheckoutData();

test.describe('Checkout Flow', () => {
  test('Complete purchase from registration to order confirmation', async ({
    homePage,
    loginPage,
    signupPage,
    productsPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    const uniqueEmail = `checkout_${Date.now()}@test.com`;

    // Step 1: Register a fresh account
    await homePage.open();
    await homePage.goToLogin();
    await loginPage.startSignup('Checkout User', uniqueEmail);
    await signupPage.fillRegistrationForm(users.registrationData);
    await signupPage.submitRegistration();
    await signupPage.verifyAccountCreated();
    await signupPage.clickContinue();

    // Step 2: Add products to cart
    await productsPage.open();
    await productsPage.addProductToCart(0);
    await productsPage.continueShopping();
    await productsPage.addProductToCart(1);
    await productsPage.viewCartFromModal();

    // Step 3: Proceed to checkout
    await cartPage.verifyCartItemCount(2);
    await cartPage.proceedToCheckout();

    // Step 4: Verify address and review order
    await checkoutPage.verifyDeliveryAddress(
      users.registrationData.firstName
    );
    await checkoutPage.addComment(checkout.comment);
    await checkoutPage.placeOrder();

    // Step 5: Fill payment details and confirm
    await checkoutPage.fillPaymentDetails(checkout.payment);
    await checkoutPage.confirmPayment();

    // Step 6: Verify order confirmation
    await checkoutPage.verifyOrderPlaced();

    // Cleanup: delete the test account
    await checkoutPage.clickContinue();
    await homePage.deleteAccount();
    await expect(page.locator('[data-qa="account-deleted"]')).toBeVisible();
  });
});
