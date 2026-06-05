'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { createUser } from './actions/create-user.action';
import { usersKeys, type UsersListData } from '../list-users/list-users.query';
import type { User } from '@/app/admin/users/state';

// Input validation schema
const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['user', 'admin']).optional().default('user'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export function useCreateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const result = await createUser(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.user;
    },
    onMutate: async (data: CreateUserFormData) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.lists() });
      const previous = queryClient.getQueriesData<UsersListData>({
        queryKey: usersKeys.lists(),
      });

      const tempUser: User = {
        id: `temp-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: true,
        image: null,
        banned: null,
        banReason: null,
        banExpires: null,
        pending: true,
      };
      queryClient.setQueriesData<UsersListData>(
        { queryKey: usersKeys.lists() },
        (old) =>
          old ? { users: [tempUser, ...old.users], total: old.total + 1 } : old
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
  const handleCreateUser = (rawData: unknown) => {
    const parsed = createUserSchema.safeParse(rawData);
    if (!parsed.success) {
      return Promise.reject(
        new Error(parsed.error.issues.map((e) => e.message).join(', '))
      );
    }
    return mutation.mutateAsync(parsed.data);
  };

  return {
    handleCreateUser,
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
