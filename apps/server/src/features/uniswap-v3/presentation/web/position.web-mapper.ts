import { FEE_ACCRUAL_MODES, PROTOCOLS_META } from "@depthly/catalog";
import { formatTokenAmount, formatTokenAmountShort } from "@depthly/protocol-math/format";

import { UNISWAP_V3_EXTENSION_TYPE, type UniswapV3Extension } from "../schemas/extension.schema";
import type { ICardVM, ITokenSideVM, TPositionRangeTone } from "#presentation/web/views/positions/card.vm";
import { derivePriceRangeVM, deriveRangeTone } from "#presentation/web/views/positions/price-range";
import type { Position, PositionRange, PositionToken, TokensMap } from "#shared/contracts";

const tokenSide = (positionToken: PositionToken, tokens: TokensMap): ITokenSideVM => {
  const meta = tokens[positionToken.tokenRef];
  return {
    tokenRef: positionToken.tokenRef,
    symbol: meta?.symbol ?? positionToken.tokenRef,
    formatted: formatTokenAmount(positionToken.balance.formatted, meta?.displayDecimals),
    formattedShort: formatTokenAmountShort(positionToken.balance.formatted),
    iconUrl: meta?.iconUrl ?? "",
  };
};

// Both amount lists are rendered as bare numbers whose slots the pair names, so they
// have to follow the pair through an inversion or the two swap places without it.
const displayOrder = (positionTokens: PositionToken[], inverted: boolean): PositionToken[] =>
  inverted ? [positionTokens[1], positionTokens[0]].filter((token): token is PositionToken => Boolean(token)) : positionTokens;

const derivePair = (principals: PositionToken[], tokens: TokensMap, inverted: boolean): ICardVM["pair"] => {
  const baseRef = principals[inverted ? 1 : 0]?.tokenRef ?? "";
  const quoteRef = principals[inverted ? 0 : 1]?.tokenRef ?? "";
  const baseMeta = tokens[baseRef];
  const quoteMeta = tokens[quoteRef];
  return {
    base: { tokenRef: baseRef, symbol: baseMeta?.symbol ?? baseRef, iconUrl: baseMeta?.iconUrl ?? "" },
    quote: { tokenRef: quoteRef, symbol: quoteMeta?.symbol ?? quoteRef, iconUrl: quoteMeta?.iconUrl ?? "" },
  };
};

// Every state this feature's contract mapper emits, and nothing else. A state outside the four
// is a state the card was never built for, and the one guess available — "in-range" — would
// paint a position that earns nothing as live. Throwing instead lets the board count it as
// unrenderable, which is what it is.
const TONE_BY_STATE: Record<string, TPositionRangeTone | undefined> = {
  "out-of-range": "out-of-range",
  drained: "drained",
  closed: "closed",
};

const deriveTone = (state: string, range: PositionRange, inverted: boolean): TPositionRangeTone => {
  if (state === "in-range") return deriveRangeTone(range, inverted);

  const tone = TONE_BY_STATE[state];
  if (!tone) throw new Error(`mapPositionToCardVM: unknown uniswap-v3 position state "${state}"`);
  return tone;
};

// app.uniswap.org names chains with its own slugs, which are a fact about Uniswap's interface
// rather than about the chain.
const UNISWAP_CHAIN_SLUGS: Record<number, string> = {
  1: "ethereum",
  8453: "base",
  42161: "arbitrum",
};

// A chain with no slug gets "unknown", which 404s. Falling back to a real chain's slug would
// hand the reader a link that opens confidently on the wrong network.
const uniswapPositionUrl = (chainId: number, nftTokenId: string): string =>
  `https://app.uniswap.org/positions/v3/${UNISWAP_CHAIN_SLUGS[chainId] ?? "unknown"}/${nftTokenId}`;

// Pinned to en-US rather than the host's locale: this renders on the server, so "the user's
// locale" is whichever machine happens to be serving, and a date that changes format with the
// deployment is worse than one that is consistently American.
const openedAt = (iso: string | null): string | null => {
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// An unregistered slug falls back to the slug itself rather than to a wrong protocol's name.
const protocolOf = (slug: string): ICardVM["protocol"] => ({
  slug,
  label: PROTOCOLS_META[slug as keyof typeof PROTOCOLS_META]?.label ?? slug,
});

export const mapPositionToCardVM = (position: Position, tokens: TokensMap, opts: { inverted: boolean }): ICardVM => {
  if (position.extension.type !== UNISWAP_V3_EXTENSION_TYPE) {
    throw new Error(`mapPositionToCardVM: expected uniswap-v3 extension, got "${position.extension.type}"`);
  }
  if (!position.range) {
    throw new Error(`mapPositionToCardVM: position ${position.ref} carries no range; the v3 contract mapper always fills one`);
  }
  const ext = position.extension as unknown as UniswapV3Extension;
  const { inverted } = opts;

  const chainId = Number(position.ref.split(":")[1]);

  const principals = position.tokens.filter((t) => t.role === "principal");
  const owedTokens = position.tokens.filter((t) => t.role === "owed");

  return {
    ref: position.ref,
    rangeTone: deriveTone(position.status.state, position.range, inverted),
    inverted,
    chainId,
    protocol: protocolOf(position.protocol),
    venueLabel: ext.feeTierLabel,
    positionLabel: `#${ext.nftTokenId}`,
    externalUrl: uniswapPositionUrl(chainId, ext.nftTokenId),
    pair: derivePair(principals, tokens, inverted),
    principal: displayOrder(principals, inverted).map((t) => tokenSide(t, tokens)),
    owed: displayOrder(owedTokens, inverted).map((t) => tokenSide(t, tokens)),
    priceRange: derivePriceRangeVM(position.range, tokens, inverted),
    poolAddress: ext.pool.address,
    ownerAddress: position.address,
    openedAtLabel: openedAt(position.createdAt),
    hasUnclaimedBalance: owedTokens.some((token) => Number(token.balance.formatted) > 0),
    feeMode: position.feeAccrual?.mode ?? FEE_ACCRUAL_MODES.unknown,
  };
};
