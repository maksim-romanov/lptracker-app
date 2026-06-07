import type { ComponentType } from "react";

import type { TKnownExtensionType, TPositionByExt, TTokensMap } from "./types";

export interface IProtocolPluginMeta {
  readonly label: string;
  readonly brandColor: string;
  readonly iconUrl: string;
}

export interface IProtocolPlugin<T extends TKnownExtensionType> {
  readonly type: T;
  readonly meta: IProtocolPluginMeta;
  readonly supportedVersions: ReadonlyArray<number>;
  buildRef(input: { chainId: number; id: string }): string;
  readonly components: {
    ListBody: ComponentType<{ position: TPositionByExt<T>; tokens: TTokensMap }>;
    DetailBody: ComponentType<{ position: TPositionByExt<T>; tokens: TTokensMap }>;
    Strip?: ComponentType<{ position: TPositionByExt<T>; tokens: TTokensMap }>;
  };
}
