import { cn } from "../../utils/cn";
import { shortenAddress } from "../labels";

type Props = { url: string; symbol: string; tokenRef?: string; class?: string };

const HUE_COUNT = 12;

// Deterministic so a token keeps its disc between renders and between the table and the card.
// Seeded on the token's ref rather than its symbol: symbols are not unique — a board of meme
// pairs carries several unrelated tokens calling themselves the same three letters.
const hueClassFor = (seed: string): string => {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 100003;
  return `token-hue-${hash % HUE_COUNT}`;
};

// The first letter or digit, not the first character: a good share of long-tail symbols open
// with a bracket, a sigil or an emoji ("(BP)", "$MICHI"), and a disc reading "(" names
// nothing. Unicode classes rather than a-z so a CJK or Cyrillic symbol still gets its own
// initial, and a match rather than an index so a surrogate pair is never split in half.
const monogramFor = (symbol: string): string => symbol.match(/\p{L}|\p{N}/u)?.[0] ?? "?";

// The one thing the icon does not already say. Symbols repeat across unrelated tokens, so the
// address is what tells two identically-named ones apart, and the list layouts print it nowhere
// else.
const tooltipFor = (symbol: string, tokenRef?: string): string => {
  const address = tokenRef?.split(":")[1];
  return address ? `${symbol} \u00b7 ${shortenAddress(address)}` : symbol;
};

// Always a circle of a fixed size, whether the image arrives or not. A bare <img alt={symbol}>
// looked right until a token's icon 404'd, at which point the browser painted the alt text
// inside the image box and a three-letter symbol spilled across the icon beside it.
// The image itself is decorative: every place this is used prints the symbol as real text
// next to it — the pair name, the row header — so naming it again would only repeat it.
// The fallback is rendered under every image, not only where a URL is missing: a URL that
// 404s is the common case (a token list is mostly long-tail assets), and the controller
// reveals the disc when that happens.
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
