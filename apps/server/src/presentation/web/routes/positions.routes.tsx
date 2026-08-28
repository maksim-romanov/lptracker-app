import { Hono } from "hono";
import { validator } from "hono-openapi";
import * as v from "valibot";

import { POSITION_REF_REGEX, parsePositionRef } from "../../v1/schemas/request.schemas";
import { DEFAULT_POSITIONS_LAYOUT, POSITIONS_LAYOUTS } from "../positions-layout";
import { ErrorBanner } from "../views/components/Banner/ErrorBanner/ErrorBanner";
import { PositionDetail } from "../views/positions/PositionDetail/PositionDetail";
import { PositionItem } from "../views/positions/PositionItem/PositionItem";
import { Positions } from "../views/positions/Positions/Positions";
import { NoWallets } from "../views/wallets/NoWallets/NoWallets";
import { webPositionsQuerySchema } from "./query.schema";
import { webValidationHook } from "./validation";
import { listPositions } from "#app/positions/list-positions";
import { protocolRegistry } from "#app/protocols/registry";
import { UNISWAP_V3_EXTENSION_TYPE } from "#features/uniswap-v3/presentation/schemas/extension.schema";
import { type ICardVM, mapPositionToCardVM, type TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";
import { TokensMapBuilder } from "#shared/tokens/tokens-map";

export const webRoutes = new Hono();

const refParamSchema = v.object({
  ref: v.pipe(v.string(), v.regex(POSITION_REF_REGEX, "invalid position ref")),
});

// The list leads with the positions that need a decision and trails with the ones that
// cannot need one. Ties break on ref so the order is stable across polls — an ordering
// that reshuffles under a list the user is reading is worse than no ordering at all.
const URGENCY: Record<TPositionRangeTone, number> = {
  "out-of-range": 0,
  "near-lower": 1,
  "near-upper": 1,
  "in-range": 2,
  closed: 3,
};

const byUrgency = (a: ICardVM, b: ICardVM): number => URGENCY[a.rangeTone] - URGENCY[b.rangeTone] || a.ref.localeCompare(b.ref);

const positionQuerySchema = v.object({
  inverted: v.optional(v.picklist(["0", "1"]), "0"),
  layout: v.optional(v.picklist(POSITIONS_LAYOUTS), DEFAULT_POSITIONS_LAYOUT),
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

  const cards = positions
    .filter((p) => p.extension.type === "uniswap-v3")
    .map((p) => mapPositionToCardVM(p, tokens, { inverted: invertedSet.has(p.ref) }))
    .sort(byUrgency);

  return c.html(
    <>
      {partialFailures.length > 0 && <ErrorBanner message={`${partialFailures.length} source(s) failed to load — showing partial results.`} />}
      <Positions cards={cards} layout={query.layout} />
    </>,
  );
});

type TCardResult = { card: ReturnType<typeof mapPositionToCardVM> } | { error: ReturnType<typeof ErrorBanner>; status: 400 | 422 | 502 };

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
  if (result.isErr()) return { error: <ErrorBanner message="Could not load position" />, status: 502 };

  const position = result.value.position;
  if (position.extension.type !== UNISWAP_V3_EXTENSION_TYPE) return { error: <ErrorBanner message="Unsupported position type" />, status: 422 };

  const tokensBuilder = new TokensMapBuilder();
  tokensBuilder.add(result.value.tokenMetaInputs);
  return { card: mapPositionToCardVM(position, tokensBuilder.build(), { inverted }) };
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
    const r = await loadCardVM(c.req.valid("param").ref, c.req.valid("query").inverted === "1");
    return "error" in r ? c.html(r.error, r.status) : c.html(<PositionDetail card={r.card} />);
  },
);
