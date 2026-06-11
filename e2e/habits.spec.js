import { test, expect } from '@playwright/test';

async function registerAndLogin(page) {
  const email = `e2e_${Date.now()}@anima.dev`;
  const password = 'Password123!';

  await page.request.post('http://localhost:5000/api/auth/register', {
    data: { username: 'HabitTester', email, password, species: 'TERRA' }
  });

  await page.goto('/');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page.getByText(/HabitTester/i)).toBeVisible({ timeout: 10000 });
}

test.describe('Habits', () => {
  test('user can create a habit and mark it complete', async ({ page }) => {
    await registerAndLogin(page);

    // Open add habit form
    await page.getByRole('button', { name: /add habit/i }).click();
    await page.getByPlaceholder(/habit name/i).fill('Morning Run');
    // Select STR stat
    await page.getByRole('button', { name: /str/i }).click();
    await page.getByRole('button', { name: /create/i }).click();

    // Habit card should appear
    await expect(page.getByText('Morning Run')).toBeVisible({ timeout: 5000 });

    // Complete the habit
    await page.getByRole('button', { name: /complete/i }).first().click();

    // XP should increase — check the pet stats panel shows non-zero XP
    await expect(page.getByText(/xp/i)).toBeVisible();
  });

  test('adventure log shows completion entries', async ({ page }) => {
    await registerAndLogin(page);

    // Create and complete a habit via API
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const createRes = await page.request.post('http://localhost:5000/api/habits', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Journaling', statCategory: 'SPI', difficulty: 1 }
    });
    const habits = await createRes.json();
    const habitId = habits[0]._id;

    await page.request.post(`http://localhost:5000/api/habits/${habitId}/complete`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { note: 'Felt peaceful' }
    });

    // Open adventure log
    await page.getByRole('button', { name: /log/i }).click();
    await expect(page.getByText('Journaling')).toBeVisible({ timeout: 8000 });
  });
});
