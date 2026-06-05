import { queryOptions } from '@tanstack/react-query';
import { listSessions } from './actions/list-sessions.action';
import type { Session } from '@/app/admin/users/state';

export const sessionsKeys = {
  all: ['sessions'] as const,
  list: (userId: string) => [...sessionsKeys.all, 'list', userId] as const,
};

export function listSessionsQuery(userId: string) {
  return queryOptions({
    queryKey: sessionsKeys.list(userId),
    queryFn: async (): Promise<Session[]> => {
      const result = await listSessions({ userId });
      if (result.error) {
        throw new Error(result.error);
      }
      return result.sessions;
    },
  });
}
