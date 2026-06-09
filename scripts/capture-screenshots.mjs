/**
 * Screenshot capture script for Anima README.
 * Run: node scripts/capture-screenshots.mjs
 * Requires: both dev servers running (npm run dev in /server and /client)
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '../.github/assets/screenshots');
const EMAIL = 'screenshot@anima.local';
const PASSWORD = 'Screenshot123!';

mkdirSync(OUT_DIR, { recursive: true });

const DESKTOP = { width: 1440, height: 900 };
const MOBILE  = { width: 390,  height: 844 };

const save = (filename) => join(OUT_DIR, filename);

async function login(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  // Wait past Zustand hydration spinner — AuthForm mounts after isHydrated=true
  await page.waitForSelector('input[type="email"]', { timeout: 30000 });
  // Toggle to login mode if needed
  const signInBtn = page.getByRole('button', { name: /sign in/i });
  if (await signInBtn.isVisible()) await signInBtn.click();

  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /login|sign in|continue/i }).last().click();
  // Wait for dashboard — pet habitat or nav renders
  await page.waitForSelector('nav, [class*="sidebar"], aside, [class*="habitat"]', { timeout: 15000 });
  await page.waitForTimeout(1500); // animations settle
}

// ── helpers ────────────────────────────────────────────────────────────────────
async function shot(page, filename, msg) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: save(filename), fullPage: false });
  console.log(`  ✓ ${filename}${msg ? '  — ' + msg : ''}`);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. AUTH — LOGIN PAGE
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n[1/11] auth-login');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await shot(page, 'auth-login.png');
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. DASHBOARD — DESKTOP
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[2/11] dashboard-desktop');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    await shot(page, 'dashboard-desktop.png');
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. DASHBOARD — MOBILE
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[3/11] dashboard-mobile');
  {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();
    await login(page);
    await shot(page, 'dashboard-mobile.png');
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. QUEST CARD COMPLETION (confetti moment)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[4/11] quest-complete');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Click the first quest card that is NOT completed (no line-through / opacity-50)
    const cards = page.locator('button[class*="border-l-"]').filter({ hasNot: page.locator('[class*="opacity-50"]') });
    const count = await cards.count();
    if (count > 0) {
      await cards.first().click();
      // QuestCompletionModal opens — claim the reward to trigger confetti
      const claimBtn = page.getByRole('button', { name: /Claim Reward/i });
      if (await claimBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await claimBtn.click();
        await page.waitForTimeout(600); // confetti fires
      }
    }
    await shot(page, 'quest-complete.png', `${count} clickable cards found`);
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. EVOLUTION EVENT (click Learn Programming → XP goes 90+30=120 > 100)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[5/11] evolution-event');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Find "Learn Programming" quest card and click it
    const lpCard = page.locator('button', { hasText: 'Learn Programming' });
    if (await lpCard.isVisible()) {
      await lpCard.click();
      // QuestCompletionModal opens — must click "Claim Reward" to complete
      const claimBtn = page.getByRole('button', { name: /Claim Reward/i });
      if (await claimBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await claimBtn.click();
      }
      // Wait for evolution modal
      await page.waitForSelector('text=Evolution Event', { timeout: 6000 }).catch(() => {});
      await page.waitForTimeout(1500); // let rings animate
    }
    await shot(page, 'evolution-event.png');
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FOCUS TIMER
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[6/11] focus-timer');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Click the Timer nav item (tooltip text "Focus Timer")
    await page.locator('button').filter({ has: page.locator('svg') }).nth(3).click();
    await page.waitForTimeout(800);
    // Open the setup panel
    const setupBtn = page.getByRole('button', { name: /setup/i });
    if (await setupBtn.isVisible()) await setupBtn.click();
    await page.waitForTimeout(500);
    await shot(page, 'focus-timer.png');
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 7. INSIGHTS VIEW
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[7/11] insights');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Click the LineChart / Insights nav icon (4th nav item after Home, Log, Shop, Timer)
    await page.locator('button').filter({ has: page.locator('svg') }).nth(4).click();
    await page.waitForTimeout(1200);
    await shot(page, 'insights.png');
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADVENTURE LOG
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[8/11] adventure-log');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Click the Scroll / Adventure Log nav icon (2nd nav item)
    await page.locator('button').filter({ has: page.locator('svg') }).nth(1).click();
    await page.waitForTimeout(800);
    await shot(page, 'adventure-log.png');
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ITEM SHOP
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[9/11] shop');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Click ShoppingBag / Shop nav icon (3rd nav item)
    await page.locator('button').filter({ has: page.locator('svg') }).nth(2).click();
    await page.waitForTimeout(800);
    await shot(page, 'shop.png');
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 10. SETTINGS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[10/11] settings');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Click the avatar / settings button in the sidebar (first button, aria-label="Open settings")
    await page.locator('[aria-label="Open settings"]').click();
    await page.waitForTimeout(800);
    await shot(page, 'settings.png');
    await ctx.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 11. AMBIENT MODE
  // ══════════════════════════════════════════════════════════════════════════
  console.log('[11/11] ambient-mode');
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await login(page);
    // Click the Monitor / Ambient Mode nav icon (5th item)
    await page.locator('button').filter({ has: page.locator('svg') }).nth(5).click();
    await page.waitForTimeout(800);
    await shot(page, 'ambient-mode.png');
    await ctx.close();
  }

  await browser.close();

  console.log(`\n✅ All screenshots saved to .github/assets/screenshots/`);
  console.log('📌 Onboarding screenshot: re-run after deleting all habits for the test account.');
})();
