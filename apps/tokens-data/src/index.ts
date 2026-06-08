import "reflect-metadata";

import { installLogger, requestLogger } from "@depthly/logger";
import { Hono } from "hono";

import { registerApp } from "./di/register";
import { v1Routes } from "./presentation/api/routes";
import { config } from "./shared/config";

await installLogger({ app: "tokens-data" });
registerApp();

const app = new Hono();

app.use("*", requestLogger({ app: "tokens-data" }));

app.get("/health", (c) => c.json({ ok: true, service: "tokens-data" }));
app.route("/v1", v1Routes);

export default {
  port: config.port,
  fetch: app.fetch,
};
