import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// Names itself in neither layout: the table has <th scope="col">Principal</th> and the
// card wraps this in its own <dt>.
export const PositionPrincipal = ({ principal }: { principal: ICardVM["principal"] }) => (
  <dl class="flex flex-col gap-1">
    {principal.map((token) => (
      <div class="flex justify-between gap-2">
        <dt>{token.symbol}</dt>
        <dd>{token.formatted}</dd>
      </div>
    ))}
  </dl>
);
