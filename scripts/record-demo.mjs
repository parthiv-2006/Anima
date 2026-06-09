/**
 * Demo recording script for Anima README.
 * Produces a WebM video of the full user flow against the live Vercel app.
 * Run: node scripts/record-demo.mjs
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const BASE_URL = 'https://anima-client.vercel.app';
const ASSETS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../.github/assets');
const EMAIL    = 'screenshot@anima.local';
const PASSWORD = 'Screenshot123!';

mkdirSync(ASSETS_DIR, { recursive: true });

const DESKTOP = { width: 1280, height: 800 };

async function pause(ms) {
  await new Promise(r => setTimeout(r, ms));
}

(async () => {
  const browser = await chromium.launch({ headless: false });

  const ctx = await browser.newContext({
    viewport: DESKTOP,
    recordVideo: { dir: ASSETS_DIR, size: DESKTOP },
  });

  const page = await ctx.newPage();

  // ── 1. Login page ────────────────────────────────────────────────────────
  console.log('1. Login page...');
  // ── Bypass Zustand hydration bug by pre-seeding localStorage with token ──
  // Navigate first, then inject auth token via API call before React renders
  await page.goto(BASE_URL, { waitUntil: 'commit' });
  await pause(1500);

  console.log('2. Injecting auth token via login API...');
  const loginResult = await page.evaluate(async ({ email, password, apiBase }) => {
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (e) {
      return { error: e.message };
    }
  }, { email: EMAIL, password: PASSWORD, apiBase: 'https://anima-client.vercel.app/api' });

  if (!loginResult.token) {
    console.error('Login failed:', loginResult);
    process.exit(1);
  }

  // Seed localStorage so Zustand hydrates as authenticated
  await page.evaluate(({ token, user }) => {
    const state = { state: { token, user, isAuthenticated: true, isHydrated: true }, version: 0 };
    localStorage.setItem('auth-storage', JSON.stringify(state));
  }, { token: loginResult.token, user: loginResult.user });

  // Reload — Zustand will now hydrate correctly from localStorage
  await page.goto(BASE_URL, { waitUntil: 'commit' });
  await pause(4000);
  await page.waitForSelector('nav, [class*="sidebar"], aside', { timeout: 15000 });

  // ── 3. Dashboard ─────────────────────────────────────────────────────────
  console.log('3. Waiting for dashboard...');
  await page.waitForSelector('nav, [class*="sidebar"], aside', { timeout: 15000 });
  await pause(1800); // let pet animation settle

  // ── 4. Scroll to show quest list ──────────────────────────────────────────
  console.log('4. Quest list...');
  await pause(1200);

  // ── 5. Complete "Meditation" quest ────────────────────────────────────────
  console.log('5. Completing Meditation quest...');
  const meditationCard = page.locator('button', { hasText: 'Meditation' }).first();
  if (await meditationCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await meditationCard.click();
    await pause(600);
    const claimBtn = page.getByRole('button', { name: /Claim Reward/i });
    if (await claimBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await claimBtn.click();
      await pause(1200); // confetti
    }
  }
  await pause(1000);

  // ── 6. Complete "Push-ups" quest ──────────────────────────────────────────
  console.log('6. Completing Push-ups quest...');
  const pushupsCard = page.locator('button', { hasText: 'Push-ups' }).first();
  if (await pushupsCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await pushupsCard.click();
    await pause(500);
    const claimBtn2 = page.getByRole('button', { name: /Claim Reward/i });
    if (await claimBtn2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await claimBtn2.click();
      await pause(1200);
    }
  }
  await pause(800);

  // ── 7. Focus Timer ───────────────────────────────────────────────────────
  console.log('7. Focus Timer...');
  await page.getByRole('button', { name: 'Focus Timer' }).click();
  await pause(600);
  const setupBtn = page.getByRole('button', { name: /Setup/i });
  if (await setupBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await setupBtn.click();
    await pause(800);
  }
  await pause(1200);

  // ── 8. Item Shop ─────────────────────────────────────────────────────────
  console.log('8. Item Shop...');
  await page.getByRole('button', { name: 'Shop' }).click();
  await pause(1500);

  // Switch to Backgrounds tab
  const bgTab = page.getByRole('button', { name: /Backgrounds/i });
  if (await bgTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await bgTab.click();
    await pause(1000);
  }

  // Close shop
  const closeBtn = page.getByRole('button', { name: '✕' });
  if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeBtn.click();
    await pause(400);
  }

  // ── 9. Insights ──────────────────────────────────────────────────────────
  console.log('9. Insights...');
  await page.getByRole('button', { name: 'Insights' }).click();
  await pause(1800);

  // ── 10. Adventure Log ────────────────────────────────────────────────────
  console.log('10. Adventure Log...');
  await page.getByRole('button', { name: 'Adventure Log' }).click();
  await pause(1200);

  // ── 11. Ambient Mode ─────────────────────────────────────────────────────
  console.log('11. Ambient Mode...');
  await page.getByRole('button', { name: 'Ambient Mode' }).click();
  await pause(3000); // let the pet breathe

  // ── Done ─────────────────────────────────────────────────────────────────
  console.log('Saving video...');
  const video = await page.video();
  await ctx.close();
  await browser.close();

  const savedPath = await video.path();
  const finalPath = join(ASSETS_DIR, 'demo.webm');

  // Rename the auto-generated file to demo.webm
  const { renameSync } = await import('fs');
  renameSync(savedPath, finalPath);

  console.log(`\n✅ Demo video saved to .github/assets/demo.webm`);
  console.log('   Upload to a GitHub release or convert to GIF with:');
  console.log('   ffmpeg -i .github/assets/demo.webm -vf "fps=12,scale=1280:-1" demo.gif');
})();
