// ABOUTME: Tests for user registration using unique credentials per run.
// ABOUTME: Registration saves credentials to a shared store for other tests to consume.

import { test } from '../fixtures/test-fixtures';
import { saveAccount } from '../utils/account-store';

test.describe('User Registration', () => {
  test('Register a new user with unique name and email', async ({
    homePage,
    loginPage,
    signupPage,
  }) => {
    const now = new Date();
    const timeStamp = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const rand = Math.floor(Math.random() * 900 + 100);
    const uniqueName = `hariteja_${timeStamp}_${rand}`;
    const uniqueEmail = `haritejac_${timeStamp}_${rand}@hotmail.com`;

    await homePage.open();
    await homePage.goToLogin();
    await loginPage.verifyLoginPageVisible();

    await loginPage.startSignup(uniqueName, uniqueEmail);

    await signupPage.fillRegistrationForm({
      title: 'Mr',
      password: 'Rules@123',
      day: '19',
      month: '5',
      year: '2010',
      firstName: 'hariteja',
      lastName: 'chintakunta',
      company: 'Perficient',
      address: '123 Test Street',
      address2: 'Suite 456',
      country: 'United States',
      state: 'Missouri',
      city: 'St Louis',
      zipcode: '63141',
      mobile: '5551234567',
    });

    await signupPage.submitRegistration();
    await signupPage.verifyAccountCreated();

    saveAccount({
      name: uniqueName,
      email: uniqueEmail,
      password: 'Rules@123',
      createdAt: new Date().toISOString(),
    });

    console.log(`Created user — Name: ${uniqueName}, Email: ${uniqueEmail}`);

    await signupPage.clickContinue();
    await homePage.verifyLoggedIn(uniqueName);

    await homePage.logout();
  });

});
