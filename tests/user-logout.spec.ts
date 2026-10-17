// ABOUTME: Test for user logout using the latest account from the shared credential store.
// ABOUTME: Logs in first, then logs out and verifies the user is signed out.

import { test } from '../fixtures/test-fixtures';
import { getLatestAccount } from '../utils/account-store';

test.describe('User Logout', () => {
  test('Logout the logged-in user and verify', async ({
    homePage,
    loginPage,
  }) => {
    const account = getLatestAccount();

    await homePage.open();
    await homePage.goToLogin();
    await loginPage.login(account.email, account.password);
    await homePage.verifyLoggedIn(account.name);

    await homePage.logout();
    await homePage.verifyLoggedOut();

    console.log(`User ${account.name} logged out successfully`);
  });
});
