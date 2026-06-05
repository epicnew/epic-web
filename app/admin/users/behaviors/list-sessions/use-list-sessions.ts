'use client';

import { useQuery } from '@tanstack/react-query';
import { listSessionsQuery } from './list-sessions.query';

// Reads a user's active sessions. Enabled only when a userId is present and
// the consumer asks for it (e.g. the sessions dialog is open), so we don't
// fetch until needed.
export function useListSessions(userId: string | undefined, enabled: boolean) {
  const query = useQuery({
    ...listSessionsQuery(userId ?? ''),
    enabled: enabled && !!userId,
  });

  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
  };
}
