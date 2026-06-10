export type TWidgetStatus = "in-range" | "out-of-range" | "closed";

export type TWidgetToken = {
  symbol: string;
  iconUrl: string;
  formatted: string;
};

export type TWidgetPair = {
  sym0: string;
  sym1: string;
  icon0: string;
  icon1: string;
};

export type TWidgetTickRange = {
  tickLower: number;
  tickUpper: number;
  currentTick: number;
  decimalsDelta: number;
};

export type TWidgetExtension =
  | { type: "uniswap-v3"; feeTierLabel: string; nftTokenId: string; range: TWidgetTickRange }
  | { type: "uniswap-v4"; feeTierLabel: string; poolId: string }
  | { type: "aerodrome"; feeTierLabel: string; positionId: string }
  | { type: "velodrome"; feeTierLabel: string; positionId: string };

export type TWidgetPosition = {
  ref: string;
  chainId: number;
  protocol: string;
  protocolLabel: string;
  brandColor: string;
  containerLabel: string;
  status: TWidgetStatus;
  pair: TWidgetPair;
  principals: TWidgetToken[];
  fees: TWidgetToken[];
  extension: TWidgetExtension;
};

export type TWidgetSnapshot = {
  v: 1;
  writtenAt: number;
  positions: TWidgetPosition[];
};
