import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.js'],
    hookTimeout: 120000,
    testTimeout: 30000,
    env: {
      JWT_SECRET: 'vitest-test-secret-local',
      NODE_ENV: 'test'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/__tests__/**', 'src/index.js']
    }
  }
});
