# Foundation

A production-ready full-stack monorepo template. Clone it, change the config, ship your product.

**Auth, database, API, and UI — wired together and ready to build on.**

## What You Get

- **Frontend**: React 19 + TanStack Router + Vite + shadcn/ui
- **Backend**: Hono on Cloudflare Workers with OpenAPI documentation
- **Database**: Neon Postgres + Drizzle ORM, pooled via Cloudflare Hyperdrive
- **Auth**: Better Auth (email/password + Google OAuth), session-based
- **Testing**: Vitest (unit) + Playwright (E2E), both wired into CI
- **CI/CD**: Full GitHub Actions pipeline — lint, test, build, deploy, E2E, cleanup
- **UI**: Dark/light theme, mobile bottom tab bar, FAB drawer, command palette (Cmd+K)
- **DevEx**: Turborepo, Biome, Husky, Commitlint, Changesets

## Packages

| Package | Description |
|---|---|
| `@foundation/api` | Hono API server (Cloudflare Workers) |
| `@foundation/web` | React frontend application |
| `@foundation/e2e` | End-to-end tests (Playwright) |
| `@foundation/db` | Database schema, migrations, Drizzle ORM |
| `@foundation/ui` | Shared UI components (shadcn/ui) |
| `@foundation/types` | Shared TypeScript types and Zod schemas |
| `@foundation/constants` | App config, cookie names, category colors |
| `@foundation/env` | Environment variable validation (Zod) |
| `@foundation/utils` | Shared utilities |
| `@foundation/tsconfig` | Shared TypeScript configuration |

## Quick Start

### Prerequisites

- Node.js LTS (see `.nvmrc`)
- pnpm 10+ (`corepack enable`)
- A [Neon](https://neon.tech) Postgres database
- A [Cloudflare](https://cloudflare.com) account (for deployment)
- Google OAuth credentials (for sign-in)

### 1. Clone and install

```bash
git clone git@github.com:solution-ops/foundation.git
cd foundation
pnpm install
```

### 2. Configure environment

```bash
cp .dev.vars.example .dev.vars
```

Fill in `.dev.vars`:

| Variable | Description | How to get it |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | [Neon Console](https://console.neon.tech) → Project → Connection Details |
| `AUTH_SECRET` | Session signing secret | `openssl rand --base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create OAuth 2.0 Client |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Same as above |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | Default `http://localhost:8080` for local dev |

> **Google OAuth**: Add `http://localhost:8787/api/auth/callback/google` as an authorized redirect URI.

### 3. Push the database schema

```bash
pnpm db:push
```

### 4. Start developing

```bash
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080).

## Customizing for Your Project

### 1. Update app config

Edit `packages/constants/src/app-config.ts` — name, description, tagline, and links. This propagates to the landing page, PWA manifest, and page titles.

### 2. Rename packages (optional)

Find and replace `@foundation/` with `@yourapp/` across all `package.json` files, imports, `turbo.json`, `.changeset/config.json`, and CI workflows.

### 3. Modify the example resource

The template includes an "items" CRUD resource with categories, audit logging, and soft-delete. To adapt for your domain:

- **Database schema**: `packages/db/src/schemas/items.ts` and `item-audit-logs.ts`
- **API routes**: `apps/api/src/routes/items/`
- **API services**: `apps/api/src/services/items.ts`
- **Type schemas**: `packages/types/src/schemas/items.schema.ts`
- **Frontend components**: `apps/web/src/components/items/`
- **Frontend API layer**: `apps/web/src/api/items/`

### 4. Regenerate migrations

The included migrations are from the template's development. For a clean start:

```bash
rm -rf packages/db/src/migrations
pnpm db:generate   # Creates a fresh initial migration from your schema
```

## Commands

```bash
# Development
pnpm dev                            # Start all apps (web :8080, API :8787)
pnpm --filter @foundation/api dev   # API only
pnpm --filter @foundation/web dev   # Web only

# Database
pnpm db:generate    # Generate migration from schema changes
pnpm db:push        # Push schema directly (dev only)
pnpm db:migrate     # Run pending migrations
pnpm db:studio      # Open Drizzle Studio GUI

# Testing
pnpm test           # Run all unit tests
pnpm test:watch     # Watch mode
pnpm e2e            # Playwright E2E (requires running app)

# Quality
pnpm check          # Biome lint + format check
pnpm build          # Build all packages
```

## Deployment

### Cloudflare Workers

The API and web frontend deploy as a single Cloudflare Worker. Static assets (Vite build) are served via Workers Static Assets; API routes (`/api/*`) are handled by Hono. Configuration is in `wrangler.jsonc`.

### Cloudflare Hyperdrive

Hyperdrive provides connection pooling at the edge for Neon Postgres.

- **Production/Stage**: Persistent Hyperdrive configs (IDs stored as GitHub variables)
- **Feature PRs**: Dynamic Hyperdrive configs created per PR, cleaned up on close
- **Local dev**: Wrangler emulates Hyperdrive using `DATABASE_URL` from `.dev.vars`

### CI/CD Pipeline

GitHub Actions runs the full pipeline:

1. **Setup** — dependency caching
2. **Quality** — Biome lint + format
3. **Build + Unit tests** — TypeScript + Vitest
4. **Database** — Neon branch creation (PRs) + Drizzle migrations
5. **Deploy** — Cloudflare Workers deployment
6. **E2E** — Playwright against the deployed preview
7. **Cleanup** — Worker, Neon branch, and Hyperdrive config deletion on PR close

Environment routing:

| Trigger | Database | Worker name |
|---|---|---|
| PR | Ephemeral Neon branch | `foundation-qa-{pr}` |
| Push to `dev` | `DATABASE_URL_STAGE` | `foundation-stage` |
| Push to `main` | `DATABASE_URL_PROD` | `foundation-prod` |

## GitHub Setup

### Required Secrets

Set these in **Settings → Secrets and variables → Actions → Secrets**:

| Secret | Description | How to get it |
|---|---|---|
| `AUTH_SECRET` | Better Auth session signing secret | `openssl rand --base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console |
| `DATABASE_URL_STAGE` | Staging Neon connection string | Neon Console — staging branch |
| `DATABASE_URL_PROD` | Production Neon connection string | Neon Console — main branch |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | Cloudflare dashboard → API Tokens → Create (needs Workers + Hyperdrive permissions) |
| `NEON_API_KEY` | Neon API key for branch management | Neon Console → Account Settings → API Keys |

Optional:

| Secret | Description |
|---|---|
| `ANTHROPIC_API_KEY` | For automated Claude PR security reviews |
| `PAT_TOKEN` | GitHub PAT for auto-promote workflow (falls back to `GITHUB_TOKEN`) |

### Required Variables

Set these in **Settings → Secrets and variables → Actions → Variables**:

| Variable | Example | Description |
|---|---|---|
| `NEON_PROJECT_ID` | `spring-rain-123456` | Neon project ID (from Neon Console → Settings) |
| `NEON_DATABASE_NAME` | `neondb` | Database name in Neon |
| `NEON_ROLE_NAME` | `neondb_owner` | Database role for feature branches |
| `HYPERDRIVE_ID_STAGE` | `abc123def456...` | Cloudflare Hyperdrive config ID for staging |
| `HYPERDRIVE_ID_PROD` | `789abc012def...` | Cloudflare Hyperdrive config ID for production |
| `CLOUDFLARE_APP_DOMAIN` | `my-account.workers.dev` | Workers domain suffix |
| `ALLOWED_ORIGINS_STAGE` | `https://foundation-stage.workers.dev` | Staging CORS origin |
| `ALLOWED_ORIGINS_PROD` | `https://foundation-prod.workers.dev` | Production CORS origin |
| `STAGE_URL` | `https://foundation-stage.workers.dev` | Base URL for staging E2E tests |

### Service Setup Checklist

1. **Neon** — Create a project, note the project ID. Create `dev` and `main` branches. Copy connection strings for each.
2. **Cloudflare** — Create an API token with Workers and Hyperdrive permissions. Create Hyperdrive configs for staging and production, pointing at the Neon connection strings.
3. **Google OAuth** — Create an OAuth 2.0 Client in Google Cloud Console. Add redirect URIs for each environment: `https://{worker-url}/api/auth/callback/google`.
4. **GitHub** — Add all secrets and variables listed above. Enable GitHub Actions.

## Project Structure

```
foundation/
├── apps/
│   ├── api/          # Hono API (Cloudflare Workers)
│   ├── web/          # React frontend (Vite SPA)
│   └── e2e/          # Playwright E2E tests
├── packages/
│   ├── db/           # Drizzle ORM schema + migrations
│   ├── ui/           # shadcn/ui components + theme
│   ├── types/        # Shared types + Zod schemas
│   ├── constants/    # App config, colors, cookies
│   ├── env/          # Env var validation
│   ├── utils/        # Shared utilities
│   └── tsconfig/     # Shared TS configs
├── .github/          # CI/CD workflows
├── wrangler.jsonc    # Cloudflare Workers config
├── turbo.json        # Turborepo config
└── .dev.vars         # Local env vars (gitignored)
```

## Development Tools

- **[Turborepo](https://turbo.build)** — Monorepo build system
- **[Biome](https://biomejs.dev)** — Lint + format (replaces ESLint + Prettier)
- **[Husky](https://typicode.github.io/husky)** — Git hooks (pre-commit runs lint, tests, build)
- **[Commitlint](https://commitlint.js.org)** — Enforces [Conventional Commits](https://www.conventionalcommits.org)
- **[Changesets](https://github.com/changesets/changesets)** — Version management + changelogs

## Claude Code Skills (Optional)

If you use [Claude Code](https://claude.ai/code), install recommended skills for this stack:

```bash
npx skills find drizzle        # Drizzle ORM patterns
npx skills find playwright     # E2E test best practices
npx skills find neon           # Neon Postgres
npx skills find cloudflare     # Workers, Wrangler, Hyperdrive
npx skills find better-auth    # Auth configuration
npx skills find shadcn         # UI components
```

Use `npx skills add <owner/repo@skill>` to install any skill you find.

## License

AGPL-3.0 — see [LICENSE](LICENSE).
