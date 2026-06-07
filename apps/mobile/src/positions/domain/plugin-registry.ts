import type { ComponentType } from "react";

import type { IProtocolPlugin, IProtocolPluginMeta } from "./plugin.contract";
import type { TGatewayPosition, TKnownExtensionType, TTokensMap } from "./types";

type TErasedComponents = {
  ListBody: ComponentType<{ position: TGatewayPosition; tokens: TTokensMap }>;
  DetailBody: ComponentType<{ position: TGatewayPosition; tokens: TTokensMap }>;
  Strip?: ComponentType<{ position: TGatewayPosition; tokens: TTokensMap }>;
};

export interface IErasedProtocolPlugin {
  readonly type: TKnownExtensionType;
  readonly meta: IProtocolPluginMeta;
  readonly supportedVersions: ReadonlyArray<number>;
  readonly buildRef: (input: { chainId: number; id: string }) => string;
  readonly components: TErasedComponents;
}

type TPluginRegistry = { readonly [T in TKnownExtensionType]: IProtocolPlugin<T> };

export function lookupPlugin(type: string, version: number, plugins: TPluginRegistry): IErasedProtocolPlugin | undefined {
  const plugin = (plugins as Partial<Record<string, IErasedProtocolPlugin>>)[type];
  if (!plugin) return undefined;
  if (!plugin.supportedVersions.includes(version)) return undefined;
  return plugin;
}
