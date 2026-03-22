# @foundation/env

Zod-validated environment variables using [`@t3-oss/env-core`](https://env.t3.gg).

Validation runs at import time and throws if any required variable is missing or malformed. Validation is automatically skipped during tests (`VITEST=true`) and can be manually skipped with `SKIP_ENV_VALIDATION=true`.

## Exports

### `server` — API runtime variables

| Variable | Schema | Default |
|---|---|---|
| `NODE_ENV` | `"development" \| "production" \| "test"` | `"development"` |
| `AUTH_SECRET` | `string` (min 1) | — |
| `GOOGLE_CLIENT_ID` | `string` (min 1) | — |
| `GOOGLE_CLIENT_SECRET` | `string` (min 1) | — |
| `ALLOWED_ORIGINS` | `string` (comma-separated, parsed to `string[]`) | `"http://localhost:8080"` |

### `db` — Database connection

| Variable | Schema | Default |
|---|---|---|
| `DATABASE_URL` | `url` | — |

## Usage

```ts
import { env } from "@foundation/env/server";
import { dbEnv } from "@foundation/env/db";

console.log(env.NODE_ENV);            // "development"
console.log(env.ALLOWED_ORIGINS);     // ["http://localhost:8080"]
console.log(dbEnv.DATABASE_URL);      // "postgresql://..."
```
