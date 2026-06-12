import { PROTOCOLS_META } from "@depthly/catalog";
import { tokensDataUrls } from "core/tokens-data/urls";
import type { TGatewayPosition, TPositionByExt, TTokensMap } from "positions/domain/types";

import type { TWidgetExtension, TWidgetPair, TWidgetPosition, TWidgetSnapshot, TWidgetStatus, TWidgetToken } from "../domain/types";
import { formatWidgetAmount } from "./format";

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
  const positions = args.positions
    .filter((p) => args.following.has(p.ref))
    .map((p) => buildPosition(p, args.tokens))
    .filter((p): p is TWidgetPosition => p !== null);

  return { v: 1, writtenAt: args.now, positions };
}

function buildPosition(position: TGatewayPosition, tokens: TTokensMap): TWidgetPosition | null {
  const ext = mapExtension(position, tokens);
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
    pair: buildPair(principals),
    principals,
    fees,
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

function mapExtension(position: TGatewayPosition, tokens: TTokensMap): TWidgetExtension | null {
  switch (position.extension.type) {
    case "uniswap-v3": {
      const ext = (position as TPositionByExt<"uniswap-v3">).extension;
      const principals = position.tokens.filter((t) => t.role === "principal");
      const baseDecimals = tokens[principals[0]?.tokenRef ?? ""]?.decimals ?? 18;
      const quoteDecimals = tokens[principals[1]?.tokenRef ?? ""]?.decimals ?? 18;
      return {
        type: "uniswap-v3",
        feeTierLabel: ext.feeTierLabel,
        nftTokenId: ext.nftTokenId,
        range: {
          tickLower: ext.tickLower,
          tickUpper: ext.tickUpper,
          currentTick: ext.pool.currentTick,
          decimalsDelta: baseDecimals - quoteDecimals,
        },
      };
    }
    default:
      return null;
  }
}
