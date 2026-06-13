import { test, expect } from '@playwright/test';

async function registerAndLogin(page) {
  const email = `e2e_${Date.now()}@anima.dev`;
  const password = 'Password123!';

  await page.request.post('http://localhost:5000/api/auth/register', {
    data: { username: 'HabitTester', email, password, species: 'TERRA' }
  });

  await page.goto('/');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /enter the sanctuary/i }).click();
  await expect(page.getByText(/HabitTester/i)).toBeVisible({ timeout: 10000 });
  await completeOnboardingIfNeeded(page);
}

// New users land in the onboarding wizard; seed a quest via API to reach the dashboard.
async function completeOnboardingIfNeeded(page) {
  const onboarding = page.getByText(/choose your companion|begin your journey/i).first();
  if (await onboarding.isVisible({ timeout: 3000 }).catch(() => false)) {
    const token = await page.evaluate(() => localStorage.getItem('token'));
    await page.request.post('http://localhost:5000/api/habits', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Bootstrap Quest', statCategory: 'STR', difficulty: 1 }
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  }
}

test.describe('Habits', () => {
  test('user can create a habit and mark it complete', async ({ page }) => {
    await registerAndLogin(page);

    // Open the new-quest form (STR is the default category)
    await page.getByRole('button', { name: /new quest/i }).click();
    // Unique name so it never collides with an AI recommendation card
    await page.getByPlaceholder(/read 10 pages/i).fill('E2E Pushups Quest');
    await page.getByRole('button', { name: /add habit quest/i }).click();

    // The new quest card appears on the board; the whole card is the complete button
    const questCard = page.getByRole('button', { name: /E2E Pushups Quest/i });
    await expect(questCard).toBeVisible({ timeout: 5000 });

    // Clicking the card opens the completion modal; claim the reward to finalize
    await questCard.click();
    await expect(page.getByRole('heading', { name: /quest complete/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /claim reward/i }).click();

    // The "done" counter increments once the completion is recorded
    await expect(page.getByText(/1\/\d+\s*done/i)).toBeVisible({ timeout: 8000 });
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
    const journaling = habits.find((h) => h.name === 'Journaling');

    await page.request.post(`http://localhost:5000/api/habits/${journaling._id}/complete`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { note: 'Felt peaceful' }
    });

    // Open adventure log (scoped name to avoid matching the "Logout" button)
    await page.getByRole('button', { name: /adventure log/i }).click();
    await expect(page.getByText('Journaling').first()).toBeVisible({ timeout: 8000 });
  });
});
