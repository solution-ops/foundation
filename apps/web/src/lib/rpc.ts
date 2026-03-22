import type { AppType } from "@foundation/api";
import { hc } from "hono/client";

export const rpc = hc<AppType>("/");

export type { InferRequestType, InferResponseType } from "hono/client";
