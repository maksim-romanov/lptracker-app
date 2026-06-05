import "reflect-metadata";

import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

import { v1Routes } from "../src/presentation/v1";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUTPUT_DIR = join(import.meta.dir, "..", "openapi");

const gatewaySpec = {
  openapi: "3.1.0",
  info: {
    title: "mars-909 Gateway API",
    version: "1.0.0",
    description: "Protocol-agnostic gateway API for DeFi position aggregation across wallets, chains, and protocols",
  },
  servers: [
    {
      url: "/api/v1",
      description: "Gateway API v1",
    },
  ],
  tags: [
    {
      name: "Positions",
      description: "Multi-wallet, multi-chain, multi-protocol position endpoints",
    },
    {
      name: "Catalog",
      description: "Networks and protocols metadata",
    },
  ],
};

async function generateSchema(routes: Hono, documentation: object, outputPath: string) {
  const app = new Hono();
  app.get("/openapi.json", openAPIRouteHandler(routes, { documentation }));

  const response = await app.request("/openapi.json");
  const schema = await response.json();

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(schema, null, 2));

  console.log(`Generated: ${outputPath}`);
}

async function main() {
  await generateSchema(v1Routes, gatewaySpec, join(OUTPUT_DIR, "gateway.json"));

  console.log("OpenAPI schemas generated successfully");
}

main().catch(console.error);
