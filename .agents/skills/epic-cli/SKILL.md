---
name: epic-cli
description: Use the Epic CLI for project and issue management, PRD-driven specs, the AI agent-driven issue lifecycle (plan/execute/verify/review/merge), design tokens, and UI prototypes. Triggers on requests like "create a project", "generate a PRD", "break a PRD into issues", "plan/build an issue", "review/merge an issue", or "apply the design".
---

# Epic CLI

## Overview

Epic CLI manages projects and issues backed by Markdown files and GitHub. It drives a
PRD → issues → implementation workflow where each issue is taken through an AI agent
lifecycle (plan, execute, verify, fix, review, merge). It also handles DESIGN.md,
UI prototypes, per-issue preview servers, and git worktrees.

Run any command with no args or `--help` for subcommands: `epic <command> --help`.

## Storage & settings

PRD and issue **content** (title, description/body, status) lives only in the
database — the CLI reads and writes it through the API; no `.epic/prds/*.md` or
`.epic/issues/*.md` files are created or read. `.epic/` on disk holds only
machine configuration (`.epic/settings.local.json`, gitignored — the linked
project id — and `.epic/.worktreeinclude`).

Issue IDs accept an issue number or `prefix-number` (e.g. `CLI-8`); PRD ids
accept `PRD-N` or the PRD's uuid.

Many agent commands accept `--provider claude|codex|opencode` and `-b` (detach: run in
background instead of attaching a viewer).

## Project

| Command | Description |
|---------|-------------|
| `epic project new [name] [--web\|--terminal\|--empty] [--codex\|--opencode]` | Create a project + GitHub repo from a template |
| `epic project build [--mode auto\|manual] [--clean]` | Build all issues, walking the dependency graph; detaches an orchestrator and attaches a viewer. `manual` (default) stops each issue at "In Review"; `auto` self-merges to main |

## PRD (product requirements)

| Command | Description |
|---------|-------------|
| `epic prd new [title]` | Create a blank PRD (backend-assigned `PRD-N`, content in the DB) |
| `epic prd generate [description] [-b]` | AI-generate a PRD from a description |
| `epic prd list [--status draft\|ready\|building\|in_review\|done\|archived] [--refresh]` | List PRDs |
| `epic prd plan <PRD-id\|path>` | Fill the PRD body with a structured spec |
| `epic prd interview <PRD-id\|path>` | Interview the user and rewrite the PRD body in place |
| `epic prd attach <PRD-id\|path>` | Attach to / resume the PRD's agent session |
| `epic prd break <PRD-id\|path> [-b]` | Break a PRD into issues (created via the API) |
| `epic prd build <PRD-id\|path> [-b] [--mode auto\|manual]` | Build the PRD's issues, stacking them onto a `prd-<n>` branch. `manual` (default) stops each issue at "In Review" for `epic issue approve`; `auto` self-merges each |
| `epic prd approve <PRD-id\|path> [--squash]` | Merge the in-review PRD's integration PR and set its status to `done` |
| `epic prd sessions` | List active PRD agent sessions for this repo |

## Issue

Creation, sync, and housekeeping:

| Command | Description |
|---------|-------------|
| `epic issue new [title] [--no-sync]` | Create an issue (syncs to GitHub unless `--no-sync`) |
| `epic issue list [open\|closed]` | List issues |
| `epic issue show <id>` | Show issue details |
| `epic issue get <id>` | Download issue from GitHub |
| `epic issue sync push\|pull <id>` | Push/pull changes to/from GitHub |
| `epic issue assign <id> <user>` | Assign issue |
| `epic issue close <id>` | Close issue and clean up |
| `epic issue worktree <id>` | Create just a worktree (no tmux/agent) |

Agent-driven lifecycle (each takes `--provider`, most take `-b`):

| Command | Description |
|---------|-------------|
| `epic issue plan <id>` | Update the issue with an implementation plan |
| `epic issue execute <id>` | Implement the plan (resumes the plan's session) |
| `epic issue build <id> [--mode auto\|manual]` | Full loop: plan + execute + verify-fix. `manual` (default) leaves the issue "In Review" with the worktree kept |
| `epic issue verify <id> [-p PORT]` | Verify the issue in a browser via playwright |
| `epic issue fix <id>` | Fix failing scenarios from a prior verify |
| `epic issue interview <id>` | Interview the user and rewrite the issue in place |
| `epic issue review <id>` | Review the worktree diff vs main; write a `# Review` section |
| `epic issue pr <id>` | Push the branch and open/surface its GitHub PR |
| `epic issue merge <id>` | Agent-driven merge of the worktree branch into main |
| `epic issue approve <id>` | Approve an In-Review issue: agent-merge into main, mark Done |
| `epic issue attach\|stop <id>` | Attach to / stop a running session |
| `epic issue message <id> "<text>" [-b]` | Send a message to the issue's running agent (resumes the session) |
| `epic issue sessions` | List active tmux-backed agent sessions for this repo |

## Design

| Command | Description |
|---------|-------------|
| `epic design new [title] [--force]` | Create a blank `DESIGN.md` scaffold at the project root |
| `epic design generate [description] [-b]` | AI-generate `DESIGN.md` from a description |
| `epic design apply [-b]` | Apply `DESIGN.md` to the project via an agent |
| `epic design attach` / `epic design stop` | Attach to / end the project's design agent session |

## Prototype

| Command | Description |
|---------|-------------|
| `epic prototype new "<description>" [--web\|--terminal]` | Scaffold a numbered prototype folder + `prompt.md`; the agent writes `page.tsx` (web) or `screen.tsx` (terminal) |
| `epic prototype list` | List prototypes; Enter resumes a prototype's agent session |

## Preview (per-issue dev server)

| Command | Description |
|---------|-------------|
| `epic preview start\|stop\|url\|list <id>` | Start/stop/inspect a dev server running in an issue's worktree |

## Worktrees

| Command | Description |
|---------|-------------|
| `epic wt list [--paths]` | List git worktrees |
| `epic wt new <branch> [path]` | Create a worktree and print its path |
| `epic wt path <branch>` | Print a branch's worktree path |
| `epic wt switch <branch> [-c] [-x cmd -- args]` | Print/enter a worktree path, optionally run a command in it |
| `epic wt prune` / `epic wt remove [branch]` | Clean up stale refs / remove a worktree + branch |

## Other

- `epic` (no args) opens a live PRD dashboard; `epic menu` opens the categorized command menu.
- `epic debugger on\|off` — toggle Epic's line-by-line debugger (Variables Snapshot) by editing `.env`; usually triggers a server restart.
- `epic stage assign --stage "In Review" --user alice` — auto-assign a user when an issue reaches a stage.
- `epic login [name] [--url]`, `epic logout`, `epic whoami`, `epic profile` — authentication and saved credential profiles. Add `--as <profile>` to any command to run it under a specific profile once.
- Marketplace (hand issues to freelancers): `epic request`, `epic proposal`, `epic contract`, `epic payouts`, `epic admin`. Run `epic <cmd> --help` for each.

## Common Workflows

**PRD-driven build:**
```bash
epic prd generate "E-commerce platform"   # AI-draft a PRD (content saved to the DB)
epic prd break PRD-1                       # Create issues from it via the API
epic project build                         # Build all issues by dependency order
```

**Single issue, end to end:**
```bash
epic issue new "Add dark mode support"     # Create + sync to GitHub
epic issue build CLI-8                      # plan + execute + verify-fix loop
epic issue review CLI-8                     # Write a review of the diff
epic issue approve CLI-8                    # Merge into main and mark Done
```

**Prototype an idea:**
```bash
epic prototype new "Login page with email and password" --web
```

**Design system:**
```bash
epic design generate "dark fintech dashboard, minimal, Inter font, blue accent"
epic design apply
```
