---
name: interview
description: Interview the user about an existing issue or PRD, then rewrite that file in place with richer, more concrete content (scope, acceptance criteria, goals, flows) before any plan is drafted. Use when the user wants to flesh out, clarify, or enrich an issue or PRD through a guided Q&A. Triggers on "interview me about this issue", "interview the PRD", "flesh out this issue", or "enrich this PRD".
---

# Interview

Conduct a focused, interactive interview about an existing **issue** or **PRD**, then
rewrite that file in place with the richer content the conversation surfaces. The user
is present — ask questions one at a time and wait for each answer. Never invent answers.

This mirrors the `epic issue interview` and `epic prd interview` CLI commands, merged
into one skill. The two targets share the same shape (read the file → find gaps → ask
focused questions one at a time → rewrite the body in place, keeping the heading) but
enrich different sections.

## Choosing the target

Neither an issue nor a PRD lives in a file on disk — their content lives in the database.
This skill never picks a path itself; it always reads and rewrites whichever file the
invoking prompt names (typically an ephemeral buffer such as "Read the issue file at
`<path>`" or "Read the PRD file at `<path>`").

Decide what is being interviewed from the request and from how the invoking prompt
describes the file:

- An **issue** — the invoking prompt hands you an issue buffer, or the user says "issue".
  → Follow `references/issue.md`.
- A **PRD** — the invoking prompt hands you a PRD buffer, or the user says "PRD". → Follow
  `references/prd.md`.

If it is ambiguous which target or which type, ask the user before starting.

**If nothing names a file at all** — a user asks directly, with no issue or PRD in hand —
this skill has nothing to interview yet. Point them at `epic issue interview <id>` or `epic
prd interview <PRD-id>`, whichever they mean; that command fetches the content and hands you
the file to rewrite.

## Workflow (both targets)

1. Read the target file in full — its top-level heading and body (there is no front matter).
2. Identify the gaps worth asking about (the matching reference lists what to probe).
3. Ask the user **one focused question at a time** and wait for the answer. Keep
   questions concrete and answerable. Cap at roughly 5–10 questions; stop early once the
   file is clearly scoped or the user signals they are done.
4. Rewrite the file body **in place** at its existing path, following the rules in the
   matching reference.
5. Print a short confirmation summarizing what changed, then stop.

## Hard rules (both targets)

- **Neither file carries YAML front matter.** Issue and PRD state (status, assignee,
  `depends_on`, and the like) live in the database, not in this buffer — there is nothing
  to preserve on that front. The buffer is just the top-level heading plus the body.
- **Keep the existing top-level heading** (`# <ID> <title>` for issues, `# PRD-N Title`
  for PRDs) unless the user explicitly asks for a rename.
- **Edit the file in place — do not create new files.**
- Preserve prior content that is still accurate; don't delete material just to fit a
  template.
- If the user declines a question or says "I don't know yet", record it (under
  `## Open Questions` for PRDs) rather than guessing.

## References

- `references/issue.md` — full prompt for interviewing an **issue** (enriches scope,
  acceptance criteria, constraints).
- `references/prd.md` — full prompt for interviewing a **PRD** (enriches goals,
  non-goals, user flows, open questions).
