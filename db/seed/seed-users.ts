import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../index";
import { user } from "../schema";
import { loadUserSeeds, saveUserSeeds, type UserSeed } from "./seed-store";

export type { UserSeed };

const USER_COUNT = 5;

function randomPassword(): string {
  // base64url keeps the password to safe, form-fillable characters
  return randomBytes(18).toString("base64url");
}

function generateUsers(): UserSeed[] {
  return Array.from({ length: USER_COUNT }, (_, i) => ({
    email: `user-${i + 1}@gmail.com`,
    password: randomPassword(),
    name: `User ${i + 1}`,
    userId: "",
  }));
}

/**
 * Ensure one seed user exists in the CURRENT database with the given
 * credentials. New user → created via Better Auth (properly hashed password).
 * Existing user → reconciled: the DB's real id is read back and the row's
 * password is reset to this seed's value.
 *
 * The reconcile arm is the fix for the stale-seed drift: the old code kept
 * the file's credentials untouched on "already exists", so after a DB wipe
 * the file held ids that no longer existed, and after a file regeneration it
 * held passwords that no longer matched the DB hash. The invariant now is:
 * after ANY `db:seed`, the stored credentials sign into the target database.
 */
async function ensureUser(seed: UserSeed): Promise<UserSeed> {
  try {
    const result = await auth.api.signUpEmail({
      body: { email: seed.email, password: seed.password, name: seed.name },
    });
    return { ...seed, userId: result?.user?.id ?? seed.userId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("already exists") && !message.includes("duplicate")) {
      throw error;
    }

    const [row] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, seed.email))
      .limit(1);
    if (!row) throw error; // duplicate reported but row not found — surface it

    const ctx = await auth.$context;
    await ctx.internalAdapter.updatePassword(
      row.id,
      await ctx.password.hash(seed.password),
    );
    return { ...seed, userId: row.id };
  }
}

/**
 * Create (or reconcile) the deterministic set of test users for the CURRENT
 * database, and persist their credentials to that database's seed file
 * (db/seed/.credentials/user-seeds.<db>.json — see seed-store.ts).
 *
 * Safe to re-run against any DATABASE_URL: existing users keep their id and
 * get their password re-aligned; the seed file is rewritten from the actual
 * outcome on every run, so it can never drift from the database it describes.
 */
export async function seedUsers(): Promise<UserSeed[]> {
  const existing = loadUserSeeds();
  const targets = existing.length === 0 ? generateUsers() : existing;

  const reconciled: UserSeed[] = [];
  for (const target of targets) {
    reconciled.push(await ensureUser(target));
  }

  saveUserSeeds(reconciled);
  return reconciled;
}
