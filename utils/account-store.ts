// ABOUTME: Shared credential management for test accounts created during registration.
// ABOUTME: Reads and writes the created-accounts.json file used across all test files.

import * as fs from 'fs';
import * as path from 'path';

const CREDENTIALS_FILE = path.resolve(__dirname, '../reports/created-accounts.json');

export interface TestAccount {
  name: string;
  email: string;
  password: string;
  createdAt?: string;
}

export function getLatestAccount(): TestAccount {
  const accounts = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
  return accounts[accounts.length - 1];
}

export function saveAccount(account: TestAccount): void {
  const existing = fs.existsSync(CREDENTIALS_FILE)
    ? JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'))
    : [];
  existing.push(account);
  fs.mkdirSync(path.dirname(CREDENTIALS_FILE), { recursive: true });
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(existing, null, 2));
}
