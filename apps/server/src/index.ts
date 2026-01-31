import "reflect-metadata";

import { Hono } from "hono";
import { tokenPricesRoutes } from "token-prices/presentation/api";
import { tokensMetaRoutes } from "tokens-meta/presentation/api";
import { uniswapV3Routes } from "uniswap-v3/presentation/api";

import { registerApp } from "./di/register";
import { gatewayRoutes } from "./presentation/api";

registerApp();

const app = new Hono();

// Gateway routes - aggregates all protocols
app.route("/api", gatewayRoutes);

// Feature-specific routes
app.route("/api/uniswap-v3", uniswapV3Routes);
app.route("/meta", tokensMetaRoutes);
app.route("/prices", tokenPricesRoutes);

export default app;
