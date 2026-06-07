import type { TKnownProtocolSlug } from "@mars-909/catalog";
import type { components } from "core/api-client/generated/gateway";

export type TGatewayPosition = components["schemas"]["Position"];
export type TTokensMap = components["schemas"]["TokensMap"];

export type TKnownExtensionType = TKnownProtocolSlug;

export type TPositionByExt<T extends TKnownExtensionType> = Omit<TGatewayPosition, "extension"> & {
  extension: Extract<TGatewayPosition["extension"], { type: T }>;
};
