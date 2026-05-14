import { test, expect } from '@playwright/test';

test.describe('Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('analytics page loads with all chart sections', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    await expect(page.getByText('Business Intelligence')).toBeVisible();

    await expect(page.getByText('CLV by Segment')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Regional Performance')).toBeVisible();
  });

  test('geographic table renders without NaN values', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });

    await expect(page.locator('th:has-text("State")')).toBeVisible();
    await expect(page.locator('th:has-text("Revenue")')).toBeVisible();
    await expect(page.locator('th:has-text("Customers")')).toBeVisible();

    const nanCells = page.locator('td:has-text("NaN")');
    await expect(nanCells).toHaveCount(0);
  });

  test('CLV by segment chart renders with labels', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    const clvSection = page.locator('text=CLV by Segment').locator('..');
    await expect(clvSection).toBeVisible({ timeout: 10000 });

    const unknownLabels = page.locator('.recharts-xAxis text:has-text("Unknown")');
    const count = await unknownLabels.count();
    expect(count).toBeLessThanOrEqual(1);
  });
});
