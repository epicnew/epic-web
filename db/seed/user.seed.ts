// Static resolver for the generated seed credentials — no longer a generated
// file. `bun run db:seed` writes db/seed/.credentials/user-seeds.<db>.json
// for the database it targeted; this module exports the set matching the
// CURRENT process's DATABASE_URL, so tests running against test.db never read
// credentials that belong to development.db. (The old generated single file
// aliased both databases and drifted: stale ids after a wipe, stale passwords
// after a regeneration.)
//
// Empty array = that database was never seeded — run `bun run db:seed` with
// the intended DATABASE_URL.
import { loadUserSeeds, type UserSeed } from "./seed-store";

export type { UserSeed };

export const userSeeds: UserSeed[] = loadUserSeeds();
