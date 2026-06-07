export interface INetworkEntry {
  readonly chainId: number;
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
  readonly nativeCurrency: { symbol: string; name: string; decimals: number };
  readonly explorerUrl: string;
}

export interface IProtocolMeta {
  readonly slug: string;
  readonly version: string;
  readonly label: string;
  readonly brandColor: string;
  readonly supportedChainIds: ReadonlyArray<number>;
  readonly capabilities: ReadonlyArray<string>;
  readonly extensionVersion: number;
}
