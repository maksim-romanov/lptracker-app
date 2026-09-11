import { getLogger } from "@depthly/logger";
import { Hono } from "hono";
import { validator } from "hono-openapi";
import * as v from "valibot";

import { mapDomainErrorToResponse } from "../../v1/error-mapper";
import { POSITION_REF_REGEX, parsePositionRef } from "../../v1/schemas/request.schemas";
import { DEFAULT_POSITIONS_LAYOUT, POSITIONS_LAYOUTS } from "../positions-layout";
import { ErrorBanner } from "../views/components/Banner/ErrorBanner/ErrorBanner";
import { type ICardVM, sortCardsByUrgency } from "../views/positions/card.vm";
import { NoPositions } from "../views/positions/NoPositions/NoPositions";
import { PositionDetail } from "../views/positions/PositionDetail/PositionDetail";
import { PositionItem } from "../views/positions/PositionItem/PositionItem";
import { Positions } from "../views/positions/Positions/Positions";
import { mapCardVM } from "../views/positions/web-card-mappers";
import { NoWallets } from "../views/wallets/NoWallets/NoWallets";
import { webPositionsQuerySchema } from "./query.schema";
import { webValidationHook } from "./validation";
import { listPositions } from "#app/positions/list-positions";
import { protocolRegistry } from "#app/protocols/registry";
import { TokensMapBuilder } from "#shared/tokens/tokens-map";

export const webRoutes = new Hono();

const logger = getLogger(["server", "web"]);

const refParamSchema = v.object({
  ref: v.pipe(v.string(), v.regex(POSITION_REF_REGEX, "invalid position ref")),
});

const boardBanner = (failedSources: number, unrenderable: number): string | null => {
  const parts: string[] = [];
  if (failedSources > 0) parts.push(`${failedSources} source${failedSources === 1 ? "" : "s"} could not be checked.`);
  if (unrenderable > 0) parts.push(`${unrenderable} position${unrenderable === 1 ? "" : "s"} could not be displayed.`);
  return parts.length > 0 ? parts.join(" ") : null;
};

const positionQuerySchema = v.object({
  inverted: v.optional(v.picklist(["0", "1"]), "0"),
  layout: v.optional(v.picklist(POSITIONS_LAYOUTS), DEFAULT_POSITIONS_LAYOUT),
  // Set only by the panel's own invert control: the board is still on screen behind the modal,
  // and its copy of this position has to turn round with the panel or the two disagree the
  // moment it closes. Opening the panel does not change anything, so it does not ask for this.
  sync: v.optional(v.picklist(["0", "1"]), "0"),
});

webRoutes.get("/positions", validator("query", webPositionsQuerySchema, webValidationHook), async (c) => {
  const query = c.req.valid("query");
  const wallets = query.wallets ?? [];
  const invertedSet = query.inverted ?? new Set<string>();

  if (wallets.length === 0) {
    return c.html(<NoWallets />);
  }

  if (query.protocols) {
    const unknown = query.protocols.filter((slug) => !protocolRegistry.bySlug(slug));
    if (unknown.length > 0) {
      return c.html(<ErrorBanner message={`Unknown protocols: ${unknown.join(", ")}`} />, 400);
    }
  }

  const { positions, tokens, partialFailures } = await listPositions({
    wallets,
    protocols: query.protocols,
    status: query.status,
  });

  const cards: ICardVM[] = [];
  let unrenderable = 0;
  for (const position of positions) {
    // A mapper throwing on a malformed extension would otherwise 500 the whole board, hiding
    // every other position behind one bad one.
    try {
      const card = mapCardVM(position, tokens, { inverted: invertedSet.has(position.ref) });
      if (card) cards.push(card);
      else unrenderable += 1;
    } catch (error) {
      logger.error("web board: card mapper threw", { ref: position.ref, error });
      unrenderable += 1;
    }
  }

  const banner = boardBanner(partialFailures.length, unrenderable);

  return c.html(
    <>
      {banner && <ErrorBanner message={banner} />}
      {cards.length > 0 && <Positions cards={sortCardsByUrgency(cards)} layout={query.layout} />}
      {/* The empty state asserts the wallets hold nothing. Any banner means that is untrue or unknown. */}
      {cards.length === 0 && !banner && <NoPositions />}
    </>,
  );
});

type TCardResult = { card: ICardVM } | { error: ReturnType<typeof ErrorBanner>; status: 200 | 400 | 404 | 502 };

const loadCardVM = async (ref: string, inverted: boolean): Promise<TCardResult> => {
  const parsed = parsePositionRef(ref);
  if (!parsed) return { error: <ErrorBanner message="Invalid position ref" />, status: 400 };

  const protocol = protocolRegistry.bySlug(parsed.protocol);
  if (!protocol) return { error: <ErrorBanner message={`Unknown protocol: ${parsed.protocol}`} />, status: 400 };

  const result = await protocol.getPositionByRef({
    positionRef: ref,
    chainId: parsed.chainId,
    protocolPositionId: parsed.protocolPositionId,
  });
  if (result.isErr()) {
    const notFound = mapDomainErrorToResponse(result.error).status === 404;
    return { error: <ErrorBanner message={notFound ? "Position not found" : "Could not load position"} />, status: notFound ? 404 : 502 };
  }

  const tokensBuilder = new TokensMapBuilder();
  tokensBuilder.add(result.value.tokenMetaInputs);
  const card = mapCardVM(result.value.position, tokensBuilder.build(), { inverted });
  // 200, not an error status: the position exists and loaded — only its rendering is missing.
  if (!card) return { error: <ErrorBanner message="This position could not be displayed" />, status: 200 };

  return { card };
};

webRoutes.get(
  "/positions/:ref/item",
  validator("param", refParamSchema, webValidationHook),
  validator("query", positionQuerySchema, webValidationHook),
  async (c) => {
    const query = c.req.valid("query");
    const r = await loadCardVM(c.req.valid("param").ref, query.inverted === "1");
    if ("error" in r) return c.html(r.error, r.status);
    return c.html(<PositionItem card={r.card} layout={query.layout} />);
  },
);

webRoutes.get(
  "/positions/:ref/detail",
  validator("param", refParamSchema, webValidationHook),
  validator("query", positionQuerySchema, webValidationHook),
  async (c) => {
    const query = c.req.valid("query");
    const r = await loadCardVM(c.req.valid("param").ref, query.inverted === "1");
    if ("error" in r) return c.html(r.error, r.status);

    // The row rides along out of band, wrapped in a <template> because a bare <tr> outside a
    // table is dropped by the HTML parser before htmx ever sees it.
    return c.html(
      <>
        <PositionDetail card={r.card} />
        {query.sync === "1" && (
          <template>
            <PositionItem card={r.card} layout={query.layout} oob />
          </template>
        )}
      </>,
    );
  },
);
