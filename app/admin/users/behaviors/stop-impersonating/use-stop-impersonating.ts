'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stopImpersonating } from './actions/stop-impersonating.action';
import { usersKeys } from '../list-users/list-users.query';
import { sessionsKeys } from '../list-sessions/list-sessions.query';

export function useStopImpersonating() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      // Server action redirects on success.
      const result = await stopImpersonating();
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to stop impersonating');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      queryClient.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });

  return {
    handleStopImpersonating: () => mutation.mutateAsync(),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
