import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

import { routes } from "./routes";

export const uniswapV3Routes = new Hono();

// Mount API routes
uniswapV3Routes.route("/v1", routes);

// OpenAPI JSON spec endpoint
uniswapV3Routes.get(
  "/v1/openapi.json",
  openAPIRouteHandler(routes, {
    documentation: {
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
    },
  }),
);

// Swagger UI endpoint
uniswapV3Routes.get(
  "/v1/docs",
  swaggerUI({
    url: "/api/uniswap-v3/v1/openapi.json",
  }),
);
