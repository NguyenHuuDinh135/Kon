import { test, expect } from '@playwright/test';

test.describe('ML Predictions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('predictions overview page loads and shows 4 model cards', async ({ page }) => {
    await page.goto('http://localhost:3000/predictions');

    // Verify page heading
    await expect(page.locator('h2')).toContainText('ML Predictions');

    // Verify all 4 model cards are rendered as links
    const modelCards = page.locator('a[href^="/predictions/"]');
    await expect(modelCards).toHaveCount(4);

    // Verify each model card title is present
    await expect(page.getByText('Decision Tree (Cây quyết định)')).toBeVisible();
    await expect(page.getByText('K-Means Clustering (Gom cụm)')).toBeVisible();
    await expect(page.getByText('Logistic Regression (Hồi quy Logistic)')).toBeVisible();
    await expect(page.getByText('So sánh 3 Mô hình')).toBeVisible();
  });

  test('Decision Tree page shows metrics section and predictions table', async ({ page }) => {
    await page.goto('http://localhost:3000/predictions/decision-tree');

    // Verify page heading
    await expect(page.locator('h2')).toContainText('Decision Tree');

    // Verify metrics cards are rendered (4 metrics: Accuracy, Precision, Recall, F1 Score)
    await expect(page.getByText('Accuracy')).toBeVisible();
    await expect(page.getByText('Precision')).toBeVisible();
    await expect(page.getByText('Recall')).toBeVisible();
    await expect(page.getByText('F1 Score')).toBeVisible();

    // Verify predictions table structure exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verify table headers
    await expect(page.locator('th', { hasText: 'ID' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Giới tính' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Tuổi' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Thu nhập (k$)' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Điểm chi tiêu' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Dự đoán' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Độ tin cậy' })).toBeVisible();
  });

  test('Clustering page shows cluster summary cards', async ({ page }) => {
    await page.goto('http://localhost:3000/predictions/clustering');

    // Verify page heading
    await expect(page.locator('h2')).toContainText('K-Means Clustering');

    // Verify model quality metrics section
    await expect(page.getByText('Silhouette Score')).toBeVisible();
    await expect(page.getByText('Inertia')).toBeVisible();
    await expect(page.getByText('Số cụm (K)')).toBeVisible();

    // Verify predictions table structure exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verify table headers for clustering
    await expect(page.locator('th', { hasText: 'ID' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Cụm' })).toBeVisible();
  });

  test('Logistic Regression page shows risk distribution indicators', async ({ page }) => {
    await page.goto('http://localhost:3000/predictions/logistic-regression');

    // Verify page heading
    await expect(page.locator('h2')).toContainText('Logistic Regression');

    // Verify metrics cards
    await expect(page.getByText('Accuracy')).toBeVisible();
    await expect(page.getByText('Precision')).toBeVisible();
    await expect(page.getByText('Recall')).toBeVisible();
    await expect(page.getByText('F1 Score')).toBeVisible();

    // Verify risk distribution section with 3 risk levels
    await expect(page.getByText('High Risk (>70%)')).toBeVisible();
    await expect(page.getByText('Medium Risk (30-70%)')).toBeVisible();
    await expect(page.getByText('Low Risk (<30%)')).toBeVisible();

    // Verify predictions table
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verify table headers for churn predictions
    await expect(page.locator('th', { hasText: 'Xác suất Churn' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Mức rủi ro' })).toBeVisible();
  });

  test('Compare page shows comparison table with columns for all 3 models', async ({ page }) => {
    await page.goto('http://localhost:3000/predictions/compare');

    // Verify page heading
    await expect(page.locator('h2')).toContainText('So sánh 3 Mô hình');

    // Verify Performance Metrics table
    await expect(page.getByText('Performance Metrics')).toBeVisible();

    // Verify side-by-side predictions table exists
    const tables = page.locator('table');
    await expect(tables.first()).toBeVisible();

    // Verify the comparison table has columns for all 3 models
    await expect(page.locator('th', { hasText: 'Decision Tree' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'K-Means Cluster' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Churn Prob' })).toBeVisible();

    // Verify the metrics table has model column headers
    await expect(page.locator('th', { hasText: 'Model' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Accuracy' })).toBeVisible();
  });

  test('navigation from sidebar ML Predictions section works', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Verify the ML Predictions section label is in the sidebar
    await expect(page.getByText('ML Predictions')).toBeVisible();

    // Click "All Models" sidebar link to navigate to predictions overview
    await page.click('a[href="/predictions"]');
    await expect(page).toHaveURL(/.*\/predictions$/);
    await expect(page.locator('h2')).toContainText('ML Predictions');

    // Navigate to Decision Tree via sidebar
    await page.click('a[href="/predictions/decision-tree"]');
    await expect(page).toHaveURL(/.*\/predictions\/decision-tree/);
    await expect(page.locator('h2')).toContainText('Decision Tree');

    // Navigate to Clustering via sidebar
    await page.click('a[href="/predictions/clustering"]');
    await expect(page).toHaveURL(/.*\/predictions\/clustering/);
    await expect(page.locator('h2')).toContainText('K-Means Clustering');

    // Navigate to Logistic Regression via sidebar
    await page.click('a[href="/predictions/logistic-regression"]');
    await expect(page).toHaveURL(/.*\/predictions\/logistic-regression/);
    await expect(page.locator('h2')).toContainText('Logistic Regression');
  });
});
