# Apply DESIGN.md

Apply the project's existing visual design specification to the codebase. Read `DESIGN.md` at the repo root (it follows the google-labs-code/design.md format described in `SKILL.md`) and edit the project's styling in place so the running app matches its tokens.

## Goal

Apply the design to the project. Decide which files to change and edit them in place so the running app matches the design tokens in `DESIGN.md`.

## Instructions

- Read the `DESIGN.md` content, then explore the project to find where its UI / styling lives (global CSS, theme files, Tailwind config, component styles).
- Translate the design tokens into the project's **existing** styling system rather than introducing a new one. Match the project's color format, units, and file structure.
- Cover every section present in `DESIGN.md`: colors, typography, spacing, elevation/shadows, border-radius/shapes, and per-component tokens.
- Edit files in place. Make the smallest set of changes that realizes the design. Do not scaffold a new project or rewrite unrelated code.
- Skip sections that are absent from `DESIGN.md` rather than inventing values.
- Do not commit; the user reviews the diff in git afterward.

## When done

Summarize which files you changed and how each maps back to the design tokens.
