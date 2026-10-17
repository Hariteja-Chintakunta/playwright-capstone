# Playwright E-Commerce Test Automation Framework

> **Presentation overview**
> A TypeScript and Playwright framework that automates important user journeys on
> [Automation Exercise](https://automationexercise.com). It demonstrates reusable page
> objects, custom fixtures, cross-browser testing, accessibility checks, visual
> regression, network controls, and actionable test reporting.

## Project at a glance

| Item | Details |
|---|---|
| Application under test | Automation Exercise e-commerce demo |
| Language | TypeScript |
| Automation framework | Playwright Test |
| Design pattern | Page Object Model (POM) |
| Browsers | Chromium, Firefox, and WebKit |
| Additional checks | axe-core accessibility, screenshot comparison, network interception |
| Configuration | `playwright.config.ts`, `.env` |

## Contents

1. [Purpose and scope](#purpose-and-scope)
2. [How the project works](#how-the-project-works)
3. [Project structure](#project-structure)
4. [Automated coverage](#automated-coverage)
5. [Setup](#setup)
6. [Run tests](#run-tests)
7. [Reports and debugging](#reports-and-debugging)
8. [Latest execution results](#latest-execution-results)
9. [Implementation and verification walkthrough](#implementation-and-verification-walkthrough)
10. [Known limits and next steps](#known-limits-and-next-steps)
11. [Presentation outline](#presentation-outline)
12. [Related documentation](#related-documentation)

## Purpose and scope

Manual regression testing of an online shop requires repeating the same flows after
changes: registering and logging in, finding products, updating a cart, placing an
order, and checking user-facing pages. This project automates those checks so they
can be repeated consistently in multiple browsers.

The framework covers:

- Account registration, login, and logout.
- Product search, browsing, and adding products to the cart.
- Removing cart items and checking cart contents.
- Checkout, payment, and invoice download.
- Contact form submission with a file attachment.
- Accessibility analysis of key pages.
- Visual comparison of key pages against saved screenshots.
- Request observation, routing, resource blocking, response checks, and simulated
  network delay.

The target is a public demo site. The test suite depends on that site being reachable
and its content and behavior remaining stable. A failure can therefore be caused by
the site, network, browser differences, test data, or the test itself.

## How the project works

The test flow follows a simple layered design:

```text
Playwright test
      |
      v
Custom fixture provides page objects and shared browser setup
      |
      v
Page object performs page actions and exposes reusable checks
      |
      v
Playwright browser visits Automation Exercise
      |
      v
Assertions, screenshots, traces, and reports capture the result
```

### Page Object Model

Each page class owns the locators and interactions for one area of the site. For
example, `CartPage` provides cart actions while `CheckoutPage` provides checkout and
payment actions. Shared behavior such as navigation and reading text is in
`BasePage`. Tests can describe user behavior without repeating locator details.

### Custom fixtures

`fixtures/test-fixtures.ts` extends Playwright's test fixture with page objects for
the home, login, signup, products, product detail, cart, checkout, and contact pages.
It also blocks selected advertising and tracking requests to reduce overlays and
improve test stability.

### Configuration and data

`playwright.config.ts` sets the test directory, browser projects, retry behavior,
timeouts, trace and screenshot policies, and list/HTML/JSON reporters. Tests run in a
single worker because the public demo stores carts on shared user accounts; parallel
tests that log into the same account can otherwise clear or modify each other's carts.
This improves determinism at the cost of longer suite execution time. The base URL
defaults to `https://automationexercise.com` and can be changed with `BASE_URL`.
Reusable sample inputs are kept in `testdata/`; account registration tests can save
generated accounts under `reports/` for other scenarios.

### Quality checks

- **Accessibility:** `@axe-core/playwright` scans key pages for WCAG-related issues.
- **Visual regression:** `toHaveScreenshot()` compares Chromium screenshots with
  versioned baselines.
- **Network behavior:** tests observe requests and responses, block images, and add
  artificial delay. The search-routing test exercises a route handler while checking
  the site's form-based search behavior.
- **Cross-browser:** the same functional scenarios run in Chromium, Firefox, and
  WebKit; visual baselines are intentionally Chromium-only.

## Project structure

```text
playwright-capstone/
|-- config/
|   `-- env.config.ts                  # Typed environment defaults
|-- docs/
|   |-- manual-test-cases.html         # Manual scenario reference
|   |-- presentation-guide.html        # Speaking notes and Q&A
|   |-- presentation.html              # Presentation material
|   `-- project-walkthrough.html       # Framework walkthrough
|-- fixtures/
|   `-- test-fixtures.ts               # Shared page objects and ad blocking
|-- pages/
|   |-- base.page.ts                   # Shared page methods
|   |-- cart.page.ts                   # Cart interactions and assertions
|   |-- checkout.page.ts               # Checkout and payment
|   |-- contact-us.page.ts             # Contact form and upload
|   |-- home.page.ts                   # Home page and navigation
|   |-- login.page.ts                  # Login and signup entry
|   |-- product-detail.page.ts         # Product detail and quantity
|   |-- products.page.ts               # Product search and browsing
|   `-- signup.page.ts                 # Account registration
|-- reports/                           # Generated reports and run artifacts
|-- testdata/
|   |-- checkout.json                  # Checkout sample data
|   |-- products.json                  # Product/search sample data
|   |-- test-upload.txt                # Contact form upload fixture
|   `-- users.json                     # User sample data
|-- tests/
|   |-- accessibility.spec.ts          # Accessibility scans
|   |-- contact-us-form-validation.spec.ts
|   |-- network-mock.spec.ts           # Network routing and response checks
|   |-- place-order.spec.ts            # Checkout through invoice download
|   |-- remove-product.spec.ts          # Cart removal flow
|   |-- search-add-to-cart.spec.ts      # Browse and add products
|   |-- user-login.spec.ts             # Login using a saved test account
|   |-- user-logout.spec.ts             # Logout flow
|   |-- user-registration.spec.ts       # Registration and account saving
|   |-- visual.spec.ts                 # Screenshot comparisons
|   `-- visual.spec.ts-snapshots/      # Chromium visual baselines
|-- utils/
|   |-- account-store.ts               # Generated account persistence
|   |-- data-reader.ts                 # Typed test data readers
|   |-- logger.ts                      # Shared logging utility
|   `-- screenshot.ts                  # Screenshot helper
|-- .env.example                       # Environment variable template
|-- FRAMEWORK_DECISIONS.md             # Architecture rationale
|-- package.json                       # Dependencies and commands
|-- playwright.config.ts               # Playwright runner configuration
`-- tsconfig.json                      # TypeScript compiler configuration
```

## Automated coverage

| Spec | Main scenario |
|---|---|
| `user-registration.spec.ts` | Register a user with unique details and persist the account |
| `user-login.spec.ts` | Log in using the latest saved test account |
| `user-logout.spec.ts` | Log out and confirm the signed-out state |
| `search-add-to-cart.spec.ts` | Browse men's T-shirts, filter to Polo, add products, verify cart |
| `remove-product.spec.ts` | Add products, remove one, and verify remaining cart contents |
| `place-order.spec.ts` | Sign in, add products, checkout, pay, download and check invoice |
| `contact-us-form-validation.spec.ts` | Submit contact form with an uploaded file and verify success |
| `accessibility.spec.ts` | Scan the home, login, and products pages using axe-core |
| `visual.spec.ts` | Compare home, login, and products screenshots with Chromium baselines |
| `network-mock.spec.ts` | Observe requests, route form search, block images, simulate delay, inspect statuses |

## Setup

### Prerequisites

- Node.js 18 or later.
- npm 9 or later.
- Network access to the application under test.

### Install dependencies and browsers

From the project root:

```powershell
npm install
npx playwright install chromium firefox webkit
```

### Configure the target URL

Copy `.env.example` to `.env` and set `BASE_URL` if you want to target a different
environment. The default is `https://automationexercise.com`.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Command Prompt:

```bat
copy .env.example .env
```

Do not put real credentials or secrets in source control. Generated test account data
and reports should be treated as local run artifacts.

## Run tests

Run the full suite in all configured browsers:

```bash
npm test
```

Run the TypeScript compiler without emitting build files:

```bash
npm run typecheck
```

Run against a single browser:

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

Run a specific spec or filter tests by title:

```bash
npx playwright test tests/network-mock.spec.ts
npx playwright test tests/place-order.spec.ts --project=chromium
npx playwright test -g "Register a new user"
```

Useful interactive modes:

```bash
npm run test:headed
npm run test:debug
npm run test:ui
```

Run accessibility tests or update screenshot baselines:

```bash
npm run test:accessibility
npm run test:visual
```

Review visual diffs before accepting updated baselines; updating snapshots changes
expected output and should not be used just to silence an unexpected difference.

## Reports and debugging

The configured reporters include terminal output, an HTML report, and a JSON result
file. Run:

```bash
npm run report
```

For failed or retried tests:

1. Read the terminal failure and identify the failed assertion or action.
2. Open the HTML report for screenshots, videos, and test attachments.
3. Open a trace archive from `test-results/`:

   ```bash
   npx playwright show-trace test-results/<test-folder>/trace.zip
   ```

4. Re-run only the failing spec and browser while investigating.

Configured artifacts:

| Artifact | Location |
|---|---|
| HTML report | `reports/html-report/` |
| JSON results | `reports/results.json` |
| Test output and traces | `test-results/` |
| Visual baselines | `tests/visual.spec.ts-snapshots/` |
| Generated accounts and invoice | `reports/` |

## Latest execution results

**Baseline full run before serializing shared-account tests: October 17, 2026.** The
run executed 30 browser-test cases across 7 workers:

| Result | Count |
|---|---:|
| Passed | 18 |
| Failed | 4 |
| Flaky (failed once, passed on retry) | 2 |
| Skipped | 6 |

The six skips are the Firefox and WebKit visual checks: visual baselines are restricted
to Chromium. The remaining failures were:

1. **Place order — Chromium and WebKit:** the cart had 2 rows when the test expected 3.
   Chromium's retry also timed out while opening the cart.
2. **Place order — Firefox:** the test timed out waiting for the checkout URL after
   proceeding from the cart.
3. **Place order — WebKit retry:** the expected cart item was found but hidden.
4. **Search and add to cart — WebKit:** a product quantity was `2` when the test
   expected `1`.

The search-and-add scenario was flaky in Chromium and Firefox but passed on retry.
The suite was subsequently configured to use one worker to prevent cross-test cart
state races. Re-run the affected tests after that configuration change to verify the
fix. Results can still vary because the suite uses a live external demo site and the
tests may create accounts, carts, or orders.

## Implementation and verification walkthrough

Use this sequence to explain the project from beginning to end:

1. **Define the goal:** automate repeatable e-commerce workflows and quality checks
   against a browser-visible demo application.
2. **Choose the stack:** use TypeScript for typed page and test data, and Playwright
   Test for browser control, assertions, retries, routing, and reporting.
3. **Build reusable layers:** establish configuration, `BasePage`, individual page
   objects, and custom fixtures so tests share setup and actions.
4. **Add scenarios:** cover user lifecycle, product discovery, cart changes,
   checkout/invoice, contact form, and cross-cutting quality checks.
5. **Add diagnostics:** collect HTML/JSON reports, screenshots on failure, traces on
   retry, and Chromium visual baselines.
6. **Run and triage:** run `npm test` across Chromium, Firefox, and WebKit; inspect
   the report and isolate the remaining browser-specific failures listed above.
7. **Fix a test-blocking syntax issue:** the first line of `pages/product-detail.page.ts`
   had accidental command text before its comment. Removing that prefix restored
   TypeScript parsing and allowed the Playwright suite to execute.
8. **Record the verified state:** the latest observed run was 18 passed, 4 failed,
   2 flaky, and 6 skipped. Do not describe the full suite as passing until those
   outstanding failures are resolved and re-tested.

## Known limits and next steps

- Tests depend on a public site and internet access; this is not a self-hosted,
  deterministic test environment.
- Some end-to-end flows share generated account data and can affect site state.
- Cart and checkout behavior differs across browsers in the latest recorded run.
- Test registration, cart, payment, or order flows may create data on the target
  site. Use only the intended demo environment and test data.
- A sensible next step is to investigate cart state and checkout navigation first,
  then re-run the affected specs in each browser before another full-suite run.

## Presentation outline

1. **Problem:** manual e-commerce regression takes repeated effort and may miss
   browser-specific issues.
2. **Solution:** a reusable Playwright + TypeScript test framework.
3. **Architecture:** configuration, fixtures, page objects, data, tests, and reports.
4. **Demonstration:** run registration/login, product/cart, or contact form tests.
5. **Quality coverage:** accessibility, visual regression, network routing, and
   three-browser execution.
6. **Results:** show the latest run counts and explain that failures are tracked
   transparently rather than hidden.
7. **Next steps:** stabilize cart/checkout flows, re-run tests, and update this
   section with verified results.

## Related documentation

- [Framework architecture decisions](./FRAMEWORK_DECISIONS.md)
- [Presentation guide](./docs/presentation-guide.html)
- [Project walkthrough](./docs/project-walkthrough.html)
- [Presentation material](./docs/presentation.html)
- [Manual test cases](./docs/manual-test-cases.html)
