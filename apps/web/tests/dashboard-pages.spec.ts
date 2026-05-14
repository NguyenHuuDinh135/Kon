import { test, expect } from '@playwright/test';

test.describe('Dashboard Sub-pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('main dashboard loads with KPI cards and charts', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('Tổng khách hàng')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Tổng đơn hàng')).toBeVisible();
    await expect(page.getByText('Tổng doanh thu')).toBeVisible();

    await expect(page.getByText('Customer Segments')).toBeVisible();
  });

  test('campaigns page loads', async ({ page }) => {
    await page.goto('/dashboard/campaigns');

    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('notifications page loads', async ({ page }) => {
    await page.goto('/dashboard/notifications');

    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('sidebar navigation works between sections', async ({ page }) => {
    await page.goto('/dashboard');

    const predictionsLink = page.locator('a[href="/predictions"]');
    await expect(predictionsLink).toBeVisible();
    await predictionsLink.click();
    await expect(page).toHaveURL(/.*\/predictions$/);

    await page.goto('/dashboard');
    const analyticsLink = page.locator('a[href="/dashboard/analytics"]');
    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();
      await expect(page).toHaveURL(/.*\/dashboard\/analytics$/);
    }
  });
});
