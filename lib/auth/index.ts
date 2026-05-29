import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { cache } from "react";
import { headers } from "next/headers";
import { admin } from "better-auth/plugins";
import { magicLink } from "better-auth/plugins";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

function getParentDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    if (hostname === "localhost" || hostname === "127.0.0.1") return "";
    const parts = hostname.split(".");
    return parts.length > 2 ? parts.slice(-2).join(".") : "";
  } catch {
    return "";
  }
}

const parentDomain = getParentDomain(baseUrl);

export const auth = betterAuth({
  plugins: [
    admin({
      defaultRole: "user",
    }),
    magicLink({
      expiresIn: 3600,
      sendMagicLink: async () => {},
    }),
    nextCookies(),
  ],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendEmailVerificationOnSignUp: false,
  },
  user: {
    additionalFields: {},
  },
  trustedOrigins: [
    ...(parentDomain
      ? [`https://${parentDomain}`, `https://*.${parentDomain}`]
      : []),
    "http://localhost:3000",
  ],
  trustedProxyHeaders: true,
  advanced: {
    cookiePrefix: "sandbox-auth",
    useSecureCookies: true,
    ...(parentDomain
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: parentDomain,
          },
        }
      : {}),
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseUrl,
});

export const getUser = cache(async () => {
  const sessionResponse = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResponse || !sessionResponse.user) {
    return { user: null, isImpersonating: false, impersonatedBy: null };
  }

  // Better Auth getSession returns: { user, session: { id, token, expiresAt, impersonatedBy, ... } }
  // impersonatedBy is stored in session.impersonatedBy
  const sessionData = sessionResponse.session as {
    impersonatedBy?: string | null;
  } & typeof sessionResponse.session;

  // Check impersonatedBy directly from session
  const impersonatedBy = sessionData?.impersonatedBy || null;
  const isImpersonating = !!impersonatedBy;

  return {
    user: sessionResponse.user,
    sessionToken: sessionResponse.session.token,
    isImpersonating,
    impersonatedBy,
  };
});
