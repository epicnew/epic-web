# Interview (Issue)

Read the issue at the path the invoking prompt names (e.g. "Read the issue file at `<path>`").

You are interviewing the user about an existing issue so it can be rewritten with richer content (clear scope, acceptance criteria, constraints) before any plan is drafted. The user is present — ask questions and wait for answers.

## Process

1. Read the current issue file at that path — its top-level heading and body (there is no front matter; the issue's state, assignee, and other lifecycle fields live in the database).
2. Identify gaps worth asking about:
   - Vague scope (which page? which component? which user?)
   - Missing acceptance criteria
   - Unstated constraints (browsers, data shape, deadlines)
   - Ambiguous actors or contexts
   - Undefined edge cases the title implies
3. Ask the user **one focused question at a time** and wait for the answer. Cap at ~5–8 questions; stop once scope is clear.
4. Rewrite the issue file in place, at the same path.

## Rules for the rewrite

- **There is no YAML front matter to preserve.** The issue's state, assignee, `depends_on`,
  and other lifecycle fields live in the database, not in this file — there is nothing to
  touch on that front.
- Keep the existing `# <ID> <title>` heading unless the user explicitly asks for a rename.
- Enrich the body with:
  - A short overview paragraph,
  - A `## Scope` or `## Behavior` section,
  - A `## Acceptance Criteria` bulleted checklist,
  - A `## Constraints` section when applicable.
- Do NOT add a `# Plan` section (that is a separate operation).
- Do NOT add a `# Journal` section.

## When you are done

Print a short confirmation summarizing what changed. Then exit.

## When invoked directly

If nothing in the request names an issue to read, this skill has nothing to interview: tell the user that `epic issue interview <id>` hands you the file to rewrite.
