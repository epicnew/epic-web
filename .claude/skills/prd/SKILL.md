---
name: prd
description: Create a Product Requirements Document (PRD) for a project or feature in .epic/prds, capturing the MVP pages, behaviors, and flows. Use when the user wants to spec out a new product or feature from a description. Triggers on "create a PRD", "write a PRD", or "spec out this product".
---

# PRD

Given the product or feature description the user provides, write a complete Product Requirements Document.

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

Do not put anything above the `# PRD-[N] [Title]` heading except the front matter. Only write the body below the heading.

## Writing the body

- Capture an MVP — only the most essential pages and behaviors. We will iterate later.
- Think about what the core job to be done of this product is, and focus on it.
- A **Behavior** is an action the user can take on a Page.
- A **job story** is a design tool that focuses on the job a user is trying to accomplish rather than the user themselves. It emphasizes the context and situation surrounding the task, the motivation for the task, and the desired outcome:

```
When <situation>, I want to <motivation>, so I can <expected outcome>.
```

- A **Flow** is a user workflow that connects behaviors across pages in order. Each step depends on the ones before it. Flows capture the implicit dependencies between behaviors. Capture them carefully — the **break** skill uses Flows to order issues and populate each issue's `depends_on` dependencies.

## Specification Format

Write the body using this exact structure:

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

Once the PRD is written, the **break** skill turns it into individual implementation issues.
