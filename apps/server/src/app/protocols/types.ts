import type { Result } from "neverthrow";
import type { ExtensionVariantSchema, MapPositionResult } from "shared/contracts";
import type { DomainError } from "shared/errors/base.error";

export interface ProtocolListParams {
  ownerAddress: string;
  chainId: number;
  pagination?: { limit: number; offset: number };
  filters?: { closed: boolean };
}

export interface ProtocolDetailParams {
  positionRef: string;
  chainId: number;
  protocolPositionId: string;
}

export interface ProtocolEntry {
  readonly slug: string;
  readonly version: string;
  readonly supportedChainIds: number[];
  readonly capabilities: string[];
  readonly extensionVersion: string;
  /** Valibot schema for this protocol's extension. Must be an object schema whose `type` is a literal discriminator. */
  readonly extensionSchema: ExtensionVariantSchema;

  listPositionsForChain(params: ProtocolListParams): Promise<Result<MapPositionResult[], DomainError>>;
  getPositionByRef(params: ProtocolDetailParams): Promise<Result<MapPositionResult, DomainError>>;
}
