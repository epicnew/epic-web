---
name: verify
description: Verify that an implemented issue works by exercising its behavior in a real browser with agent-browser, checking every scenario from the issue's specification. Use after implementing an issue, or when the user asks to verify/confirm a behavior works. Triggers on "verify this issue", "verify the behavior", or "check the issue works".
---

# Verify

You are verifying that a web issue's implementation is working correctly by exercising it in the browser.

Use `npx agent-browser` to drive the browser (fetched on demand — no install needed). The application is running at `http://localhost:8080` (use the port the user specifies if different).

## Workflow

1. Read the issue file the user provides. Locate its `# Functional Specification` section.
2. Inside it, find the `## Behavior: <name>` block. Treat that block as the source of truth for what to verify.
3. Enumerate **every scenario under `### Scenarios`**. Each `#### <scenario-name>` is one verifiable scenario — a worked walkthrough with optional `#### PreDB`, required `#### Steps` (using `Act:` / `Check:` keywords), and optional `#### PostDB`. Follow the Steps in order.

   The `### Rules` block is **not** verified independently. Rules are declarative `When:` / `Then:` context that tells you what a scenario's `Check:` assertions mean — do **not** emit a PASS/FAIL line for a rule. Every line in the report corresponds to a Scenario.
4. Open the browser and navigate to the application.
5. For each scenario, in order:
   - **Assign a distinct test user to the scenario** (see [Test Users](#test-users)). For the Nth scenario, use `userSeeds[(N - 1) % userSeeds.length]`. Using a different user per scenario keeps the scenarios isolated so data created by one doesn't bleed into the next.
   - **If the scenario requires an authenticated user, sign in as that assigned test user first** (via the app's signin page) before driving its steps. Skip this only when the scenario is itself an unauthenticated flow (e.g. signin/signup, public landing pages), in which case use the credentials directly as the scenario dictates.
   - If the scenario has `#### PreDB`, **set the database into that state before driving the Steps** (see [Setting up scenario state](#setting-up-scenario-state)). This is setup only: insert the rows the block names; you do not read the database back afterward.
   - Drive the UI per the scenario's `Act:` steps. Use `snapshot` to see the page; use the `@e…` refs it prints to `click`, `fill`, `type`, etc.
   - Confirm the scenario's `Check:` assertions match what's actually on screen / in network responses. If the scenario has a `#### PostDB` block, confirm the equivalent outcome **through the UI or network** — do not query the database to assert it.
   - Record: PASS or FAIL, with a one-line reason.

## Test Users

The application is seeded with test users in `db/seed/user.seed.ts`, exported as the `userSeeds` array. Each entry has `email`, `password`, `name`, and `userId`. Passwords are randomly generated per environment, so **read the credentials from that file** — never assume a default password.

```bash
cat db/seed/user.seed.ts
```

If `userSeeds` is empty (or `db/seed/user.seed.ts` is missing), **seed the database yourself** before verifying:

```bash
bun run db:seed   # creates the 5 test users and writes db/seed/user.seed.ts
```

Then re-read `db/seed/user.seed.ts` to pick up the generated credentials. `db:seed` is safe to re-run — existing users are skipped. Reach for `bun run db:reset` only when the schema is stale and you need a clean rebuild; it drops all data, so re-seed afterward.

- Assign one distinct user per scenario, round-robin by scenario order (`userSeeds[(N - 1) % userSeeds.length]`). One user per scenario keeps data created by one scenario from bleeding into the next. With 5 seeded users, the first five scenarios each get a unique user.
- Optionally pair each scenario with its own `npx agent-browser --session <name>` jar (e.g. `--session scenario-1`) so the assigned user and the browser storage stay isolated per scenario.
- To authenticate, navigate to the signin page and fill the assigned user's `email` and `password`, then submit and confirm the redirect to the authenticated home page before proceeding with the scenario's steps.

## Setting up scenario state

When a scenario has a `#### PreDB` block, put the database into that state **before** driving its Steps. This is setup only — insert the rows the block names; you never read the database back to assert (PostDB checks are confirmed through the UI/network instead).

Use the `PreDB` helper from `lib/db-test` (the same one the unit tests use). Write a throwaway script and run it against the **development** database — the one the preview app at `:8080` reads (`file:./db/databases/development.db`):

```bash
cat > /tmp/verify-setup.ts <<'EOF'
import { db } from "@/db";
import * as schema from "@/db/schema";
import { PreDB } from "@/lib/db-test";

await PreDB(
  db,
  schema,
  {
    // rows from the scenario's #### PreDB block, e.g.
    // posts: [{ id: 1, userId: "<assigned user's userId>", title: "First Post" }],
  },
  { wipe: false }, // add rows without clobbering seeded users / other scenarios
);
process.exit(0);
EOF
NODE_ENV=development bun /tmp/verify-setup.ts
```

- Pass `{ wipe: false }` so PreDB inserts the scenario's rows without deleting the seeded users — sign-in depends on them. Only use the default `wipe: true` (optionally scoped with `{ only: ["<table>"] }`) when the scenario owns that feature table outright and needs a clean slate. **Never wipe the auth/user tables.**
- When a PreDB row needs an owner, reference the assigned test user's `userId` from `db/seed/user.seed.ts`.
- Delete the temp script when done.

## Browser automation with agent-browser

### Prerequisites

No install step — `npx agent-browser` fetches the tool on first use. The one thing that is per-machine is the browser: the first time you use it, provision Chrome for Testing once (reused on later runs):

```bash
npx agent-browser install
```

### Quick start

```bash
# open the browser and navigate
npx agent-browser open http://localhost:8080
# take a snapshot to see element refs (@e1, @e2, …)
npx agent-browser snapshot
# interact with the page using the @refs from the snapshot
npx agent-browser click @e15
npx agent-browser fill @e5 "user@example.com"
npx agent-browser type @e7 "search query"
npx agent-browser press Enter
# take a screenshot if needed
npx agent-browser screenshot
# close the browser when done
npx agent-browser close
```

### Common commands

- `open [url]` / `goto <url>` — open browser / navigate
- `snapshot` — capture the page with `@e…` element refs (`snapshot -i` for interactive elements only)
- `click @ref` / `hover @ref` — pointer actions
- `fill @ref "<text>"` / `type @ref "<text>"` — input
- `press <key>` — keyboard (Enter, ArrowDown, Tab, …)
- `screenshot` — take a screenshot
- `console` / `network requests` — read console / network
- `close` — close the browser

### Refs go stale after every interaction

Element refs (`@e1`, `@e2`, `@e15`, …) are only valid until the next DOM update. After any
`click`, `fill`, `press`, or navigation, **all previous refs are invalid** — call `snapshot`
again before using any ref on the updated page.

```bash
npx agent-browser fill @e5 "user@example.com"
npx agent-browser snapshot   # required — refs have changed
npx agent-browser fill @e8 "password"  # use refs from the new snapshot
```

Always close the browser when done with `npx agent-browser close`.

## Verification Report

After verifying all scenarios, print a report with exactly this shape:

```
── Verification Report ─────────────────
[PASS] <scenario name>  <one-line reason>
[FAIL] <scenario name>  <one-line reason>
...

Score: <passed>/<total> scenarios passed
```

Grammar rules (so the report parses cleanly the way a test runner's output does):
- One scenario per line. Start the line with the status token `[PASS]` or `[FAIL]` (no leading whitespace).
- Separate `<scenario name>` from `<one-line reason>` with **two or more spaces** (or a tab). The name itself must not contain a run of 2+ spaces.
- Keep each reason on a single line. Brackets, quotes, and slashes inside the reason are fine.
- End with a single `Score: <passed>/<total> scenarios passed` line whose numbers match the report.

If a scenario fails, the one-line reason should describe what was expected vs what actually
happened (missing element, wrong text, error state, etc.). If any scenario fails, hand the
failures to the implementation steps (or the **execute** skill) to fix, then verify again.
