import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Use globalThis indirection to prevent Nitro/rollup from statically replacing
// process.env values at build time. Without this, skipValidation gets inlined
// as a literal boolean and the Cloudflare Workers deploy-time module validation
// fails because secrets aren't yet bound.
const runtimeEnv = globalThis.process?.env ?? {};

const rawEnv = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    ALLOWED_ORIGINS: z.string().default("http://localhost:8080"),
  },
  runtimeEnv: runtimeEnv,
  emptyStringAsUndefined: true,
  skipValidation: !!runtimeEnv.VITEST || !!runtimeEnv.SKIP_ENV_VALIDATION,
});

export const env = {
  ...rawEnv,
  ALLOWED_ORIGINS: (rawEnv.ALLOWED_ORIGINS ?? "http://localhost:8080").split(",").map((o) => o.trim()),
};
