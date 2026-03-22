import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Use globalThis indirection to prevent Nitro/rollup from statically replacing
// process.env values at build time during Cloudflare Workers bundling.
const runtimeEnv = globalThis.process?.env ?? {};

export const dbEnv = createEnv({
  server: {
    DATABASE_URL: z.url(),
  },
  runtimeEnv: runtimeEnv,
  emptyStringAsUndefined: true,
  skipValidation: !!runtimeEnv.VITEST || !!runtimeEnv.SKIP_ENV_VALIDATION,
});
