---
name: break
description: Break a PRD into individual implementation issues, one per behavior or feature, ordered and linked by the PRD's flows. Use when the user wants to turn a PRD into a set of issues. Triggers on "break the PRD into issues" or "break down the PRD".
---

# Break

Given the PRD the user provides (a file in `.epic/prds/`), break it into issues in `.epic/issues/`.

- Break the PRD into issues. The number of issues should match the PRD: one per behavior or feature. Do not pad with extra issues, and do not invent requirements that are not in the PRD.
- Each issue is just the title and a brief overview. The **build** skill turns each one into a full plan and implements it later.
- Issues follow this naming convention (use Title Case for behavior and page names, converting kebab-case to space-separated words):
  - Implement [Behavior Name] Behavior in [Page Name] Page
  - Change [Behavior Name] Behavior in [Page Name] Page to [What Change We Want]
  - Fix [Behavior Name] Behavior in [Page Name] Page

## Using Flows for Ordering and Dependencies

If the PRD includes a **Flows** section or describes user journeys, use it to:

1. **Order issues correctly**: behaviors that appear earlier in a flow must be implemented before behaviors that appear later.
2. **Populate the `depends_on` front matter field**: list the issue IDs (from this same batch) that must be completed before this issue can start. Use `depends_on: []` for issues with no dependencies. Do NOT use a `### Dependencies` body section — `depends_on` is the only source of truth, and `epic project build` reads it to schedule work.

Example issue front matter with dependencies (front matter only — no body section needed):

```
---
id: PROJ-12
github_id: null
status: open
assignee: null
state: Queued
type: item
depends_on: [PROJ-10, PROJ-11]
---
```

Rules for determining dependencies:

- Within a flow, each behavior depends on the behaviors listed before it in that flow.
- If a behavior appears in multiple flows, combine all dependencies.
- Only list **direct** dependencies (not transitive ones).
- Reference dependencies by their issue ID (e.g. `PROJ-10`), not by title.
- All IDs in `depends_on` must refer to issues created in this same batch.

Order issues in implementation sequence: foundational behaviors before dependent behaviors. Use the Flows section to determine the correct order when available.

- Create the issues in the folder `.epic/issues/` as `[prefix]-[number]-[slug].md`.
