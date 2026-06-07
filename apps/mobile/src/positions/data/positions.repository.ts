import type { TGatewayPosition, TKnownExtensionType, TTokensMap } from "positions/domain/types";

export interface TPositionsListParams {
  readonly wallets: ReadonlyArray<{
    readonly address: string;
    readonly chainIds: ReadonlyArray<number>;
  }>;
  readonly protocols?: ReadonlyArray<TKnownExtensionType>;
  readonly status?: "open" | "closed" | "all";
  readonly cursor?: string;
  readonly limit?: number;
}

export interface TPartialMeta {
  readonly failures: ReadonlyArray<{ address: string; chainId: number; protocol: string }>;
  readonly warning: string | null;
}

export interface TPositionsListResult {
  readonly data: ReadonlyArray<TGatewayPosition>;
  readonly tokens: TTokensMap;
  readonly page?: { readonly nextCursor?: string };
  readonly meta: { readonly partial?: TPartialMeta };
}

export interface TPositionsDetailResult {
  readonly data: TGatewayPosition;
  readonly tokens: TTokensMap;
}

export interface IPositionsRepository {
  list(params: TPositionsListParams): Promise<TPositionsListResult>;
  getByRef(ref: string): Promise<TPositionsDetailResult>;
}
