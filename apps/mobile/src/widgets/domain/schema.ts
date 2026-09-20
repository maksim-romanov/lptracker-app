import * as v from "valibot";

import type { TWidgetSnapshot } from "./types";

const Token = v.object({
  symbol: v.string(),
  iconUrl: v.string(),
  formatted: v.string(),
});

const Pair = v.object({
  sym0: v.string(),
  sym1: v.string(),
  icon0: v.string(),
  icon1: v.string(),
});

const PriceBounds = v.object({
  lower: v.nullable(v.string()),
  upper: v.nullable(v.string()),
  current: v.string(),
  lowerLabel: v.string(),
  upperLabel: v.string(),
  currentLabel: v.string(),
});

const PriceRange = v.object({
  quoted: PriceBounds,
  inverted: PriceBounds,
});

const Extension = v.variant("type", [
  v.object({
    type: v.literal("uniswap-v3"),
    feeTierLabel: v.string(),
    nftTokenId: v.string(),
    priceRange: v.nullable(PriceRange),
  }),
  v.object({
    type: v.literal("uniswap-v4"),
    feeTierLabel: v.string(),
    poolId: v.string(),
  }),
  v.object({
    type: v.literal("aerodrome"),
    feeTierLabel: v.string(),
    positionId: v.string(),
  }),
  v.object({
    type: v.literal("velodrome"),
    feeTierLabel: v.string(),
    positionId: v.string(),
  }),
  v.object({
    type: v.literal("unknown"),
    raw: v.string(),
  }),
]);

const Position = v.object({
  ref: v.string(),
  chainId: v.number(),
  protocol: v.string(),
  protocolLabel: v.string(),
  brandColor: v.string(),
  containerLabel: v.string(),
  status: v.picklist(["in-range", "out-of-range", "closed"]),
  pair: Pair,
  principals: v.array(Token),
  fees: v.array(Token),
  feeMode: v.string(),
  extension: Extension,
});

export const WidgetSnapshotSchema = v.object({
  v: v.literal(1),
  writtenAt: v.number(),
  positions: v.array(Position),
});

export function assertWidgetSnapshot(value: unknown): TWidgetSnapshot {
  return v.parse(WidgetSnapshotSchema, value);
}
