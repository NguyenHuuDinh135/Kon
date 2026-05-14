import { test, expect } from '@playwright/test';

test.describe('ML Predictions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('predictions overview page loads and shows 4 model cards', async ({ page }) => {
    await page.goto('/predictions');

    await expect(page.locator('h1')).toContainText('Predictive Intelligence');

    const modelCards = page.locator('a[href^="/predictions/"]');
    await expect(modelCards).toHaveCount(4);

    await expect(page.getByText('Decision Tree')).toBeVisible();
    await expect(page.getByText('K-Means Clustering')).toBeVisible();
    await expect(page.getByText('Logistic Regression')).toBeVisible();
    await expect(page.getByText('Model Comparison')).toBeVisible();
  });

  test('Decision Tree page shows metrics section and predictions table', async ({ page }) => {
    await page.goto('/predictions/decision-tree');

    await expect(page.locator('h2')).toContainText('Decision Tree');

    await expect(page.getByText('Accuracy')).toBeVisible();
    await expect(page.getByText('Precision')).toBeVisible();
    await expect(page.getByText('Recall')).toBeVisible();
    await expect(page.getByText('F1 Score')).toBeVisible();

    const table = page.locator('table');
    await expect(table).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'ID', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Gender' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Tenure' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Satisfaction' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Prediction' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Confidence' })).toBeVisible();
  });

  test('Clustering page shows cluster summary cards', async ({ page }) => {
    await page.goto('/predictions/clustering');

    await expect(page.locator('h2')).toContainText('K-Means Clustering');

    await expect(page.getByText('Silhouette Score')).toBeVisible();
    await expect(page.getByText('Inertia')).toBeVisible();
    await expect(page.getByText('Clusters (K)')).toBeVisible();

    const table = page.locator('table');
    await expect(table).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'ID', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Cluster' })).toBeVisible();
  });

  test('Logistic Regression page shows risk distribution indicators', async ({ page }) => {
    await page.goto('/predictions/logistic-regression');

    await expect(page.locator('h2')).toContainText('Logistic Regression');

    await expect(page.getByText('Accuracy')).toBeVisible();
    await expect(page.getByText('Precision')).toBeVisible();
    await expect(page.getByText('Recall')).toBeVisible();
    await expect(page.getByText('F1 Score')).toBeVisible();

    await expect(page.getByText('High Risk (>70%)')).toBeVisible();
    await expect(page.getByText('Medium Risk (30-70%)')).toBeVisible();
    await expect(page.getByText('Low Risk (<30%)')).toBeVisible();

    const table = page.locator('table');
    await expect(table).toBeVisible();

    await expect(page.locator('th', { hasText: 'Churn Probability' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Risk Level' })).toBeVisible();
  });

  test('Compare page shows comparison table with columns for all 3 models', async ({ page }) => {
    await page.goto('/predictions/compare');

    await expect(page.locator('h2')).toContainText('Compare 3 Models');

    await expect(page.getByRole('heading', { name: 'Performance', exact: true })).toBeVisible();

    const tables = page.locator('table');
    await expect(tables.first()).toBeVisible();

    await expect(page.locator('th', { hasText: 'Decision Tree' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'K-Means' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Churn Prob' })).toBeVisible();

    await expect(page.locator('th', { hasText: 'Model' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Accuracy' })).toBeVisible();
  });

  test('navigation from sidebar ML Predictions section works', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('ML Predictions')).toBeVisible();

    await page.click('a[href="/predictions"]');
    await expect(page).toHaveURL(/.*\/predictions$/);
    await expect(page.locator('h1')).toContainText('Predictive Intelligence');

    await page.goto('/predictions/decision-tree');
    await expect(page.locator('h2')).toContainText('Decision Tree');

    await page.goto('/predictions/clustering');
    await expect(page.locator('h2')).toContainText('K-Means Clustering');

    await page.goto('/predictions/logistic-regression');
    await expect(page.locator('h2')).toContainText('Logistic Regression');
  });
});
