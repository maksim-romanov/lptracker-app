import { FEE_ACCRUAL_MODES, PROTOCOLS_META } from "@depthly/catalog";
import { toDecimalString } from "@depthly/protocol-math/format";
import { tokensDataUrls } from "core/tokens-data/urls";
import type { TGatewayPosition, TPositionByExt, TTokensMap } from "positions/domain/types";

import type {
  TWidgetExtension,
  TWidgetPair,
  TWidgetPosition,
  TWidgetPriceBounds,
  TWidgetPriceRange,
  TWidgetSnapshot,
  TWidgetStatus,
  TWidgetToken,
} from "../domain/types";
import { formatWidgetAmount, formatWidgetBoundLabel, formatWidgetPrice, UNBOUNDED_PRICE } from "./format";

type BuildArgs = {
  positions: readonly TGatewayPosition[];
  following: Set<string>;
  tokens: TTokensMap;
  now: number;
};

const STATUS_MAP: Record<string, TWidgetStatus> = {
  "in-range": "in-range",
  "out-of-range": "out-of-range",
  closed: "closed",
};

export function buildWidgetSnapshot(args: BuildArgs): TWidgetSnapshot {
  const positions = args.positions.filter((p) => args.following.has(p.ref)).map((p) => buildPosition(p, args.tokens));

  return { v: 1, writtenAt: args.now, positions };
}

function buildPosition(position: TGatewayPosition, tokens: TTokensMap): TWidgetPosition {
  const ext = mapExtension(position);

  const meta = PROTOCOLS_META[position.protocol as keyof typeof PROTOCOLS_META];
  const principals = position.tokens.filter((t) => t.role === "principal").map((t) => toWidgetToken(t.tokenRef, t.balance.formatted, tokens));
  const owed = position.tokens.filter((t) => t.role === "owed").map((t) => toWidgetToken(t.tokenRef, t.balance.formatted, tokens));

  return {
    ref: position.ref,
    chainId: position.chainId,
    protocol: position.protocol,
    protocolLabel: meta?.label ?? position.protocol,
    brandColor: meta?.brandColor ?? "#888888",
    containerLabel: position.container.label,
    status: STATUS_MAP[position.status.state] ?? "closed",
    pair: buildPair(principals),
    principals,
    fees: owed,
    // Optional chained: a server mid-rollout can send a position without it, and one throw here
    // skips the whole snapshot write, which leaves every installed widget stale.
    feeMode: position.feeAccrual?.mode ?? FEE_ACCRUAL_MODES.unknown,
    extension: ext,
  };
}

function toWidgetToken(tokenRef: string, formatted: string, tokens: TTokensMap): TWidgetToken {
  const meta = tokens[tokenRef];
  return {
    symbol: meta?.symbol ?? tokenRef,
    iconUrl: tokensDataUrls.resolve(meta?.iconUrl) ?? "",
    formatted: formatWidgetAmount(formatted),
  };
}

function buildPair(principals: TWidgetToken[]): TWidgetPair {
  const [a, b] = principals;
  return {
    sym0: a?.symbol ?? "?",
    sym1: b?.symbol ?? "?",
    icon0: a?.iconUrl ?? "",
    icon1: b?.iconUrl ?? "",
  };
}

function mapExtension(position: TGatewayPosition): TWidgetExtension {
  switch (position.extension.type) {
    case "uniswap-v3": {
      const ext = (position as TPositionByExt<"uniswap-v3">).extension;
      return {
        type: "uniswap-v3",
        feeTierLabel: ext.feeTierLabel,
        nftTokenId: ext.nftTokenId,
        priceRange: buildPriceRange(position.range),
      };
    }
    default:
      return { type: "unknown", raw: position.extension.type };
  }
}

function buildPriceRange(range: TGatewayPosition["range"]): TWidgetPriceRange | null {
  if (!range) return null;

  return {
    quoted: buildPriceBounds(range.lower, range.upper, range.current),
    inverted: buildPriceBounds(invertBound(range.upper), invertBound(range.lower), invertPrice(range.current)),
  };
}

function buildPriceBounds(lower: string | null, upper: string | null, current: string): TWidgetPriceBounds {
  return {
    lower,
    upper,
    current,
    lowerLabel: formatWidgetBoundLabel(lower, "low"),
    upperLabel: formatWidgetBoundLabel(upper, "high"),
    currentLabel: formatWidgetPrice(current),
  };
}

// An unbounded bound stays unbounded once flipped, it only changes which end of the bar it is —
// and so does a zero, whose inverse is unbounded rather than zero. buildPriceRange swaps the two
// ends, so null here lands at the end the flipped bound belongs to.
//
// A bound that does not parse is not unbounded: null would draw it at an end of the scale. It
// keeps its own string, which the label formatter already renders as unreadable rather than as
// a magnitude.
function invertBound(price: string | null): string | null {
  if (price === null) return null;
  const value = Number(price);
  if (!Number.isFinite(value)) return price;
  const inverse = 1 / value;
  if (!Number.isFinite(inverse) || inverse === 0) return null;
  return toDecimalString(inverse);
}

// `current` has no null on this wire, so an inverse off the top of the scale saturates at the
// value the labels already draw as unbounded rather than falling to the bottom of it. Only a
// price of zero inverts that way: a price that does not parse keeps its own string, because
// saturating it would pin the thumb at the far right and report a broken number as a real one.
function invertPrice(price: string): string {
  const value = Number(price);
  if (!Number.isFinite(value)) return price;
  const inverse = 1 / value;
  return Number.isFinite(inverse) ? toDecimalString(inverse) : String(UNBOUNDED_PRICE);
}
