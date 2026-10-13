# Playwright Capstone - Enterprise E-Commerce Automation Framework

An enterprise-grade test automation framework built with **Playwright** and **TypeScript** for
validating critical business workflows on [automationexercise.com](https://automationexercise.com/).

Built as a Perficient capstone project demonstrating production-ready automation practices:
Page Object Model, custom fixtures, data-driven testing, network interception, accessibility
validation, visual regression, and cross-browser execution.

---

## Architecture Overview

```
playwright-capstone/
  config/
    env.config.ts          # Typed environment settings (URLs, timeouts)
  fixtures/
    test-fixtures.ts       # Custom fixtures: page object injection + ad blocking
  pages/
    base.page.ts           # Shared methods (navigate, screenshot, getText)
    home.page.ts           # Home page: nav links, login state verification
    login.page.ts          # Login/signup entry: both forms on /login
    signup.page.ts         # Registration form: full account creation at /signup
    products.page.ts       # Product listing: search, browse, add to cart
    product-detail.page.ts # Single product: info display, quantity, add to cart
    cart.page.ts           # Shopping cart: items, removal, proceed to checkout
    checkout.page.ts       # Checkout + payment: address, order, payment, confirmation
    contact-us.page.ts     # Contact form: fill, upload, submit
  tests/
    auth.spec.ts           # Registration, login/logout, invalid credentials
    product-search.spec.ts # Data-driven search across multiple terms
    cart.spec.ts           # Add, remove, verify cart items and quantities
    checkout.spec.ts       # End-to-end purchase flow
    contact-us.spec.ts     # Contact form submission with file upload
    accessibility.spec.ts  # axe-core WCAG 2.0 A/AA scanning
    visual.spec.ts         # Screenshot baseline comparison
    network-mock.spec.ts   # Request interception, mocking, blocking
  testdata/
    users.json             # Registration and login credentials
    products.json          # Search terms and expected product data
    checkout.json          # Payment details and order comments
    test-upload.txt        # File for contact form upload test
  utils/
    data-reader.ts         # Typed JSON reader for test data files
    screenshot.ts          # Manual screenshot capture utility
    logger.ts              # Timestamped logging to console and file
  reports/                 # Generated reports and screenshots (gitignored)
  playwright.config.ts     # Playwright: browsers, reporters, traces, timeouts
  package.json             # Dependencies and npm scripts
  tsconfig.json            # TypeScript compiler configuration
  .env.example             # Environment variable template
  FRAMEWORK_DECISIONS.md   # Detailed reasoning for every architecture decision
```

---

## Setup Instructions

### Prerequisites
- Node.js 18 or later
- npm 9 or later

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd playwright-capstone

# Install dependencies
npm install

# Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install
```

### Environment Configuration

```bash
# Copy the example env file
cp .env.example .env

# Edit if you need to point to a different environment
# Default: https://automationexercise.com
```

---

## Running Tests

### All tests across all browsers
```bash
npm test
```

### Single browser
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Headed mode (see the browser)
```bash
npm run test:headed
```

### Debug mode (step through tests)
```bash
npm run test:debug
```

### Interactive UI mode
```bash
npm run test:ui
```

### Specific test file
```bash
npx playwright test tests/auth.spec.ts
npx playwright test tests/checkout.spec.ts
```

### Specific test by name
```bash
npx playwright test -g "Register a new user"
```

### Update visual baselines
```bash
npm run test:visual
```

---

## Viewing Reports

### HTML Report
```bash
npm run report
```
Opens an interactive report showing every test, its steps, screenshots on failure,
and trace files for retried tests.

### Trace Viewer
When a test fails and retries, Playwright captures a trace. View it with:
```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```
The Trace Viewer shows a timeline of every action, screenshots at each step,
DOM snapshots, network requests, and console logs.

### JSON Report
Machine-readable results are written to `reports/results.json` for CI/CD integration.

---

## Test Coverage

| Test File | What It Covers | Requirement |
|---|---|---|
| `auth.spec.ts` | Registration, login, logout, invalid login | User Registration/Login/Logout |
| `product-search.spec.ts` | Data-driven search with 5 terms, product details | Product Search |
| `cart.spec.ts` | Add/remove items, verify quantities and totals | Add/Remove Products from Cart |
| `checkout.spec.ts` | Full purchase: register, cart, checkout, payment | Checkout Flow + Order Placement |
| `contact-us.spec.ts` | Form fill, file upload, submit, success message | Contact Us Form Validation |
| `accessibility.spec.ts` | axe-core WCAG 2.0 A/AA on 3 pages | Accessibility Testing |
| `visual.spec.ts` | Screenshot baseline comparison on 3 pages | Visual Regression Testing |
| `network-mock.spec.ts` | Request interception, blocking, mocking, timing | Network Interception and Mocking |

**Total: 8 test files with 20+ individual test cases.**

---

## Framework Components Explained

### Page Object Model (POM)

Each page of the application has a corresponding TypeScript class that encapsulates:
- **Locators:** Defined once as `private readonly` properties in the constructor
- **Actions:** Public methods that perform user interactions (login, search, addToCart)
- **Assertions:** Public methods that verify page state (verifyLoggedIn, verifySearchResults)

**Why this matters:** When a UI element changes, you update one file. Not twenty tests.

The locator strategy prioritizes stability:
1. `data-qa` attributes (most stable, explicitly for testing)
2. Semantic selectors (`a[href="/login"]`, form input names)
3. Text-based selectors (`h2:has-text("Login")`) as last resort

### Custom Fixtures

Playwright fixtures work like dependency injection. Tests declare what page objects they need:

```typescript
test('Login test', async ({ loginPage, homePage }) => {
  // loginPage and homePage are automatically constructed and injected
});
```

The `page` fixture is overridden to block ad requests:

```typescript
page: async ({ page }, use) => {
  await page.route(/google|doubleclick|googlesyndication/, route => route.abort());
  await use(page);
},
```

### Data-Driven Testing

Test data lives in JSON files under `testdata/`. The `data-reader.ts` utility reads them
with type safety:

```typescript
const users = getUsers();        // Returns typed UserTestData
const products = getProducts();  // Returns typed ProductTestData
```

The product search test demonstrates data-driven iteration:

```typescript
for (const searchTerm of productData.searchTerms) {
  test(`Search for "${searchTerm}"`, async ({ productsPage }) => {
    // One test generated per search term from JSON
  });
}
```

### Network Interception

Playwright's `page.route()` can intercept any HTTP request:

- **Block requests:** Abort ad/tracking scripts for test stability
- **Monitor requests:** Log URLs and status codes for validation
- **Mock responses:** Return custom data for edge case testing
- **Simulate conditions:** Add artificial latency to test slow network handling

### Accessibility Testing

`@axe-core/playwright` runs the axe-core engine inside the page and reports WCAG violations:

```typescript
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();
```

Tests filter for `critical` and `serious` violations, logging full details (rule ID,
description, help URL, affected elements) for any failures.

### Visual Regression

Playwright's `toHaveScreenshot()` compares the current page against a stored baseline:

```typescript
await expect(page).toHaveScreenshot('home-page.png', {
  maxDiffPixelRatio: 0.05,
  fullPage: true,
});
```

- First run: Creates baseline images in `tests/visual.spec.ts-snapshots/`
- Subsequent runs: Compares against baselines, fails if difference exceeds 5%
- Update baselines: `npx playwright test --update-snapshots`

### Cross-Browser Execution

The `playwright.config.ts` defines three browser projects:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
]
```

`npm test` runs all tests across all three browsers. Use `--project=chromium` to target one.

---

## Debugging Failures

### 1. Check the HTML Report
```bash
npm run report
```
Every failed test includes a screenshot and (on retry) a trace file.

### 2. Open the Trace Viewer
Click the trace icon in the HTML report, or run:
```bash
npx playwright show-trace test-results/<folder>/trace.zip
```

### 3. Run in Debug Mode
```bash
npm run test:debug
```
Opens Playwright Inspector with step-through execution, locator highlighting, and DOM exploration.

### 4. Run in UI Mode
```bash
npm run test:ui
```
Interactive test runner with time-travel debugging, watch mode, and filtering.

### 5. Check Logs
Test execution logs are written to `reports/test-execution.log` with timestamps and severity levels.

---

## Adding New Tests

### 1. Create a page object (if testing a new page)
```typescript
// pages/new-page.page.ts
export class NewPage extends BasePage {
  private readonly someElement: Locator;

  constructor(page: Page) {
    super(page);
    this.someElement = page.locator('[data-qa="element"]');
  }

  async doSomething(): Promise<void> {
    await this.someElement.click();
  }
}
```

### 2. Register it in fixtures
```typescript
// fixtures/test-fixtures.ts
newPage: async ({ page }, use) => {
  await use(new NewPage(page));
},
```

### 3. Write the test
```typescript
// tests/new-feature.spec.ts
import { test, expect } from '../fixtures/test-fixtures';

test('New feature works', async ({ newPage }) => {
  // test implementation
});
```

### 4. Add test data (if needed)
Create a JSON file in `testdata/` and add a reader function in `utils/data-reader.ts`.

---

## Design Decisions

See [FRAMEWORK_DECISIONS.md](./FRAMEWORK_DECISIONS.md) for detailed reasoning behind every
architectural choice, including:

- Why Playwright over Selenium
- Why TypeScript over JavaScript
- Why POM with class inheritance
- Why custom fixtures with ad blocking
- Why JSON for test data
- Why axe-core for accessibility
- Why built-in visual regression
- Why network interception for ad blocking
- Why this folder structure
- Why environment configuration with dotenv
- Why multiple reporters
- Why trace on first retry
- Why unique emails per test run
- Why BasePage inheritance
