# 0045 · USD prices from a keyless source chain, refreshed by the worker

- Status: proposed
- Deciders: Maksim Romanov

## Context

Users read a portfolio in USD first, so prices join the MVP in M3.5 ([0011](0011-token-amounts-not-usd.md)). Long-tail LP tokens often have no price or a wrong one, aggregators return a number for any token with a pool, self-hosters have no paid keys, and the official instance has $50 a month for RPC, The Graph and price sources ([0032](0032-deployment-and-cost.md)). Research: [token-prices](../research/server/token-prices.md), [token-price-providers](../research/server/token-price-providers.md), [in the wild](../research/server/prices-and-logos-in-the-wild.md).

## Options

- **Ordered chain of keyless sources with per-token fallback**, computed by the worker.
- **One paid aggregator** (DefiLlama Pro $300, CoinMarketCap $29+): over budget, and self-hosters cannot run it.
- **Pool-derived prices only**: free, but easy to manipulate and wrong for thin pools.

## Decision

Chosen **an ordered chain of keyless sources with per-token fallback**, because it works with zero keys, stays inside the budget, and agreement between sources catches a single bad answer.

- Source order and thresholds: [prices and logos](../concepts/prices-and-logos.md#price-sources).
- A token missing from one source is asked of the next; a batch never stops at a partial answer.
- Two or more answers give the median; disagreement and jumps lower confidence ([resolution](../concepts/prices-and-logos.md#resolution)).
- The worker refreshes every token in the price index each minute in batches. Requests read the cache and never call a price API, so cost follows the number of tokens, not users, and no source sees one user's token set.
- An unpriced or stale token shows its amount only, never `$0`. Totals carry `partial` and the count of unpriced tokens.
- No paid price API. Pyth (key required), 0x (quote-based, sales contact), Moralis ($149+) and DeBank (reports `0` for unknown prices) are excluded.

## Consequences

- Prices are external estimates with a source, a confidence and an age, not quantities ([0007](0007-data-rule-and-read-block.md)).
- Chain files gain generated Chainlink feed files ([integration model](../concepts/integration-model.md#chain-file)).
- Price sources and their extra RPC reads count against the external API budget ([0032](0032-deployment-and-cost.md)).
- PnL and history stay after the MVP; DefiLlama `batchHistorical` and Chainlink rounds at archive blocks are the planned sources.
- Thresholds (agreement tolerance, jump bound, depeg band, list agreement) are set by a spike on recorded cassettes before M3.5 code.
- Golden tests cover totals with unpriced, stale and depegged tokens (*planned*).
