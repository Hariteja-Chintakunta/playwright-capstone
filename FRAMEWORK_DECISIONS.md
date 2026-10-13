# Framework Architecture Decisions

Every technology choice, pattern, and structural decision in this framework is documented here
with the reasoning behind it.

---

## 1. Why Playwright Over Selenium?

**Decision:** Use Playwright as the browser automation engine.

**Reasoning:**
- **Auto-wait mechanism:** Playwright automatically waits for elements to be actionable before
  performing actions (visible, enabled, stable). Selenium requires explicit waits (`WebDriverWait`,
  `ExpectedConditions`), which leads to either flaky tests (too short) or slow tests (too long).
- **Built-in assertions with retry:** `expect(locator).toBeVisible()` retries until the condition
  is met or timeout expires. Selenium assertions fail immediately on the current DOM state.
- **Network interception:** Playwright can intercept, modify, and mock HTTP requests natively.
  Selenium requires a separate proxy tool (BrowserMob Proxy) or DevTools Protocol setup.
- **Trace Viewer:** Playwright captures a full trace (screenshots, DOM snapshots, network logs,
  console output) that can be replayed step-by-step for debugging. Selenium has no equivalent.
- **Multi-browser from one API:** Playwright drives Chromium, Firefox, and WebKit with the same
  API. Selenium requires different driver binaries and sometimes different code paths.
- **Speed:** Playwright runs in the same process as the browser via CDP/protocol, avoiding the
  HTTP-based WebDriver protocol overhead.
- **Built-in visual regression:** `toHaveScreenshot()` with baseline comparison is built in.
  Selenium requires third-party libraries (Ashot, Shutterbug).

**When Selenium is still the right choice:**
- Legacy projects already invested in Selenium infrastructure
- Teams that need to test on real mobile devices via Appium (Playwright has limited mobile support)
- Organizations with existing Selenium Grid infrastructure

---

## 2. Why TypeScript Over JavaScript?

**Decision:** Use TypeScript for all framework code.

**Reasoning:**
- **Compile-time error detection:** Type mismatches, missing properties, and wrong function
  arguments are caught before tests run. In JavaScript, these become runtime errors that waste
  execution time.
- **IDE intelligence:** TypeScript enables autocomplete for page object methods, fixture types,
  and test data shapes. When a team member types `loginPage.`, the IDE shows exactly what methods
  are available.
- **Self-documenting interfaces:** The `RegistrationData`, `CartItem`, and `ProductInfo`
  interfaces serve as living documentation of data structures. No need for separate data dictionaries.
- **Refactoring safety:** Renaming a method in a page object immediately flags every test that
  calls it. In JavaScript, broken references hide until runtime.
- **Industry alignment:** Playwright's own documentation and examples use TypeScript. The
  Playwright team optimizes the TypeScript experience first.

---

## 3. Why Page Object Model (POM)?

**Decision:** Encapsulate every page's locators and interactions in a dedicated class.

**Reasoning:**
- **Single source of truth for locators:** If the signup button's `data-qa` attribute changes,
  we update `signup.page.ts` once, not every test that clicks it.
- **Readable tests:** `await loginPage.login(email, password)` reads like a business action.
  `await page.locator('[data-qa="login-email"]').fill(email)` reads like implementation detail.
- **Encapsulation:** Tests don't know (or care) whether the login form uses `data-qa` attributes,
  CSS classes, or XPath. The page object hides that decision.
- **Reusable across test suites:** The `CartPage` is used in `cart.spec.ts`, `checkout.spec.ts`,
  and potentially future regression tests. Each test gets the same reliable API.

**Why we chose a class-based POM (not functional):**
- Class inheritance (`extends BasePage`) shares common methods (navigate, screenshot, getText)
  without duplication.
- Constructor injection of `page` keeps the Playwright page instance consistent across all
  methods within a page object.
- Class-based POM is the established pattern in the Playwright documentation and the broader
  QA engineering community.

---

## 4. Why Custom Fixtures?

**Decision:** Extend Playwright's `test` object with custom fixtures that inject page objects.

**Reasoning:**
- **Dependency injection:** Tests declare what they need (`{ loginPage, homePage }`) and the
  fixture system provides it. Tests don't construct page objects themselves.
- **Centralized setup:** Ad blocking is configured once in the `page` fixture override. Every
  test gets ad-free pages without any per-test setup code.
- **Lazy instantiation:** Fixtures are only created when a test actually requests them. A test
  that only needs `contactUsPage` doesn't pay the cost of constructing `checkoutPage`.
- **Test isolation:** Each test gets its own browser context, page, and page object instances.
  No shared mutable state between tests.

**Why override the `page` fixture for ad blocking:**
automationexercise.com loads Google Ads that overlay clickable elements and cause flaky tests.
Blocking ad requests at the network level (via `page.route()`) is more reliable than:
- Trying to close ad popups (they appear inconsistently)
- Adding extra waits (doesn't help when ads overlay the element)
- Using `{ force: true }` on clicks (bypasses actionability checks, hides real issues)

---

## 5. Why Data-Driven Testing With JSON Files?

**Decision:** Store test data in JSON files under `testdata/` and read them via a typed utility.

**Reasoning:**
- **Separation of concerns:** Test logic (what to verify) is separate from test data (what
  values to use). A new test scenario can often be added by editing JSON, not TypeScript.
- **Data-driven iteration:** The product search test loops over `searchTerms` from JSON,
  generating one test per term. Adding a new search term requires no code changes.
- **Type safety:** The `data-reader.ts` utility returns typed objects (`UserTestData`,
  `CheckoutTestData`). If the JSON structure changes and breaks the contract, TypeScript catches it.
- **No hardcoded credentials:** Test credentials live in data files, not scattered across spec
  files. Easy to update, easy to find, easy to exclude from version control if needed.

**Why JSON over CSV or Excel:**
- JSON supports nested structures (registration data with address fields)
- TypeScript has native JSON support (`resolveJsonModule`)
- No external libraries needed (unlike xlsx parsing)
- JSON files are diffable in git

---

## 6. Why axe-core for Accessibility Testing?

**Decision:** Use `@axe-core/playwright` for automated accessibility validation.

**Reasoning:**
- **Industry standard:** axe-core is the most widely adopted accessibility testing engine,
  maintained by Deque Systems. It powers browser extensions (axe DevTools), CI tools, and
  automated test integrations.
- **WCAG compliance:** Tests check against WCAG 2.0 Level A and AA criteria, which are the
  legal requirements in many jurisdictions (ADA, Section 508, EN 301 549).
- **Actionable results:** Each violation includes the rule ID, description, impact level,
  affected HTML elements, and a help URL explaining how to fix it.
- **Severity filtering:** We filter for `critical` and `serious` violations to avoid failing
  tests on `minor` or `moderate` issues that may be acceptable trade-offs.
- **First-class Playwright integration:** `@axe-core/playwright` runs axe-core in the page
  context via Playwright's `evaluate()`, with no additional browser extension or proxy needed.

---

## 7. Why Built-in Visual Regression (Not Percy or Applitools)?

**Decision:** Use Playwright's native `toHaveScreenshot()` for visual regression.

**Reasoning:**
- **Zero external dependencies:** No third-party service, API keys, or billing. Screenshots
  are compared locally against baseline images stored in the repo.
- **Tight integration:** `toHaveScreenshot()` uses Playwright's auto-waiting, screenshot
  stabilization, and retry logic. It waits for animations to settle before capturing.
- **Configurable thresholds:** `maxDiffPixelRatio: 0.05` allows 5% pixel difference, accounting
  for minor rendering variations across environments.
- **Baseline management:** Run `npx playwright test --update-snapshots` to update baselines.
  Baseline images are committed to git and reviewed in PRs.

**Why only on Chromium:**
Visual baselines are pixel-level. Firefox and WebKit render fonts and layouts slightly
differently from Chromium. Maintaining separate baselines per browser triples the maintenance
burden without proportional value. Cross-browser functional coverage is handled by other test suites.

---

## 8. Why Network Interception for Ad Blocking?

**Decision:** Use `page.route()` to abort requests matching ad/tracking domains.

**Reasoning:**
- **Reliability:** Ad content loads asynchronously and inconsistently. Sometimes ads appear,
  sometimes they don't. Blocking at the network level ensures deterministic test behavior.
- **Performance:** Blocking ad requests reduces page load time, making tests faster.
- **No DOM dependency:** Unlike popup dismissal approaches, route-based blocking works regardless
  of how ads are rendered (iframe, overlay, injected script).
- **Pattern:** The regex `/google|facebook|doubleclick|googlesyndication|adservice/` covers
  the major ad networks used by automationexercise.com.

---

## 9. Why This Folder Structure?

```
playwright-capstone/
  config/       -> Environment configuration (URLs, timeouts)
  fixtures/     -> Custom Playwright fixtures (dependency injection)
  pages/        -> Page Object Model classes (one per page)
  tests/        -> Test spec files (one per feature area)
  testdata/     -> External test data (JSON files, upload fixtures)
  utils/        -> Reusable utilities (logging, screenshots, data reading)
  reports/      -> Generated output (gitignored)
```

**Reasoning:**
- **Matches the PDF requirement** for the expected structure
- **Separation by responsibility:** Each directory has one purpose. A developer looking for
  a locator goes to `pages/`. A developer adding test data goes to `testdata/`.
- **Scales with team size:** Multiple engineers can work on different page objects or test
  suites without merge conflicts, because the files are separated by feature.
- **Convention over configuration:** The structure follows Playwright community conventions,
  so a new team member familiar with Playwright will immediately understand the layout.

---

## 10. Why Environment Configuration With dotenv?

**Decision:** Use `.env` files and `dotenv` for environment-specific settings.

**Reasoning:**
- **Environment portability:** The same framework runs against different environments (dev,
  staging, production) by changing `BASE_URL` in `.env`.
- **CI/CD compatibility:** CI systems (Jenkins, GitHub Actions) set environment variables
  natively. The framework reads them without any CI-specific code.
- **Security:** `.env` files are gitignored. Sensitive values (if any) never enter version
  control.
- **Simplicity:** dotenv is a single dependency with zero configuration. It loads `.env` into
  `process.env` at startup.

---

## 11. Why Multiple Reporters?

**Decision:** Configure three reporters: `list`, `html`, and `json`.

**Reasoning:**
- **list:** Real-time console output during local development. Shows pass/fail as tests run.
- **html:** Rich interactive report with screenshots, traces, and test steps. Ideal for
  sharing with stakeholders and for the capstone presentation.
- **json:** Machine-readable output for CI/CD integration. Can be parsed by Jenkins, GitHub
  Actions, or custom dashboards.

---

## 12. Why Trace on First Retry?

**Decision:** Set `trace: 'on-first-retry'` in Playwright configuration.

**Reasoning:**
- **Efficient debugging:** Traces are only captured when a test fails and retries. This avoids
  the storage cost of capturing traces for passing tests.
- **Full diagnostic data:** A trace includes screenshots at every action, DOM snapshots, network
  requests, and console logs. It's the single most powerful debugging tool in Playwright.
- **Trace Viewer:** `npx playwright show-trace trace.zip` opens an interactive timeline where
  you can step through every action the test took, see what the page looked like, and inspect
  the network activity.
- **Why not `on` (always):** Traces consume disk space (~1-5 MB per test). Capturing for every
  test in a large suite wastes storage. `on-first-retry` captures only when needed.

---

## 13. Why Unique Emails Per Test Run?

**Decision:** Generate unique emails using `Date.now()` for registration tests.

**Reasoning:**
- **Test isolation:** Each test run creates its own account. No dependency on pre-existing data.
- **No cleanup ordering:** Tests don't need to run in a specific order or depend on a shared
  test account.
- **Parallel safety:** Multiple test workers can run registration tests simultaneously without
  email conflicts.
- **Pattern:** `register_${Date.now()}@test.com` produces emails like
  `register_1697234567890@test.com` that are unique to the millisecond.

---

## 14. Why BasePage Inheritance?

**Decision:** All page objects extend a `BasePage` class.

**Reasoning:**
- **DRY principle:** Common operations (navigate, getText, takeScreenshot, waitForPageLoad)
  are defined once and inherited by all 8 page objects.
- **Consistent interface:** Every page object can navigate and take screenshots the same way.
- **Protected page access:** The `page` instance is `protected`, meaning page objects can
  access it internally but tests cannot bypass the page object API.
- **Extensibility:** If we need to add a common behavior (like logging every navigation),
  we add it to `BasePage` once.
