import "reflect-metadata";

import { GetPositionUseCase } from "features/uniswap-v3/app/get-position.usecase";
import { GetWalletPositionsUseCase } from "features/uniswap-v3/app/get-wallet-positions.usecase";
import type { Context } from "hono";
import { Hono } from "hono";
import { container } from "tsyringe";

export const routes = new Hono();

routes.get("/wallets/:walletAddress/positions", async (c: Context) => {
  const result = await container.resolve(GetWalletPositionsUseCase).execute(c.req.param("walletAddress"));

  if (result.isErr()) return c.json({ error: "Internal server error" }, 500);

  return c.json(result.value);
});

routes.get("/positions/:id", async (c: Context) => {
  const result = await container.resolve(GetPositionUseCase).execute(c.req.param("id"));

  if (result.isErr()) return c.json({ error: "Internal server error" }, 500);

  return c.json(result.value);
});

routes.get("/positions/:id/fees", async (c: Context) => {
  return c.json({ message: "Sample fees response" });
});
