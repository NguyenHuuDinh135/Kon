import { test, expect } from '@playwright/test';

test.describe('Admin Product CRUD', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post('http://localhost:8000/auth/login', {
      form: { username: 'admin', password: 'admin123' }
    });
    expect(loginRes.ok()).toBeTruthy();
    const body = await loginRes.json();
    token = body.access_token;
  });

  test('should create, verify, and delete a product', async ({ request }) => {
    // Create product
    const createRes = await request.post('http://localhost:8000/products', {
      headers: { 'Authorization': `Bearer ${token}` },
      data: { product_category_name: 'test_playwright_product', product_weight_g: 500, product_photos_qty: 3 }
    });
    expect(createRes.ok()).toBeTruthy();
    const product = await createRes.json();
    expect(product.product_id).toBeTruthy();

    // Verify product exists via search
    const searchRes = await request.get(`http://localhost:8000/products?search=test_playwright`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(searchRes.ok()).toBeTruthy();
    const products = await searchRes.json();
    expect(products.some((p: { product_category_name: string }) => p.product_category_name === 'test_playwright_product')).toBeTruthy();

    // Delete product
    const deleteRes = await request.delete(`http://localhost:8000/products/${product.product_id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(deleteRes.ok()).toBeTruthy();

    // Verify deletion
    const verifyRes = await request.get(`http://localhost:8000/products/${product.product_id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(verifyRes.status()).toBe(404);
  });

  test('should show products page in UI', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await page.goto('/dashboard/products');
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('th:has-text("Category")')).toBeVisible();
  });
});
