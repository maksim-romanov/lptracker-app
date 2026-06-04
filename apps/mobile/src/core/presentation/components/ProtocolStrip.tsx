import type { ComponentType } from "react";

import type { Protocol } from "core/config/protocol-logos";

import { UniswapV3Strip } from "./UniswapV3Strip";

const STRIPS: Record<Protocol, ComponentType> = {
  "uniswap-v3": UniswapV3Strip,
};

type Props = {
  protocol: Protocol;
};

export const ProtocolStrip = ({ protocol }: Props) => {
  const Strip = STRIPS[protocol];
  return <Strip />;
};
