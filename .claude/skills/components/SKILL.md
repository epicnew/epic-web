---
name: components
description: Write React components following the Epic architecture patterns. Use when creating page components, UI components, or refactoring components to follow the three-layer architecture. Triggers on "create a component", "add a component", or "write a component for".
---

# Components

## Overview

This skill creates React components that follow the Epic three-layer architecture. Components belong to the **Frontend layer** and handle UI rendering only - all logic is delegated to hooks.

## Architecture Context

```
page.tsx (Server Component)      -> prefetch + HydrationBoundary
  └─ PageContent (Client)        -> Components -> Hooks
                                       Hooks -> TanStack Query (server state)
                                              -> Jotai atoms (UI state only)
```

Components:
- Only render UI and consume hooks
- NO direct server actions or data fetching
- NO business logic
- Use TypeScript interfaces for props
- MUST add `data-testid` attributes for testing

### Page Server Component + prefetch

A page that renders a read is a **Server Component** that prefetches the query
and hydrates a client content component. Keep the page prefetch-only; put the
interactive UI (dialog state, hook calls) in the `*-content.tsx` client child.

```tsx
// page.tsx (Server Component — no 'use client')
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/get-query-client';
import { listItemsQuery, defaultParams } from './behaviors/list-items/list-items.query';
import { PageContent } from './page-content';

export default async function Page() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(listItemsQuery(defaultParams));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContent />
    </HydrationBoundary>
  );
}
```

The client component consumes the data through a `useQuery` hook — it never
reads the cache directly. Default prefetch params must match the client's first
render so the hydrated query key matches.

## Before Writing a Component

1. **Read `docs/DESIGN.md`** to find where components and tokens are defined
2. **Check if it already exists**: Review `app/styleguide/navigation.ts`
3. **Use existing primitives**: Compose from components in `components/` subdirectories
4. **Use design tokens**: Use Tailwind semantic classes mapped to CSS variables

## Design Token Usage

**Read `app/globals.css`** to see all available semantic tokens.

Use Tailwind classes mapped to CSS variables (e.g., `bg-primary`, `text-muted-foreground`, `border-border`).

**Never use** hardcoded colors like `bg-gray-100`, `text-black`, `#ffffff`, or `rgb(...)`.

The token names in `globals.css` map directly to Tailwind classes:
- `--primary` → `bg-primary`, `text-primary`
- `--muted-foreground` → `text-muted-foreground`
- `--border` → `border-border`

## When Creating New Shared Components

If a component doesn't exist and should be reusable:
1. Create it in `components/ui/[component-name].tsx`
2. Add a styleguide page at `app/styleguide/components/[component-name]/page.tsx`
3. Update `app/styleguide/navigation.ts` with the new component (include description)
4. Follow the styleguide page pattern with "Notes for the AI" section

## Component Location

```
app/[role]/[page]/
  page.tsx                    # Next.js page
  state.ts                    # Jotai atoms
  components/                 # Page-specific components
    component-name.tsx
```

## Component Specification Format

Follow the Epic Component specification format from `references/specification.md`:

```markdown
# ComponentName

[Short description of what this component renders]

## Props
- propName: Type - description

## State

### Local
- localState: Type

### Shared
- sharedState: Type - via atomName

## Children
- ChildComponent
- AnotherChild
```

## Implementation Pattern

```typescript
'use client';

import { useBehaviorName } from './behaviors/behavior-name/hooks/use-behavior-name';

interface ComponentNameProps {
  onSuccess?: (data: DataType) => void;
}

export function ComponentName({ onSuccess }: ComponentNameProps) {
  const { items, isPending, error, handleAction } = useBehaviorName();

  if (isPending) {
    return <div data-testid="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error-message">{error}</div>;
  }

  return (
    <div data-testid="component-container">
      <div data-testid="items-list">
        {items.map(item => (
          <div key={item.id} data-testid={`item-card-${item.id}`}>
            {item.name}
          </div>
        ))}
      </div>
      <button
        data-testid="action-button"
        onClick={() => handleAction()}
      >
        Action
      </button>
    </div>
  );
}
```

## Test ID Guidelines

### Always Add data-testid To:

1. **Interactive Elements**:
```tsx
<button data-testid="add-item-button">Add</button>
<input data-testid="item-name-input" />
<select data-testid="item-status-select" />
```

2. **State-Dependent Elements**:
```tsx
<div data-testid="items-list">{/* list */}</div>
{isLoading && <div data-testid="loading-spinner" />}
{error && <div data-testid="error-message">{error}</div>}
<span data-testid="item-count">{items.length}</span>
```

3. **Form Elements and Containers**:
```tsx
<form data-testid="add-item-form" />
<dialog data-testid="edit-item-modal" />
```

### Test ID Naming Conventions

- **Buttons**: `[action]-[entity]-button` (e.g., `add-problem-button`)
- **Inputs**: `[entity]-[field]-input` (e.g., `problem-title-input`)
- **Lists**: `[entity-plural]-list` (e.g., `problems-list`)
- **Cards/Items**: `[entity]-card-[id]` (e.g., `problem-card-123`)
- **Modals**: `[action]-[entity]-modal` (e.g., `edit-problem-modal`)
- **Forms**: `[action]-[entity]-form` (e.g., `add-problem-form`)
- **States**: `loading-spinner`, `error-message`, `success-toast`
- **Counts**: `[entity]-count` (e.g., `problem-count`)

## State Management

Server state (lists, records) comes from hooks backed by TanStack Query — never
store it in Jotai. `state.ts` holds **UI state only** (dialogs, selections,
filter/sort/page inputs that feed query keys):

```typescript
import { atom } from 'jotai';

// UI state only — server data lives in the TanStack Query cache.
export const pageAtom = atom(1);
export const searchAtom = atom('');
export const dialogAtom = atom<'add' | 'edit' | null>(null);
```

## Constraints

- NEVER import database clients in components
- NEVER call server actions directly - use hooks
- NEVER read the query cache directly from a component - go through a hook
- NEVER store server state in Jotai - use the query cache
- NEVER put business logic in components
- NEVER access window object in server components
- ALWAYS delegate state management to hooks
- ALWAYS add data-testid for interactive and state elements

## Example Specification

```markdown
# CreateProjectForm

Renders the form used to create a new project with a name input and submit button.

## Props
- onSuccess: (project: Project) => void - optional callback after creation

## State

### Local
- (none - delegated to hook)

### Shared
- projects: Project[] - via useProjects atom

## Children
- TextInput
- SubmitButton
```
