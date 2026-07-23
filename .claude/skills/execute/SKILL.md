---
name: execute
description: Execute an issue end-to-end following the Epic three-layer architecture, loading the layer-specific skills. Use when the user wants to implement a planned issue. Triggers on "execute an issue", "implement this issue", or "build this issue".
---

# Execute

Implement the issue file the user provides, following the steps below.

This skill guides you through executing a complete issue following the Epic three-layer architecture patterns. Each step uses a layer-specific skill that documents the patterns for that part of the implementation. Follow each step in order, loading the appropriate skill for each part.

This build process leverages a dedicated skill for each layer of the architecture:

| Skill | Purpose | Layer |
|-------|---------|-------|
| **integrations** | External integrations and complex business logic | Infrastructure |
| **models** | Active Record models over Drizzle tables | Infrastructure |
| **actions** | Server actions with auth, validation, and model calls | Backend |
| **routes** | API routes and server-side route handlers (streaming, webhooks) | Backend |
| **hooks** | Client hooks with state management and optimistic updates | Frontend |
| **components** | UI components that consume hooks | Frontend |
| **test** | Action/hook tests (.test.ts, see `references/unit.md`) and E2E behavior tests (.spec.ts, see `references/behavior.md`) | Testing |

Each skill documents the project's three-layer architecture patterns for its layer, ensuring consistency, proper debug logging, and error handling. Load the relevant skill at each step.

**Prerequisites**: If the page the behavior belongs to doesn't exist yet, create it. A page that renders a read is a **Server Component** that prefetches the query and hydrates a client `page-content.tsx` via `HydrationBoundary` (see the **components** skill). A page that only hosts forms/dialogs can be a plain client page.

# Steps to Execute the Issue

Here is the order of steps to execute the issue: 

1. Create or Update Integrations (if necessary)
2. Create or Update UI State (Jotai) and Query Options
3. Create or Update Actions
4. Create or Update Hooks
5. Create or Update Components
6. Create End-to-End Behavior Test

Details for each step are provided below.


## 1. Create or Update Integrations (if necessary)

**Location:** `/shared/integrations/[integration-name]/`

### When to Create/Update:
- External API integrations needed
- Complex business logic that doesn't belong in actions
- Email, notifications, or third-party services
- Heavy computations or background tasks

### Instructions:
**Load the integrations skill**

**Required Information:**
- Integration purpose (email, payment, analytics, etc.)
- External APIs or libraries to integrate
- Complex business logic requirements
- Environment variables needed

The integrations skill documents all implementation details following the project's Infrastructure layer patterns. If the behavior needs database models, also load the **models** skill.

## 2. Create or Update UI State (Jotai) and Query Options

Server state (lists, records, their loading/error/cache) lives in the **TanStack
Query** cache — never in Jotai. This step covers the two things you DO author by
hand: UI-state atoms and a read's query-options file.

### UI state — `app/[page]/state.ts`

Jotai atoms for **UI state only**: dialog/selection state, and the
filter/sort/pagination inputs that feed query keys. No data or loading atoms.

```typescript
export const pageAtom = atom(1);
export const searchAtom = atom('');
export const dialogAtom = atom<'add' | 'edit' | null>(null);
```

### Query options — `app/[page]/behaviors/[name]/[name].query.ts`

For each read, a `queryOptions` factory (shared `queryKey` + `queryFn` calling
the Action) plus a key factory and a `defaultParams` export. The page Server
Component prefetches it; the client hook consumes it. Export `defaultParams` and
make the param atoms' initial values match it, or hydration silently misses.
(See the **hooks** skill for the full pattern.)

## 3. Create or Update Actions

**Location:** `app/[page]/behaviors/[behavior-name]/actions/[action-name].action.ts`

### Instructions:
**Load the actions skill**

**Required Information:**
- Behavior name and action purpose
- Input data requirements and validation rules
- Which database tables to query (from `db/schema.ts`)
- Authentication requirements
- Expected return data structure

The actions skill documents all implementation details following the project's Backend layer patterns, calling models for data operations.

### Testing the Action:
After creating the action, load the **test** skill (use `references/unit.md`) to create an action test:

**Test Location:** `app/[page]/behaviors/[behavior-name]/tests/[action-name].action.test.ts`

Create a single test case using:
- PreDB/PostDB patterns for database state verification
- Mocked authentication with `createTestUser`
- Real database operations (NODE_ENV=test)

**Run the test:**
```bash
bun run test [action-name].action.test.ts
```

## 4. Create or Update Hooks

**Location:** `app/[page]/behaviors/[behavior-name]/use-[behavior].ts` (directly in the behavior folder — no `hooks/` subfolder)

### Instructions:
**Load the hooks skill**

**Required Information:**
- Behavior name and purpose
- Read or write: `useQuery` (consumes the `[name].query.ts` options) or `useMutation`
- Which UI-state atoms feed the query key (page/search/sort)
- Server action to call as the `queryFn`/`mutationFn`
- Validation requirements (validate once at the call site)
- Optimistic update strategy (via the query cache, for list mutations)
- Error handling needs

The hooks skill documents all implementation details following the project's Frontend layer patterns.

### Testing the Hook:
After creating the hook, load the **test** skill (use `references/unit.md`) to create a hook test:

**Test Location:** `app/[page]/behaviors/[behavior-name]/tests/use-[behavior].test.tsx`

Create a single test case using:
- A fresh `QueryClient` (with `retry: false`) wrapped in `QueryClientProvider`
- Mocked server actions
- Testing Library's `renderHook`
- Verification of returned `data`/`error` and cache effects (optimistic + rollback)

**Run the test:**
```bash
bun run test use-[behavior].test.tsx
```

## 5. Create or Update Components

**Location:** `app/[page]/components/[ComponentName].tsx`

### Instructions:
**Load the components skill**

**Required Information:**
- Component purpose and UI requirements
- Which behavior hooks to consume
- Props interface requirements
- Loading and error state displays
- Form handling needs (if applicable)
- Tailwind styling requirements

The components skill documents all implementation details following the project's Frontend layer patterns.

## 6. Create End-to-End Behavior Test

After implementing all the components, create a comprehensive end-to-end test to verify the complete user workflow.

**Location:** `app/[page]/behaviors/[behavior-name]/tests/[behavior-name].spec.ts`

### Instructions:
Load the **test** skill (use `references/behavior.md`) to create a behavior test.

**Required Information:**
- Behavior name and expected workflow
- Page route and authentication requirements
- Success scenario to test
- Data-testid attributes used in components

Create a single Playwright test that:
- Navigates to the page
- Performs user interactions
- Verifies expected outcomes
- Cleans up test data after completion

### Running the Behavior Test:

Specs target the URL in the `BASE_URL` environment variable (loaded from
`.env.test` by `playwright.config.ts`) — that is the PREVIEW: locally the
per-issue dev server, in a remote sandbox the preview's public HTTPS URL.

```bash
bun run spec [behavior-name].spec.ts
```

If nothing responds at `BASE_URL` (connection refused), the preview is down —
in a remote sandbox it is supervisor-managed and comes back on its own (retry
after a moment); locally re-run `epic preview start <issue>`.

**Never edit `.env.test` and never rewrite `BASE_URL` to `localhost` in a
remote sandbox.** The preview's auth cookies are `Secure`/`SameSite=None`
(its Better Auth base URL is the HTTPS proxy domain) and Chromium silently
drops them over plain-HTTP localhost — sign-in appears to succeed but no
session cookie sticks and every protected page bounces to `/signin`. Only
the HTTPS preview URL in `BASE_URL` works.

**Check the logs after test completes:**
```bash
tail -n 100 logs/test.log
```
This shows the last 100 lines of logs to see what happened during the test.

### Analyze results and logs:
- **If test passes**: ✅ Complete behavior is working correctly
- **If test fails**:
  - Check the Playwright output for specific failures
  - Review `logs/test.log` for server-side errors
  - Check browser console errors in Playwright output
  - Look for authentication, validation, or database issues

### Debug common issues:
- Missing `data-testid` attributes on components
- Authentication not working (check `.auth/user.json` exists)
- Server actions throwing errors (check logs)
- Components not rendering expected content
- Timing issues (may need to adjust timeouts)

### Fix issues and re-run:
1. Fix the identified issues
2. Re-run the behavior test:
   ```bash
   bun run spec [behavior-name].spec.ts
   ```
3. Check logs again if needed:
   ```bash
   tail -n 100 logs/test.log
   ```
4. Repeat until the behavior test passes

### Test Best Practices:

**For All Tests:**
1. **Start Small**: Write one test case first, expand later
2. **Test Behavior**: Focus on outcomes, not implementation
3. **Isolate Tests**: Each test should be independent
4. **Clean Up**: Remove test data after tests

**For Behavior Tests:**
1. **Base URL**: Never hardcode a URL — use relative paths (`page.goto('/')`) so Playwright's configured `baseURL` (from `BASE_URL` / `.env.test`) applies
2. **Authentication**: Use `test.use({ storageState: '.auth/user.json' });` for auth-required pages
3. **Data Test IDs**: Ensure all interactive elements have `data-testid` attributes
4. **Real Workflows**: Test actual user behavior, not just happy paths

**For Action Tests:**
1. **Use PreDB/PostDB**: Set up and verify database state
2. **Mock Minimally**: Only mock auth and external services
3. **Test with Real DB**: Use NODE_ENV=test database

**For Hook Tests:**
1. **Mock Actions**: Mock server actions (hooks don't touch the DB directly)
2. **Wrap in QueryClientProvider**: Fresh `QueryClient` per test, `retry: false`
3. **Test State Changes**: Verify returned data/error and optimistic updates + rollbacks via the cache

### Monitoring and Debugging:
- **Run tests first**, then check logs with `tail logs/test.log` after completion
- **Review logs** at `logs/test.log` for server-side issues and debug output
- **Use Playwright's** `--debug` flag for step-by-step debugging
- **Check browser console** for client-side JavaScript errors
- **Verify database state** if data operations aren't working

### Debug Logging Features:

The implementation includes comprehensive debug logging for all layers:

**🔧 SERVER ACTION** logs show:
- Function calls with parameters (JSON formatted)
- Authentication status and user ID
- Validation results
- Database queries and results
- Success/error responses

**🔧 INTEGRATION** logs show:
- Integration method calls with parameters
- External API requests and responses
- Success/error states

**🔧 HOOK HANDLER** logs show:
- Hook function calls with parameters
- Validation results
- Loading state changes
- Optimistic updates (add/rollback)
- Server action calls and responses

**Usage during testing:**
1. Run your Playwright test:
   ```bash
   bun run spec behavior.spec.ts
   ```
2. After test completes, check the logs:
   ```bash
   tail -n 100 logs/test.log
   ```
3. Review logs to see exactly what functions were called and with what parameters
4. Debug issues by following the complete flow from UI → Hook → Action → Database
5. The logs show the exact sequence of calls with all parameters for easy debugging

This behavior test step ensures your complete behavior works from UI to database and back, catching integration issues that unit tests might miss.

## File Organization Pattern

```
app/[page]/
├── page.tsx                 # Next.js page component
├── state.ts                 # Jotai atoms (UI state only)
├── components/              # UI components
│   ├── [List].tsx
│   ├── [Card].tsx
│   └── [Form].tsx
└── behaviors/               # Grouped by user action
    └── [behavior-name]/     # e.g., "add-bookmark", "view-bookmarks"
        ├── use-[behavior].ts        # Client hook (directly here, no hooks/ subfolder)
        ├── [behavior].query.ts      # Query options (reads)
        ├── actions/                 # Server actions
        │   └── [action].action.ts
        └── tests/                   # All tests for this behavior
            ├── [action].action.test.ts
            ├── use-[behavior].test.tsx
            └── [behavior].spec.ts
```

## Testing Summary

Tests are created alongside each implementation step using the **test** skill (`references/unit.md` for action/hook tests, `references/behavior.md` for behavior tests):

1. **After creating actions** → Write action tests (.action.test.ts)
2. **After creating hooks** → Write hook tests (.test.tsx)
3. **After full implementation** → Write behavior tests (.spec.ts)

Each test starts with a single test case following the "start small" principle.

## Common Patterns to Follow

1. **Error Handling**: Always return `{ success, data?, error? }` format
2. **Authentication**: Check `getUser()` in all protected actions
3. **Validation**: Use Zod schemas for input validation (once, at the hook's call site)
4. **Optimistic Updates**: Via the query cache — `onMutate` snapshot, `onError` rollback, `onSettled` invalidate
5. **Loading States**: Expose `isPending`/`isLoading` from the hook for UI feedback
6. **Test IDs**: Add `data-testid` attributes for testing
7. **TypeScript**: Use proper types for all data structures

## Phase Discipline

- **Quality checks run ONCE, as a final batch**: `bun run typecheck` and lint at the
  end of the implementation, not after every step. To inspect a result you already
  have, grep the captured output — never re-run the command just to re-read it.
- **Never run git commands** — commits, branches and pushes are the epic CLI
  harness's contract, not the execute phase's. Never manage the dev server either;
  the sandbox supervisor owns it.
8. **File Naming**: Follow consistent naming conventions