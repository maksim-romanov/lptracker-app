import "reflect-metadata";

import { Scalar } from "@scalar/hono-api-reference";
import { StablesService } from "features/stables/app/stables.service";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import { tokenPricesRoutes } from "token-prices/presentation/api";
import { tokensMetaRoutes } from "tokens-meta/presentation/api";
import { container } from "tsyringe";

import { registerApp } from "./di/register";
import { v1Routes } from "./presentation/v1";

registerApp();

try {
  await container.resolve(StablesService).hydrate();
} catch (error) {
  console.warn("[bootstrap] StablesService.hydrate() threw; starting server with empty stables cache", error);
}

const app = new Hono();

app.route("/api/v1", v1Routes);

const openApiDocumentation = {
  openapi: "3.1.0",
  info: {
    title: "mars-909 Gateway API",
    version: "1.0.0",
    description: "Protocol-agnostic gateway API for DeFi position aggregation across wallets, chains, and protocols",
  },
  servers: [{ url: "/api/v1", description: "Gateway API v1" }],
  tags: [
    { name: "Positions", description: "Multi-wallet, multi-chain, multi-protocol position endpoints" },
    { name: "Catalog", description: "Networks and protocols metadata" },
  ],
};

app.get("/openapi.json", openAPIRouteHandler(v1Routes, { documentation: openApiDocumentation }));
app.get("/docs", Scalar({ url: "/openapi.json", theme: "purple", pageTitle: "mars-909 API" }));

// Deprecated tokens-data passthroughs (slated for removal once mobile stops calling them)
app.route("/meta", tokensMetaRoutes);
app.route("/prices", tokenPricesRoutes);

export default app;
