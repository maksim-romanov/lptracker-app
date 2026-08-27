import * as v from "valibot";

import { DEFAULT_POSITIONS_LAYOUT, POSITIONS_LAYOUTS } from "../positions-layout";

const WALLET_ITEM_REGEX = /^0x[a-fA-F0-9]{40}:\d+(?:,\d+)*$/;

const walletItemSchema = v.pipe(
  v.string(),
  v.regex(WALLET_ITEM_REGEX, "wallet item must be 'address:chainId1,chainId2,...'"),
  v.transform((val) => {
    const sep = val.indexOf(":");
    return {
      address: val.slice(0, sep).toLowerCase(),
      chainIds: val
        .slice(sep + 1)
        .split(",")
        .map((s) => Number(s)),
    };
  }),
);

export const webPositionsQuerySchema = v.object({
  // Optional / may be empty → render Empty instead of 400 (unlike the v1 schema).
  wallets: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => val.split("|").filter((s) => s.length > 0)),
      v.array(walletItemSchema),
    ),
  ),
  protocols: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => val.split(",").filter((s) => s.length > 0)),
    ),
  ),
  status: v.optional(v.picklist(["open", "closed", "all"]), "open"),
  // Set by the client from the viewport width (client/lib/layout.ts).
  layout: v.optional(v.picklist(POSITIONS_LAYOUTS), DEFAULT_POSITIONS_LAYOUT),
  inverted: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => new Set(val.split(",").filter((s) => s.length > 0))),
    ),
  ),
});

export type WebPositionsQuery = v.InferOutput<typeof webPositionsQuerySchema>;
