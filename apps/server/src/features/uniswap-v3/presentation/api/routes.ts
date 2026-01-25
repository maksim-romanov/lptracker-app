import "reflect-metadata";

import { GetWalletPositionsUseCase } from "features/uniswap-v3/app/get-wallet-positions.usecase";
import type { Context } from "hono";
import { Hono } from "hono";
import { container } from "tsyringe";

export const routes = new Hono();

routes.get("/wallets/:walletAddress/positions", async (c: Context) => {
  const getWalletPositionsUseCase = container.resolve(GetWalletPositionsUseCase);
  const result = await getWalletPositionsUseCase.execute(c.req.param("walletAddress"));

  if (result.isErr()) return c.json({ error: "Internal server error" }, 500);

  return c.json(result.value);
});

routes.get(":id/fees", async (c: Context) => {
  return c.json({ message: "Sample fees response" });
});

routes.get("/:id", async (c: Context) => {
  return c.json({ message: "Sample position response" });
});
