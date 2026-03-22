# @foundation/utils

Shared utility functions used across the monorepo.

## Exports

### `common/ensure-error`

Normalizes any thrown value into a proper `Error` instance. Handles plain objects, strings, H3-style errors, and other non-Error throwables.

```ts
import { ensureError } from "@foundation/utils/common/ensure-error";

try {
  await riskyOperation();
} catch (thrown) {
  const error = ensureError(thrown);
  console.error(error.message);
}
```

### `common/get-greeting-time`

Returns `"morning"`, `"afternoon"`, or `"evening"` based on the current hour.

```ts
import { getGreetingTime } from "@foundation/utils/common/get-greeting-time";

getGreetingTime();  // "morning" | "afternoon" | "evening"
```
