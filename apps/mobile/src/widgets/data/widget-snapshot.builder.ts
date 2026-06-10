import { PROTOCOLS_META } from "@depthly/catalog";
import type { TGatewayPosition, TPositionByExt, TTokensMap } from "positions/domain/types";

import type { TWidgetExtension, TWidgetPair, TWidgetPosition, TWidgetSnapshot, TWidgetStatus, TWidgetToken } from "../domain/types";
import { formatWidgetAmount } from "./format";

type BuildArgs = {
  positions: readonly TGatewayPosition[];
  following: Set<string>;
  invertedRefs: Set<string>;
  tokens: TTokensMap;
  now: number;
};

const STATUS_MAP: Record<string, TWidgetStatus> = {
  "in-range": "in-range",
  "out-of-range": "out-of-range",
  closed: "closed",
};

export function buildWidgetSnapshot(args: BuildArgs): TWidgetSnapshot {
  const positions = args.positions
    .filter((p) => args.following.has(p.ref))
    .map((p) => buildPosition(p, args.invertedRefs.has(p.ref), args.tokens))
    .filter((p): p is TWidgetPosition => p !== null);

  return { v: 1, writtenAt: args.now, positions };
}

function buildPosition(position: TGatewayPosition, inverted: boolean, tokens: TTokensMap): TWidgetPosition | null {
  const ext = mapExtension(position);
  if (ext === null) return null;

  const meta = PROTOCOLS_META[position.protocol as keyof typeof PROTOCOLS_META];
  const principals = position.tokens.filter((t) => t.role === "principal").map((t) => toWidgetToken(t.tokenRef, t.balance.formatted, tokens));
  const fees = position.tokens.filter((t) => t.role === "fee").map((t) => toWidgetToken(t.tokenRef, t.balance.formatted, tokens));

  return {
    ref: position.ref,
    chainId: position.chainId,
    protocol: position.protocol,
    protocolLabel: meta?.label ?? position.protocol,
    brandColor: meta?.brandColor ?? "#888888",
    containerLabel: position.container.label,
    status: STATUS_MAP[position.status.state] ?? "closed",
    pair: buildPair(principals, inverted),
    principals,
    fees,
    extension: ext,
  };
}

function toWidgetToken(tokenRef: string, formatted: string, tokens: TTokensMap): TWidgetToken {
  const meta = tokens[tokenRef];
  return {
    symbol: meta?.symbol ?? tokenRef,
    iconUrl: meta?.iconUrl ?? "",
    formatted: formatWidgetAmount(formatted),
  };
}

function buildPair(principals: TWidgetToken[], inverted: boolean): TWidgetPair {
  const [a, b] = principals;
  if (!a || !b) {
    return {
      sym0: a?.symbol ?? "?",
      sym1: b?.symbol ?? "?",
      icon0: a?.iconUrl ?? "",
      icon1: b?.iconUrl ?? "",
    };
  }
  return inverted
    ? { sym0: b.symbol, sym1: a.symbol, icon0: b.iconUrl, icon1: a.iconUrl }
    : { sym0: a.symbol, sym1: b.symbol, icon0: a.iconUrl, icon1: b.iconUrl };
}

function mapExtension(position: TGatewayPosition): TWidgetExtension | null {
  switch (position.extension.type) {
    case "uniswap-v3": {
      const ext = (position as TPositionByExt<"uniswap-v3">).extension;
      return {
        type: "uniswap-v3",
        feeTierLabel: ext.feeTierLabel,
        nftTokenId: ext.nftTokenId,
        range: {
          tickLower: ext.tickLower,
          tickUpper: ext.tickUpper,
          currentTick: ext.pool.currentTick,
        },
      };
    }
    default:
      return null;
  }
}
