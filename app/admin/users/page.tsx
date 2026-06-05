import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import {
  listUsersQuery,
  defaultUsersParams,
} from "./behaviors/list-users/list-users.query";
import { UsersPageContent } from "./users-page-content";

// Server Component: prefetch the default users list and hand the dehydrated
// cache to the client so the table renders without a loading flash.
export default async function AdminUsersPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(listUsersQuery(defaultUsersParams));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersPageContent />
    </HydrationBoundary>
  );
}
