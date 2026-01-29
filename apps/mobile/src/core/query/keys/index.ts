import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { positionsKeys } from "./positions.keys";

export const queryKeys = mergeQueryKeys(positionsKeys);
