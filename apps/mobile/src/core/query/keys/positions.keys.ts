import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { TPositionsListParams } from "positions/data/gateway-positions.repository";

export const positionsKeys = createQueryKeys("positions", {
  list: (params: Omit<TPositionsListParams, "cursor">) => ({
    queryKey: [{ ...params }],
  }),
  byRef: (ref: string) => ({
    queryKey: [ref],
  }),
});
