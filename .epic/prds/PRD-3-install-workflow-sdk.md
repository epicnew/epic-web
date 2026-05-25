---
id: PRD-3
status: draft
---

# PRD-3 Install Workflow SDK

## Overview

Install the Vercel Workflow SDK and integrate it into the project architecture. Introduce **Automations** as a new concept alongside the existing **Behaviors**. Update the architecture and specification references to document the distinction.

## Motivation

The project currently supports Behaviors (triggered by user actions via Actions or Routes). We need a way to express work triggered by the system itself — scheduled jobs, recurring tasks, and internal events — with durability, automatic retries, and checkpointing. The Vercel Workflow SDK provides this through durable async functions.

## Two Concepts

### Behaviors (existing)

Triggered by user actions. Implemented with a Hook (Presentation) calling an Action or Route (Orchestration) which calls Integrations and Models (Infrastructure).

```
Component → Hook → Action/Route → Integration → Model
```

Location: `app/[page]/behaviors/[name]/`

### Automations (new)

Triggered by the system — on a schedule (cron) or by an internal event/queue. No Presentation layer. The Workflow is the top of the stack.

```
Workflow → Integration → Model
```

Location: `shared/automations/[name]/`

## Automation Triggers

Two trigger types to support:

| Trigger | Description | Example |
|---------|-------------|---------|
| **Scheduled** | Cron-based, runs at a specific time or interval | "every night at midnight", "every Monday at 9am" |
| **Internal event** | Fired by another part of the app via a queue | "after a user signs up, run onboarding workflow" |

## File Structure

Every workflow, regardless of where it lives, follows the same pattern: a `workflows/` subfolder containing the workflow file and a `steps/` folder.

### Behavior

Entry point types live in their own subfolders when present. Workflows are additive alongside actions and routes.

```
app/[page]/behaviors/[name]/
  actions/
    [name].action.ts
    [name].action.test.ts
  workflows/
    [name].workflow.ts
    steps/
      [step-name].ts
    [name].workflow.test.ts
  routes/
    route.ts
    route.test.ts
  use-[name].ts
  state.ts                    # Optional
  tests/
    [name].spec.ts
```

Only include a subfolder when that entry point type is needed. The `steps/` folder always lives inside `workflows/`.

### Automation

Same subfolder convention. Since automations only ever have a workflow, the structure is simpler:

```
shared/automations/[name]/
  workflows/
    [name].workflow.ts
    steps/
      [step-name].ts
    [name].workflow.test.ts
  state.ts                    # Optional
```

Automations have no UI, so there is no E2E spec. All tests live inside `workflows/`.

## Specification Changes

### specification.md

Automation is a **Functional Specification**. Behaviors belong to Pages; Automations belong to the Project directly:

```
Project → Page → Behavior   (user-triggered)
        → Automation        (system-triggered, not page-specific)
```

Changes:
- Add **Automation Specification Format** as a new numbered section in the Functional Specifications part, alongside the Behavior Specification Format
- Same Rules + Scenarios structure as Behavior specs, with a **Trigger** section at the top describing what kicks off the automation (cron expression or event name)
- The existing **Workflow Specification Format** (Section 10) in the Technical Specifications remains — workflows can be used inside normal behaviors as background jobs

### architecture.md

- Clarify that behaviors are containers that implement the layers, not a layer themselves
- Add Automations as a parallel concept to Behaviors
- Add `shared/automations/` to the sharing hierarchy
- Update file locations table with the new subfolder structure (`actions/`, `workflows/`, `routes/`)
- Update the "one backend entry point" rule: a behavior may have at most one Action, one Route, and one Workflow — they serve distinct purposes (synchronous call, HTTP/streaming, and long-running background job respectively) and can coexist within the same behavior
- Document the Workflow entry point pattern and its constraints (deterministic, no side effects in workflow body)

## Installation Tasks

- [ ] Install `workflow` package via Bun
- [ ] Set up the workflow API route handler (`app/api/workflow/route.ts`)
- [ ] Configure environment variables (if any)
- [ ] Update `architecture.md`
- [ ] Update `specification.md`
- [ ] Update `CLAUDE.md` with automation file naming conventions
