import "reflect-metadata";

import type { Context } from "hono";
import { Hono } from "hono";
import { container } from "tsyringe";

import { GetPositionUseCase } from "../../app/get-position.usecase";
import { GetPositionFeesUseCase } from "../../app/get-position-fees.usecase";
import { GetWalletPositionsUseCase } from "../../app/get-wallet-positions.usecase";
import { getContainer } from "../../di/containers";

export const routes = new Hono();
routes.get("/wallets/:walletAddress/positions", async (c: Context) => {
  const result = await container.resolve(GetWalletPositionsUseCase).execute(c.req.param("walletAddress"));

  if (result.isErr()) return c.json({ error: "Internal server error" }, 500);

  return c.json(result.value);
});

routes.get("/chains/:chainId/positions/:id", async (c: Context) => {
  const result = await getContainer(c.req.param("chainId")).resolve(GetPositionUseCase).execute(c.req.param("id"));

  if (result.isErr()) return c.json({ error: "Internal server error" }, 500);

  return c.json(result.value);
});

routes.get("/chains/:chainId/positions/:id/fees", async (c: Context) => {
  const result = await getContainer(c.req.param("chainId")).resolve(GetPositionFeesUseCase).execute(c.req.param("id"));

  if (result.isErr()) return c.json({ error: "Internal server error" }, 500);

  return c.json(result.value);
});
