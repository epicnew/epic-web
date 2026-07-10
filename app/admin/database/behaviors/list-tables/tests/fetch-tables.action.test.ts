import { describe, it, expect, beforeEach, vi } from "vitest";

// These actions gate on getUser() -> next/headers, which only exists inside a
// real request scope. Mock both (same pattern as the admin/users tests) so the
// action logic runs under vitest.
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));
vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual("@/lib/auth");
  return {
    ...actual,
    getUser: vi.fn(() =>
      Promise.resolve({ user: { id: "admin-test", role: "admin" } }),
    ),
  };
});
import { db } from "@/db";
import * as schema from "@/db/schema";
import { PreDB } from "@/lib/db-test";
import { fetchTables } from "../fetch-tables.action";

describe("fetchTables action", () => {
  beforeEach(async () => {
    await PreDB(db, schema, {
      user: [],
      session: [],
      account: [],
      verification: [],
    });
  });

  it("should return all tables with row counts", async () => {
    const tables = await fetchTables();

    expect(tables.length).toBeGreaterThanOrEqual(4);

    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain("user");
    expect(tableNames).toContain("session");
    expect(tableNames).toContain("account");
    expect(tableNames).toContain("verification");
  });

  it("should return correct row counts", async () => {
    const now = new Date();

    await PreDB(db, schema, {
      user: [
        {
          id: "user-1",
          email: "user1@example.com",
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "user-2",
          email: "user2@example.com",
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      session: [
        {
          id: "session-1",
          userId: "user-1",
          token: "token-1",
          expiresAt: new Date(now.getTime() + 3600000),
          createdAt: now,
          updatedAt: now,
        },
      ],
    });

    const tables = await fetchTables();

    const userTable = tables.find((t) => t.name === "user");
    const sessionTable = tables.find((t) => t.name === "session");

    expect(userTable?.rowCount).toBe(2);
    expect(sessionTable?.rowCount).toBe(1);
  });

  it("should return zero counts for empty tables", async () => {
    const tables = await fetchTables();

    tables.forEach((table) => {
      expect(table.rowCount).toBe(0);
    });
  });
});
