import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { container } from "tsyringe";
import * as v from "valibot";

import { TokensDataClient } from "../../../token-prices/data/tokens-data-client";

const logoParamsSchema = v.object({
  chainId: v.pipe(v.string(), v.transform(Number), v.integer()),
  address: v.pipe(v.string(), v.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address")),
});

export const routes = new Hono();

routes.get(
  "/chains/:chainId/tokens/:address/logo.png",
  describeRoute({
    tags: ["Token Logos (Deprecated)"],
    summary: "[Deprecated] Resolve logo URL — use tokens-data /v1/chains/:chainId/tokens/:address/logo.png",
    responses: { 302: { description: "Redirect to upstream CDN" }, 404: { description: "Not found" } },
  }),
  validator("param", logoParamsSchema),
  async (c) => {
    const { chainId, address } = c.req.valid("param") as { chainId: number; address: string };
    const client = container.resolve(TokensDataClient);
    const url = await client.getLogoUrl(chainId, address);
    if (!url) return c.json({ error: "Logo not found" }, 404);

    c.header("Deprecation", "true");
    c.header(
      "Link",
      `<${process.env.TOKENS_DATA_URL ?? "http://localhost:3100"}/v1/chains/${chainId}/tokens/${address}/logo.png>; rel="successor-version"`,
    );
    return c.redirect(url, 302);
  },
);
