import { cn } from "../../utils/cn";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// One row per token, principal and its own unclaimed fee side by side. Two mirrored lists — an
// amounts list, then a repeated fees list — split a token's own numbers across two groups and
// made the reader match them up by position; here they read together.
// A real <table>: each cell is a token crossed with a measure, which is what a table is for,
// and it is what associates "0.0084" with "WETH" and "Fees" for a screen reader. A <dl> can
// name one value per term, not two.
export const PositionAmounts = ({ card, class: className }: { card: ICardVM; class?: string }) => {
  const rows = card.principal.map((token) => ({
    token,
    fee: card.fees.find((entry) => entry.tokenRef === token.tokenRef),
  }));

  if (rows.length === 0) return <p class={cn("text-body-small text-on-surface-variant", className)}>This position holds no tokens.</p>;

  return (
    <table class={cn("w-full", className)}>
      <thead>
        <tr class="text-caption text-on-surface-variant">
          <th scope="col" class="pb-1 text-left font-normal">
            Token
          </th>
          <th scope="col" class="pb-1 text-right font-normal">
            Amount
          </th>
          <th scope="col" class="pb-1 text-right font-normal">
            Unclaimed fees
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ token, fee }) => (
          <tr>
            <th scope="row" class="py-0.5 text-left font-normal">
              <span class="flex items-center gap-2 text-body-small">
                <TokenIcon url={token.iconUrl} symbol={token.symbol} class="h-4 w-4 shrink-0 rounded-full" />
                {token.symbol}
              </span>
            </th>
            <td class="py-0.5 text-right font-mono text-figure-small tabular-nums">{token.formatted}</td>
            <td class="py-0.5 text-right font-mono text-figure-small text-on-surface-variant tabular-nums">
              {fee ? fee.formatted : <span aria-hidden="true">—</span>}
              {!fee && <span class="sr-only">None</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
