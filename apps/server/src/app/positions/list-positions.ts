import { getLogger } from "@depthly/logger";
import type { Result } from "neverthrow";
import type { MapPositionResult, Position, TokensMap, WalletScopeEntry } from "shared/contracts";
import type { DomainError } from "shared/errors/base.error";
import { TokensMapBuilder } from "shared/tokens/tokens-map";

import { isKnownChainId } from "../networks/catalog";
import { protocolRegistry } from "../protocols/registry";
import type { ProtocolEntry } from "../protocols/types";

const logger = getLogger(["server", "list-positions"]);

// Hard cap per upstream source (wallet×chain×protocol). Revisit when real wallets approach it.
export const MAX_PER_SOURCE = 200;

export interface IListPositionsScope {
  wallets: WalletScopeEntry[];
  protocols?: string[];
  status?: "open" | "closed" | "all";
}
export interface IResolvedRef {
  address: string;
  chainId: number;
  protocol: string;
}
export interface IPartialFailure {
  protocol: string;
  chainId: number;
  message: string;
}
export interface IListPositionsResult {
  positions: Position[];
  tokens: TokensMap;
  partialFailures: IPartialFailure[];
  resolvedScope: IResolvedRef[];
}
export interface IListPositionsDeps {
  registry: Pick<typeof protocolRegistry, "all" | "bySlug">;
  isKnownChainId: (id: number) => boolean;
}

interface IResolvedTriple {
  wallet: WalletScopeEntry;
  chainId: number;
  protocol: ProtocolEntry;
}

const resolveScope = (wallets: WalletScopeEntry[], protocolFilter: string[] | undefined, deps: IListPositionsDeps): IResolvedTriple[] => {
  const protocols = protocolFilter ? deps.registry.all().filter((p) => protocolFilter.includes(p.slug)) : deps.registry.all();
  const triples: IResolvedTriple[] = [];
  for (const wallet of wallets) {
    for (const chainId of wallet.chainIds) {
      if (!deps.isKnownChainId(chainId)) continue;
      for (const protocol of protocols) {
        if (!protocol.supportedChainIds.includes(chainId)) continue;
        triples.push({ wallet, chainId, protocol });
      }
    }
  }
  return triples;
};

export const listPositions = async (scope: IListPositionsScope, deps?: IListPositionsDeps): Promise<IListPositionsResult> => {
  const resolvedDeps: IListPositionsDeps = deps ?? { registry: protocolRegistry, isKnownChainId };
  const triples = resolveScope(scope.wallets, scope.protocols, resolvedDeps);
  const closed = scope.status === "closed";
  const upstreamFilter = scope.status === "all" ? undefined : { closed };

  const results = await Promise.all(
    triples.map(
      (triple): Promise<Result<MapPositionResult[], DomainError>> =>
        triple.protocol.listPositionsForChain({
          ownerAddress: triple.wallet.address,
          chainId: triple.chainId,
          pagination: { limit: MAX_PER_SOURCE, offset: 0 },
          filters: upstreamFilter,
        }),
    ),
  );

  const tokensBuilder = new TokensMapBuilder();
  const positions: Position[] = [];
  const partialFailures: IPartialFailure[] = [];

  for (const [i, res] of results.entries()) {
    const triple = triples[i];
    if (!triple) continue;
    if (res.isErr()) {
      partialFailures.push({ protocol: triple.protocol.slug, chainId: triple.chainId, message: res.error.message });
      logger.error("source failed", { protocol: triple.protocol.slug, chainId: triple.chainId, error: res.error });
      continue;
    }
    for (const mapped of res.value) {
      positions.push(mapped.position);
      tokensBuilder.add(mapped.tokenMetaInputs);
    }
  }

  positions.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : a.ref.localeCompare(b.ref)));

  return {
    positions,
    tokens: tokensBuilder.build(),
    partialFailures,
    resolvedScope: triples.map((t) => ({ address: t.wallet.address, chainId: t.chainId, protocol: t.protocol.slug })),
  };
};
