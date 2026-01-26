import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

import { routes } from "./routes";

export const gatewayRoutes = new Hono();

// Mount API routes
gatewayRoutes.route("/v1", routes);

// OpenAPI JSON spec endpoint
gatewayRoutes.get(
  "/v1/openapi.json",
  openAPIRouteHandler(routes, {
    documentation: {
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
    },
  }),
);

// Swagger UI endpoint
gatewayRoutes.get(
  "/v1/docs",
  swaggerUI({
    url: "/api/v1/openapi.json",
  }),
);
