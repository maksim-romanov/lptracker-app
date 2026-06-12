import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { container } from "tsyringe";
import * as v from "valibot";

import { TokensDataClient } from "../../../token-prices/data/tokens-data-client";

const tokenIconParamsSchema = v.object({
  chainId: v.pipe(v.string(), v.transform(Number), v.integer()),
  address: v.pipe(v.string(), v.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address")),
});

const CACHE_CONTROL = "public, max-age=300, stale-while-revalidate=86400";

export const routes = new Hono();

routes.get(
  "/tokens/:chainId/:address",
  describeRoute({
    tags: ["Icons"],
    summary: "Token logo — 302 redirect to upstream CDN",
    responses: { 302: { description: "Redirect to CDN logo URL" }, 404: { description: "Not found" } },
  }),
  validator("param", tokenIconParamsSchema),
  async (c) => {
    const { chainId, address } = c.req.valid("param") as { chainId: number; address: string };
    const url = await container.resolve(TokensDataClient).getLogoUrl(chainId, address);
    if (!url) return c.notFound();
    c.header("Cache-Control", CACHE_CONTROL);
    return c.redirect(url, 302);
  },
);
