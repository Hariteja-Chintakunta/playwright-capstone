// ABOUTME: Lightweight logging utility for test execution diagnostics.
// ABOUTME: Writes timestamped log entries to console and optionally to a log file.

import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const LOG_FILE = path.resolve(__dirname, '../reports/test-execution.log');

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

function appendToFile(message: string): void {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, message + '\n');
  } catch {
    // Logging failure should never break tests
  }
}

export const logger = {
  info(message: string): void {
    const formatted = formatMessage('INFO', message);
    console.log(formatted);
    appendToFile(formatted);
  },

  warn(message: string): void {
    const formatted = formatMessage('WARN', message);
    console.warn(formatted);
    appendToFile(formatted);
  },

  error(message: string): void {
    const formatted = formatMessage('ERROR', message);
    console.error(formatted);
    appendToFile(formatted);
  },

  debug(message: string): void {
    if (process.env.DEBUG) {
      const formatted = formatMessage('DEBUG', message);
      console.debug(formatted);
      appendToFile(formatted);
    }
  },
};
