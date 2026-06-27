import * as v from "valibot";

export const POSITION_REF_REGEX = /^[a-z0-9-]+:\d+:[A-Za-z0-9_-]+$/;
const WALLET_ITEM_REGEX = /^0x[a-fA-F0-9]{40}:\d+(?:,\d+)*$/;

/**
 * Wallet-scope item.
 *
 * Wire format: `address:chainId1,chainId2,...`
 * Example:     `0x742d35cc6634c0532925a3b844bc9e7595f0beb0:1,8453,42161`
 *
 * Multiple wallets are joined with `|` in the `wallets` query param.
 */
const walletItemSchema = v.pipe(
  v.string(),
  v.regex(WALLET_ITEM_REGEX, "wallet item must be in format 'address:chainId1,chainId2,...'"),
  v.transform((val) => {
    const sepIdx = val.indexOf(":");
    const address = val.slice(0, sepIdx).toLowerCase();
    const chainIds = val
      .slice(sepIdx + 1)
      .split(",")
      .map((s) => Number(s));
    return { address, chainIds };
  }),
);

export const positionsListQuerySchema = v.object({
  /**
   * Pipe-separated list of wallet items.
   * Wire format: `addr1:c1,c2|addr2:c3`
   */
  wallets: v.pipe(
    v.string(),
    v.transform((val) => val.split("|").filter((s) => s.length > 0)),
    v.array(walletItemSchema),
    v.minLength(1, "at least one wallet entry is required"),
  ),
  /**
   * Optional CSV of protocol slugs to filter by. Omit → all known.
   */
  protocols: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => val.split(",").filter((s) => s.length > 0)),
    ),
  ),
  status: v.optional(v.picklist(["open", "closed", "all"]), "open"),
});

export const positionRefParamSchema = v.object({
  ref: v.pipe(v.string(), v.regex(POSITION_REF_REGEX, "ref must be in format '{protocol}:{chainId}:{protocolPositionId}'")),
});

export type PositionsListQuery = v.InferOutput<typeof positionsListQuerySchema>;
export type PositionRefParam = v.InferOutput<typeof positionRefParamSchema>;

export interface ParsedPositionRef {
  protocol: string;
  chainId: number;
  protocolPositionId: string;
}

export const parsePositionRef = (ref: string): ParsedPositionRef | null => {
  const parts = ref.split(":");
  if (parts.length !== 3) return null;
  const [protocol, chainIdStr, protocolPositionId] = parts;
  if (!protocol || !chainIdStr || !protocolPositionId) return null;
  const chainId = Number(chainIdStr);
  if (!Number.isInteger(chainId) || chainId < 1) return null;
  return { protocol, chainId, protocolPositionId };
};
