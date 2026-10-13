// ABOUTME: Tests for the Contact Us form submission workflow.
// ABOUTME: Validates form filling, file upload, submission, and success confirmation.

import { test, expect } from '../fixtures/test-fixtures';
import * as path from 'path';

test.describe('Contact Us Form', () => {
  test('Submit contact form with all fields and file upload', async ({
    contactUsPage,
  }) => {
    await contactUsPage.open();
    await contactUsPage.verifyContactPageVisible();

    await contactUsPage.fillContactForm({
      name: 'Test User',
      email: 'testuser@example.com',
      subject: 'Test Automation Inquiry',
      message:
        'This is an automated test message for the contact form validation.',
    });

    const testFilePath = path.resolve(
      __dirname,
      '../testdata/test-upload.txt'
    );
    await contactUsPage.uploadFile(testFilePath);

    await contactUsPage.submit();
    await contactUsPage.verifySuccessMessage();
  });

  test('Contact Us page is accessible from home', async ({
    homePage,
    contactUsPage,
  }) => {
    await homePage.open();
    await homePage.goToContactUs();
    await contactUsPage.verifyContactPageVisible();
  });
});
