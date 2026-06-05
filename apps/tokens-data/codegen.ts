import "reflect-metadata";

import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { v1Routes } from "./src/presentation/api/routes";

const OUTPUT = join(import.meta.dir, "generated", "openapi.json");

const spec = {
  openapi: "3.1.0",
  info: {
    title: "tokens-data API",
    version: "1.0.0",
    description: "Aggregator API for token logos, prices, and meta",
  },
  servers: [{ url: "/v1", description: "tokens-data v1" }],
  tags: [
    { name: "Token Logos", description: "Logo URL resolution with multi-provider fallback" },
    { name: "Token Prices", description: "USD prices across multiple providers" },
    { name: "Token Meta", description: "name/symbol/decimals via RPC multicall" },
  ],
};

const app = new Hono();
app.get("/openapi.json", openAPIRouteHandler(v1Routes, { documentation: spec }));

const response = await app.request("/openapi.json");
const schema = await response.json();

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(schema, null, 2));
console.log(`Generated: ${OUTPUT}`);
