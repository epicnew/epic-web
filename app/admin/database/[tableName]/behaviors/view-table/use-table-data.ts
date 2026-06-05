"use client";

import { useState, useCallback, useRef } from "react";
import { useAtom } from "jotai";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { sortAtom, filterAtom } from "../../state";
import { tableDataQuery, tableDataKeys } from "./view-table.query";

const DEBOUNCE_MS = 300;

export function useTableData(tableName: string) {
  const queryClient = useQueryClient();
  const [sort, setSort] = useAtom(sortAtom);
  const [filter, setFilter] = useAtom(filterAtom);
  const [localPage, setLocalPage] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Server state lives in the query cache; sort/filter (atoms) and localPage
  // feed the query key, so changing any of them refetches automatically.
  const query = useQuery({
    ...tableDataQuery(tableName, { page: localPage, sort, filter }),
    placeholderData: keepPreviousData,
  });

  const data = query.data;

  // Debounced filter change handler
  const handleFilterChange = useCallback((newFilter: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setFilter(newFilter);
      setLocalPage(1); // Reset to first page on filter change
    }, DEBOUNCE_MS);
  }, [setFilter]);

  // Sort handler - cycles through asc -> desc -> null
  const handleSortChange = useCallback((column: string) => {
    setSort((prev) => {
      if (!prev || prev.column !== column) {
        return { column, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { column, direction: "desc" };
      }
      return null;
    });
    setLocalPage(1); // Reset to first page on sort change
  }, [setSort]);

  // Page change handler
  const handleGoToPage = useCallback((page: number) => {
    setLocalPage(page);
  }, []);

  // Refresh function
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: tableDataKeys.table(tableName) });
  }, [queryClient, tableName]);

  return {
    rows: data?.rows ?? [],
    columns: data?.columns ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? localPage,
    totalPages: data?.totalPages ?? 0,
    isLoading: query.isPending,
    error: query.error ? (query.error as Error).message : null,
    sort,
    filter,
    handleSortChange,
    handleFilterChange,
    handleGoToPage,
    handleRefresh,
  };
}
