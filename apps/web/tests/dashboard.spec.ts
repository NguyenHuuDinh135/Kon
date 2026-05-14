import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('should load the dashboard overview', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('Trung tâm điều khiển', { exact: true })).toBeVisible();

    await expect(page.getByText('Tổng khách hàng')).toBeVisible();
    await expect(page.getByText('Tổng đơn hàng')).toBeVisible();
    await expect(page.getByText('Tổng doanh thu')).toBeVisible();
    await expect(page.getByText('Cảnh báo rời bỏ').first()).toBeVisible();
  });

  test('should navigate to search and perform a query', async ({ page }) => {
    await page.goto('/dashboard/search');

    const searchInput = page.getByRole('textbox');
    await searchInput.fill('young high spending male');
    await page.click('button:has-text("Tìm kiếm")');

    await expect(page.locator('text=/Customer #\\d+/').first()).toBeVisible({ timeout: 30000 });
  });

  test('should interact with AI agent', async ({ page }) => {
    await page.goto('/dashboard/agent');

    const chatInput = page.getByPlaceholder(/Hỏi Kon AI/);
    await chatInput.fill('Khách hàng nào chi tiêu nhiều nhất?');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', { name: 'Kon AI Agent' })).toBeVisible();
    await expect(page.locator('.rounded-2xl').last()).toBeVisible({ timeout: 60000 });
  });
});
