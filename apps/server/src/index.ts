import { Hono } from "hono";
import { uniswapV3Routes } from "uniswap-v3/presentation/api";

import { registerApp } from "./di/register";

registerApp();

const app = new Hono();

app.route("/api/uniswap-v3", uniswapV3Routes);

export default app;
