# API Reference

All endpoints use Valibot schemas for request validation and OpenAPI documentation via hono-openapi.

## Gateway

### `GET /api/wallets/{walletAddress}/positions`
Aggregates positions across all protocols.

- `walletAddress` (path) — Wallet address
- `chainIds` (query) — Filter by chain IDs (default: all)
- `limit` (query) — Pagination limit
- `offset` (query) — Pagination offset
- `closed` (query) — Include closed positions

Returns `WrappedPosition[]` — each entry includes `protocol`, `chainId`, and position data.

## Uniswap V3

### `GET /api/uniswap-v3/wallets/{walletAddress}/positions`
Returns Uniswap V3 LP positions with prices and fees.

### `GET /api/uniswap-v3/chains/{chainId}/positions/{id}`
Returns a single position with full details.

### `GET /api/uniswap-v3/chains/{chainId}/positions/{id}/fees`
Returns unclaimed fees: `{ token0: number, token1: number }`.

## Token Prices

### `GET /prices/chains/{chainId}/tokens`
- `addresses` (query) — Array of token addresses

Returns `{ prices: { [address]: { priceUSD: number, confidence: number } } }`.

## Token Meta

### `GET /meta/chains/{chainId}/tokens/{address}/logo.png`
Returns HTTP 302 redirect to the token's logo URL, or 404 if not found.

## Error Handling

Routes use neverthrow `Result` types. On error, `error-mapper.ts` returns:

```json
{ "error": "Internal server error", "code": "INTERNAL_ERROR" }
```

## OpenAPI Generation

```bash
cd apps/server && bun run codegen
```

Generates TypeScript types from the OpenAPI spec via `scripts/generate-openapi.ts`.
