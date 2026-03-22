import { Hono } from "hono";
import type { AppEnv } from "../types";

const loaderData = new Hono<AppEnv>();

loaderData.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "hello from@foundation/api loader-data route",
    timestamp: new Date().toISOString(),
  });
});

export { loaderData };
