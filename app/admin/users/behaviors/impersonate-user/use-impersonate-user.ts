'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { impersonateUser } from './actions/impersonate-user.action';
import { usersKeys } from '../list-users/list-users.query';
import { sessionsKeys } from '../list-sessions/list-sessions.query';

export function useImpersonateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      // Server action redirects on success.
      const result = await impersonateUser({ userId });
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to impersonate user');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      queryClient.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });

  return {
    handleImpersonateUser: (userId: string) => mutation.mutateAsync(userId),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
