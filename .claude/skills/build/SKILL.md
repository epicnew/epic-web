---
name: build
description: Complete a single issue by planning then implementing it. Use when the user wants to build out one issue end-to-end. Triggers on "build this issue", "run this issue", or "complete this issue".
---

# Build

Complete an issue end-to-end: plan it, then implement it. Issue content lives in the
database, not in a file under `.epic/` — this skill never picks its own path; it works with
whichever issue file the invoking context names.

**When an issue file is named** (e.g. "Read the issue file at `<path>`"):
1. Use the **plan** skill with that file to write a detailed implementation plan (updates the file only, no code yet).
2. Use the **execute** skill with that file to implement the plan across all layers.

**When invoked directly with no file** — the user says "build this issue" naming only an id
or title, with no file in hand — this skill does not fetch or create issue content itself.
Tell the user that `epic issue build <id>` owns the full plan-then-execute flow (or, to run
the phases separately, `epic issue plan <id>` followed by `epic issue execute <id>`): those
commands fetch the issue into a file and hand it to this skill, then PATCH your edits back to
the database when each phase ends.
