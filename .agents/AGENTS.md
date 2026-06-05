# AGENTS.md

This file provides guidance to coding agents (Claude Code, Codex, OpenCode) working with this repository. `.claude/CLAUDE.md` and `.codex/AGENTS.md` are symlinks to this file.

## Architecture

**Three-layer architecture** with one-way data flow (top to bottom only):

| Layer | Runs On | Components | May Import | Must NOT Import |
|-------|---------|------------|------------|-----------------|
| **Frontend** | Browser | Components, Hooks, Queries, States | React, Zod, TanStack Query, Jotai, Actions | Drizzle, Integrations, server-only |
| **Backend** | Server | Actions, Routes | Integrations, auth utilities | React, Jotai, direct DB access |
| **Infrastructure** | Server | Integrations, Models | Drizzle, external APIs | React, Actions, Hooks |

**Server state** (lists, records, caching) is owned by **TanStack Query** (`useQuery`/`useMutation`); **Jotai is for UI state only** (dialogs, selections, filter/sort/page inputs). Reads use a `[name].query.ts` options file with server prefetch + `HydrationBoundary`; mutations are optimistic by default.

See `docs/references/architecture.md` for detailed patterns and code examples.

## Project Structure

```
app/
  /(landing-page)/     # Public pages (NO auth)
  /(app)/              # Authenticated pages (LOGIN REQUIRED)
  /admin/              # Admin pages (LOGIN + ADMIN ROLE)
  /auth/               # Auth pages (signin, signup, etc.)
  /api/                # API routes
db/                    # Schema + migrations
lib/                   # Utilities, auth, testing libs
shared/                # Models + Integrations
components/ui/         # shadcn/ui components
```

### Behavior Structure

Features are organized by behavior:

```
app/[page]/behaviors/[behavior-name]/
  [behavior-name].action.ts      # Server action (atomic)
  route.ts                       # Route endpoint (streaming)
  use-[behavior-name].ts         # React hook
  state.ts                       # Behavior-specific state (optional)
  tests/
    [behavior-name].spec.ts      # E2E test
    [behavior-name].action.test.ts
    [behavior-name].route.test.ts
```

A behavior has either an action OR a route, not both.

## File Naming

| Type | Pattern |
|------|---------|
| Server actions | `[name].action.ts` |
| Routes | `route.ts` |
| React hooks | `use-[name].ts` |
| Components | `[Name].tsx` |
| E2E tests | `[name].spec.ts` |
| Action tests | `[name].action.test.ts` |
| Route tests | `[name].route.test.ts` |
| State files | `state.ts` |

## Commands

```bash
# Development
bun run lint             # ESLint

# Database
bun run db:generate      # Generate migrations
bun run db:migrate       # Apply migrations
bun run db:push          # Push schema (dev only)
bun run db:studio        # Visual editor
bun run db:reset         # Clean + push schema
bun run db:squash        # Combine migrations into one

# Testing
bun run test             # Vitest unit tests
bun run spec             # Playwright E2E tests
```

## Testing

**Philosophy**: Test real code with real database, minimal mocking.

**Rules**:
- NO mocking in Playwright tests
- NO `toHaveBeenCalled` - test outcomes, not implementation
- USE test database, not mocks
- Start with ONE test, expand later
- Use PreDB/PostDB for deterministic state

```typescript
// Database test pattern
await PreDB(db, schema, { users: [] });
// ... execute action ...
await PostDB(db, schema, { users: [{ name: 'Alice' }] });
```

## Authentication

**Better Auth** with middleware protection:
- `/(app)/*` and `/admin/*` require authentication
- Config: `lib/auth/index.ts`, Client: `lib/auth/client.ts`
- Server-side: `getUser()` for cached session retrieval

## Epic CLI

When the user is planning a project, creating/managing issues, or building/reviewing issues with the `epic` command, use the **epic-cli** skill at `.claude/skills/epic-cli/SKILL.md`. This includes requests like "create a project", "generate a PRD", "break a PRD into issues", "plan an issue", "build an issue", or "review/merge an issue".

Planning artifacts live under `.epic/` (configured in `.epic/settings.json`): PRDs in `.epic/prds/`, issues in `.epic/issues/`.

## Workflow Skills

The repository ships skills that encode this architecture. Prefer them over ad-hoc implementation:

- **prd → break → build** is the project workflow: write a PRD (`.epic/prds/`), split it into issues (`.epic/issues/`), then `build` each issue (plan, then execute).
- **execute** implements an issue by loading the layer skills in order: **models**, **integrations**, **actions**, **routes**, **hooks**, **components**, then **unit-tests** / **behavior-tests**.
- **plan** writes an implementation plan into an issue; **issues** creates or updates issue files.

Each layer skill (`actions`, `models`, `hooks`, `routes`, `components`, `integrations`) carries its own architecture/spec reference, so load the matching skill when writing that layer.

## Frontend Design

When working on tasks that involve React components or UI, use the **frontend-design** skill at `.claude/skills/frontend-design/SKILL.md` for high-quality, production-grade design output.

## Design System

Before writing any UI code, read `docs/DESIGN.md` — it points to the component inventory (`navigation.ts`) and design tokens (`globals.css`).

**Key rules**:
- Check `components/` subdirectories for existing components before creating new ones
- Use semantic color tokens (`bg-primary`, `text-muted-foreground`) — never hardcode colors
- New shared components must be added to the styleguide

## Package Management

Use **Bun** exclusively: `bun add`, `bun remove`

## Sandbox Environment

The dev server is **already running** via pm2 on port 8080. Two URLs are available:
- `http://localhost:8080` — local access
- Public sandbox URL — external access (check with `pm2 status`)

**Never run `bun run build`** — the sandbox is for development only.
After making changes, prefer running **`bun run typecheck`** as the final verification step.
