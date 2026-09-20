import * as v from "valibot";

import { tokenRefSchema } from "./token.schema";
import { tokenAmountSchema } from "./token-amount.schema";

export const containerSchema = v.pipe(
  v.object({
    kind: v.string(),
    ref: v.string(),
    label: v.string(),
  }),
  v.metadata({ ref: "PositionContainer" }),
);

export const positionStatusSchema = v.pipe(
  v.object({
    state: v.string(),
    stateDetail: v.nullable(v.string()),
  }),
  v.metadata({ ref: "PositionStatus" }),
);

export const positionTokenSchema = v.pipe(
  v.object({
    // "principal" | "owed" — open string on the wire, so a protocol with a role no client was
    // compiled against still parses. "owed" is what a claim transaction would pay out, which is
    // not the same as fee income: Uniswap v3 credits withdrawn principal into the same balance
    // ("Tokens owed may be from accumulated swap fees or burned liquidity", v3-core's
    // IUniswapV3PoolActions#collect), and only a protocol that keeps the two apart may name a
    // fee role.
    role: v.string(),
    tokenRef: tokenRefSchema,
    balance: tokenAmountSchema,
  }),
  v.metadata({ ref: "PositionToken" }),
);

export const feeAccrualSchema = v.pipe(
  v.object({
    // "unknown" | "claimable" | "redirected" | "compounded" — open string on the wire, so a
    // protocol with a mode no client was compiled against still parses.
    mode: v.string(),
    reason: v.nullable(v.string()),
    destination: v.nullable(v.string()),
  }),
  v.metadata({ ref: "FeeAccrual" }),
);

export const yieldRewardSchema = v.pipe(
  v.object({
    tokenRef: tokenRefSchema,
    claimable: tokenAmountSchema,
    // Raw token quantity per second, not a rate — it overflows Number.
    emissionPerSecond: v.nullable(tokenAmountSchema),
  }),
  v.metadata({ ref: "YieldReward" }),
);

export const yieldSourceSchema = v.pipe(
  v.object({
    kind: v.string(),
    ref: v.string(),
    container: v.nullable(containerSchema),
    rewards: v.array(yieldRewardSchema),
  }),
  v.metadata({ ref: "YieldSource" }),
);

export const positionRangeSchema = v.pipe(
  v.object({
    // Decimal strings. null means unbounded. No formatting and no rounding — displayDecimals
    // stays the client's call, and inversion is a client-held preference.
    lower: v.nullable(v.string()),
    upper: v.nullable(v.string()),
    current: v.string(),
    baseTokenRef: tokenRefSchema,
    quoteTokenRef: tokenRefSchema,
  }),
  v.metadata({ ref: "PositionRange" }),
);

export const positionStatSchema = v.pipe(
  v.object({
    // Display only. Never compared, never a dispatch key — the moment a client writes
    // `if (stat.label === …)` this becomes a second taxonomy with no schema.
    label: v.string(),
    value: v.string(),
    critical: v.boolean(),
  }),
  v.metadata({ ref: "PositionStat" }),
);

export const positionBaseShape = {
  ref: v.string(),
  address: v.string(),
  chainId: v.number(),
  protocol: v.string(),
  protocolVersion: v.optional(v.string()),
  container: containerSchema,
  tokens: v.array(positionTokenSchema),
  status: positionStatusSchema,
  createdAt: v.nullable(v.string()),
  updatedAt: v.string(),
  feeAccrual: feeAccrualSchema,
  yieldSources: v.array(yieldSourceSchema),
  range: v.nullable(positionRangeSchema),
  stats: v.array(positionStatSchema),
};

/**
 * Minimum interface a protocol's extension schema must satisfy:
 * a Valibot object schema whose `type` property is a literal string discriminator.
 */
export type ExtensionVariantSchema = v.ObjectSchema<
  { type: v.LiteralSchema<string, undefined> } & Record<string, v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>,
  undefined
>;

/**
 * Forward-compat fallback for clients receiving an extension whose protocol they
 * weren't compiled against. Has the discriminator (`type`) as a free string so
 * client-side `switch (extension.type)` lands in the default branch.
 */
export const unknownExtensionSchema = v.pipe(
  v.object({
    type: v.string(),
    version: v.number(),
  }),
  v.metadata({ ref: "UnknownExtension" }),
);
export type UnknownExtension = v.InferOutput<typeof unknownExtensionSchema>;

/**
 * Build a positionSchema bound to the supplied set of protocol-specific extension schemas
 * plus the UnknownExtension fallback.
 *
 * Produced schema:
 *   Position = { ...baseFields, extension: variant("type", [...known, UnknownExtension]) }
 *
 * In OpenAPI this becomes `oneOf` (not `anyOf`), so Dart and Swift generators render a
 * proper sealed type instead of flattening every variant's fields into one class with
 * everything required. `unknownExtensionSchema` must stay last: its `type` field is a
 * free string, so it matches any discriminant value that no earlier variant claimed.
 */
export const buildPositionSchema = (extensionSchemas: readonly ExtensionVariantSchema[]) => {
  const extensionVariant = v.variant("type", [...extensionSchemas, unknownExtensionSchema]);

  return v.pipe(
    v.object({
      ...positionBaseShape,
      extension: extensionVariant,
    }),
    v.metadata({ ref: "Position" }),
  );
};

export type PositionContainer = v.InferOutput<typeof containerSchema>;
export type PositionStatus = v.InferOutput<typeof positionStatusSchema>;
export type PositionToken = v.InferOutput<typeof positionTokenSchema>;
export type FeeAccrual = v.InferOutput<typeof feeAccrualSchema>;
export type YieldReward = v.InferOutput<typeof yieldRewardSchema>;
export type YieldSource = v.InferOutput<typeof yieldSourceSchema>;
export type PositionRange = v.InferOutput<typeof positionRangeSchema>;
export type PositionStat = v.InferOutput<typeof positionStatSchema>;

/**
 * Hand-written Position interface used by mappers and route handlers.
 *
 * NOTE: We deliberately don't infer Position from a Valibot schema, because the
 * extension variant is built at composition time (factory) and the inferred type
 * would be too narrow (single fixed union). The Valibot side (buildPositionSchema)
 * is the OpenAPI / wire-shape source of truth; this interface is the developer-facing
 * type used inside the server. Both stay structurally equivalent.
 */
export interface PositionExtensionBase {
  type: string;
  version: number;
}

export interface Position {
  ref: string;
  address: string;
  chainId: number;
  protocol: string;
  protocolVersion?: string;
  container: PositionContainer;
  tokens: PositionToken[];
  status: PositionStatus;
  createdAt: string | null;
  updatedAt: string;
  feeAccrual: FeeAccrual;
  yieldSources: YieldSource[];
  range: PositionRange | null;
  stats: PositionStat[];
  extension: PositionExtensionBase & Record<string, unknown>;
}
