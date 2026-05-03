import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('should load the dashboard overview', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');

    // Check for title
    await expect(page.getByText('Dashboard Overview')).toBeVisible();

    // Check for KPI cards
    await expect(page.getByText('Total Customers')).toBeVisible();
    await expect(page.getByText('Total Orders')).toBeVisible();
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Churn Alerts').first()).toBeVisible();
  });

  test('should navigate to search and perform a query', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/search');

    // Type a query
    const searchInput = page.getByPlaceholder('e.g. \'High spending customers who are older than 40\'');
    await searchInput.fill('young high spending male');
    await page.keyboard.press('Enter');

    // Wait for results
    await expect(page.getByText('Customer #').first()).toBeVisible({ timeout: 10000 });
  });

  test('should interact with AI agent', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/agent');

    const chatInput = page.getByPlaceholder('Ask Kon AI... (e.g., \'Recommend some beverages\')');
    await chatInput.fill('Who is our top customer?');
    await page.keyboard.press('Enter');

    // Check for thinking state or response
    await expect(page.getByRole('heading', { name: 'Kon AI Agent' })).toBeVisible();
    // Wait for assistant response (increased timeout for LLM)
    await expect(page.locator('.rounded-2xl').last()).toBeVisible({ timeout: 60000 });
  });
});
