# @foundation/api

The Hono API server for the Task.Cloud application, deployed to Cloudflare Workers. Provides RESTful endpoints for the frontend application with edge connection pooling via Cloudflare Hyperdrive.

## Features

- **Hono Framework**: Lightweight, fast web framework built for the edge
- **Cloudflare Workers**: Serverless deployment at the edge
- **Hyperdrive**: Edge connection pooling for Neon Postgres (eliminates TCP/TLS handshake overhead)
- **Database Integration**: Drizzle ORM with `pg` (node-postgres) driver
- **Better Auth**: Authentication with email/password and Google OAuth
- **Type Safety**: Full TypeScript support with Zod OpenAPI schemas

## Development

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- pnpm
- PostgreSQL database connection string (via [Neon](https://neon.tech))
- Environment variables configured in `.dev.vars` at the project root

### Running the Server

```bash
# Development mode (starts wrangler dev on port 8081)
pnpm dev

# Type-check
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Environment Variables

Environment variables are stored in `.dev.vars` at the project root (not in the API directory):

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
ALLOWED_ORIGINS="http://localhost:8080"
```

The dev script automatically extracts `DATABASE_URL` for local Hyperdrive emulation.

## Architecture

### Database Connection

The API uses Cloudflare Hyperdrive for connection pooling in deployed environments. The connection resolution order is:

1. `env.HYPERDRIVE.connectionString` — Hyperdrive-pooled connection (deployed environments)
2. `env.DATABASE_URL` — Direct connection fallback (tests)

### Authentication

Built with [Better Auth](https://better-auth.com/), supporting:

- Email/password sign-up and sign-in
- Google OAuth
- Session management with cookie caching

### Key Files

- `src/index.ts` — Hono app entry point, route registration
- `src/utils/auth.ts` — Better Auth factory (`createAuth`)
- `src/middleware/` — Auth factory, request logger
- `src/types.ts` — Worker bindings interface
- `test/helpers.ts` — Test utilities with mock environment

## Testing

Tests use Vitest with Hono's `app.request()` for direct handler testing (no HTTP server needed):

```bash
pnpm test
```

### Test Structure

- `test/*.spec.ts` — Test files for each endpoint group
- `test/helpers.ts` — Shared test utilities and mock bindings

## Deployment

Deployed automatically via CI to Cloudflare Workers. The `wrangler.jsonc` at the project root configures the worker, including the Hyperdrive binding.

```bash
# Manual deploy (from project root)
wrangler deploy
```

## Dependencies

### Core

- `hono` — Web framework
- `@hono/zod-openapi` — OpenAPI schema integration
- `better-auth` — Authentication
- `drizzle-orm` — Database ORM
- `pg` — PostgreSQL driver (TCP-based, required for Hyperdrive)
- `@foundation/db` — Shared database schemas

### Dev

- `vitest` — Test framework
- `@cloudflare/workers-types` — Worker type definitions
