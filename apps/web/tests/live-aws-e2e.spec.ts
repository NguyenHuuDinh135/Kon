/**
 * Comprehensive live AWS deployment E2E tests
 * Target: http://kon-alb-1252996460.us-east-1.elb.amazonaws.com
 *
 * Tests all 10 pages. Screenshots captured to /tmp/e2e-screenshots/.
 * Console errors are logged but only JS runtime errors (not HTTP 401/404/resource
 * load failures from the API backend) cause test failures.
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://kon-alb-1252996460.us-east-1.elb.amazonaws.com';
const SCREENSHOT_DIR = '/tmp/e2e-screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function screenshot(page: Page, name: string) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

/** Returns only JS runtime errors, filtering out expected API/resource 401/404 failures */
function jsRuntimeErrors(errors: string[]): string[] {
  return errors.filter(
    e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('401') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR_')
  );
}

// ─────────────────────────────────────────────
// Helper: login once before auth-protected tests
// ─────────────────────────────────────────────
async function doLogin(page: Page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });

  const usernameField = page.locator(
    'input[name="username"], input[id="username"], input[type="text"], input[placeholder*="user"], input[placeholder*="User"]'
  ).first();
  const passwordField = page.locator('input[type="password"]').first();

  await usernameField.waitFor({ state: 'visible', timeout: 10000 });
  await usernameField.fill('admin');
  await passwordField.fill('admin123');

  const submitBtn = page.locator(
    'button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login"), button:has-text("Sign in")'
  ).first();
  await submitBtn.click();

  await page.waitForURL('**/dashboard**', { timeout: 20000 }).catch(() => {});
}

// ─────────────────────────────────────────────
// 1. HOMEPAGE
// ─────────────────────────────────────────────
test('1. Homepage (/) — storefront landing page', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  const response = await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  expect(response?.status(), 'HTTP status should be 2xx').toBeLessThan(400);

  await screenshot(page, '01-homepage');

  const bodyText = await page.locator('body').innerText();
  expect(bodyText.length, 'Page body should have content').toBeGreaterThan(50);

  const title = await page.title();
  expect(title).not.toContain('500');
  expect(title).not.toContain('Error');

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`Homepage title: "${title}"`);
  console.log(`Body preview: ${bodyText.slice(0, 250)}`);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on homepage').toHaveLength(0);
});

// ─────────────────────────────────────────────
// 2. PRODUCTS
// ─────────────────────────────────────────────
test('2. Products (/products) — product listing', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  const response = await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle', timeout: 30000 });
  expect(response?.status()).toBeLessThan(400);

  await screenshot(page, '02-products');

  const bodyText = await page.locator('body').innerText();
  expect(bodyText.length).toBeGreaterThan(50);

  const title = await page.title();
  expect(title).not.toContain('500');
  expect(title).not.toContain('Error');

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`Products title: "${title}"`);
  console.log(`Body preview: ${bodyText.slice(0, 250)}`);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on products').toHaveLength(0);
});

// ─────────────────────────────────────────────
// 3. LOGIN
// ─────────────────────────────────────────────
test('3. Login (/login) — authenticate and redirect to /dashboard', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, '03a-login-page');

  const usernameField = page.locator(
    'input[name="username"], input[id="username"], input[type="text"], input[placeholder*="user"], input[placeholder*="User"], input[placeholder*="email"]'
  ).first();
  const passwordField = page.locator(
    'input[name="password"], input[id="password"], input[type="password"]'
  ).first();

  await expect(usernameField, 'Username input should be visible').toBeVisible({ timeout: 10000 });
  await expect(passwordField, 'Password input should be visible').toBeVisible({ timeout: 10000 });

  await usernameField.fill('admin');
  await passwordField.fill('admin123');

  await screenshot(page, '03b-login-filled');

  const submitBtn = page.locator(
    'button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login"), button:has-text("Sign in")'
  ).first();
  await submitBtn.click();

  await page.waitForURL('**/dashboard**', { timeout: 20000 }).catch(async () => {
    console.log(`After login, URL is: ${page.url()}`);
  });

  const finalUrl = page.url();
  console.log(`Post-login URL: ${finalUrl}`);
  await screenshot(page, '03c-post-login');

  expect(finalUrl, 'Should redirect to dashboard after login').toContain('dashboard');

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on login').toHaveLength(0);
});

// ─────────────────────────────────────────────
// 4. DASHBOARD
// ─────────────────────────────────────────────
test('4. Dashboard (/dashboard) — KPI stats, revenue chart, top products', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  await doLogin(page);
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, '04-dashboard');

  const title = await page.title();
  const bodyText = await page.locator('body').innerText();

  expect(title).not.toContain('500');
  expect(title).not.toContain('Error');
  expect(bodyText.length).toBeGreaterThan(100);

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`Dashboard title: "${title}"`);
  console.log(`Body preview: ${bodyText.slice(0, 300)}`);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on dashboard').toHaveLength(0);
});

// ─────────────────────────────────────────────
// 5. CAMPAIGNS
// ─────────────────────────────────────────────
test('5. Dashboard Campaigns (/dashboard/campaigns) — campaign management', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  await doLogin(page);
  await page.goto(`${BASE_URL}/dashboard/campaigns`, { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, '05-campaigns');

  const title = await page.title();
  const bodyText = await page.locator('body').innerText();

  expect(title).not.toContain('500');
  expect(title).not.toContain('Error');
  expect(bodyText.length).toBeGreaterThan(50);

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`Campaigns title: "${title}"`);
  console.log(`Body preview: ${bodyText.slice(0, 300)}`);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on campaigns').toHaveLength(0);
});

// ─────────────────────────────────────────────
// 6. NOTIFICATIONS
// ─────────────────────────────────────────────
test('6. Dashboard Notifications (/dashboard/notifications) — notification list', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  await doLogin(page);
  await page.goto(`${BASE_URL}/dashboard/notifications`, { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, '06-notifications');

  const title = await page.title();
  const bodyText = await page.locator('body').innerText();

  expect(title).not.toContain('500');
  expect(title).not.toContain('Error');
  expect(bodyText.length).toBeGreaterThan(50);

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`Notifications title: "${title}"`);
  console.log(`Body preview: ${bodyText.slice(0, 300)}`);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on notifications').toHaveLength(0);
});

// ─────────────────────────────────────────────
// 7. PREDICTIONS overview
// ─────────────────────────────────────────────
test('7. Predictions (/predictions) — ML model comparison page', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  await doLogin(page);
  await page.goto(`${BASE_URL}/predictions`, { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, '07-predictions');

  const title = await page.title();
  const bodyText = await page.locator('body').innerText();

  expect(title).not.toContain('500');
  expect(title).not.toContain('Error');
  expect(bodyText.length).toBeGreaterThan(50);

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`Predictions title: "${title}"`);
  console.log(`Body preview: ${bodyText.slice(0, 300)}`);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on predictions').toHaveLength(0);
});

// ─────────────────────────────────────────────
// 8. CLUSTERING
// ─────────────────────────────────────────────
test('8. Predictions Clustering (/predictions/clustering) — K-Means results', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  await doLogin(page);
  await page.goto(`${BASE_URL}/predictions/clustering`, { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, '08-clustering');

  const title = await page.title();
  const bodyText = await page.locator('body').innerText();

  expect(title).not.toContain('500');
  expect(title).not.toContain('Error');
  expect(bodyText.length).toBeGreaterThan(50);

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`Clustering title: "${title}"`);
  console.log(`Body preview: ${bodyText.slice(0, 300)}`);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on clustering').toHaveLength(0);
});

// ─────────────────────────────────────────────
// 9. DECISION TREE
// ─────────────────────────────────────────────
test('9. Predictions Decision Tree (/predictions/decision-tree) — decision tree model', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  await doLogin(page);
  await page.goto(`${BASE_URL}/predictions/decision-tree`, { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, '09-decision-tree');

  const title = await page.title();
  const bodyText = await page.locator('body').innerText();

  expect(title).not.toContain('500');
  expect(title).not.toContain('Error');
  expect(bodyText.length).toBeGreaterThan(50);

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`Decision Tree title: "${title}"`);
  console.log(`Body preview: ${bodyText.slice(0, 300)}`);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on decision-tree').toHaveLength(0);
});

// ─────────────────────────────────────────────
// 10. LOGISTIC REGRESSION
// ─────────────────────────────────────────────
test('10. Predictions Logistic Regression (/predictions/logistic-regression) — logistic regression model', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  await doLogin(page);
  await page.goto(`${BASE_URL}/predictions/logistic-regression`, { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, '10-logistic-regression');

  const title = await page.title();
  const bodyText = await page.locator('body').innerText();

  expect(title).not.toContain('500');
  expect(title).not.toContain('Error');
  expect(bodyText.length).toBeGreaterThan(50);

  const runtimeErrors = jsRuntimeErrors(errors);
  console.log(`Logistic Regression title: "${title}"`);
  console.log(`Body preview: ${bodyText.slice(0, 300)}`);
  console.log(`All console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  expect(runtimeErrors, 'No JS runtime errors on logistic-regression').toHaveLength(0);
});
