---
name: hooks
description: Write React hooks following the Epic architecture patterns. Use when creating custom hooks for state management, server action calls, optimistic updates, and validation. Triggers on "create a hook", "add a hook", or "write a hook for".
---

# Hooks

## Overview

This skill creates React hooks that follow the Epic three-layer architecture. Hooks belong to the **Frontend layer**. Server state is owned by **TanStack Query** (`useQuery`/`useMutation`); **Jotai is retained for UI state only** (dialogs, selections, filter/sort/page inputs).

## Architecture Context

```
Frontend (Browser): Components -> Hooks -> TanStack Query cache (server state)
                          |                 Jotai atoms (UI state only)
                          v
Backend (Server): Actions (atomic) OR Routes (streaming)
```

Hooks:
- Run in the browser (Frontend layer)
- Read server state with `useQuery`; write it with `useMutation`
- Use Jotai atoms ONLY for UI state — never for server data
- Validate inputs with Zod
- Call ONE backend entry point (Action or Route, never both) as the `queryFn`/`mutationFn`
- Handle optimistic updates and rollback through the query cache
- NEVER access database or import server-only code

### Read vs Write

- **Read** → `useQuery` with a `[name].query.ts` options file (shared `queryKey` + `queryFn`). The page Server Component prefetches it and hydrates via `HydrationBoundary`.
- **Write** → `useMutation`, optimistic by default (`onMutate` snapshot, `onError` rollback, `onSettled` invalidate). Mutations with no list representation are plain mutations.

### Backend Entry Point Rule

Each hook calls exactly ONE backend entry point:

**Action** (default):
- Import and call directly
- Most behaviors
- Simpler mental model

**Route**:
- Call via `fetch` or `fetchEventSource`
- Streaming/SSE, webhooks, HTTP semantics needed
- Supports both request/response and streaming

Never call both. Never call multiple endpoints.

## Hook Location and Naming

```
app/[role]/[page]/behaviors/[behavior-name]/
  hooks/
    use-[behavior-name].ts    # Hook file
  actions/
    [action-name].action.ts   # Server action it calls
```

- File names start with `use-` and match the exported function
- Behavior folders use kebab-case

## Hook Specification Format

Follow the Epic Hook specification format:

```markdown
## useHookName(params?: ParamType)

[Short description of what stateful logic this hook encapsulates]

### Parameters
- paramName: Type - description

### State
- stateName: Type
- anotherState: Type

### Returns
- value: Type - description
- action: () => void - description

### Dependencies
- useOtherHook - why it's needed
```

## Implementation Pattern

### Query options file (`[name].query.ts`)

```typescript
import { queryOptions } from '@tanstack/react-query';
import { listItems } from './actions/list-items.action';

export const itemsKeys = {
  all: ['items'] as const,
  lists: () => [...itemsKeys.all, 'list'] as const,
  list: (params: ListParams) => [...itemsKeys.lists(), params] as const,
};

export function listItemsQuery(params: ListParams) {
  return queryOptions({
    queryKey: itemsKeys.list(params),
    queryFn: async () => {
      const result = await listItems(params);   // the Action
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
}
```

### Read hook (`useQuery`)

```typescript
'use client';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { listItemsQuery } from './list-items.query';
import { pageAtom, searchAtom } from '@/app/[role]/[page]/state'; // UI state

export function useListItems() {
  // UI-state atoms feed the query key.
  const page = useAtomValue(pageAtom);
  const search = useAtomValue(searchAtom);

  const query = useQuery(listItemsQuery({ page, search }));

  return {
    items: query.data?.items ?? [],
    isLoading: query.isPending,
    error: query.error ? (query.error as Error).message : null,
  };
}
```

The page Server Component prefetches and hydrates:

```tsx
// page.tsx (Server Component)
const queryClient = getQueryClient();
await queryClient.prefetchQuery(listItemsQuery(defaultParams));
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <PageContent />
  </HydrationBoundary>
);
```

### Mutation hook (`useMutation`, optimistic)

Preserve a `{ handleX, isLoading, error }` shape so components stay untouched.

```typescript
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { createItem } from './actions/create-item.action';
import { itemsKeys } from '../list-items/list-items.query';

const InputSchema = z.object({ name: z.string().min(1).max(100) });

export function useCreateItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (raw: unknown) => {
      const parsed = InputSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
      }
      const result = await createItem(parsed.data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (raw) => {
      await queryClient.cancelQueries({ queryKey: itemsKeys.lists() });
      const previous = queryClient.getQueriesData({ queryKey: itemsKeys.lists() });
      const parsed = InputSchema.safeParse(raw);
      if (parsed.success) {
        queryClient.setQueriesData({ queryKey: itemsKeys.lists() }, (old: any) =>
          old
            ? { ...old, items: [{ ...parsed.data, id: `temp-${Date.now()}`, pending: true }, ...old.items] }
            : old
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx: any) =>
      ctx?.previous?.forEach(([key, data]: any) => queryClient.setQueryData(key, data)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: itemsKeys.all }),
  });

  return {
    handleCreateItem: (raw: unknown) => mutation.mutateAsync(raw),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
```

Mutations with no list representation (e.g. set-password, redirect-on-success) are plain mutations — no `onMutate`/`onError` cache work.

## Route Consumption Patterns

### Non-Streaming Route

```typescript
import { useAtom } from 'jotai';
import { useState } from 'react';

export function useRouteBehavior() {
  const [result, setResult] = useAtom(resultAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: Input) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/page/behaviors/behavior-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, error, handleSubmit };
}
```

### Streaming Route (SSE)

```typescript
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAtom } from 'jotai';
import { useState, useRef } from 'react';

export function useStreamingBehavior() {
  const [result, setResult] = useAtom(resultAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async (input: Input) => {
    setIsLoading(true);
    setError(null);
    setResult('');

    abortControllerRef.current = new AbortController();

    await fetchEventSource(`/page/behaviors/behavior-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: abortControllerRef.current.signal,

      onmessage(event) {
        switch (event.event) {
          case 'token':
            setResult(prev => prev + event.data);
            break;
          case 'complete':
            setIsLoading(false);
            break;
          case 'error':
            setError(event.data);
            setIsLoading(false);
            break;
        }
      },

      onclose() {
        setIsLoading(false);
      },

      onerror(err) {
        setError('Connection failed');
        setIsLoading(false);
      },
    });
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  return { result, isLoading, error, handleGenerate, handleCancel };
}
```

### Key Differences

| Aspect | Action | Route | Streaming Route |
|--------|--------|-------|-----------------|
| Import | Action function | `fetch` | `fetchEventSource` |
| Call | `await action(input)` | `await fetch(url)` | `await fetchEventSource(url)` |
| Response | Single result | Single result | Multiple events |
| Cancellation | Not supported | Not typical | Via `AbortController` |

---

## Key Patterns

### 1. Validation First
- Always validate input with Zod schemas before operations
- Use `safeParse` and handle validation errors gracefully
- Return early with error messages for invalid input

### 2. Optimistic Updates (via the query cache)
- `onMutate`: cancel in-flight queries, snapshot with `getQueriesData`, apply the optimistic change with `setQueriesData` (temp id, `pending: true`)
- `onError`: restore the snapshot
- `onSettled`: `invalidateQueries` to reconcile with the server

### 3. Error Handling
- Surface `mutation.error` / `query.error` as a string; `isPending` for loading
- Throw inside `mutationFn` so callers (`mutateAsync`) reject and components can `try/catch`
- Provide descriptive error messages

### 4. State Management
- Server state lives in the TanStack Query cache — never in Jotai
- Use Jotai atoms (from `state.ts`) ONLY for UI state; filter/sort/page atoms feed query keys
- Return a consistent shape: reads `{ data, isLoading, error }`; mutations `{ handleX, isLoading, error }`

### 5. Server Action Calls
- Actions are the `queryFn`/`mutationFn` (import from `./actions/[name].action`)
- Throw on `result.error` so the query/mutation enters its error state
- Never call actions directly from components

## Constraints

- NEVER import database clients or models
- NEVER store server state in Jotai — use the query cache
- NEVER call more than one backend entry point (action or route)
- NEVER put business logic in hooks - that belongs in actions/routes
- ALWAYS include both loading and error states (`isPending`/`error`)
- ALWAYS validate input with Zod inside the `mutationFn`
- ALWAYS make list mutations optimistic (`onMutate`/`onError`/`onSettled`); plain mutations otherwise
- ALWAYS support cancellation for streaming behaviors (routes)

## Example Specification

```markdown
## useCreateProject()

Entry point for the Create Project behavior. Validates input, performs optimistic updates, and calls the server action.

### State
- isLoading: boolean
- error: string | null

### Returns
- handleCreateProject: (name: string) => Promise<void> - triggers the behavior
- isLoading: boolean - submission in progress
- error: string | null - current error message

### Dependencies
- useSetAtom(projectsAtom) - for optimistic updates

### Example: Create project successfully

#### PreState
projectsAtom: []
isLoading: false
error: null

#### Steps
* Call: handleCreateProject("New Project")
* Returns: void

#### PostState
projectsAtom: [{ id: "1", name: "New Project", status: "draft", pending: false }]
isLoading: false
error: null

### Example: Reject empty name

#### PreState
projectsAtom: []
isLoading: false
error: null

#### Steps
* Call: handleCreateProject("")
* Throws: "Name is required"

#### PostState
projectsAtom: []
isLoading: false
error: "Name is required"
```

## Test Generation

Generate test files at `[behavior-path]/tests/use-[behavior-name].test.tsx`.

### Test Structure

Wrap the hook in a `QueryClientProvider` with retries disabled. Use a fresh
`QueryClient` per test so cache state never leaks between tests.

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { useCreateItem } from '../use-create-item';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>{children}</JotaiProvider>
    </QueryClientProvider>
  );
}

describe('useCreateItem', () => {
  it('creates an item', async () => {
    const { result } = renderHook(() => useCreateItem(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleCreateItem({ name: 'New Item' });
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});
```

### Translation Rules

| Spec | Test |
|------|------|
| PreState | Seed the cache with `queryClient.setQueryData(...)` if needed |
| `Call:` | `await result.current.handleX(...)` |
| `Returns:` | Verify the promise resolves / cache updated |
| `Throws:` | `await expect(result.current.handleX(...)).rejects` or assert `result.current.error` |
| PostState | Assert returned `data`/`error`, or read `queryClient.getQueryData(...)` |

### Principles

- Fresh `QueryClient` per test; `retry: false`
- Test state transitions and cache effects, not the database
- Mock server actions if needed (hooks don't touch DB directly)
- Start with ONE test (happy path)
