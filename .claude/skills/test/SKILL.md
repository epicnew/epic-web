---
name: test
description: Write tests for behaviors — unit tests (.test.ts) for actions/hooks/models and behavior tests (.spec.ts) for end-to-end user workflows. Use when creating tests from a specification (PreDB/Workflow/PostDB or Act:/Check: steps). Triggers on "write a test", "write a unit test", "write a behavior test", "create a spec test", or "test this behavior".
---

# Test

## Overview

This skill writes tests that follow the Epic testing philosophy: **test real code against a real database with minimal mocking**. It covers two kinds of tests, each documented in its own reference.

## When to Use Each Reference

Pick the reference based on what you are testing and how the spec is written.

| Reference | Test kind | File | Tests | Spec format | Use when |
|-----------|-----------|------|-------|-------------|----------|
| `references/unit.md` | Unit test | `[module]/tests/[name].test.ts` | Actions, hooks, models — server/logic layer | PreDB / Workflow / PostDB | You verify behavior at the function/method level against the database (TDD: tests before implementation). |
| `references/behavior.md` | Behavior test | `app/[page]/behaviors/[name]/tests/[name].spec.ts` | Complete user workflows end-to-end in a browser | PreDB / Steps (Act:/Check:) | You verify a full UI workflow through Playwright, asserting outcomes through the UI. |

**Quick rule of thumb:**
- Spec has a `Workflow` section that calls a method (`Call \`class.method(args)\``) and a `PostDB` → **unit test** (`references/unit.md`).
- Spec has `Steps` with `Act:`/`Check:` bullets describing UI interactions → **behavior test** (`references/behavior.md`).

## Shared Principles

Both test kinds follow these rules:

- **Test behavior, not implementation** — assert outcomes, never `toHaveBeenCalled`.
- **No mocking** — use the test database and real navigation/API calls.
- **PreDB sets up state** — translate CSV-like tables to `PreDB(db, schema, {...})`.
- **One test per scenario/example** from the spec.
- Start with one test, expand later. Focus on the happy path first.

## How to Proceed

1. Read the spec and decide which reference applies using the table above.
2. Load that reference (`references/unit.md` or `references/behavior.md`) for the detailed format, translation rules, and full examples.
3. Generate one test per scenario, placing the file in the location shown in the table.
