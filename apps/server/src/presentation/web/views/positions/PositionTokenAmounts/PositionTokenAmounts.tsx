import { cn } from "../../utils/cn";
import type { ITokenSideVM } from "../card.vm";

type Props = { tokens: ITokenSideVM[]; earning?: boolean; read?: boolean; class?: string };

export const PositionTokenAmounts = ({ tokens, earning = false, read = true, class: className }: Props) => {
  if (tokens.length === 0) {
    // An amount that was never read is not an amount of zero, and the dash is how this column
    // says zero.
    if (!read) return <span class={cn("block text-right text-body-small text-on-surface-variant", className)}>Unknown</span>;

    return (
      <span class={cn("block text-right text-body-small text-on-surface-variant", className)}>
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
            earning && (index === 0 ? "text-success-text" : "text-success-text/75"),
          )}
        >
          {token.formattedShort} {token.symbol}
        </span>
      ))}
    </span>
  );
};
