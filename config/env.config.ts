// ABOUTME: Centralized environment configuration with typed access to all settings.
// ABOUTME: Reads from environment variables with sensible defaults for local development.

export const envConfig = {
  baseUrl: process.env.BASE_URL || 'https://automationexercise.com',
  timeout: {
    default: 30_000,
    action: 15_000,
    navigation: 30_000,
  },
  retries: process.env.CI ? 2 : 1,
};
