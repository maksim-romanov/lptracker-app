import { Hono } from "hono";

import { Layout } from "../views/Layout";

export const shellRoutes = new Hono();

shellRoutes.get("/", (c) => c.html(<Layout />));
