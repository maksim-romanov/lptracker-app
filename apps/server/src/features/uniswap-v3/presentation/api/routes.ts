import "reflect-metadata";

import { classValidator } from "@hono/class-validator";
import { Hono } from "hono";
import { container } from "tsyringe";

import { GetPositionUseCase } from "../../app/get-position.usecase";
import { GetPositionFeesUseCase } from "../../app/get-position-fees.usecase";
import { GetWalletPositionsUseCase } from "../../app/get-wallet-positions.usecase";
import { getContainer } from "../../di/containers";
import { ChainPositionParamDto, GetWalletPositionsQueryDto, WalletAddressParamDto } from "../dto/validation.dto";
import { validationHook } from "../middleware/validation.middleware";
import { mapToHttpResponse } from "../utils/error-mapper";

export const routes = new Hono();

routes.get(
  "/wallets/:walletAddress/positions",
  classValidator("param", WalletAddressParamDto, validationHook),
  classValidator("query", GetWalletPositionsQueryDto, validationHook),
  async (c) => {
    try {
      const { walletAddress } = c.req.valid("param") as WalletAddressParamDto;
      const { limit, offset, closed } = c.req.valid("query") as GetWalletPositionsQueryDto;

      const result = await container.resolve(GetWalletPositionsUseCase).execute({
        owner: walletAddress,
        pagination: { limit, offset },
        filters: { closed },
      });

      if (result.isErr()) {
        return mapToHttpResponse(c, result.error);
      }

      return c.json(result.value);
    } catch (error) {
      return mapToHttpResponse(c, error);
    }
  },
);

routes.get("/chains/:chainId/positions/:id", classValidator("param", ChainPositionParamDto, validationHook), async (c) => {
  try {
    const { chainId, id } = c.req.valid("param") as ChainPositionParamDto;

    const result = await getContainer(chainId).resolve(GetPositionUseCase).execute(id);

    if (result.isErr()) {
      return mapToHttpResponse(c, result.error);
    }

    return c.json(result.value);
  } catch (error) {
    return mapToHttpResponse(c, error);
  }
});

routes.get("/chains/:chainId/positions/:id/fees", classValidator("param", ChainPositionParamDto, validationHook), async (c) => {
  try {
    const { chainId, id } = c.req.valid("param") as ChainPositionParamDto;

    const result = await getContainer(chainId).resolve(GetPositionFeesUseCase).execute(id);

    if (result.isErr()) {
      return mapToHttpResponse(c, result.error);
    }

    return c.json(result.value);
  } catch (error) {
    return mapToHttpResponse(c, error);
  }
});
