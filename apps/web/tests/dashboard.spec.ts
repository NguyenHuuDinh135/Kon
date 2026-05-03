import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test('should load the dashboard overview', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');

    // Check for title
    await expect(page.getByText('Dashboard Overview')).toBeVisible();

    // Check for KPI cards
    await expect(page.getByText('Total Customers')).toBeVisible();
    await expect(page.getByText('Total Orders')).toBeVisible();
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Churn Alerts')).toBeVisible();
  });

  test('should navigate to search and perform a query', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/search');

    // Type a query
    const searchInput = page.getByPlaceholder('e.g. \'High spending customers who are older than 40\'');
    await searchInput.fill('young high spending male');
    await page.keyboard.press('Enter');

    // Wait for results
    await expect(page.getByText('Customer #')).first().toBeVisible({ timeout: 10000 });
  });

  test('should interact with AI agent', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/agent');

    const chatInput = page.getByPlaceholder('Ask Kon anything...');
    await chatInput.fill('Who is our top customer?');
    await page.keyboard.press('Enter');

    // Check for thinking state or response
    await expect(page.getByText('Kon AI')).toBeVisible();
    // Wait for assistant response (increased timeout for LLM)
    await expect(page.locator('.bg-muted\\/80')).first().toBeVisible({ timeout: 30000 });
  });
});
