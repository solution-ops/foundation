/**
 * Cloudflare Hyperdrive binding — declared locally so consumers
 * that import AppType for Hono RPC don't need @cloudflare/workers-types.
 */
interface HyperdriveBinding {
  connectionString: string;
}

/**
 * Cloudflare Rate Limit binding — declared locally so consumers
 * that import AppType for Hono RPC don't need @cloudflare/workers-types.
 * https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
 */
interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/**
 * Cloudflare Workers environment bindings.
 *
 * In Hono on CF Workers, env vars arrive per-request via `c.env`
 * rather than `process.env`. This type declares the expected bindings.
 */
export interface Bindings {
  HYPERDRIVE?: HyperdriveBinding;
  RATE_LIMITER?: RateLimitBinding;
  AUTH_RATE_LIMITER?: RateLimitBinding;
  DATABASE_URL: string;
  AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  ALLOWED_ORIGINS: string;
  NODE_ENV?: string;
}

/**
 * Hono context variables set by middleware.
 *
 * Types are declared inline to avoid requiring external packages
 * (better-auth, drizzle-orm) when consumers import AppType for Hono RPC.
 *
 * - `db`: Drizzle ORM instance (per-request with Hyperdrive, cached without)
 * - `auth`: Better Auth instance (created per request using `db`)
 * - `session`: Current user session (set by require-auth middleware)
 * - `user`: Current user object (set by require-auth middleware)
 */
export interface Variables {
  db: any;
  auth: any;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface AppEnv {
  Bindings: Bindings;
  Variables: Variables;
}
