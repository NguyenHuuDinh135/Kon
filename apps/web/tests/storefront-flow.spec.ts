import { test, expect } from '@playwright/test';

test.describe('Storefront Flow', () => {
  test('should allow a customer to login, add to cart, and checkout', async ({ page }) => {
    // 1. Visit /login
    await page.goto('http://localhost:3000/login');

    // 2. Enter client / client123
    await page.fill('#username', 'client');
    await page.fill('#password', 'client123');
    await page.click('button:has-text("Sign In")');

    // 3. Verify redirected to homepage or products
    await expect(page).toHaveURL('http://localhost:3000/');

    // 4. Click "Add to Cart" on a product
    // We might need to navigate to /products if not on homepage, 
    // but the homepage usually has featured products.
    // Let's go to /products to be sure.
    await page.goto('http://localhost:3000/products');
    
    // Wait for products to load
    await page.waitForSelector('text=Add to Cart');
    
    // Click the first "Add to Cart" button
    await page.click('button:has-text("Add to Cart") >> nth=0');

    // 5. Click the Cart icon in the header to open the CartSheet
    await page.click('button[aria-label="Open Cart"]');

    // 6. Verify CartSheet is open and has items
    await expect(page.locator('text=Your Cart')).toBeVisible();
    await expect(page.locator('text=Checkout')).toBeVisible();

    // 7. Click "Checkout"
    await page.click('text=Checkout');

    // 8. Verify redirected to /checkout
    await expect(page).toHaveURL(/.*checkout/);

    // 9. Fill out the checkout form
    // The implementation has: customerID, shipName, shipAddress, shipCity, shipCountry
    await page.fill('#customerID', 'ALFKI');
    await page.fill('#shipName', 'John Doe');
    await page.fill('#shipAddress', '123 Playwright St');
    await page.fill('#shipCity', 'Test City');
    await page.fill('#shipCountry', 'Test Country');

    // 10. Click "Place Order"
    await page.click('button:has-text("Place Order")');

    // 11. Verify success
    // Success state shows "Order Confirmed!" or "Order placed successfully!"
    await expect(page.locator('text=Order Confirmed!')).toBeVisible();
    await expect(page.locator('text=Thank you for your purchase')).toBeVisible();
  });
});
