import "reflect-metadata";

import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

import { routes as uniswapV3Routes } from "../src/features/uniswap-v3/presentation/api/routes";
import { routes as gatewayRoutes } from "../src/presentation/api/routes";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUTPUT_DIR = join(import.meta.dir, "..", "openapi");

const gatewaySpec = {
  openapi: "3.1.0",
  info: {
    title: "Matrapp Gateway API",
    version: "1.0.0",
    description: "Gateway API for aggregating positions across all supported DeFi protocols",
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
      description: "Multi-protocol position aggregation endpoints",
    },
  ],
};

const uniswapV3Spec = {
  openapi: "3.1.0",
  info: {
    title: "Uniswap V3 API",
    version: "1.0.0",
    description: "API for querying Uniswap V3 positions and unclaimed fees",
  },
  servers: [
    {
      url: "/api/uniswap-v3/v1",
      description: "Uniswap V3 API v1",
    },
  ],
  tags: [
    {
      name: "Positions",
      description: "Uniswap V3 position management endpoints",
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
  await generateSchema(gatewayRoutes, gatewaySpec, join(OUTPUT_DIR, "gateway.json"));

  await generateSchema(uniswapV3Routes, uniswapV3Spec, join(OUTPUT_DIR, "uniswap-v3.json"));

  console.log("OpenAPI schemas generated successfully");
}

main().catch(console.error);
