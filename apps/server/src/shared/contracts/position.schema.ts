import * as v from "valibot";

import { tokenAmountSchema } from "./token-amount.schema";
import { tokenRefSchema } from "./token.schema";

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
    role: v.string(),
    tokenRef: tokenRefSchema,
    balance: tokenAmountSchema,
  }),
  v.metadata({ ref: "PositionToken" }),
);

const positionBaseShape = {
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
};

/**
 * Minimum interface a protocol's extension schema must satisfy:
 * a Valibot object schema whose `type` property is a literal string discriminator.
 */
export type ExtensionVariantSchema = v.ObjectSchema<{ type: v.LiteralSchema<string, undefined> } & Record<string, v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>, undefined>;

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
 *   Position = { ...baseFields, extension: union([...known, UnknownExtension]) }
 *
 * In OpenAPI this becomes `oneOf`. Each known extension has `type: const "..."`, so
 * openapi-typescript generates a discriminated TypeScript union on `Position["extension"]`,
 * which TS narrows via `switch (extension.type) { case "uniswap-v3": ... }`.
 */
export const buildPositionSchema = (extensionSchemas: readonly ExtensionVariantSchema[]) => {
  const extensionUnion = v.union([...extensionSchemas, unknownExtensionSchema]);

  return v.pipe(
    v.object({
      ...positionBaseShape,
      extension: extensionUnion,
    }),
    v.metadata({ ref: "Position" }),
  );
};

export type PositionContainer = v.InferOutput<typeof containerSchema>;
export type PositionStatus = v.InferOutput<typeof positionStatusSchema>;
export type PositionToken = v.InferOutput<typeof positionTokenSchema>;

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
  extension: PositionExtensionBase & Record<string, unknown>;
}
