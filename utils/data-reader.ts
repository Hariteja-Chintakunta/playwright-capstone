// ABOUTME: Utility for reading test data from JSON files in the testdata directory.
// ABOUTME: Provides typed access to user, product, and checkout test data.

import * as fs from 'fs';
import * as path from 'path';

const TEST_DATA_DIR = path.resolve(__dirname, '../testdata');

export function readTestData<T>(filename: string): T {
  const filePath = path.join(TEST_DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function getUsers(): UserTestData {
  return readTestData<UserTestData>('users.json');
}

export function getProducts(): ProductTestData {
  return readTestData<ProductTestData>('products.json');
}

export function getCheckoutData(): CheckoutTestData {
  return readTestData<CheckoutTestData>('checkout.json');
}

export interface UserTestData {
  validUser: {
    name: string;
    email: string;
    password: string;
  };
  registrationData: {
    title: 'Mr' | 'Mrs';
    password: string;
    day: string;
    month: string;
    year: string;
    firstName: string;
    lastName: string;
    company: string;
    address: string;
    address2: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
    mobile: string;
  };
  invalidUser: {
    email: string;
    password: string;
  };
}

export interface ProductTestData {
  searchTerms: string[];
  expectedProducts: {
    name: string;
    price: string;
  }[];
}

export interface CheckoutTestData {
  payment: {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
  };
  comment: string;
}
