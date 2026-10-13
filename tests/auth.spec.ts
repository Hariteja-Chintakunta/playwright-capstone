// ABOUTME: Tests for user registration, login, and logout workflows.
// ABOUTME: Validates account creation, authentication, session management, and error handling.

import { test, expect } from '../fixtures/test-fixtures';
import { getUsers } from '../utils/data-reader';

const users = getUsers();

test.describe('User Authentication', () => {
  test('Register a new user, verify account, and delete it', async ({
    homePage,
    loginPage,
    signupPage,
    page,
  }) => {
    const uniqueEmail = `register_${Date.now()}@test.com`;

    await homePage.open();
    await homePage.goToLogin();
    await loginPage.verifyLoginPageVisible();

    await loginPage.startSignup(users.validUser.name, uniqueEmail);

    await signupPage.fillRegistrationForm(users.registrationData);
    await signupPage.submitRegistration();
    await signupPage.verifyAccountCreated();
    await signupPage.clickContinue();

    await homePage.verifyLoggedIn(users.validUser.name);

    await homePage.deleteAccount();
    await expect(page.locator('[data-qa="account-deleted"]')).toBeVisible();
  });

  test('Login with valid credentials and logout', async ({
    homePage,
    loginPage,
    signupPage,
    page,
  }) => {
    const uniqueEmail = `login_${Date.now()}@test.com`;
    const password = users.registrationData.password;

    // Setup: register a fresh account so we have known credentials
    await homePage.open();
    await homePage.goToLogin();
    await loginPage.startSignup(users.validUser.name, uniqueEmail);
    await signupPage.fillRegistrationForm(users.registrationData);
    await signupPage.submitRegistration();
    await signupPage.verifyAccountCreated();
    await signupPage.clickContinue();

    // Logout after registration
    await homePage.logout();
    await homePage.verifyLoggedOut();

    // Login with the credentials we just registered
    await loginPage.open();
    await loginPage.login(uniqueEmail, password);
    await homePage.verifyLoggedIn(users.validUser.name);

    // Logout again and verify
    await homePage.logout();
    await homePage.verifyLoggedOut();

    // Cleanup: login and delete the account
    await loginPage.open();
    await loginPage.login(uniqueEmail, password);
    await homePage.deleteAccount();
    await expect(page.locator('[data-qa="account-deleted"]')).toBeVisible();
  });

  test('Login with invalid credentials shows error', async ({
    homePage,
    loginPage,
  }) => {
    await homePage.open();
    await homePage.goToLogin();

    await loginPage.login(
      users.invalidUser.email,
      users.invalidUser.password
    );
    await loginPage.verifyLoginError();
  });
});
