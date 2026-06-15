import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

// Load .env, then overlay .env.test. `.env.test` no longer sets DATABASE_URL
// (unit tests use :memory:; see vitest.env.ts) — it carries only the transient
// BASE_URL that `epic preview start` injects so spec can reuse a running preview.
dotenv.config({ path: '.env', quiet: true });
dotenv.config({ path: '.env.test', override: true, quiet: true });

// Spec runs against the PREVIEW (the normal dev server on development.db), never
// a separate test DB:
//   - BASE_URL set  → reuse the already-running preview (epic preview start).
//   - BASE_URL unset → start one ourselves via the `preview` script on a fresh
//     free port (mirrors what epic does), so there is no fixed port to collide.
const freePort = (): number =>
  Number(
    execSync(
      `node -e "const s=require('net').createServer();s.listen(0,()=>{process.stdout.write(String(s.address().port));s.close()})"`,
    )
      .toString()
      .trim(),
  );

const port = process.env.BASE_URL ? undefined : freePort();
const baseURL = process.env.BASE_URL || `http://localhost:${port}`;

export default defineConfig({
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    headless: true, // Run in headless mode (no browser UI)
  },

  projects: [
    // Setup project - runs first to authenticate
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // Test project - depends on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  // When BASE_URL is set the preview is already running — skip launching a server.
  // Otherwise start the SAME `preview` script epic uses (next dev → development.db)
  // on the free port chosen above. The port is freshly allocated, so nothing is
  // there to reuse — fail fast if it's somehow taken.
  webServer: process.env.BASE_URL ? undefined : {
    command: `rm -f .next/dev/lock && bun run preview ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
