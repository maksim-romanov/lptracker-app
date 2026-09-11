import type { ICardVM } from "./card.vm";
import { UNISWAP_V3_EXTENSION_TYPE } from "#features/uniswap-v3/presentation/schemas/extension.schema";
import { mapPositionToCardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";
import type { Position, TokensMap } from "#shared/contracts";

type TWebCardMapper = (position: Position, tokens: TokensMap, opts: { inverted: boolean }) => ICardVM;

// The one place under presentation/ that names a protocol. Everything else renders ICardVM,
// so a protocol without an entry here is counted as unrenderable rather than dropped.
const mappers: Record<string, TWebCardMapper> = {
  [UNISWAP_V3_EXTENSION_TYPE]: mapPositionToCardVM,
};

export const mapCardVM = (position: Position, tokens: TokensMap, opts: { inverted: boolean }): ICardVM | undefined =>
  mappers[position.extension.type]?.(position, tokens, opts);
