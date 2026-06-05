'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { updateUser } from './actions/update-user.action';
import { usersKeys, type UsersListData } from '../list-users/list-users.query';

// Input validation schema
const updateUserSchema = z.object({
  userId: z.string(),
  email: z.string().email('Invalid email').optional(),
  name: z.string().min(1, 'Name cannot be empty').optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (rawData: unknown) => {
      const parsed = updateUserSchema.safeParse(rawData);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
      }
      const result = await updateUser(parsed.data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.user;
    },
    onMutate: async (rawData: unknown) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.lists() });
      const previous = queryClient.getQueriesData<UsersListData>({
        queryKey: usersKeys.lists(),
      });

      const parsed = updateUserSchema.safeParse(rawData);
      if (parsed.success) {
        const { userId, email, name, role } = parsed.data;
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
                          ...(email && { email }),
                          ...(name && { name }),
                          ...(role && { role }),
                          pending: true,
                        }
                      : u
                  ),
                }
              : old
        );
      }

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
    handleUpdateUser: (rawData: unknown) => mutation.mutateAsync(rawData),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
