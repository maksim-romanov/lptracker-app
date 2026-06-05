import "reflect-metadata";

import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true, service: "tokens-data" }));

export default {
  port: Number(process.env.PORT ?? 3100),
  fetch: app.fetch,
};
