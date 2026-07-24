# Plan PRD

Given the PRD file the invoking prompt points you at (or, if invoked directly, the file the
user references), draft or refine its body **in place**. Write the body using the Concepts
and Specification Format in `SKILL.md`.

## Process

1. Read the PRD file at the referenced path and any current contents to understand what is already captured. If the body is empty, draft from scratch; otherwise refine and improve what is there.
2. Rewrite the body below the existing `# PRD-N Title` heading, following the Specification Format in `SKILL.md`. The file has no YAML front matter — the PRD's `id` and `status` live in the database, not here.
3. **Do not create a new file** — edit this PRD in place.
4. **Do not edit the `# PRD-N Title` heading.** Only rewrite the body below it.

## When invoked directly

If nothing in the request names a PRD file, this skill has nothing to draft: tell the user that `epic prd plan <PRD-id>` hands you the file to refine.
