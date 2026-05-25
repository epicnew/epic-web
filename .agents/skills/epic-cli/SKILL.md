---
name: epic-cli
description: Use the Epic CLI for project management, issue tracking, agent orchestration, and spec generation. Triggers on requests like "create a project", "start an issue", "start an agent", "generate a spec", or "break spec into issues".
---

# Epic CLI

## Overview

Epic CLI is a project and issue management tool that integrates with GitHub. It handles project creation, issue tracking with markdown files, AI agent orchestration, spec generation, and design token application.

## Commands

### Project Management

Create new projects with GitHub repository:

```bash
epic project new my-awesome-project
epic project new org/repo-name
epic project new my-web-app --web    # Use web template
epic project new                     # Interactive mode
```

### Issue Management

| Command | Description |
|---------|-------------|
| `epic issue new "Title"` | Create new issue with title |
| `epic issue new` | Create new issue interactively |
| `epic issue new --no-sync` | Create local issue without GitHub sync |
| `epic issue list` | List all issues |
| `epic issue list open` | List open issues |
| `epic issue list closed` | List closed issues |
| `epic issue show <id>` | Show issue details |
| `epic issue get <id>` | Download issue from GitHub |
| `epic issue sync push <id>` | Push local changes to GitHub |
| `epic issue sync pull <id>` | Pull GitHub changes to local |
| `epic issue start <id>` | Start working (creates worktree + tmux + claude) |
| `epic issue start <id> --no-switch` | Create session but don't switch to it |
| `epic issue start <id> --no-tmux` | Create worktree only (no tmux) |
| `epic issue start <id> --branch` | Create branch only (no worktree) |
| `epic issue assign <id> <user>` | Assign issue to user |
| `epic issue close <id>` | Close issue and cleanup |

Issue IDs can be: markdown file path, issue number, or prefix-number (e.g., `CLI-8`).

### Agent Management

Orchestrate AI agents that work on issues autonomously:

| Command | Description |
|---------|-------------|
| `epic agent start <input>` | Start agent from issue file or prompt |
| `epic agent list` | List all active agents |
| `epic agent send <id> <message>` | Send message to running agent |
| `epic agent pause <id>` | Pause agent (interrupt generation) |
| `epic agent cancel <id>` | Cancel agent (full cleanup) |
| `epic agent switch <id>` | Switch to agent's tmux session |

Starting an agent with a prompt auto-creates an issue:

```bash
epic agent start docs/issues/cli-8.md       # Start with existing issue
epic agent start "implement dark mode"      # Start with prompt (creates issue)
epic agent start cli-8.md --no-tmux         # Skip tmux session
epic agent start cli-8.md --no-switch       # Don't switch to tmux after creation
```

### Spec Generation

Generate project specs and break them into individual issues:

```bash
epic spec generate "A CLI tool for managing deployments"   # Generate spec from description
epic spec generate                                         # Interactive mode
epic spec break                                            # Break spec.md into issues
epic spec break ./docs/spec.md                             # Break custom spec file
```

### Style Application

Apply tweakcn design tokens to the project's globals.css:

```bash
epic style apply                      # Prompts for CSS input
epic style apply "paste css here"     # Applies provided CSS tokens
```

## Issue File Format

Issues are stored in `docs/issues/` with pattern `{prefix}-{number}-{slug}.md`. Contains:
- Title and GitHub issue number (if synced)
- Status
- Description
- Functional and Technical specifications
- Task checklist

## Common Workflows

**Full issue lifecycle:**
```bash
epic issue new "Add dark mode support"    # Create + sync to GitHub
epic issue start CLI-8                    # Worktree + tmux + claude
epic issue sync push CLI-8               # Push local changes
epic issue close CLI-8                    # Close + cleanup
```

**Delegate work to an agent:**
```bash
epic agent start docs/issues/cli-8.md    # Agent works on existing issue
epic agent list                          # Check progress
epic agent send cli-8 "fix the tests"   # Give agent feedback
epic agent cancel cli-8                  # Stop if needed
```

**Spec-driven development:**
```bash
epic spec generate "E-commerce platform"  # Generate spec.md
# Review and edit spec.md
epic spec break                           # Creates individual issue files
epic agent start docs/issues/ecom-1.md    # Start agents on each issue
```

**Review open issues:**
```bash
epic issue list open
epic issue show CLI-8
```
