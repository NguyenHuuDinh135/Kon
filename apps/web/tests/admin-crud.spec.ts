import { test, expect } from '@playwright/test';

test.describe('Admin Product CRUD', () => {
  test('should allow an admin to add and delete a product', async ({ page }) => {
    // 1. Visit /login
    await page.goto('http://localhost:3000/login');

    // 2. Enter admin / admin123
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Sign In")');

    // 3. Verify redirected to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);

    // 4. Navigate to /dashboard/products
    await page.goto('http://localhost:3000/dashboard/products');

    // 5. Click "Add Product"
    await page.click('button:has-text("Add Product")');

    // 6. Fill in the form
    await page.fill('#name', 'Playwright Product');
    await page.fill('#price', '10.5');
    await page.fill('#category', '1');

    // 7. Click "Save changes"
    await page.click('button:has-text("Save changes")');

    // 8. Verify "Playwright Product" is in the table
    // Wait for the dialog to close and the list to refresh
    await page.waitForSelector('text=Playwright Product');
    await expect(page.locator('text=Playwright Product')).toBeVisible();

    // 9. Click the Delete icon for "Playwright Product"
    // We need to find the row with "Playwright Product" and click the delete button in it.
    // The delete button has a Trash2 icon and "Delete" as sr-only text.
    
    // Handle window.confirm
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to delete this product?');
      await dialog.accept();
    });

    const row = page.locator('tr', { hasText: 'Playwright Product' });
    await row.locator('button:has-text("Delete")').click();

    // 10. Verify the product is removed
    await expect(page.locator('text=Playwright Product')).not.toBeVisible();
  });
});
