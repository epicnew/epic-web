'use client';

import { useMutation } from '@tanstack/react-query';
import { setPassword } from './actions/set-password.action';

export interface SetPasswordData {
  userId: string;
  newPassword: string;
}

export function useSetPassword() {
  // No optimistic update: a password change has no representation in any
  // cached list, so this is a plain mutation.
  const mutation = useMutation({
    mutationFn: async (data: SetPasswordData) => {
      const result = await setPassword(data);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Failed to reset password');
      }
    },
  });

  return {
    handleSetPassword: (data: SetPasswordData) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
