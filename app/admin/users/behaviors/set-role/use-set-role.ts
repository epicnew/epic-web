'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setRole } from './actions/set-role.action';
import { usersKeys, type UsersListData } from '../list-users/list-users.query';

export interface SetRoleData {
  userId: string;
  role: 'user' | 'admin';
}

export function useSetRole() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: SetRoleData) => {
      const result = await setRole(data);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to update role');
      }
    },
    onMutate: async (data: SetRoleData) => {
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
                  u.id === data.userId
                    ? { ...u, role: data.role, pending: true }
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
    handleSetRole: (data: SetRoleData) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
