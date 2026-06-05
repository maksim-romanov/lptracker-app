import { Hono } from "hono";

import { catalogRoutes } from "./catalog.routes";
import { positionsRoutes } from "./positions.routes";

export const v1Routes = new Hono();

v1Routes.route("/catalog", catalogRoutes);
v1Routes.route("/positions", positionsRoutes);
