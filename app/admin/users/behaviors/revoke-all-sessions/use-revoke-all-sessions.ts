'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { revokeAllSessions } from './actions/revoke-all-sessions.action';
import { sessionsKeys } from '../list-sessions/list-sessions.query';
import type { Session } from '@/app/admin/users/state';

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await revokeAllSessions({ userId });
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to revoke all sessions');
      }
    },
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: sessionsKeys.list(userId) });
      const previous = queryClient.getQueryData<Session[]>(
        sessionsKeys.list(userId)
      );

      queryClient.setQueryData<Session[]>(sessionsKeys.list(userId), []);

      return { previous, userId };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(
          sessionsKeys.list(context.userId),
          context.previous
        );
      }
    },
    onSettled: (_data, _err, userId) => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.list(userId) });
    },
  });

  return {
    handleRevokeAllSessions: (userId: string) => mutation.mutateAsync(userId),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
