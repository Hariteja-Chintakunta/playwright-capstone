// ABOUTME: Custom Playwright fixtures providing pre-configured page objects and shared test setup.
// ABOUTME: Blocks ad/tracking requests for stability and injects page object instances into tests.

import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { SignupPage } from '../pages/signup.page';
import { ProductsPage } from '../pages/products.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ContactUsPage } from '../pages/contact-us.page';

type TestFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  contactUsPage: ContactUsPage;
};

export const test = base.extend<TestFixtures>({
  // Override the default page fixture to block ads and tracking scripts.
  // automationexercise.com loads Google Ads that overlay page elements and
  // cause flaky locator clicks. Aborting these requests at the network level
  // is more reliable than trying to dismiss popups.
  page: async ({ page }, use) => {
    await page.route(
      /googlesyndication|doubleclick|adservice|googleadservices|connect\.facebook|facebook\.com\/(tr|plugins)/,
      (route) => route.abort()
    );
    await use(page);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  contactUsPage: async ({ page }, use) => {
    await use(new ContactUsPage(page));
  },
});

export { expect };
