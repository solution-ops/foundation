import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { drizzle } from "drizzle-orm/node-postgres";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { Client } from "pg";
import { authFactory } from "./middleware/auth-factory";
import { dbFactory } from "./middleware/db-factory";
import { requestLogger } from "./middleware/logger";
import { authRateLimit, rateLimit } from "./middleware/rate-limit";
import { about } from "./routes/about";
import { auth } from "./routes/auth";
import { categoriesRoute } from "./routes/categories";
import { health } from "./routes/health";
import { protectedIndex } from "./routes/index";
import { loaderData } from "./routes/loader-data";
import { itemsRoute } from "./routes/items";
import { purgeExpiredItems } from "./services/items";
import type { AppEnv, Bindings } from "./types";
import { onError } from "./utils/error-handler";

const app = new OpenAPIHono<AppEnv>().basePath("/api");

// --- Global middleware ---
app.use("*", requestLogger);
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowed = (c.env.ALLOWED_ORIGINS ?? "http://localhost:8080").split(",").map((o: string) => o.trim());
      return allowed.includes(origin) ? origin : null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("*", secureHeaders());

// --- Health route (no DB/auth needed) ---
app.route("/health", health);

// --- DB + Auth middleware (all routes below need these) ---
app.use("*", dbFactory);
app.use("*", authFactory);
app.route("/about", about);
app.route("/loader-data", loaderData);

// --- Auth rate limiting (stricter, keyed on IP — before auth routes) ---
app.use("/auth/*", authRateLimit);
app.route("/auth", auth);

// --- Resource rate limiting (keyed on userId — after auth resolution) ---
app.use("/items/*", rateLimit);
app.use("/categories/*", rateLimit);

// --- Resource routes (chained for RPC type inference) ---
const apiRoutes = app.route("/items", itemsRoute).route("/categories", categoriesRoute);

// --- Remaining routes ---
app.route("/", protectedIndex);

// --- OpenAPI spec + Swagger UI ---
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Foundation API",
    version: "0.1.0",
  },
});

app.get("/reference", swaggerUI({ url: "/api/doc" }));

// --- Error handling ---
app.onError(onError);

// Export app type for Hono RPC (only typed routes for RPC client)
export type AppType = typeof apiRoutes;

export { app };

// --- Scheduled handler (cron) ---

async function scheduled(_event: unknown, env: Bindings, _ctx: unknown) {
  let client: Client | undefined;
  try {
    const connectionString = env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL;
    client = new Client({ connectionString });
    await client.connect();
    const db = drizzle(client);
    const count = await purgeExpiredItems(db);
    console.log(`[cron] purged ${count} expired item(s)`);
  } finally {
    await client?.end();
  }
}

export default { fetch: app.fetch, scheduled };
