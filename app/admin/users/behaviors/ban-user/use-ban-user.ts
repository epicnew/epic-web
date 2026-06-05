'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { banUser } from './actions/ban-user.action';
import { usersKeys, type UsersListData } from '../list-users/list-users.query';

export interface BanUserData {
  userId: string;
  banReason?: string;
  banExpiresInDays?: number; // Convert to seconds in the hook
}

export function useBanUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: BanUserData) => {
      const banExpiresIn = data.banExpiresInDays
        ? data.banExpiresInDays * 24 * 60 * 60
        : undefined;
      const result = await banUser({
        userId: data.userId,
        banReason: data.banReason,
        banExpiresIn,
      });
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to ban user');
      }
    },
    onMutate: async (data: BanUserData) => {
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
                    ? {
                        ...u,
                        banned: true,
                        banReason: data.banReason || null,
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
    handleBanUser: (data: BanUserData) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
