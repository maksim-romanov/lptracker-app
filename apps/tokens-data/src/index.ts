import "reflect-metadata";

import { Hono } from "hono";

import { registerApp } from "./di/register";
import { v1Routes } from "./presentation/api/routes";

registerApp();

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true, service: "tokens-data" }));
app.route("/v1", v1Routes);

export default {
  port: Number(process.env.PORT ?? 3100),
  fetch: app.fetch,
};
