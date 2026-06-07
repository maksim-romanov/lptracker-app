import { PROTOCOLS_META } from "@mars-909/catalog";
import type { IProtocolPlugin } from "positions/domain/plugin.contract";

import { DetailBody } from "./presentation/components/DetailBody";
import { ListBody } from "./presentation/components/ListBody";
import { Strip } from "./presentation/components/Strip";

const META = PROTOCOLS_META["uniswap-v3"];

export const uniswapV3Plugin: IProtocolPlugin<"uniswap-v3"> = {
  type: "uniswap-v3",
  meta: {
    label: META.label,
    brandColor: META.brandColor,
    iconUrl: "",
  },
  supportedVersions: [META.extensionVersion],
  buildRef: ({ chainId, id }) => `uniswap-v3:${chainId}:${id}`,
  components: { ListBody, DetailBody, Strip },
};
