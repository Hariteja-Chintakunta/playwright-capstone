// ABOUTME: Page object for the account registration form at /signup.
// ABOUTME: Handles the detailed registration form that appears after initial signup entry.

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export interface RegistrationData {
  title?: 'Mr' | 'Mrs';
  password: string;
  day: string;
  month: string;
  year: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  address2?: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
  newsletter?: boolean;
  specialOffers?: boolean;
}

export class SignupPage extends BasePage {
  private readonly titleMr: Locator;
  private readonly titleMrs: Locator;
  private readonly password: Locator;
  private readonly dayDropdown: Locator;
  private readonly monthDropdown: Locator;
  private readonly yearDropdown: Locator;
  private readonly newsletter: Locator;
  private readonly specialOffers: Locator;
  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly company: Locator;
  private readonly address: Locator;
  private readonly address2: Locator;
  private readonly country: Locator;
  private readonly state: Locator;
  private readonly city: Locator;
  private readonly zipcode: Locator;
  private readonly mobile: Locator;
  private readonly createAccountButton: Locator;
  private readonly accountCreated: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleMr = page.locator('#id_gender1');
    this.titleMrs = page.locator('#id_gender2');
    this.password = page.locator('[data-qa="password"]');
    this.dayDropdown = page.locator('[data-qa="days"]');
    this.monthDropdown = page.locator('[data-qa="months"]');
    this.yearDropdown = page.locator('[data-qa="years"]');
    this.newsletter = page.locator('#newsletter');
    this.specialOffers = page.locator('#optin');
    this.firstName = page.locator('[data-qa="first_name"]');
    this.lastName = page.locator('[data-qa="last_name"]');
    this.company = page.locator('[data-qa="company"]');
    this.address = page.locator('[data-qa="address"]');
    this.address2 = page.locator('[data-qa="address2"]');
    this.country = page.locator('[data-qa="country"]');
    this.state = page.locator('[data-qa="state"]');
    this.city = page.locator('[data-qa="city"]');
    this.zipcode = page.locator('[data-qa="zipcode"]');
    this.mobile = page.locator('[data-qa="mobile_number"]');
    this.createAccountButton = page.locator('[data-qa="create-account"]');
    this.accountCreated = page.locator('[data-qa="account-created"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async fillRegistrationForm(data: RegistrationData): Promise<void> {
    if (data.title === 'Mrs') {
      await this.titleMrs.check();
    } else {
      await this.titleMr.check();
    }

    await this.password.fill(data.password);
    await this.dayDropdown.selectOption(data.day);
    await this.monthDropdown.selectOption(data.month);
    await this.yearDropdown.selectOption(data.year);

    if (data.newsletter) {
      await this.newsletter.check();
    }
    if (data.specialOffers) {
      await this.specialOffers.check();
    }

    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    if (data.company) {
      await this.company.fill(data.company);
    }
    await this.address.fill(data.address);
    if (data.address2) {
      await this.address2.fill(data.address2);
    }
    await this.country.selectOption(data.country);
    await this.state.fill(data.state);
    await this.city.fill(data.city);
    await this.zipcode.fill(data.zipcode);
    await this.mobile.fill(data.mobile);
  }

  async submitRegistration(): Promise<void> {
    await this.createAccountButton.click();
  }

  async verifyAccountCreated(): Promise<void> {
    await expect(this.accountCreated).toBeVisible();
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }
}
