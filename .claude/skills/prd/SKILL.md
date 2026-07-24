---
name: prd
description: Author and break down a Product Requirements Document (PRD), capturing the MVP pages, behaviors, and flows. Works in four modes — generate a brand-new PRD from a description, plan (fill in / refine) the body of an existing PRD in place, interview the user to enrich a PRD through guided Q&A, or break an existing PRD into implementation issues. Use when the user wants to spec out a new product or feature, flesh out a PRD, or turn a PRD into issues. Triggers on "create a PRD", "generate a PRD", "write a PRD", "plan this PRD", "interview the PRD", "break the PRD into issues", or "spec out this product".
---

# PRD

Author and break down a Product Requirements Document. PRD content lives in the database —
this skill never picks its own path; it reads and writes whichever file the invoking
command names (each mode's reference says what that file is and where it comes from). This
skill works in four modes. Pick the mode first, then follow its reference, using the shared
concepts and format below for the modes that write the PRD body.

This mirrors the `epic prd generate`, `epic prd plan`, `epic prd interview`, and `epic prd break` CLI commands, merged into one skill.

## Choosing the mode

- **generate** — there is no PRD yet. The user hands you a product or feature **description** and wants a new PRD created from scratch. The PRD record and its file are created for you; you only write the body. → Follow `references/generate.md`.
- **plan** — a PRD already exists and its body should be drafted or refined **in place**. → Follow `references/plan.md`.
- **interview** — a PRD already exists and the user wants to enrich it through a guided, one-question-at-a-time conversation before rewriting the body in place. → Follow `references/interview.md`.
- **break** — a PRD already exists and the user wants it turned into implementation **issues**. This mode reads the PRD and creates issue files in a staging directory the invoking prompt names; it does not edit the PRD body. → Follow `references/break.md`.

Route by what the user asks for:

- "break the PRD" / "turn it into issues" / `prd break` → **break**.
- "interview the PRD" / "interview me about this PRD" → **interview**.
- A description with no existing PRD → **generate**.
- An existing PRD to flesh out / refine → **plan**.

If it is genuinely ambiguous, ask which one before starting.

## Concepts (both modes)

- Capture an **MVP** — only the most essential pages and behaviors. Iterate later.
- Focus on the product's core **job to be done**.
- **Authentication is already implemented.** The template ships sign-up, sign-in, and sign-out (better-auth) — pages, behaviors, and tests included. Do **not** add an Authentication page or sign-up/sign-in/sign-out behaviors to the PRD; they already exist. Spec only the product-specific surface.
- A **Behavior** is an action the user can take on a Page.
- A **job story** focuses on the job a user is trying to accomplish rather than the user themselves, emphasizing the context, motivation, and desired outcome:

  ```
  When <situation>, I want to <motivation>, so I can <expected outcome>.
  ```

- A **Flow** is a user workflow that connects behaviors across pages in order; each step depends on the ones before it. Flows capture the implicit dependencies between behaviors. Capture them carefully — the **break** mode uses Flows to order issues and populate each issue's `depends_on`.

## Specification Format (both modes)

Write the PRD **body** using this exact structure (the `# PRD-N Title` heading sits above it and is handled by the mode reference; there is no YAML front matter — the PRD's `id` and `status` live in the database):

```
## Overview

[Brief description of what this product does and its purpose]

## [page-name]

[Brief page description and when the user visits it]

### Behaviors

- **[behavior-name]**: [Single sentence describing what this behavior does]
- **[behavior-name]**: [Single sentence describing what this behavior does]

## [page-name]

[Brief page description]

### Behaviors

- **[behavior-name]**: [Description]

## Flows

### [Flow Name]
[One sentence describing the user goal]

1. [verb] [subject] -- page behavior
2. [verb] [subject] -- page behavior
3. [verb] [subject] -- page behavior

### [Flow Name]
[One sentence describing the user goal]

1. [verb] [subject] -- page behavior
2. [verb] [subject] -- another-page behavior
```

Keep it tight: every page earns its place by enabling at least one behavior in a flow; every behavior maps to a concrete user goal. Once the PRD is written, the **break** mode turns it into individual implementation issues.

## References

- `references/generate.md` — write the body of a brand-**new** PRD from a description.
- `references/plan.md` — draft or refine the body of an **existing** PRD in place.
- `references/interview.md` — interview the user to enrich an **existing** PRD, then rewrite its body in place.
- `references/break.md` — break an **existing** PRD into implementation issues.
