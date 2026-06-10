# Generate PRD

Given the product or feature **description** the user provides, create a new Product Requirements Document. Write the body using the Concepts and Specification Format in `SKILL.md`.

## Creating the file

1. Determine the next PRD number `N` by checking existing files in `.epic/prds/` (named `PRD-[N]-[slug].md`). Use the next integer (start at 1 if the folder is empty).
2. Create the file at `.epic/prds/PRD-[N]-[slug].md`, where `[slug]` is a short kebab-case title.
3. Start the file with this front matter and heading, then write the body below it:

```
---
id: PRD-[N]
status: draft
---

# PRD-[N] [Title]

[body goes here]
```

Do not put anything above the `# PRD-[N] [Title]` heading except the front matter. Write only the body below the heading, following the Specification Format in `SKILL.md`.
