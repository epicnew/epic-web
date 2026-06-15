import "./vitest.env"; // MUST be first — sets DATABASE_URL=":memory:" before "@/db" is imported
import "@testing-library/jest-dom/vitest";
import { expand } from "dotenv-expand";
import { config } from "dotenv";
import { beforeAll, beforeEach, vi } from "vitest";

// Load .env for non-DB vars (BETTER_AUTH_SECRET, NEXT_PUBLIC_BASE_URL, …).
// DATABASE_URL stays ":memory:" from ./vitest.env: `.env` is loaded without
// override, and .env.test must not define DATABASE_URL (see vitest.env.ts).
expand(config({ path: ".env" }));
expand(config({ path: ".env.test", override: true }));

import { sql } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";

// Mock server-only package (used by Next.js server actions)
vi.mock("server-only", () => ({}));

// Set required environment variables for Better Auth
process.env.NEXT_PUBLIC_BASE_URL ??= "http://localhost:8080";
process.env.BETTER_AUTH_SECRET ??= "test-secret-key-for-testing-only-32-chars-min";

// Extract table names from Drizzle schema
const TABLE_SYMBOL = Symbol.for("drizzle:IsDrizzleTable");
const NAME_SYMBOL = Symbol.for("drizzle:Name");

const tableNames = Object.values(schema)
  .filter((t) => !!(t as unknown as Record<symbol, unknown>)?.[TABLE_SYMBOL])
  .map((t) => (t as unknown as Record<symbol, unknown>)[NAME_SYMBOL] as string);

// Push schema before all tests
beforeAll(async () => {
  const { pushSQLiteSchema } = await import("drizzle-kit/api");
  const { apply } = await pushSQLiteSchema(schema, db);
  await apply();
}, 20000);

// Clean all tables before each test
beforeEach(async () => {
  await db.run(sql`PRAGMA foreign_keys = OFF`);
  for (const name of tableNames) {
    await db.run(sql.raw(`DELETE FROM "${name}"`));
  }
  await db.run(sql`PRAGMA foreign_keys = ON`);
});
