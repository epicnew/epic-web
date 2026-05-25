# Three-Layer Architecture Reference

> A uni-directional layering model that keeps React UI, server logic, and external integrations cleanly separated.

## Architecture Overview

```
+-------------------------------------+
|        PRESENTATION LAYER           |
|   Components -> Hooks -> States     |
|          (Browser)                  |
+-------------------------------------+
              |
              v
+-------------------------------------+
|       ORCHESTRATION LAYER           |
|   Actions + Routes + Workflows      |
|          (Server)                   |
+-------------------------------------+
              |
              v
+-------------------------------------+
|      INFRASTRUCTURE LAYER           |
|    Integrations  +  Models          |
|          (Server)                   |
+-------------------------------------+
```

**Critical Rule**: Data flows top to bottom only. No layer may import from layers above it.

**Behaviors** (user-triggered) and **Automations** (system-triggered) are the feature units that span these layers. A Behavior is triggered by a user action. An Automation is triggered by a schedule or internal event and has no Presentation layer.

---

## Layer Responsibilities

### Presentation Layer (Browser)

| Component | Responsibility |
|-----------|----------------|
| **Components** | Render UI, collect user input, consume hooks |
| **Hooks** | Validate input (Zod), manage state (Jotai), optimistic updates, call Actions |
| **States** | Jotai atoms for client-side state |

**May import**: React, Zod, Jotai, Actions

**Must NOT import**: Database clients, Drizzle, Integrations, Models, server-only code

---

### Orchestration Layer (Server)

| Component | Responsibility |
|-----------|----------------|
| **Actions** | Server Actions for behaviors (direct import, RPC-style) |
| **Routes** | HTTP endpoints for behaviors (fetch-based, supports streaming) |
| **Workflows** | Long-running background jobs/processes |

**May import**: Integrations, Models, auth/context utilities

**Must NOT import**: React, `window`, Jotai atoms, direct database queries

---

### Infrastructure Layer (Server)

The Infrastructure layer handles all communication with the external world: databases, third-party APIs, file systems, and external services.

| Component | Responsibility |
|-----------|----------------|
| **Models** | Database access via Drizzle ORM (Active Record pattern) |
| **Integrations** | External API clients (email, payments, storage, etc.) |

**May import**: Drizzle/SQL client, external APIs, SDKs

**Must NOT import**: React, Jotai, Actions, Hooks, Components

---

## One-Way Data Flow

- **Infrastructure** never calls **Orchestration** or **Presentation**
- **Orchestration** never calls **Presentation**
- **Presentation** Components never contain server code or manage atoms directly
- **Presentation** Hooks never touch the database directly

```
Component -> Hook -> Action -> Integration -> Database
                                    |
                                    v
                              External API
```

---

## Behavior Entry Points

A behavior may have at most one Action, one Route, and one Workflow. Each serves a distinct purpose and they can coexist within the same behavior.

| Aspect | Action | Route | Workflow |
|--------|--------|-------|----------|
| Protocol | Server Action (direct import) | HTTP endpoint (fetch-based) | Durable background job |
| Invocation | `await action(input)` | `fetch()` or `fetchEventSource()` | `await workflow.start(input)` |
| Streaming | No | Optional (SSE supported) | No |
| Long-running | No | No | Yes |
| Retries | Manual | Manual | Automatic |
| File | `[name].action.ts` | `route.ts` | `[name].workflow.ts` |
| Location | `behaviors/[name]/actions/` | `behaviors/[name]/routes/` | `behaviors/[name]/workflows/` |

### When to Use Each

**Action** (default):
- Most behaviors
- Direct function call semantics
- Simpler mental model

**Route**:
- Streaming/SSE required
- Webhooks (external integrations like Stripe)
- Need HTTP semantics (headers, status codes)
- External client access needed

**Workflow**:
- Long-running background processing
- Automatic retries and checkpointing required
- Multi-step orchestration with durable state

### Hook Consumption

**Non-streaming route:**
```typescript
const response = await fetch(`/${page}/behaviors/${behavior}`, {
  method: 'POST',
  body: JSON.stringify(input),
});
const data = await response.json();
```

**Streaming route:**
```typescript
fetchEventSource(`/${page}/behaviors/${behavior}`, {
  method: 'POST',
  body: JSON.stringify(input),
  signal: abortController.signal,
  onmessage(event) {
    // React to route-specific events
  },
});
```

---

## Thin Client, Fat Server

The frontend coordinates nothing. It triggers intent and reacts to outcomes.

### Client Constraints

- No hook may call more than one backend entry point
- No component may call backend code directly
- No frontend code may encode business rules
- No orchestration, sequencing, or workflow logic

### Server Constraints

- Owns all business logic and orchestration
- Owns sequencing, retries, and transactional boundaries
- Owns integrations and domain rules

### Review Heuristic

> "Is the client deciding anything it shouldn't?"

Violations:
- Calling multiple backend endpoints from one hook
- Branching based on backend semantics
- Handling retries or error recovery strategy
- Stitching partial backend results together

---

## Import Rules Summary

| From / To | Presentation | Orchestration | Infrastructure |
|-----------|--------------|---------------|----------------|
| **Presentation** | Yes | Yes (Actions only) | No |
| **Orchestration** | No | Yes | Yes |
| **Infrastructure** | No | No | Yes |

---

## File Locations

| Type | Location | File Pattern |
|------|----------|--------------|
| Components | `app/[page]/components/` | `PascalCase.tsx` |
| Hooks | `app/[page]/behaviors/[name]/` | `use-[name].ts` |
| States | `app/[page]/behaviors/[name]/` | `state.ts` |
| Actions | `app/[page]/behaviors/[name]/actions/` | `[name].action.ts` |
| Routes | `app/[page]/behaviors/[name]/routes/` | `route.ts` |
| Workflows (behavior) | `app/[page]/behaviors/[name]/workflows/` | `[name].workflow.ts` |
| Workflow Steps | `app/[page]/behaviors/[name]/workflows/steps/` | `[step-name].ts` |
| Automations | `shared/automations/[name]/workflows/` | `[name].workflow.ts` |
| Automation Steps | `shared/automations/[name]/workflows/steps/` | `[step-name].ts` |
| Integrations | `shared/integrations/` | `[name].ts` |
| Models | `shared/models/` | `[name].ts` |

---

## Sharing Hierarchy

Code can be shared at three levels, following the same structure at each scope:

```
shared/                              <- Global: shared across all pages
  integrations/
  models/
  actions/
  hooks/
  states/
  automations/                       <- System-triggered workflows
    [name]/
      workflows/
        [name].workflow.ts
        steps/

app/[page]/
  shared/                            <- Page-level: shared between behaviors
    state.ts
    actions/
    hooks/
  behaviors/
    [behavior-name]/
      state.ts                       <- Behavior-level: specific to this behavior
      use-[name].ts
      [name].action.ts
```

### Scope Rules

| Scope | Location | Shared Between |
|-------|----------|----------------|
| **Behavior** | `behaviors/[name]/` | Nothing (behavior-specific) |
| **Page** | `app/[page]/shared/` | Behaviors within the same page |
| **Global** | `shared/` | All pages and behaviors |

### When to Use Each Level

**Behavior-level** (default):
- State, hooks, and actions specific to one behavior
- Start here; promote to higher levels only when needed

**Page-level shared**:
- State shared between 2+ behaviors on the same page
- Actions or hooks reused within the same page

**Global shared**:
- Models and Integrations (always global)
- Code needed by 2+ pages
- Core utilities used throughout the app
- Automations (always global — not page-specific)

---

## Automations

Automations are system-triggered processes that run independently of user interaction. They are parallel to Behaviors in the functional hierarchy — both are feature units, but with different triggers and no Presentation layer.

| Aspect | Behavior | Automation |
|--------|----------|------------|
| Trigger | User action | Schedule or internal event |
| Presentation | Component → Hook | None |
| Entry point | Action / Route / Workflow | Workflow only |
| Location | `app/[page]/behaviors/[name]/` | `shared/automations/[name]/` |

### Trigger Types

| Trigger | Description |
|---------|-------------|
| **Scheduled** | Cron expression — runs at a fixed time or interval |
| **Internal event** | Fired by the app via a queue — e.g. after a user signs up |

### Workflow Constraints

Workflow functions (`"use workflow"`) are sandboxed and must be **deterministic and side-effect-free**. All side effects happen in step functions (`"use step"`), which have full Node.js runtime access and are automatically retried on failure.

```typescript
export async function myAutomation() {
  "use workflow";
  // Orchestration only — no DB calls, no fetch, no Date.now()
  const result = await processStep();
  return result;
}

async function processStep() {
  "use step";
  // Full runtime access — DB, APIs, file system
  return db.users.findAll();
}
```
