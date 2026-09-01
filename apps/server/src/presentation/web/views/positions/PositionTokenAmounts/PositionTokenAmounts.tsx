import { cn } from "../../utils/cn";
import type { ITokenSideVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

type Props = { tokens: ITokenSideVM[]; earning?: boolean; class?: string };

// Both amounts, each named. They used to be bare numbers on the grounds that the pair names its
// two slots in the same order a few columns to the left — true, and still a lot to ask of anyone
// reading down a column of them. The symbol is onchain data, so it stays in the mono face with
// the figure it belongs to.
// The second token is set quieter: a position's two sides are rarely equally interesting, and
// the first one is the one the pair is named for.
export const PositionTokenAmounts = ({ tokens, earning = false, class: className }: Props) => {
  if (tokens.length === 0) {
    return (
      <span class={cn("block text-body-small text-on-surface-variant", className)}>
        <span aria-hidden="true">—</span>
        <span class="sr-only">None</span>
      </span>
    );
  }

  return (
    <span class={cn("flex flex-col items-end font-mono tabular-nums", className)}>
      {tokens.map((token, index) => (
        <span
          class={cn(
            "text-figure-small",
            index === 0 ? "text-on-surface" : "text-caption text-on-surface-variant",
            earning && (index === 0 ? "text-success" : "text-success/75"),
          )}
        >
          {token.formattedShort} {token.symbol}
        </span>
      ))}
    </span>
  );
};
