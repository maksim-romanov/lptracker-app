import "reflect-metadata";

import { installLogger, requestLogger } from "@depthly/logger";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { secureHeaders } from "hono/secure-headers";
import { openAPIRouteHandler } from "hono-openapi";
import { iconsRoutes } from "icons/presentation/api";
import { tokenPricesRoutes } from "token-prices/presentation/api";
import { tokensMetaRoutes } from "tokens-meta/presentation/api";

import { registerApp } from "./di/register";
import { v1Routes } from "./presentation/v1";
import { webRoutes } from "./presentation/web/routes/positions.routes";
import { shellRoutes } from "./presentation/web/routes/shell.routes";

await installLogger({ app: "server" });
registerApp();

const app = new Hono();

app.use("*", requestLogger({ app: "server" }));

app.get("/health", (c) => c.json({ ok: true, service: "server" }));

app.route("/api/v1", v1Routes);

const openApiDocumentation = {
  openapi: "3.1.0",
  info: {
    title: "Depthly Gateway API",
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
app.get("/docs", Scalar({ url: "/openapi.json", theme: "purple", pageTitle: "Depthly API" }));

app.route("/icons", iconsRoutes);
app.route("/meta", tokensMetaRoutes);
app.route("/prices", tokenPricesRoutes);

const STATIC_ROOT = new URL("./static/", import.meta.url).pathname;

app.use(
  "/static/*",
  serveStatic({
    root: STATIC_ROOT,
    rewriteRequestPath: (p) => p.replace(/^\/static/, ""),
    onFound: (path, c) => {
      // Only cache-bust content-hashed files (e.g. application-5fx314ew.js); dev fixed names have no hash segment.
      if (/-[a-z0-9]{6,}\.(js|css)$/i.test(path)) {
        c.header("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

const appCsp = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'", "https:", "data:"],
    connectSrc: ["'self'"],
  },
});

app.use("/", appCsp);
app.use("/positions", appCsp);
app.use("/positions/*", appCsp);

app.route("/", shellRoutes);
app.route("/", webRoutes);

export default app;
