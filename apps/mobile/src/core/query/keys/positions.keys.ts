import { createQueryKeys } from "@lukemorales/query-key-factory";

export const positionsKeys = createQueryKeys("positions", {
  list: (walletAddress: string) => ({
    queryKey: [walletAddress],
  }),
});
