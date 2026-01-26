import { Hono } from "hono";

import { routes } from "./routes";

export const gatewayRoutes = new Hono();

gatewayRoutes.route("/v1", routes);
