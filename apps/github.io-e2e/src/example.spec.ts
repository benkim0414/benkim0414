import { test, expect } from '@playwright/test';

test('shows the showcase header and search first', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Gunwoo Ben Kim' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search skills' })).toBeVisible();
});

test('cycles and persists theme mode', async ({ page }) => {
  await page.goto('/');

  const themeToggle = page.getByRole('button', { name: /theme/i });
  await expect(themeToggle).toBeVisible();

  await themeToggle.click();
  await expect(themeToggle).toHaveAttribute('aria-label', /Theme: light/i);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(page.getByRole('button', { name: /Theme: light/i })).toBeVisible();
});

test('loads search state from the URL and shows empty results', async ({ page }) => {
  await page.goto('/?q=no-such-skill');

  await expect(page.getByRole('textbox', { name: 'Search skills' })).toHaveValue(
    'no-such-skill'
  );
  await expect(page.getByText('No skills match your search.')).toBeVisible();
});

test('renders skill evidence and contact links on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?q=react');

  await expect(page.getByRole('link', { name: 'Email' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
  await expect(page.getByTestId('skill-card').first()).toContainText('Level');
  await expect(page.getByTestId('skill-card').first()).toContainText('Projects:');
});
