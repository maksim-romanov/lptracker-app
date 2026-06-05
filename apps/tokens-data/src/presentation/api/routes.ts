import { Hono } from "hono";

import { routes as logoRoutes } from "../../features/logos/presentation/api";
import { routes as metaRoutes } from "../../features/meta/presentation/api";
import { routes as priceRoutes } from "../../features/prices/presentation/api";

export const v1Routes = new Hono();

v1Routes.route("/", logoRoutes);
v1Routes.route("/", priceRoutes);
v1Routes.route("/", metaRoutes);
