import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    {
      name: 'reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 900 },
        // Playwright 1.62 moved reducedMotion under contextOptions.
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    // Never reuse: a stray `astro dev` or an older preview on 4321 will happily
    // serve stale HTML and the suite will verify a build that no longer exists.
    // The build takes under a second, so rebuilding every run is the cheap side
    // of this trade.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
