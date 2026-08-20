import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization as organizationPlugin } from "better-auth/plugins";
import { getDatabaseConnectionSource, getDb } from "@/db";
import * as schema from "@/db/schema";
import { getAuthAllowedHosts, getAuthFallbackOrigin, getAuthTrustedOrigins } from "./url";

export function isAuthConfigured() {
  return Boolean(getDatabaseConnectionSource().url && process.env.BETTER_AUTH_SECRET);
}

export function isGoogleAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function createAuth() {
  return betterAuth({
    appName: "PRIFYN",
    baseURL: {
      allowedHosts: getAuthAllowedHosts(),
      fallback: getAuthFallbackOrigin(),
      protocol: "auto",
    },
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema,
    }),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    socialProviders: isGoogleAuthConfigured() ? {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    } : {},
    plugins: [organizationPlugin()],
    trustedOrigins: getAuthTrustedOrigins(),
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

export function getAuth(): ReturnType<typeof createAuth> {
  if (instance) return instance;
  if (!isAuthConfigured()) throw new Error("Authentication credentials are not configured.");
  instance = createAuth();
  return instance;
}
