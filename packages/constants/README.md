# @foundation/constants

Shared constants used across the monorepo.

## Exports

| Module | Description |
|---|---|
| `app-config` | Application name, version, description, and links. Version is synced automatically during releases. |
| `cookie-names` | Type-safe cookie name constants (`SESSION`, `EMAIL_VERIFICATION`, `AUTH`) and default cookie options. |
| `category-colors` | Available category color names, the `CategoryColor` type, and limits (`MAX_CATEGORIES_PER_USER`, `MAX_CATEGORY_NAME_LENGTH`). |

## Usage

```ts
import { appConfig } from "@foundation/constants/app-config";
import { COOKIE_NAMES, getDefaultCookieOptions } from "@foundation/constants/cookie-names";
import { CATEGORY_COLORS, type CategoryColor } from "@foundation/constants/category-colors";
```
