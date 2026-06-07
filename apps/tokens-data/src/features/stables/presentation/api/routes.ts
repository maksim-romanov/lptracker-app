import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { container } from "tsyringe";

import { GetStablesUseCase } from "../../app/get-stables.usecase";

export const routes = new Hono();

routes.get(
  "/stables",
  describeRoute({
    tags: ["Stables"],
    summary: "List known stablecoin tokens across supported chains",
    description:
      "Returns a list of { chainId, address, symbol } triples sourced from CoinGecko and DefiLlama, served from a Redis cache with stale-while-revalidate semantics.",
    responses: { 200: { description: "Stablecoin entries" } },
  }),
  async (c) => {
    const stables = await container.resolve(GetStablesUseCase).execute();
    return c.json({ stables });
  },
);
