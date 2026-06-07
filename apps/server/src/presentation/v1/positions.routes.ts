import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import type { Result } from "neverthrow";
import {
  type DetailResponse,
  decodeCursor,
  detailResponseSchema,
  ERROR_CODES,
  encodeCursor,
  errorResponseSchema,
  type ListResponse,
  listResponseSchema,
  type MapPositionResult,
  type Position,
} from "shared/contracts";
import { DomainError } from "shared/errors/base.error";
import { container } from "tsyringe";

import { isKnownChainId } from "../../app/networks/catalog";
import { protocolRegistry } from "../../app/protocols/registry";
import type { ProtocolEntry } from "../../app/protocols/types";
import { badRequest, mapErrorToHttpResponse, notFound, validationHook } from "./error-mapper";
import { positionSchema } from "./schemas/position.schema";
import { parsePositionRef, positionRefParamSchema, positionsListQuerySchema, type WalletScopeEntry } from "./schemas/request.schemas";
import { TokensMapBuilder } from "./utils/tokens-map";

export const positionsRoutes = new Hono();

const buildUpstreamPagination = (cursorOffset: number, limit: number) => ({ limit: cursorOffset + limit, offset: 0 });

interface ResolvedTriple {
  wallet: WalletScopeEntry;
  chainId: number;
  protocol: ProtocolEntry;
}

const resolveScope = (wallets: WalletScopeEntry[], protocolFilter: string[] | undefined): ResolvedTriple[] => {
  const protocols = protocolFilter ? protocolRegistry.all().filter((p) => protocolFilter.includes(p.slug)) : protocolRegistry.all();
  const triples: ResolvedTriple[] = [];

  for (const wallet of wallets) {
    for (const chainId of wallet.chainIds) {
      if (!isKnownChainId(chainId)) continue;
      for (const protocol of protocols) {
        if (!protocol.supportedChainIds.includes(chainId)) continue;
        triples.push({ wallet, chainId, protocol });
      }
    }
  }

  return triples;
};

positionsRoutes.get(
  "/",
  describeRoute({
    tags: ["Positions"],
    summary: "List positions across wallets, chains, and protocols",
    description:
      "Returns positions across the requested scope (per-wallet chain selection). Effective scope is the intersection of each wallet's chains and each protocol's supported chains.",
    responses: {
      200: {
        description: "Paginated list of positions",
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

    const cursorOffset = query.cursor ? decodeCursor(query.cursor)?.offset : 0;
    if (cursorOffset === undefined) {
      return badRequest(c, ERROR_CODES.INVALID_CURSOR, "Cursor is malformed", "cursor");
    }

    const limit = query.limit;
    const triples = resolveScope(query.wallets, query.protocols);

    const closed = query.status === "closed";
    const upstreamFilter = query.status === "all" ? undefined : { closed };

    const results = await Promise.all(
      triples.map(
        async (triple): Promise<Result<MapPositionResult[], DomainError>> =>
          triple.protocol.listPositionsForChain({
            ownerAddress: triple.wallet.address,
            chainId: triple.chainId,
            pagination: buildUpstreamPagination(cursorOffset, limit),
            filters: upstreamFilter,
          }),
      ),
    );

    const tokensBuilder = container.resolve(TokensMapBuilder);
    const allPositions: Position[] = [];
    const partialFailures: { protocol: string; chainId: number; message: string }[] = [];

    for (const [i, res] of results.entries()) {
      const triple = triples[i]!;
      if (res.isErr()) {
        partialFailures.push({ protocol: triple.protocol.slug, chainId: triple.chainId, message: res.error.message });
        continue;
      }
      for (const mapped of res.value) {
        allPositions.push(mapped.position);
        tokensBuilder.add(mapped.tokenMetaInputs);
      }
    }

    allPositions.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : a.ref.localeCompare(b.ref)));

    const page = allPositions.slice(cursorOffset, cursorOffset + limit);
    const nextCursor = cursorOffset + limit < allPositions.length ? encodeCursor({ offset: cursorOffset + limit }) : null;

    const body: ListResponse<Position> = {
      data: page,
      tokens: tokensBuilder.build(),
      page: { cursor: nextCursor, limit },
    };

    c.header(
      "X-Resolved-Scope",
      JSON.stringify(triples.map((t) => ({ address: t.wallet.address, chainId: t.chainId, protocol: t.protocol.slug }))),
    );
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
      const tokensBuilder = container.resolve(TokensMapBuilder);
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
