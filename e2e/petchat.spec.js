import { test, expect } from '@playwright/test';

async function registerAndLogin(page) {
  const email = `e2e_${Date.now()}@anima.dev`;
  const password = 'Password123!';

  const regRes = await page.request.post('http://localhost:5000/api/auth/register', {
    data: { username: 'ChatTester', email, password, species: 'EMBER' }
  });
  // Seed one quest so the user skips the onboarding wizard and lands on the dashboard.
  const { token } = await regRes.json();
  await page.request.post('http://localhost:5000/api/habits', {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: 'Bootstrap Quest', statCategory: 'STR', difficulty: 1 }
  });

  await page.goto('/');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /enter the sanctuary/i }).click();
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

  test('conversation persists when leaving and returning to the chat tab', async ({ page }) => {
    test.setTimeout(40000);

    await registerAndLogin(page);
    await page.getByRole('button', { name: /pet chat/i }).click();

    // Send a unique message (not a starter chip, so its text is unambiguous)
    const secret = 'Please remember the word galadriel';
    await page.getByPlaceholder(/ask .*or say/i).fill(secret);
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="pet-message"]').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(secret)).toBeVisible();

    // Leave the chat tab and come back
    await page.getByRole('button', { name: /dashboard/i }).click();
    await page.getByRole('button', { name: /pet chat/i }).click();

    // The message survived — the chat did not reset to the welcome screen
    await expect(page.getByText(secret)).toBeVisible({ timeout: 5000 });
  });

  test('starting a new chat seals the conversation into Echoes', async ({ page }) => {
    test.setTimeout(40000);

    await registerAndLogin(page);
    await page.getByRole('button', { name: /pet chat/i }).click();

    await page.getByPlaceholder(/ask .*or say/i).fill('A short friendly greeting');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="pet-message"]').first()).toBeVisible({ timeout: 20000 });

    // Start a new chat — the active conversation is archived
    await page.getByRole('button', { name: /new chat/i }).click();
    await expect(page.getByText(/awaits/i)).toBeVisible({ timeout: 5000 });

    // The Echoes tab now holds the sealed conversation
    await page.getByRole('button', { name: /echoes/i }).click();
    await expect(page.getByText(/echoes of past conversations/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('A short friendly greeting')).toBeVisible();
  });
});
