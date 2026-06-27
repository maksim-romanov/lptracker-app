import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import {
  type DetailResponse,
  detailResponseSchema,
  ERROR_CODES,
  errorResponseSchema,
  type ListResponse,
  listResponseSchema,
  type Position,
} from "shared/contracts";
import { DomainError } from "shared/errors/base.error";
import { TokensMapBuilder } from "shared/tokens/tokens-map";

import { listPositions } from "../../app/positions/list-positions";
import { protocolRegistry } from "../../app/protocols/registry";
import { badRequest, mapErrorToHttpResponse, notFound, validationHook } from "./error-mapper";
import { positionSchema } from "./schemas/position.schema";
import { parsePositionRef, positionRefParamSchema, positionsListQuerySchema } from "./schemas/request.schemas";

export const positionsRoutes = new Hono();

positionsRoutes.get(
  "/",
  describeRoute({
    tags: ["Positions"],
    summary: "List positions across wallets, chains, and protocols",
    description:
      "Returns all positions across the requested scope, sorted by updatedAt desc. Each chain×protocol source is capped server-side. Effective scope is the intersection of each wallet's chains and each protocol's supported chains.",
    responses: {
      200: {
        description: "Merged list of positions",
        content: {
          "application/json": {
            schema: resolver(listResponseSchema(positionSchema)),
          },
        },
      },
      400: {
        description: "Validation error",
        content: { "application/json": { schema: resolver(errorResponseSchema) } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: resolver(errorResponseSchema) } },
      },
    },
  }),
  validator("query", positionsListQuerySchema, validationHook),
  async (c) => {
    const query = c.req.valid("query");

    if (query.protocols) {
      const unknown = query.protocols.filter((slug) => !protocolRegistry.bySlug(slug));
      if (unknown.length > 0) {
        return badRequest(c, ERROR_CODES.PROTOCOL_UNSUPPORTED, `Unknown protocols: ${unknown.join(", ")}`, "protocols");
      }
    }

    const { positions, tokens, partialFailures, resolvedScope } = await listPositions({
      wallets: query.wallets,
      protocols: query.protocols,
      status: query.status,
    });

    const body: ListResponse<Position> = { data: positions, tokens };

    c.header("X-Resolved-Scope", JSON.stringify(resolvedScope));
    if (partialFailures.length > 0) {
      c.header("Warning", `199 - "partial-results: ${partialFailures.length} source(s) failed"`);
      c.header("X-Partial-Failures", JSON.stringify(partialFailures));
    }
    return c.json(body);
  },
);

positionsRoutes.get(
  "/:ref",
  describeRoute({
    tags: ["Positions"],
    summary: "Get a single position by ref",
    description: "Returns the full detail for one position. `ref` is opaque — obtain from list responses.",
    responses: {
      200: {
        description: "Position detail",
        content: {
          "application/json": {
            schema: resolver(detailResponseSchema(positionSchema)),
          },
        },
      },
      400: { description: "Validation error", content: { "application/json": { schema: resolver(errorResponseSchema) } } },
      404: { description: "Position not found", content: { "application/json": { schema: resolver(errorResponseSchema) } } },
      500: { description: "Internal server error", content: { "application/json": { schema: resolver(errorResponseSchema) } } },
    },
  }),
  validator("param", positionRefParamSchema, validationHook),
  async (c) => {
    const { ref } = c.req.valid("param");

    const parsed = parsePositionRef(ref);
    if (!parsed) return badRequest(c, ERROR_CODES.INVALID_REF, "Could not parse position ref", "ref");

    const protocol = protocolRegistry.bySlug(parsed.protocol);
    if (!protocol) return badRequest(c, ERROR_CODES.PROTOCOL_UNSUPPORTED, `Unknown protocol: ${parsed.protocol}`, "ref");

    if (!protocol.supportedChainIds.includes(parsed.chainId)) {
      return badRequest(c, ERROR_CODES.CHAIN_UNSUPPORTED, `Protocol ${parsed.protocol} does not support chain ${parsed.chainId}`, "ref");
    }

    try {
      const result = await protocol.getPositionByRef({
        positionRef: ref,
        chainId: parsed.chainId,
        protocolPositionId: parsed.protocolPositionId,
      });

      if (result.isErr()) return mapErrorToHttpResponse(c, result.error);

      const mapped = result.value;
      const tokensBuilder = new TokensMapBuilder();
      tokensBuilder.add(mapped.tokenMetaInputs);

      const body: DetailResponse<Position> = {
        data: mapped.position,
        tokens: tokensBuilder.build(),
      };

      return c.json(body);
    } catch (error) {
      if (DomainError.isInstance(error)) return mapErrorToHttpResponse(c, error);
      return notFound(c, ERROR_CODES.POSITION_NOT_FOUND, "Position not found");
    }
  },
);
