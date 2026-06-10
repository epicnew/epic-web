# Interview (Issue)

Read the issue file the user is asking about (under `.epic/issues/`).

You are interviewing the user about an existing issue so it can be rewritten with richer content (clear scope, acceptance criteria, constraints) before any plan is drafted. The user is present — ask questions and wait for answers.

## Process

1. Read the current issue file, including its YAML front matter and body.
2. Identify gaps worth asking about:
   - Vague scope (which page? which component? which user?)
   - Missing acceptance criteria
   - Unstated constraints (browsers, data shape, deadlines)
   - Ambiguous actors or contexts
   - Undefined edge cases the title implies
3. Ask the user **one focused question at a time** and wait for the answer. Cap at ~5–8 questions; stop once scope is clear.
4. Rewrite the issue file in place at its existing path.

## Rules for the rewrite

- **Preserve the YAML front matter exactly.** Do NOT change `state:`, `id:`, `github_id:`, `status:`, `assignee:`, `type:`, `depends_on:`, `prd_id:`, `created_at:`, or `pr:`. Only the body below the `---` block is yours.
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
