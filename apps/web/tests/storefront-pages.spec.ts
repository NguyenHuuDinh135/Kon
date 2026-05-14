import { test, expect } from '@playwright/test';

test.describe('Storefront Pages', () => {
  test('homepage loads with hero section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('KON STORE').first()).toBeVisible();
  });

  test('products page loads with product cards or empty state', async ({ page }) => {
    await page.goto('/products');

    const productCard = page.locator('[class*="card"], [class*="Card"]').first();
    const emptyState = page.getByText(/no products|không tìm/i);

    await expect(productCard.or(emptyState)).toBeVisible({ timeout: 10000 });
  });

  test('login page renders form with username and password inputs', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Đăng nhập")');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
  });

  test('login with invalid credentials does not redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'wronguser');
    await page.fill('#password', 'wrongpass');
    await page.click('button:has-text("Đăng nhập")');

    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*\/login/);
  });
});
