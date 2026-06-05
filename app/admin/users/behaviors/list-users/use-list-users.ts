"use client";

import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { listUsersQuery } from "./list-users.query";
import {
  usersPageAtom,
  usersLimitAtom,
  usersSearchAtom,
  usersRoleFilterAtom,
  usersSortByAtom,
  usersSortDirectionAtom,
} from "@/app/admin/users/state";

// Server state for the users list now lives in the TanStack Query cache.
// The Jotai param atoms (UI state) feed the query key, so changing page,
// search, filter, or sort automatically refetches the matching query.
export function useListUsers() {
  const page = useAtomValue(usersPageAtom);
  const limit = useAtomValue(usersLimitAtom);
  const search = useAtomValue(usersSearchAtom);
  const roleFilter = useAtomValue(usersRoleFilterAtom);
  const sortBy = useAtomValue(usersSortByAtom);
  const sortDirection = useAtomValue(usersSortDirectionAtom);

  const query = useQuery(
    listUsersQuery({ page, limit, search, roleFilter, sortBy, sortDirection })
  );

  return {
    users: query.data?.users ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isPending,
    error: query.error ? (query.error as Error).message : null,
  };
}
