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

### Navigation & entry points (linking between pages)

When a task asks you to add an entry point — a link/button from one page to
another (e.g. "add a Contacts link on the home view") — use `next/link`:

```tsx
// Plain navigation link — works in BOTH Server and Client Components.
import Link from 'next/link';
<Link href="/contacts" className="text-primary underline-offset-4 hover:underline">
  Go to contacts
</Link>
```

To style that link as a button, render the real `Button` with `asChild` so it
applies its classes to the `Link` — but `Button` is a Client Component, so the
host must be a Client Component too:

```tsx
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
<Button asChild><Link href="/contacts">Go to contacts</Link></Button>
```

Do NOT call `buttonVariants({ ... })` directly in a Server Component to style a
link — `buttonVariants` is a client-only export and throws at render on the
server (see Constraints). The styleguide's `buttonVariants` "As Link" example is
client-only.

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
app/[page]/
  page.tsx                    # Server Component: prefetch + HydrationBoundary
  page-content.tsx            # Client Component: dialog/UI state, consumes hooks
  state.ts                    # Jotai atoms (UI state only)
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

### Server data (TanStack Query)
- items: Type[] - via useListItems() read hook

### Shared UI state (Jotai)
- uiState: Type - via atomName

## Children
- ChildComponent
- AnotherChild
```

## Implementation Pattern

Reads and writes are **separate hooks**, so they're usually separate components:
a list/table component consumes a `useQuery`-backed read hook; a dialog/form
consumes a `useMutation`-backed hook. Don't expect one hook to return both
`items` and `handleAction`.

### Read / list component

```typescript
'use client';

import { useListItems } from './behaviors/list-items/use-list-items';

export function ItemsList() {
  // isLoading from the read hook (isPending for always-on reads,
  // isLoading for enabled-gated ones — the hook decides).
  const { items, isLoading, error } = useListItems();

  if (isLoading) return <div data-testid="loading-spinner">Loading...</div>;
  if (error) return <div data-testid="error-message">{error}</div>;

  return (
    <div data-testid="items-list">
      {items.map((item) => (
        <div
          key={item.id}
          data-testid={`item-card-${item.id}`}
          // Optimistic rows carry `pending` — dim them until the server confirms.
          className={item.pending ? 'opacity-50' : undefined}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### Mutation / dialog component

`await handleX()` inside `try/catch` and toast — the rejected promise carries
both validation and server errors. (`isLoading` disables the submit button.)

```typescript
'use client';

import { useCreateItem } from './behaviors/create-item/use-create-item';
import { toast } from 'sonner';

export function CreateItemDialog({ open, onOpenChange }: Props) {
  const { handleCreateItem, isLoading } = useCreateItem();

  const onSubmit = async (data: unknown) => {
    try {
      await handleCreateItem(data);
      toast.success('Item created');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create item');
    }
  };

  return (
    <form data-testid="create-item-form" /* onSubmit -> onSubmit(...) */>
      <input data-testid="item-name-input" name="name" />
      <button data-testid="submit-button" type="submit" disabled={isLoading}>
        {isLoading ? 'Creating…' : 'Create'}
      </button>
    </form>
  );
}
```

For an **on-demand read** in a dialog, pass the open state into the read hook so
it only fetches when shown: `useItemSessions(item?.id, open)`.

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

## Hard-won practice notes

- **Many components can call the same read hook — no prop-drilling.** Both the page-content (for the error banner) and the data table call `useListUsers()`; TanStack dedupes by query key, so it's one fetch and one shared cache entry. Pass UI callbacks down, not server data.
- **A page with dialog `useState` cannot be a Server Component.** That's the reason for the split: `page.tsx` (Server, prefetch-only) wraps `*-content.tsx` (Client) that owns dialog/selection state. Don't try to add `useState` to the prefetching page.
- **Server Components are prefetch-only.** Prefetch into the query client and `dehydrate`; never `fetchQuery` and render the result server-side — let the client `useQuery` own the data, or hydration and the client diverge.
- **Mutations: catch the rejection, don't read `error`.** Dialogs do `await handleX(); toast.success()` / `catch { toast.error() }`. The hook's `error` field is only for inline display of the last error; the thrown rejection is the reliable path (it carries validation + server errors).
- **`isLoading` comes from the hook, not the component.** Render the hook's flag as-is; don't recompute loading from `data == null` (that breaks with `keepPreviousData` and hydration).
- **Optimistic rows carry a `pending` flag** — style them (dim/disable) so the UI reflects the in-flight state, and they reconcile on `onSettled`.

## Constraints

- NEVER import database clients in components
- NEVER call server actions directly - use hooks
- NEVER read the query cache directly from a component - go through a hook
- NEVER store server state in Jotai - use the query cache
- NEVER put business logic in components
- NEVER access window object in server components
- NEVER render query results server-side - Server Components only prefetch + hydrate
- NEVER call a function or value imported from a `'use client'` module (e.g. `buttonVariants`, `cva` helpers, hooks) inside a Server Component — it throws `Attempted to call X() from the server` at render. To link to another page styled as a button, use `<Button asChild><Link href="...">…</Link></Button>` from a Client Component, or make the host a Client Component. A bare `<Link>` (optionally with plain Tailwind classes) needs no client boundary and is fine in a Server Component.
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

### Server data (TanStack Query)
- (writes only - optimistic update handled inside useCreateProject)

### Shared UI state (Jotai)
- dialogOpen: boolean - via dialogAtom

## Children
- TextInput
- SubmitButton
```
