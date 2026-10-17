// ABOUTME: Test for Contact Us form submission with file upload using logged-in user's email.
// ABOUTME: Fills the form, uploads an invoice file, submits, and verifies the success message.

import { test, expect } from '../fixtures/test-fixtures';
import { getLatestAccount } from '../utils/account-store';
import * as path from 'path';

test.describe('Contact Us Form Validation', () => {
  test('Submit contact form with invoice issue and file upload', async ({
    homePage,
    loginPage,
    contactUsPage,
  }) => {
    const account = getLatestAccount();
    console.log(`Logging in as — ${account.name}`);

    // Login
    await homePage.open();
    await homePage.goToLogin();
    await loginPage.login(account.email, account.password);
    await homePage.verifyLoggedIn(account.name);

    // Navigate to Contact Us
    await homePage.goToContactUs();
    await contactUsPage.verifyContactPageVisible();

    // Fill form with logged-in user's email
    await contactUsPage.fillContactForm({
      name: 'Hariteja',
      email: account.email,
      subject: 'Invoice Issue',
      message: 'I am facing an issue with my previous order invoice. Kindly review and assist.',
    });

    // Upload invoice file
    const invoicePath = path.resolve(__dirname, '../docs/invoice.txt');
    await contactUsPage.uploadFile(invoicePath);

    // Submit and accept confirmation dialog
    await contactUsPage.submit();

    // Verify success message is displayed
    await contactUsPage.verifySuccessMessage();
    await expect(contactUsPage.getSuccessMessageLocator()).toContainText('Success');
  });
});
