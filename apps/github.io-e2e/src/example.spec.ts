import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain('Welcome');
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
