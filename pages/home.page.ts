// ABOUTME: Page object for the home page, providing navigation and header verification.
// ABOUTME: Exposes methods for checking login state and navigating to key sections.

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  private readonly loggedInAs: Locator;
  private readonly logoutLink: Locator;
  private readonly loginLink: Locator;
  private readonly deleteAccountLink: Locator;
  private readonly productsLink: Locator;
  private readonly cartLink: Locator;
  private readonly contactUsLink: Locator;
  private readonly slider: Locator;

  constructor(page: Page) {
    super(page);
    this.loggedInAs = page.locator('a:has-text("Logged in as")');
    this.logoutLink = page.locator('a[href="/logout"]');
    this.loginLink = page.locator('a[href="/login"]');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    this.productsLink = page.locator('a[href="/products"]');
    this.cartLink = page.locator('a[href="/view_cart"]');
    this.contactUsLink = page.locator('a[href="/contact_us"]');
    this.slider = page.locator('#slider-carousel');
  }

  async open(): Promise<void> {
    await this.navigate('/');
  }

  async verifyLoggedIn(username: string): Promise<void> {
    await expect(this.loggedInAs).toContainText(username);
  }

  async verifyLoggedOut(): Promise<void> {
    await expect(this.loginLink).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }

  async goToProducts(): Promise<void> {
    await this.productsLink.click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async goToContactUs(): Promise<void> {
    await this.contactUsLink.click();
  }

  async deleteAccount(): Promise<void> {
    await this.deleteAccountLink.click();
  }

  async verifyHomePageVisible(): Promise<void> {
    await expect(this.slider).toBeVisible();
  }
}
