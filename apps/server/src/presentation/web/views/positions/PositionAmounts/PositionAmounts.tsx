import { Icon } from "../../components/Icon/Icon";
import { explorerTokenUrl, networkLabel } from "../../networks";
import { cn } from "../../utils/cn";
import { shortenAddress } from "../labels";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM, ITokenSideVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

type Props = { card: ICardVM; withContract?: boolean; class?: string };

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

// `withContract` is for the detail panel only — the card renders the same table inside a grid
// cell whose height every other card must match, and can't spare the extra line per token.
export const PositionAmounts = ({ card, withContract = false, class: className }: Props) => {
  const rows = card.principal.map((token) => ({
    token,
    fee: card.fees.find((entry) => entry.tokenRef === token.tokenRef),
  }));

  if (rows.length === 0) return <p class={cn("text-body-small text-on-surface-variant", className)}>This position holds no tokens.</p>;

  return (
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
