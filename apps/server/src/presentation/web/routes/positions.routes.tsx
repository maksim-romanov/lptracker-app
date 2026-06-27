import { Hono } from "hono";
import { validator } from "hono-openapi";
import { TokensMapBuilder } from "shared/tokens/tokens-map";
import * as v from "valibot";

import { listPositions } from "../../../app/positions/list-positions";
import { protocolRegistry } from "../../../app/protocols/registry";
import { UNISWAP_V3_EXTENSION_TYPE } from "../../../features/uniswap-v3/presentation/schemas/extension.schema";
import { mapPositionToCardVM } from "../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { POSITION_REF_REGEX, parsePositionRef } from "../../v1/schemas/request.schemas";
import { Empty } from "../views/fragments/Empty";
import { ErrorBanner } from "../views/fragments/ErrorBanner";
import { PositionCard } from "../views/fragments/PositionCard";
import { PositionDetail } from "../views/fragments/PositionDetail";
import { Positions } from "../views/fragments/Positions";
import { webPositionsQuerySchema } from "./query.schema";
import { webValidationHook } from "./validation";

export const webRoutes = new Hono();

const refParamSchema = v.object({
  ref: v.pipe(v.string(), v.regex(POSITION_REF_REGEX, "invalid position ref")),
});

const cardQuerySchema = v.object({
  inverted: v.optional(v.picklist(["0", "1"]), "0"),
});

webRoutes.get("/positions", validator("query", webPositionsQuerySchema, webValidationHook), async (c) => {
  const query = c.req.valid("query");
  const wallets = query.wallets ?? [];
  const invertedSet = query.inverted ?? new Set<string>();

  if (wallets.length === 0) {
    return c.html(<Empty reason="no-wallets" />);
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
    .map((p) => mapPositionToCardVM(p, tokens, { inverted: invertedSet.has(p.ref) }));

  return c.html(
    <>
      {partialFailures.length > 0 && <ErrorBanner message={`${partialFailures.length} source(s) failed to load — showing partial results.`} />}
      <Positions cards={cards} />
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
  "/positions/:ref/card",
  validator("param", refParamSchema, webValidationHook),
  validator("query", cardQuerySchema, webValidationHook),
  async (c) => {
    const r = await loadCardVM(c.req.valid("param").ref, c.req.valid("query").inverted === "1");
    return "error" in r ? c.html(r.error, r.status) : c.html(<PositionCard card={r.card} />);
  },
);

webRoutes.get(
  "/positions/:ref/detail",
  validator("param", refParamSchema, webValidationHook),
  validator("query", cardQuerySchema, webValidationHook),
  async (c) => {
    const r = await loadCardVM(c.req.valid("param").ref, c.req.valid("query").inverted === "1");
    return "error" in r ? c.html(r.error, r.status) : c.html(<PositionDetail card={r.card} />);
  },
);
