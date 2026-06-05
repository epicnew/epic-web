'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { revokeSession } from './actions/revoke-session.action';
import { sessionsKeys } from '../list-sessions/list-sessions.query';
import type { Session } from '@/app/admin/users/state';

export function useRevokeSession() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (sessionToken: string) => {
      const result = await revokeSession({ sessionToken });
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to revoke session');
      }
    },
    onMutate: async (sessionToken: string) => {
      await queryClient.cancelQueries({ queryKey: sessionsKeys.all });
      const previous = queryClient.getQueriesData<Session[]>({
        queryKey: sessionsKeys.all,
      });

      queryClient.setQueriesData<Session[]>(
        { queryKey: sessionsKeys.all },
        (old) => (old ? old.filter((s) => s.token !== sessionToken) : old)
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });

  return {
    handleRevokeSession: (sessionToken: string) =>
      mutation.mutateAsync(sessionToken),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
