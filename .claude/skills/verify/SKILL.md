---
name: verify
description: Verify that an implemented issue works by exercising its behavior in a real browser with playwright-cli, checking every rule and scenario from the issue's specification. Use after implementing an issue, or when the user asks to verify/confirm a behavior works. Triggers on "verify this issue", "verify the behavior", or "check the issue works".
---

# Verify

You are verifying that a web issue's implementation is working correctly by exercising it in the browser.

Use `npx @playwright/cli@latest` to drive the browser. The application is running at `http://localhost:8080` (use the port the user specifies if different).

## Workflow

1. Read the issue file the user provides. Locate its `# Functional Specification` section.
2. Inside it, find the `## Behavior: <name>` block. Treat that block as the source of truth for what to verify.
3. Enumerate **every scenario** you need to verify:
   - **Each `#### <rule-name>` under `### Rules`** — a rule is a declarative `When:` / `Then:` constraint. Treat it as one verifiable scenario: set up the When conditions, then check that the Then outcomes hold.
   - **Each `#### <scenario-name>` under `### Scenarios`** — a worked walkthrough with optional `#### PreDB`, required `#### Steps` (using `Act:` / `Check:` keywords), and optional `#### PostDB`. Follow the Steps in order.
4. Open the browser and navigate to the application.
5. For each scenario, in order:
   - If the scenario has `#### PreDB`, treat it as the assumed starting state — note any preconditions you can verify but don't try to mutate the database yourself.
   - Drive the UI per the rule's `When:` conditions or the scenario's `Act:` steps. Use `snapshot` to see the page; use refs to `click`, `fill`, `type`, etc.
   - Confirm the rule's `Then:` outcomes or the scenario's `Check:` assertions match what's actually on screen / in network responses.
   - Record: PASS or FAIL, with a one-line reason.

## Browser automation with playwright-cli

### Quick start

```bash
# open new browser and navigate
npx @playwright/cli@latest open http://localhost:8080
# take a snapshot to see element refs
npx @playwright/cli@latest snapshot
# interact with the page using refs from the snapshot
npx @playwright/cli@latest click e15
npx @playwright/cli@latest type "search query"
npx @playwright/cli@latest fill e5 "user@example.com"
npx @playwright/cli@latest press Enter
# take a screenshot if needed
npx @playwright/cli@latest screenshot
# close the browser when done
npx @playwright/cli@latest close
```

### Common commands

- `open [url]` / `goto <url>` — open browser / navigate
- `click <ref>` / `dblclick <ref>` / `hover <ref>` — pointer actions
- `fill <ref> <text>` / `type <text>` / `select <ref> <val>` — input
- `check <ref>` / `uncheck <ref>` — toggle a checkbox
- `press <key>` — keyboard (Enter, ArrowDown, Tab, …)
- `snapshot` — capture the page with element refs
- `screenshot [ref]` — take a screenshot
- `console [level]` / `network` — read console / network
- `close` — close the browser

### Refs go stale after every interaction

Element refs (`e1`, `e2`, `e15`, …) are only valid until the next DOM update. After any
`click`, `fill`, `press`, or navigation, **all previous refs are invalid** — call `snapshot`
again before using any ref on the updated page.

```bash
npx @playwright/cli@latest fill e5 "user@example.com"
npx @playwright/cli@latest snapshot   # required — refs have changed
npx @playwright/cli@latest fill e8 "password"  # use refs from the new snapshot
```

Always close the browser when done with `npx @playwright/cli@latest close`.

## Verification Report

After verifying all scenarios, print a report with exactly this shape:

```
── Verification Report ─────────────────
[PASS] <scenario name>   <one-line reason>
[FAIL] <scenario name>   <one-line reason>
...

Score: <passed>/<total> scenarios passed
```

If a scenario fails, the one-line reason should describe what was expected vs what actually
happened (missing element, wrong text, error state, etc.). If any scenario fails, hand the
failures to the implementation steps (or the **execute** skill) to fix, then verify again.
