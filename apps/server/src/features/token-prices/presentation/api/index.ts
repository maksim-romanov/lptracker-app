import { Hono } from "hono";

import { routes } from "./routes";

export const tokenPricesRoutes = new Hono();

tokenPricesRoutes.route("/v1", routes);
