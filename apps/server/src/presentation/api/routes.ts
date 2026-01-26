import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { container } from "tsyringe";
import * as v from "valibot";

import { GetAllPositionsUseCase } from "../../app/get-all-positions.usecase";
import {
  type GetAllPositionsQuery,
  getAllPositionsQuerySchema,
  type WalletAddressParam,
  walletAddressParamSchema,
} from "../schemas/request.schemas";
import { allPositionsResponseSchema } from "../schemas/response.schemas";
import { mapToHttpResponse } from "../utils/error-mapper";

const errorResponseSchema = v.object({
  error: v.string(),
  code: v.string(),
  details: v.optional(v.record(v.string(), v.unknown())),
});

export const routes = new Hono();

routes.get(
  "/wallets/:walletAddress/positions",
  describeRoute({
    tags: ["Positions"],
    summary: "List all wallet positions across protocols",
    description: "Retrieves all positions owned by a wallet address across all supported protocols and chains",
    responses: {
      200: {
        description: "Successfully retrieved positions",
        content: {
          "application/json": {
            schema: resolver(allPositionsResponseSchema),
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
  validator("query", getAllPositionsQuerySchema),
  async (c) => {
    try {
      const { walletAddress } = c.req.valid("param") as WalletAddressParam;
      const { limit, offset, closed } = c.req.valid("query") as GetAllPositionsQuery;

      const result = await container.resolve(GetAllPositionsUseCase).execute({
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
