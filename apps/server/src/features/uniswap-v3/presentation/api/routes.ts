import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { container } from "tsyringe";
import * as v from "valibot";

import { GetPositionUseCase } from "../../app/get-position.usecase";
import { GetPositionFeesUseCase } from "../../app/get-position-fees.usecase";
import { GetWalletPositionsUseCase } from "../../app/get-wallet-positions.usecase";
import { getContainer } from "../../di/containers";
import {
  type ChainPositionParam,
  chainPositionParamSchema,
  type GetWalletPositionsQuery,
  getWalletPositionsQuerySchema,
  type WalletAddressParam,
  walletAddressParamSchema,
} from "../schemas/request.schemas";
import { errorResponseSchema, positionFeesSchema, positionSchema } from "../schemas/response.schemas";
import { mapToHttpResponse } from "../utils/error-mapper";

export const routes = new Hono();

// Endpoint 1: Get wallet positions
routes.get(
  "/wallets/:walletAddress/positions",
  describeRoute({
    tags: ["Positions"],
    summary: "List wallet positions",
    description: "Retrieves all Uniswap V3 positions owned by a wallet address across supported chains",
    responses: {
      200: {
        description: "Successfully retrieved positions",
        content: {
          "application/json": {
            schema: resolver(v.array(positionSchema)),
          },
        },
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator("param", walletAddressParamSchema),
  validator("query", getWalletPositionsQuerySchema),
  async (c) => {
    try {
      const { walletAddress } = c.req.valid("param") as WalletAddressParam;
      const { limit, offset, closed } = c.req.valid("query") as GetWalletPositionsQuery;

      const result = await container.resolve(GetWalletPositionsUseCase).execute({
        owner: walletAddress,
        pagination: {
          limit: typeof limit === "string" ? 10 : limit,
          offset: typeof offset === "string" ? 0 : offset,
        },
        filters: {
          closed: typeof closed === "string" ? false : closed,
        },
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

// Endpoint 2: Get position details
routes.get(
  "/chains/:chainId/positions/:id",
  describeRoute({
    tags: ["Positions"],
    summary: "Get position details",
    description: "Retrieves detailed information about a specific Uniswap V3 position",
    responses: {
      200: {
        description: "Successfully retrieved position",
        content: {
          "application/json": {
            schema: resolver(positionSchema),
          },
        },
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      404: {
        description: "Position not found",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator("param", chainPositionParamSchema),
  async (c) => {
    try {
      const { chainId, id } = c.req.valid("param") as ChainPositionParam;

      const result = await getContainer(chainId).resolve(GetPositionUseCase).execute(id);

      if (result.isErr()) {
        return mapToHttpResponse(c, result.error);
      }

      return c.json(result.value);
    } catch (error) {
      return mapToHttpResponse(c, error);
    }
  },
);

// Endpoint 3: Get position fees
routes.get(
  "/chains/:chainId/positions/:id/fees",
  describeRoute({
    tags: ["Positions"],
    summary: "Get position unclaimed fees",
    description: "Calculates and returns the unclaimed trading fees for a specific Uniswap V3 position",
    responses: {
      200: {
        description: "Successfully calculated fees",
        content: {
          "application/json": {
            schema: resolver(positionFeesSchema),
          },
        },
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      404: {
        description: "Position not found",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator("param", chainPositionParamSchema),
  async (c) => {
    try {
      const { chainId, id } = c.req.valid("param") as ChainPositionParam;

      const result = await getContainer(chainId).resolve(GetPositionFeesUseCase).execute(id);

      if (result.isErr()) {
        return mapToHttpResponse(c, result.error);
      }

      return c.json(result.value);
    } catch (error) {
      return mapToHttpResponse(c, error);
    }
  },
);
