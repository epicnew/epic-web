'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUser } from './actions/delete-user.action';
import { usersKeys, type UsersListData } from '../list-users/list-users.query';

export function useDeleteUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await deleteUser({ userId });
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to delete user');
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
                users: old.users.filter((u) => u.id !== userId),
                total: Math.max(0, old.total - 1),
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
    handleDeleteUser: (userId: string) => mutation.mutateAsync(userId),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
