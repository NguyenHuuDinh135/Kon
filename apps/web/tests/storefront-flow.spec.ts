import { test, expect } from '@playwright/test';

test.describe('Storefront Flow', () => {
  test('should allow a customer to login and browse products', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'client');
    await page.fill('#password', 'client123');
    await page.click('button:has-text("Đăng nhập")');

    await expect(page.getByText('KON STORE')).toBeVisible({ timeout: 15000 });

    await page.goto('/products');

    const hasProducts = await page.locator('button:has-text("Thêm vào giỏ")').first().isVisible({ timeout: 5000 }).catch(() => false);

    if (hasProducts) {
      await page.click('button:has-text("Thêm vào giỏ") >> nth=0');
      await page.click('button[aria-label="Open Cart"]');
      await expect(page.locator('text=Giỏ hàng')).toBeVisible();
      await expect(page.locator('text=Thanh toán')).toBeVisible();
      await page.click('text=Thanh toán');
      await expect(page).toHaveURL(/.*checkout/);
    } else {
      await expect(page.getByText('Không tìm thấy sản phẩm')).toBeVisible();
    }
  });
});
