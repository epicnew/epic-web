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
    mutationFn: async (data: UpdateUserFormData) => {
      const result = await updateUser(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.user;
    },
    onMutate: async (data: UpdateUserFormData) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.lists() });
      const previous = queryClient.getQueriesData<UsersListData>({
        queryKey: usersKeys.lists(),
      });

      const { userId, email, name, role } = data;
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

  // Validate once at the call site; the action and the optimistic update both
  // receive already-parsed data.
  const handleUpdateUser = (rawData: unknown) => {
    const parsed = updateUserSchema.safeParse(rawData);
    if (!parsed.success) {
      return Promise.reject(
        new Error(parsed.error.issues.map((e) => e.message).join(', '))
      );
    }
    return mutation.mutateAsync(parsed.data);
  };

  return {
    handleUpdateUser,
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
