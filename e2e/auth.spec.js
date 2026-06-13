import { test, expect } from '@playwright/test';

function uniqueEmail() {
  return `e2e_${Date.now()}@anima.dev`;
}

test.describe('Authentication', () => {
  test('new user can register and reach the dashboard', async ({ page }) => {
    await page.goto('/');
    // Should land on auth screen
    await expect(page.getByRole('heading', { name: /anima/i })).toBeVisible();

    // Switch to register tab
    await page.getByRole('button', { name: /register/i }).first().click();

    await page.getByPlaceholder(/choose your name/i).fill('E2EWarrior');
    await page.getByPlaceholder(/email/i).fill(uniqueEmail());
    await page.locator('input[type="password"]').fill('Password123!');

    await page.getByRole('button', { name: /begin your journey/i }).click();

    // Should land on dashboard — pet panel visible
    await expect(page.getByText(/E2EWarrior/i)).toBeVisible({ timeout: 10000 });
  });

  test('existing user can log in', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'Password123!';

    // Register first via API
    await page.request.post('http://localhost:5000/api/auth/register', {
      data: { username: 'LoginTester', email, password, species: 'AQUA' }
    });

    await page.goto('/');
    await page.getByPlaceholder(/email/i).fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /enter the sanctuary/i }).click();

    await expect(page.getByText(/LoginTester/i)).toBeVisible({ timeout: 10000 });
  });
});
