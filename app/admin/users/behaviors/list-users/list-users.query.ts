import { queryOptions } from '@tanstack/react-query';
import { listUsers, type ListUsersInput } from './actions/list-users.action';
import type { User } from '@/app/admin/users/state';

// Parameters that drive a users-list query. These come from Jotai UI-state
// atoms (page/search/sort) and become part of the query key.
export interface ListUsersParams {
  page: number;
  limit: number;
  search: string;
  roleFilter: string | undefined;
  sortBy: string | undefined;
  sortDirection: 'asc' | 'desc';
}

export interface UsersListData {
  users: User[];
  total: number;
}

// Default params used for the server prefetch. Must match the initial values
// of the param atoms so the prefetched query key matches the client's first render.
export const defaultUsersParams: ListUsersParams = {
  page: 1,
  limit: 10,
  search: '',
  roleFilter: undefined,
  sortBy: undefined,
  sortDirection: 'asc',
};

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: ListUsersParams) => [...usersKeys.lists(), params] as const,
};

function buildInput(params: ListUsersParams): ListUsersInput {
  const offset = (params.page - 1) * params.limit;
  const input: ListUsersInput = {
    limit: params.limit,
    offset,
    sortDirection: params.sortDirection || 'asc',
  };

  if (params.search && params.search.trim()) {
    input.searchValue = params.search.trim();
    input.searchField = 'email';
    input.searchOperator = 'contains';
  }

  if (params.roleFilter) {
    input.filterField = 'role';
    input.filterValue = params.roleFilter;
    input.filterOperator = 'eq';
  }

  if (params.sortBy) {
    input.sortBy = params.sortBy;
    input.sortDirection = params.sortDirection || 'asc';
  }

  return input;
}

export function listUsersQuery(params: ListUsersParams) {
  return queryOptions({
    queryKey: usersKeys.list(params),
    queryFn: async (): Promise<UsersListData> => {
      const result = await listUsers(buildInput(params));
      if (result.error) {
        throw new Error(result.error);
      }
      return { users: result.users, total: result.total };
    },
  });
}
