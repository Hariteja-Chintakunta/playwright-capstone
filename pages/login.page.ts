// ABOUTME: Page object for the login/signup entry page at /login.
// ABOUTME: Handles both login form submission and initial signup name/email entry.

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly loginEmail: Locator;
  private readonly loginPassword: Locator;
  private readonly loginButton: Locator;
  private readonly loginErrorMessage: Locator;
  private readonly signupName: Locator;
  private readonly signupEmail: Locator;
  private readonly signupButton: Locator;
  private readonly signupErrorMessage: Locator;
  private readonly loginHeader: Locator;
  private readonly signupHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.loginEmail = page.locator('[data-qa="login-email"]');
    this.loginPassword = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginErrorMessage = page.locator(
      'p:has-text("Your email or password is incorrect!")'
    );
    this.signupName = page.locator('[data-qa="signup-name"]');
    this.signupEmail = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupErrorMessage = page.locator(
      'p:has-text("Email Address already exist!")'
    );
    this.loginHeader = page.locator('h2:has-text("Login to your account")');
    this.signupHeader = page.locator('h2:has-text("New User Signup!")');
  }

  async open(): Promise<void> {
    await this.navigate('/login');
  }

  async verifyLoginPageVisible(): Promise<void> {
    await expect(this.loginHeader).toBeVisible();
    await expect(this.signupHeader).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupButton.click();
  }

  async verifyLoginError(): Promise<void> {
    await expect(this.loginErrorMessage).toBeVisible();
  }

  async verifySignupError(): Promise<void> {
    await expect(this.signupErrorMessage).toBeVisible();
  }
}
