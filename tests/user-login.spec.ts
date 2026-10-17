// ABOUTME: Test for user login using the latest account from the shared credential store.
// ABOUTME: Reads credentials saved by the registration test and verifies login.

import { test } from '../fixtures/test-fixtures';
import { getLatestAccount } from '../utils/account-store';

test.describe('User Login', () => {
  test('Login with the latest created user', async ({
    homePage,
    loginPage,
  }) => {
    const account = getLatestAccount();
    console.log(`Logging in as — Name: ${account.name}, Email: ${account.email}`);

    await homePage.open();
    await homePage.goToLogin();
    await loginPage.verifyLoginPageVisible();

    await loginPage.login(account.email, account.password);
    await homePage.verifyLoggedIn(account.name);
  });
});
