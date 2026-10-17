// ABOUTME: Page object for the Contact Us page form submission.
// ABOUTME: Handles filling the contact form, file upload, submission, and success verification.

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ContactUsPage extends BasePage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly subjectInput: Locator;
  private readonly messageInput: Locator;
  private readonly uploadFileInput: Locator;
  private readonly submitButton: Locator;
  private readonly successMessage: Locator;
  private readonly getInTouchHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('[data-qa="name"]');
    this.emailInput = page.locator('[data-qa="email"]');
    this.subjectInput = page.locator('[data-qa="subject"]');
    this.messageInput = page.locator('[data-qa="message"]');
    this.uploadFileInput = page.locator('input[name="upload_file"]');
    this.submitButton = page.locator('[data-qa="submit-button"]');
    this.successMessage = page.locator('#contact-page .alert-success');
    this.getInTouchHeader = page.locator('h2:has-text("Get In Touch")');
  }

  async open(): Promise<void> {
    await this.navigate('/contact_us');
  }

  async verifyContactPageVisible(): Promise<void> {
    await expect(this.getInTouchHeader).toBeVisible();
  }

  async fillContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.subjectInput.fill(data.subject);
    await this.messageInput.fill(data.message);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.uploadFileInput.setInputFiles(filePath);
  }

  async submit(): Promise<void> {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.submitButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifySuccessMessage(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 10_000 });
  }

  getSuccessMessageLocator(): Locator {
    return this.successMessage;
  }
}
