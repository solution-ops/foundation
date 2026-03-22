import { accounts } from "@foundation/db/schemas/accounts";
import { sessions } from "@foundation/db/schemas/sessions";
import { users } from "@foundation/db/schemas/users";
import { verifications } from "@foundation/db/schemas/verifications";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { deleteUserData } from "../services/users";
import type { Bindings } from "../types";

/**
 * Creates a Better Auth instance with a pre-configured Drizzle db instance.
 *
 * The caller (auth-factory middleware) is responsible for creating the
 * appropriate db connection:
 * - Hyperdrive: fresh pg.Client per request (required by Workers runtime)
 * - Local/test: Pool via connection string (lazy connect)
 *
 * See: https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/
 */
export function createAuth(env: Bindings, db: NodePgDatabase) {
  const allowedOrigins = (env.ALLOWED_ORIGINS ?? "http://localhost:8080").split(",").map((o) => o.trim());

  return betterAuth({
    baseURL: allowedOrigins[0],
    secret: env.AUTH_SECRET,
    emailAndPassword: { enabled: true },
    user: {
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          await deleteUserData(db, user.id);
        },
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        accounts,
        sessions,
        users,
        verifications,
      },
      usePlural: true,
    }),
    advanced: { database: { generateId: false } },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            return {
              data: {
                ...user,
                image: user.image ?? avatarFromName(user.name),
              },
            };
          },
        },
        update: {
          before: async (data) => {
            if (data.name && !data.image) {
              return { data: { ...data, image: avatarFromName(data.name) } };
            }
            return { data };
          },
        },
      },
    },
    logger: {
      disabled: false,
    },
    trustedOrigins: allowedOrigins,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
  });
}

function avatarFromName(name?: string) {
  const seed = (name ?? "").trim().toLowerCase() || "anonymous";
  return `https://api.dicebear.com/8.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}
