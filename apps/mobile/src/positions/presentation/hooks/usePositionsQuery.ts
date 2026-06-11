import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { container } from "core/di/container";
import { positionsKeys } from "core/query/keys/positions.keys";
import { GatewayPositionsRepository, type TPositionsListParams } from "positions/data/gateway-positions.repository";
import type { WidgetSnapshotService } from "widgets/application/widget-snapshot.service";
import { WIDGET_SNAPSHOT_SERVICE } from "widgets/di/tokens";

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
    const service = container.resolve<WidgetSnapshotService>(WIDGET_SNAPSHOT_SERVICE);
    void service.revalidateWith(query.data.positions, query.data.tokens);
  }, [query.data]);

  return query;
}
