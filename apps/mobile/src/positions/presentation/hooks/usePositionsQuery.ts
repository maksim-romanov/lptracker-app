import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { container } from "core/di/container";
import { positionsKeys } from "core/query/keys/positions.keys";
import { GatewayPositionsRepository, type TPositionsListParams } from "positions/data/gateway-positions.repository";
import { WIDGET_SNAPSHOT_STORE } from "widgets/di";
import type { WidgetSnapshotStore } from "widgets/presentation/widget-snapshot.store";

export function usePositionsQuery(params: TPositionsListParams) {
  const repo = container.resolve(GatewayPositionsRepository);
  const query = useQuery({
    queryKey: positionsKeys.list(params).queryKey,
    queryFn: () => repo.list(params),
    enabled: params.wallets.length > 0,
    select: (data) => ({
      positions: data.data,
      tokens: data.tokens,
      hasPartial: data.meta.partial !== undefined,
    }),
  });

  useEffect(() => {
    if (!query.data) return;
    const store = container.resolve<WidgetSnapshotStore>(WIDGET_SNAPSHOT_STORE);
    // TODO: refresh widget on FollowingStore changes
    void store.refresh(query.data.positions, query.data.tokens);
  }, [query.data]);

  return query;
}
