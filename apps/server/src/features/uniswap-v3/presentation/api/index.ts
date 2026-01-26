import { Hono } from "hono";

import { routes } from "./routes";

export const uniswapV3Routes = new Hono();

uniswapV3Routes.route("/v1", routes);
