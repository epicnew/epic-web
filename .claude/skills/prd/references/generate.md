# Generate PRD

Given the product or feature **description** the user provides, write a new Product
Requirements Document. Write the body using the Concepts and Specification Format in
`SKILL.md`.

## Writing the file

This skill does not create the PRD record, assign it a number, or pick a file path — the
invoking command already did that before handing you the description. The invoking prompt
names the file to write, typically as: "A PRD file at `<path>` currently holds the short
description above as its body." That file is plain markdown with no YAML front matter — the
PRD's `id` and `status` live in the database, not in this file. The identifier is visible in
the path itself (e.g. `.epic/sessions/PRD-7/prd.md` names `PRD-7`).

1. Read the file at the path the invoking prompt names — it currently holds just the
   description as plain text.
2. Replace its contents with the full document: start with a `# PRD-N [Title]` heading
   (the identifier from the path, plus a concise title drawn from the description).
3. Write the body below the heading, following the Specification Format in `SKILL.md`.

Do not create a new file.

## When invoked directly

If nothing in the request names a file to write, this skill does not create the PRD itself:
tell the user that `epic prd generate "<description>"` creates the PRD record and hands you
the file to write the body into.
