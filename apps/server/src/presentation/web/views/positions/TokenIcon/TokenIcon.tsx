import { cn } from "../../utils/cn";
import { shortenAddress } from "../labels";

type Props = { url: string; symbol: string; tokenRef?: string; class?: string };

const HUE_COUNT = 12;

// Seeded on the token's ref rather than its symbol: symbols are not unique — a board of meme
// pairs carries several unrelated tokens calling themselves the same three letters.
const hueClassFor = (seed: string): string => {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 100003;
  return `token-hue-${hash % HUE_COUNT}`;
};

// The first letter or digit, not the first character: long-tail symbols often open with a
// bracket, sigil, or emoji ("(BP)", "$MICHI"). `\p{L}|\p{N}` (not a-z) also matches CJK/Cyrillic
// initials, and matching rather than indexing avoids splitting a surrogate pair.
const monogramFor = (symbol: string): string => symbol.match(/\p{L}|\p{N}/u)?.[0] ?? "?";

const tooltipFor = (symbol: string, tokenRef?: string): string => {
  const address = tokenRef?.split(":")[1];
  return address ? `${symbol} \u00b7 ${shortenAddress(address)}` : symbol;
};

// The fallback disc is always rendered, not only when `url` is missing — a 404'd icon is the
// common case for long-tail tokens, and the token-icon controller unhides the fallback then.
export const TokenIcon = ({ url, symbol, tokenRef, class: className }: Props) => (
  <span
    class={cn("token-icon relative isolate inline-flex shrink-0 overflow-hidden rounded-full bg-surface-variant", className)}
    data-controller={url ? "token-icon" : undefined}
    data-tooltip={tooltipFor(symbol, tokenRef)}
  >
    <span class={cn("token-fallback", hueClassFor(tokenRef ?? symbol))} hidden={Boolean(url)} data-token-icon-target="fallback">
      {monogramFor(symbol)}
    </span>
    {url && (
      <img
        src={url}
        alt=""
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover"
        data-token-icon-target="image"
        data-action="error->token-icon#failed"
      />
    )}
  </span>
);
