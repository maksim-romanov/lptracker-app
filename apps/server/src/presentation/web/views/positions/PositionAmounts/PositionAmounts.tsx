import { Icon } from "../../components/Icon/Icon";
import { explorerTokenUrl, networkLabel } from "../../networks";
import { cn } from "../../utils/cn";
import { shortenAddress } from "../labels";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM, ITokenSideVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

type Props = { card: ICardVM; withContract?: boolean; class?: string };

// Only the address is the link. The symbol is the row's name — it labels the amounts beside it
// and belongs to this table, while the address is the one part of the cell that points somewhere
// else. Making the whole block clickable put a destination behind a label that is not one.
// The accessible name says which token and which chain, because "0xC02a…6Cc2" read aloud is
// neither; the full address rides along as a tooltip, since the shortened form is what fits, not
// what the reader may need to compare.
const TokenCell = ({ token, chainId }: { token: ITokenSideVM; chainId: number }) => {
  const address = token.tokenRef.split(":")[1];
  if (!address) return <span class="text-body-small">{token.symbol}</span>;

  return (
    <span class="flex min-w-0 flex-col">
      <span class="text-body-small">{token.symbol}</span>
      <a
        href={explorerTokenUrl(chainId, address)}
        target="_blank"
        rel="noopener noreferrer"
        data-tooltip={address}
        aria-label={`${token.symbol} contract on ${networkLabel(chainId)}`}
        class="flex w-fit items-center gap-1 font-mono text-caption text-on-surface-variant hover:text-primary-text"
      >
        {shortenAddress(address)}
        <Icon name="external" size={12} />
      </a>
    </span>
  );
};

// One row per token, principal and its own unclaimed fee side by side. Two mirrored lists — an
// amounts list, then a repeated fees list — split a token's own numbers across two groups and
// made the reader match them up by position; here they read together.
// A real <table>: each cell is a token crossed with a measure, which is what a table is for,
// and it is what associates "0.0084" with "WETH" and "Fees" for a screen reader. A <dl> can
// name one value per term, not two.
// `withContract` is for the detail panel only. The card shows the same table in a grid cell
// whose height every other card has to match, and a second line per token is two lines the
// board cannot spare — the panel is where there is room to say which contract this actually is.
export const PositionAmounts = ({ card, withContract = false, class: className }: Props) => {
  const rows = card.principal.map((token) => ({
    token,
    fee: card.fees.find((entry) => entry.tokenRef === token.tokenRef),
  }));

  if (rows.length === 0) return <p class={cn("text-body-small text-on-surface-variant", className)}>This position holds no tokens.</p>;

  return (
    // `table-fixed` with declared widths so a column lands in the same place on every card. Left
    // to size itself, each card measured its own figures and the grid came out ragged.
    <table class={cn("w-full table-fixed", className)}>
      <thead>
        <tr class="text-caption text-on-surface-variant">
          <th scope="col" class="w-[32%] pb-1 text-left font-normal">
            Token
          </th>
          <th scope="col" class="w-[30%] pb-1 text-right font-normal">
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
              <span class="flex items-center gap-2">
                {/* The contract line makes this cell two lines tall, and a 16px mark beside a
                    32px block reads as a bullet rather than a logo. */}
                <TokenIcon
                  url={token.iconUrl}
                  symbol={token.symbol}
                  tokenRef={token.tokenRef}
                  class={cn("shrink-0 rounded-full", withContract ? "h-7 w-7" : "h-4 w-4")}
                />
                {withContract ? <TokenCell token={token} chainId={card.chainId} /> : <span class="text-body-small">{token.symbol}</span>}
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
