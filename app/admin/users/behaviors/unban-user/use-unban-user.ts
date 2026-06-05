'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unbanUser } from './actions/unban-user.action';
import { usersKeys, type UsersListData } from '../list-users/list-users.query';

export function useUnbanUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await unbanUser({ userId });
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to unban user');
      }
    },
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.lists() });
      const previous = queryClient.getQueriesData<UsersListData>({
        queryKey: usersKeys.lists(),
      });

      queryClient.setQueriesData<UsersListData>(
        { queryKey: usersKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                users: old.users.map((u) =>
                  u.id === userId
                    ? {
                        ...u,
                        banned: false,
                        banReason: null,
                        banExpires: null,
                        pending: true,
                      }
                    : u
                ),
              }
            : old
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });

  return {
    handleUnbanUser: (userId: string) => mutation.mutateAsync(userId),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
