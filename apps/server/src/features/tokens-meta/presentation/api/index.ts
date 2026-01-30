import { Hono } from "hono";

import { routes } from "./routes";

export const tokensMetaRoutes = new Hono();

tokensMetaRoutes.route("/v1", routes);
