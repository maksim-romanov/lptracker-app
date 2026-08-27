import { Icon } from "../../components/Icon/Icon";
import { NetworkLogo } from "../../components/NetworkLogo/NetworkLogo";
import { Tag } from "../../components/Tag/Tag";
import { explorerAddressUrl, networkLabel, uniswapPositionUrl } from "../../networks";
import { pairLabel, statusLabel } from "../labels";
import { PositionRange } from "../PositionRange/PositionRange";
import { TokenIcon } from "../TokenIcon/TokenIcon";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const shortenAddress = (addr: string) => (addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr);

export const PositionDetail = ({ card }: { card: ICardVM }) => {
  const range = card.priceRange;
  return (
    <>
      <header class="flex items-center gap-3 border-outline border-b pb-3">
        <span class="flex -space-x-2">
          <TokenIcon url={card.pair.base.iconUrl} symbol={card.pair.base.symbol} class="h-8 w-8" />
          <TokenIcon url={card.pair.quote.iconUrl} symbol={card.pair.quote.symbol} class="h-8 w-8" />
        </span>
        <div class="flex flex-col">
          <div>{pairLabel(card.pair)}</div>
          <div>{card.feeTierLabel} fee tier</div>
        </div>
      </header>

      <div class="flex flex-wrap gap-2 border-outline border-b pb-3">
        <Tag>{statusLabel(card.status)}</Tag>
        <Tag>
          <NetworkLogo chainId={card.chainId} size={14} />
          {networkLabel(card.chainId)}
        </Tag>
        <Tag>{card.protocolLabel}</Tag>
      </div>

      <section class="flex flex-col gap-2 border-outline border-b pb-3">
        <div class="flex justify-between gap-2 text-sm">
          <span>Price range</span>
          <span>
            {range.currentLabel} {range.quoteSymbol}
          </span>
        </div>
        <PositionRange range={range} />
        <div class="flex justify-between gap-2 text-sm">
          <span>{range.minLabel}</span>
          <span>{range.maxLabel}</span>
        </div>
      </section>

      <section class="flex flex-col gap-2 border-outline border-b pb-3">
        <div class="text-sm">Principal</div>
        <dl class="flex flex-col gap-1">
          {card.principal.map((p) => (
            <div class="flex justify-between gap-2">
              <dt>{p.symbol}</dt>
              <dd>{p.formatted}</dd>
            </div>
          ))}
        </dl>
      </section>

      {card.fees.length > 0 && (
        <section class="flex flex-col gap-2 border-outline border-b pb-3">
          <div class="text-sm">Unclaimed fees</div>
          <dl class="flex flex-col gap-1">
            {card.fees.map((f) => (
              <div class="flex justify-between gap-2">
                <dt>{f.symbol}</dt>
                <dd>{f.formatted}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <footer class="flex items-center justify-between gap-2 border-outline border-b pb-3">
        <span class="text-sm">Pool</span>
        <a href={explorerAddressUrl(card.chainId, card.poolAddress)} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1">
          {shortenAddress(card.poolAddress)}
          <Icon name="external" size={12} />
        </a>
      </footer>

      <div class="flex justify-end">
        <a
          href={uniswapPositionUrl(card.chainId, card.nftTokenId)}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 rounded-sm border border-outline px-3 py-2"
        >
          View on Uniswap
          <Icon name="external" size={15} />
        </a>
      </div>
    </>
  );
};
