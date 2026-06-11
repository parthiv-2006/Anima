import { test, expect } from '@playwright/test';

async function registerAndLogin(page) {
  const email = `e2e_${Date.now()}@anima.dev`;
  const password = 'Password123!';

  await page.request.post('http://localhost:5000/api/auth/register', {
    data: { username: 'ChatTester', email, password, species: 'EMBER' }
  });

  await page.goto('/');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page.getByText(/ChatTester/i)).toBeVisible({ timeout: 10000 });
}

test.describe('Pet Companion Chat', () => {
  test('chat tab renders welcome screen with starter chips', async ({ page }) => {
    await registerAndLogin(page);

    // Open Pet Chat
    await page.getByRole('button', { name: /pet chat/i }).click();

    // Should show welcome/starter chips
    await expect(page.getByText(/what should i focus on today/i)).toBeVisible({ timeout: 5000 });
  });

  test('sending a message shows a reply bubble', async ({ page }) => {
    test.setTimeout(30000); // AI response can take up to 15s

    await registerAndLogin(page);
    await page.getByRole('button', { name: /pet chat/i }).click();

    // Use a starter chip
    await page.getByText(/what should i focus on today/i).click();

    // A reply bubble should appear within 20 seconds
    const replyBubble = page.locator('[data-testid="pet-message"]').first();
    await expect(replyBubble).toBeVisible({ timeout: 20000 });
  });
});
