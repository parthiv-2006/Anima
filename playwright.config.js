import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  // Start the Vite dev server before tests.
  // The backend server (port 5000) must be running separately:
  //   - Locally: npm run dev:server
  //   - CI: started as a background step in the workflow
  webServer: {
    command: 'npm run dev:client',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000
  }
});
