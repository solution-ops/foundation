# Foundation — Project Conventions

## Philosophy

- Do things right, not fast — prioritize correctness, quality, and maintainability over speed
- When unsure about an API, pattern, or best practice, refer to the official documentation (Playwright, TanStack, Hono, shadcn, Drizzle, Cloudflare Workers, etc.) before implementing
- If a library provides a component or utility for a use case, use it instead of rolling a custom solution
- Fix real bugs in source code, not in tests — if a test reveals a real issue, fix the underlying code

## Architecture Principles

- Mobile-first, Tauri-ready
- Separation of concerns, SOLID principles
- Prefer small files with scoped, composable modules
- Avoid large complex files and methods that violate SoC and SOLID principles
- RESTful API design with OpenAPI documentation
- Strict types everywhere — no `any` at boundaries
- Small files, small methods
- Atomic commits with conventional commit messages
- No barrel files — use path-based package exports

## Naming Conventions

- Branch names: `feat/#N`, `fix/#N`, `chore/description`
- Commit format: `feat(#N): message`, `fix(#N): message`, `refactor: message`
- Columns on tables we own: `dateCreated`, `dateUpdated`, `dateDeleted` (not `createdAt`/`updatedAt`)
- Auth-managed tables (users, sessions, accounts) keep Better Auth's `createdAt`/`updatedAt`
- Boolean-like fields should be nullable timestamps for auditing (e.g., `dateOnboardingCompleted` instead of `onboardingCompleted: boolean`)

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: Hono on Cloudflare Workers with `OpenAPIHono` (`@hono/zod-openapi`)
- **Frontend**: React 19 + TanStack Router + TanStack Form + React Query
- **Database**: Neon Postgres + Drizzle ORM, Cloudflare Hyperdrive pooling
- **Auth**: Better Auth (email/password + Google OAuth), session-based
- **Validation**: Zod v4 with standalone imports (`email()`, `iso.datetime()`, `enum as zenum`)
- **Testing**: Vitest with PGLite for DB tests, Playwright for E2E
- **Linting**: Biome (formatting + linting)

## API Patterns (Critical — enforce in reviews)

### Route Structure
Every route group uses the directory pattern:
```
routes/{resource}/
  routes.ts    — pure OpenAPI route definitions (createRoute)
  handlers.ts  — handlers typed with RouteHandler<typeof route, AppEnv>
  index.ts     — mounts routes with shared validationHook
```

### Route Index Pattern
```ts
import { validationHook } from "../../utils/validation-hook";
const route = new OpenAPIHono<AppEnv>({ defaultHook: validationHook })
  .openapi(routeDef, handler);
```
Never inline the defaultHook — always use the shared `validationHook`.

### Error Handling
- `apiErrorResponseSchema` lives in `@foundation/types/schemas/api-error` (single source of truth)
- API re-exports `ApiErrorResponse` and `ApiErrorType` from the types package
- Handlers throw errors via `createApiError(status, message, type)` from `utils/error-handler`
- Never return error JSON directly from handlers — throw and let the global `onError` catch it

### Service Layer
- Services are functional (exported functions, not classes)
- First parameter is always `db: Database` (imported from `@foundation/db/core`)
- Services return domain types (e.g., `UserProfile`), not wire types
- JSONB columns typed as `unknown` in Drizzle, cast at service boundary
- Deep-merge pattern for partial JSONB updates (preferences)

### Schemas
- Request/response schemas live in `@foundation/types/schemas/` — shared between API and frontend
- PG enums are the single source of truth — Zod schemas import from `enumValues`
- Enums live in `packages/db/src/enums/` (dedicated folder for scalability)
- Use proper Zod validators: `email()` not `string()`, `iso.datetime()` not `string()`

## Frontend Patterns (Critical — enforce in reviews)

### React Query Keys
All query keys come from the centralized factory in `api/query-keys.ts`:
```ts
import { userKeys } from "../api/query-keys";
queryOptions({ queryKey: userKeys.profile(), queryFn: ... });
```
Never use inline `["string"]` arrays for query keys.

### API Client
- Use Hono RPC client (`rpc` from `lib/rpc.ts`) for type-safe API calls
- Use `throwIfNotOk()` from `lib/api-error.ts` for error handling — validates against shared schema
- Mutation error/success messages via `meta` on the mutation (handled by global MutationCache)

### Auth
- Session checked via `fetchCurrentUserQueryOptions()` in route `beforeLoad`
- Open-redirect prevention via `sanitizeRedirect()` in auth hooks
- Cache invalidation after auth state changes

## Package Exports (No Barrel Files)

```jsonc
// packages/types/package.json
"exports": {
  "./*": "./src/*.type.ts",
  "./schemas/*": "./src/schemas/*.schema.ts"
}

// packages/db/package.json
"exports": {
  "./schemas/*": "./src/schemas/*.ts",
  "./enums/*": "./src/enums/*.ts"
}
```
Import directly: `import { x } from "@foundation/types/schemas/user-profile"` — never from an index.

## PR Requirements

- All PRs assigned to the repo owner
- No Claude Code attribution in commits or PRs
- Include changesets for feature work (`minor` for new features)
- All tests must pass, build must succeed, Biome must be clean
