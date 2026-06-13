import { test, expect } from '@playwright/test';

// Verification suite for the two new features:
//  1. Living 3D Habitat (react-three-fiber canvas driven by pet state)
//  2. Agentic Pet Companion (HITL tool-calling that creates habits)
//
// Uses absolute URLs so it can target a specific dev server port via
// E2E_BASE_URL (defaults to the standard 5173).
const BASE = process.env.E2E_BASE_URL || 'http://localhost:5173';

async function registerAndLogin(page, username = 'FeatureTester') {
  const email = `e2e_${Date.now()}_${Math.floor(Math.random() * 1e5)}@anima.dev`;
  const password = 'Password123!';

  await page.request.post('http://localhost:5000/api/auth/register', {
    data: { username, email, password, species: 'EMBER' }
  });

  await page.goto(BASE);
  await page.getByPlaceholder(/email/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /enter the sanctuary/i }).click();
  await expect(page.getByText(new RegExp(username, 'i')).first()).toBeVisible({ timeout: 10000 });
}

// New users land in onboarding; create one habit to reach the dashboard.
async function completeOnboardingIfNeeded(page) {
  const onboarding = page.getByText(/create your first quest|begin your journey|choose your companion/i).first();
  if (await onboarding.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Walk through whatever onboarding asks by creating a quest via API instead
    const token = await page.evaluate(() => localStorage.getItem('token'));
    await page.request.post('http://localhost:5000/api/habits', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Bootstrap Quest', statCategory: 'STR', difficulty: 1 }
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  }
}

test.describe('Feature 2: Living 3D Habitat', () => {
  test('3D canvas mounts on dashboard with WebGL context and no console errors', async ({ page }) => {
    test.setTimeout(45000);
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await registerAndLogin(page, 'HabitatTester');
    await completeOnboardingIfNeeded(page);

    // The 3D scene is lazy-loaded; wait for a canvas to appear
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 20000 });

    // Verify it is a live WebGL context, not a dead element
    const webglAlive = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return false;
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      return !!gl && c.width > 0 && c.height > 0;
    });
    expect(webglAlive).toBe(true);

    // Status bars must overlay the 3D scene
    await expect(page.getByText(/health/i).first()).toBeVisible();
    await expect(page.getByText(/experience/i).first()).toBeVisible();

    const realErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('WebGL warning')
    );
    expect(realErrors).toEqual([]);
  });

  test('can toggle between 3D and classic 2D habitat', async ({ page }) => {
    test.setTimeout(45000);
    await registerAndLogin(page, 'ToggleTester');
    await completeOnboardingIfNeeded(page);

    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20000 });

    // Switch to 2D
    await page.getByRole('button', { name: /^2d$/i }).click();
    await expect(page.getByText(/✦ 3d/i).first()).toBeVisible({ timeout: 5000 });

    // Switch back to 3D
    await page.getByRole('button', { name: /✦ 3d/i }).click();
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Feature 1: Agentic Pet Companion', () => {
  test('agent proposes habit creation, confirmation card appears, confirm creates habits', async ({ page }) => {
    test.setTimeout(90000); // two LLM round-trips

    await registerAndLogin(page, 'AgentTester');
    await completeOnboardingIfNeeded(page);

    await page.getByRole('button', { name: /pet chat/i }).click();
    await expect(page.getByText(/agentic mode/i)).toBeVisible({ timeout: 5000 });

    // Ask the agent to create a routine — should trigger a tool call
    await page.getByRole('button', { name: /create me a morning routine/i }).click();

    // The HITL confirmation card must appear (model chose a tool)
    await expect(page.getByText(/action required/i)).toBeVisible({ timeout: 30000 });
    const confirmBtn = page.getByRole('button', { name: /confirm/i });
    await expect(confirmBtn).toBeVisible();

    // Confirm → server executes tool → system message announces creation
    await confirmBtn.click();
    await expect(page.getByText(/quest(s)? added to your board/i)).toBeVisible({ timeout: 30000 });

    // The quest board must now contain the new habits
    await page.getByRole('button', { name: /dashboard/i }).click();
    const questCount = await page.getByText(/today's habits/i).textContent({ timeout: 10000 });
    // "Today's Habits — X/Y done" with Y >= 2 (bootstrap + at least one agent-created)
    const match = questCount.match(/\/(\d+)\s*done/i);
    expect(Number(match?.[1] || 0)).toBeGreaterThanOrEqual(2);
  });

  test('cancelling the confirmation card creates nothing', async ({ page }) => {
    test.setTimeout(60000);

    await registerAndLogin(page, 'CancelTester');
    await completeOnboardingIfNeeded(page);

    await page.getByRole('button', { name: /pet chat/i }).click();
    await page.getByRole('button', { name: /add a workout habit for me/i }).click();

    await expect(page.getByText(/action required/i)).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.getByText(/action cancelled — nothing was changed/i)).toBeVisible({ timeout: 5000 });
  });
});
