/**
 * Screenshot capture script for Anima README.
 *
 * Prerequisites:
 *   npm install -D playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs
 *
 * The script assumes the Vite dev server is running at http://localhost:5173
 * and the Express API is running at http://localhost:5000.
 *
 * Screenshots are saved to .github/assets/screenshots/.
 * Use a seeded test account so screenshots are reproducible.
 *
 * Test account (create once via the registration form, then hardcode below):
 *   email:    screenshot@anima.local
 *   password: Screenshot123!
 *   species:  EMBER
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '../.github/assets/screenshots');

const TEST_EMAIL = 'screenshot@anima.local';
const TEST_PASSWORD = 'Screenshot123!';

mkdirSync(OUT_DIR, { recursive: true });

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

async function shot(page, filename) {
  await page.screenshot({ path: join(OUT_DIR, filename), fullPage: false });
  console.log(`  saved ${filename}`);
}

async function login(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=Today\'s Habits', { timeout: 10000 });
}

(async () => {
  const browser = await chromium.launch();

  // ── 1. Auth form (login tab) ────────────────────────────────────────────
  console.log('Capturing auth-login...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await shot(page, 'auth-login.png');
    await ctx.close();
  }

  // ── 2. Onboarding wizard ────────────────────────────────────────────────
  // Only visible on first login for accounts with zero habits.
  // If the test account already has habits, screenshot the auth form instead
  // and swap it manually.
  console.log('Capturing onboarding...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    // Wait briefly — if onboarding wizard appears, screenshot it
    await page.waitForTimeout(1500);
    const hasWizard = await page.$('text=Choose Your Companion');
    if (hasWizard) {
      await shot(page, 'onboarding.png');
    } else {
      console.log('  (onboarding skipped — account already has habits)');
    }
    await ctx.close();
  }

  // ── 3. Dashboard — desktop ──────────────────────────────────────────────
  console.log('Capturing dashboard-desktop...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    await page.waitForTimeout(1000); // let animations settle
    await shot(page, 'dashboard-desktop.png');
    await ctx.close();
  }

  // ── 4. Dashboard — mobile ───────────────────────────────────────────────
  console.log('Capturing dashboard-mobile...');
  {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();
    await login(page);
    await page.waitForTimeout(1000);
    await shot(page, 'dashboard-mobile.png');
    await ctx.close();
  }

  // ── 5. Quest card completion (confetti) ─────────────────────────────────
  console.log('Capturing quest-complete...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Click the first incomplete quest card
    const card = page.locator('button:not([disabled])').filter({ hasText: /XP/ }).first();
    await card.click();
    await page.waitForTimeout(600); // mid-confetti
    await shot(page, 'quest-complete.png');
    await ctx.close();
  }

  // ── 6. Evolution event modal ────────────────────────────────────────────
  // Only fires when XP crosses 100 or 500. Screenshot manually when it appears
  // during normal use and drop the file at .github/assets/screenshots/evolution-event.png
  console.log('  (evolution-event.png: capture manually when the modal fires)');

  // ── 7. Focus timer ──────────────────────────────────────────────────────
  console.log('Capturing focus-timer...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    await page.click('button[aria-label="Open settings"], button:has-text("Focus Timer"), [data-nav="focus"]');
    await page.waitForTimeout(800);
    await shot(page, 'focus-timer.png');
    await ctx.close();
  }

  // ── 8. Insights view ───────────────────────────────────────────────────
  console.log('Capturing insights...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Navigate to insights via nav icon
    await page.locator('button').filter({ has: page.locator('svg') }).nth(4).click();
    await page.waitForTimeout(1200);
    await shot(page, 'insights.png');
    await ctx.close();
  }

  // ── 9. Adventure log ───────────────────────────────────────────────────
  console.log('Capturing adventure-log...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    await page.locator('button').filter({ has: page.locator('svg') }).nth(1).click();
    await page.waitForTimeout(800);
    await shot(page, 'adventure-log.png');
    await ctx.close();
  }

  // ── 10. Item shop ──────────────────────────────────────────────────────
  console.log('Capturing shop...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    await page.locator('button').filter({ has: page.locator('svg') }).nth(2).click();
    await page.waitForTimeout(800);
    await shot(page, 'shop.png');
    await ctx.close();
  }

  // ── 11. Settings ───────────────────────────────────────────────────────
  console.log('Capturing settings...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Click avatar button to open settings
    await page.locator('button').filter({ has: page.locator('svg') }).last().click();
    await page.waitForTimeout(800);
    await shot(page, 'settings.png');
    await ctx.close();
  }

  // ── 12. Ambient mode ───────────────────────────────────────────────────
  console.log('Capturing ambient-mode...');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    await page.locator('button').filter({ has: page.locator('svg') }).nth(5).click();
    await page.waitForTimeout(800);
    await shot(page, 'ambient-mode.png');
    await ctx.close();
  }

  await browser.close();
  console.log('\nDone. Screenshots saved to .github/assets/screenshots/');
  console.log('Manually capture evolution-event.png when the modal fires during normal use.');
})();
