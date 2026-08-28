import { cn } from "../../utils/cn";
import type { ITokenSideVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

type Props = { tokens: ITokenSideVM[]; class?: string };

// Amounts only, one per line: the pair names its two slots once per item and these follow
// the same order, so repeating the symbols here would print them a third time. They stay
// in the accessibility tree, where there is no such thing as reading across.
// `tabular-nums` is what makes a column of these comparable at a glance — proportional
// digits put the same magnitude at a different width on every row.
export const PositionTokenAmounts = ({ tokens, class: className }: Props) => {
  if (tokens.length === 0) {
    return (
      <span class={cn("block text-on-surface-variant text-sm", className)}>
        <span aria-hidden="true">—</span>
        <span class="sr-only">None</span>
      </span>
    );
  }

  return (
    <span class={cn("flex flex-col text-sm tabular-nums", className)}>
      {tokens.map((token) => (
        <span>
          <span class="sr-only">{token.symbol} </span>
          {token.formattedShort}
        </span>
      ))}
    </span>
  );
};
