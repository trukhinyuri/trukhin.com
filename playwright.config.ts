import { defineConfig } from '@playwright/test';

// DIST picks the build to serve (dist by default, dist-on for the variant with the private block).
const DIST = process.env.DIST ?? 'dist';
const PORT = Number(process.env.PORT ?? 4321);

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome', // Google Chrome from /Applications
  },
  webServer: {
    command: `npx --no astro preview --ignore-lock --outDir ${DIST} --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
