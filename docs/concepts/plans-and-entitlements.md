# Plans and entitlements

Who may do what, decided on the server ([ADR 0043](../decisions/0043-plans-and-entitlements.md)).

## Tiers

Wallet limits per tier are the `wallets.max` row of the entitlement keys below.

| | Guest | Free | Pro |
|---|---|---|---|
| How to get it | No account | Sign in with a passkey | Manual grant by the owner (MVP) |
| Range exit and re-entry alerts | None | Fast, no daily cap, cooldown `alerts.cooldown_s` per position | Same |
| Early warnings ("within X% of the range edge", X set by the user) | None | None | Yes |

- A **wallet** is one address, counted once across all EVM chains; each non-EVM namespace counts separately. Positions per scope are capped as in [providers-and-cache.md](providers-and-cache.md#request-budget).
- Official instance: limits apply from the MVP, rolled out with the `limits.enforced` flag.
- Self-hosted instance: limits are off (every key resolves to unlimited) unless `instance.config` enables them.
- After the MVP, Pro adds history, PnL and IL, CSV export, Telegram and email; a third tier for funds is possible.

## Entitlement keys

| Key | Guest | Free | Pro |
|---|---|---|---|
| `wallets.max` | 1 | 3 | 25 |
| `push.enabled` | false | true | true |
| `alerts.early_warning` | false | false | true |
| `alerts.cooldown_s` | — | 1800 | 1800 |

Plan defaults live in `packages/core`. A new key needs a value in every plan.

## Data

| Table | Holds |
|---|---|
| `grants` | `account_id`, `source` (`admin`, `trial`, `promo`, `revenuecat`, `stripe`, `crypto`), `source_ref`, plan or key/value, `starts_at`, `ends_at`, `state`, `reason` |
| `entitlement_audit` | Append-only: who changed which grant, when and why |

The effective value of a key is the most generous across active grants and the plan default. It is cached with a version and invalidated when a grant changes.

## Enforcement

- Adding a wallet runs in one transaction: lock the account row (`FOR UPDATE`), count active wallets, insert. `UNIQUE(account_id, wallet_key)` makes adding the same wallet twice a no-op.
- Over the limit, the server answers `409` with an RFC 9457 problem of type `plan-limit`: `key`, `upgradeAvailable`, and `limit` and `usage` for counted keys. The server sets `upgradeAvailable` per platform and storefront.
- `GET /api/v1/me` returns the entitlement map, `source`, `expiresAt`, `inGrace` and usage, with an ETag. Clients cache it for offline display; only the server enforces.
- A guest portfolio query with more addresses than the guest `wallets.max` is answered for the first `wallets.max` addresses with a `planLimit` notice (`key`, `limit`, `usage` = the address count in the query); the server stores nothing about the guest. The check uses the Guest plan default and follows `limits.enforced` and the self-hosted "limits off" rule. A guest reads the limit from `GET /api/v1/meta` (*proposed*).
- Adding a wallet on sign-in merge uses the same locked add; wallets over the account limit are not added and the answer says how many (*proposed*).
- On-demand refresh is rate-limited the same way for every plan; it is not an entitlement key.
- The worker reads entitlements when it evaluates alert rules; early warnings run only for accounts with `alerts.early_warning`.
- Saving an alert rule that needs a boolean key the account lacks (`alerts.early_warning`) answers `409` `plan-limit` with `key` and `upgradeAvailable`; `limit` and `usage` are omitted for boolean keys (*proposed*).
- Pull-to-refresh and widgets never bypass limits: widgets read cached data, and on-demand refresh is rate-limited the same way for every plan.

## Downgrade and expiry

- Wallets above the new limit are paused: read-only, not monitored, no alerts.
- The oldest wallets stay active by default; the person chooses which ones instead.
- Upgrading reactivates paused wallets at once.
- Paused data follows the retention in [ADR 0035](../decisions/0035-data-lifecycle.md), and the person can delete it.

## Guests

- Guest watchlist storage: [ADR 0012](../decisions/0012-accounts-guests-and-passkeys.md).
- Abuse is limited by the rate limits in [resilience.md](resilience.md#inbound-protection), later Turnstile on the web; no fingerprinting.
- Push needs an account, so a guest sees "create an account to get alerts".

## Manual grants (MVP)

The owner runs these on the server (*planned*):

```
bun run voidx grant pro --account <id> --reason friend|contributor|beta [--until 2027-10-01]
bun run voidx revoke --account <id>
bun run voidx grants --account <id>
```

Every command writes `entitlement_audit`. The account id is shown in the app's profile.

## Billing after the MVP

| Source | Channel | Notes |
|---|---|---|
| RevenueCat | App Store, Google Play | `appUserID` = opaque account UUID; restore transfers to the signed-in account; Family Sharing off |
| Stripe Billing | Web | Possibly through RevenueCat Web Billing |
| Crypto | Web only | Prepaid time passes, not subscriptions; Coinbase Commerce is closed, and Apple forbids unlocking features with cryptocurrency |

Each source is an adapter that writes grants from webhooks:

- deduplicate by event id;
- ignore delivery order and re-fetch the provider's current state;
- verify the signature over the raw body;
- reconcile nightly;
- keep access during the store's grace period;
- revoke on refund.

Store rules:

- once Pro is purchasable anywhere, the apps offer it through in-app purchase;
- "subscribe on the web" links appear only where the storefront allows them;
- billing providers receive only the opaque account UUID ([ADR 0040](../decisions/0040-privacy.md)).

## Tests

- A table-driven matrix of plan × key, including grant overrides.
- A concurrency test: N parallel wallet adds end with exactly the limit.
- A contract test: every key has a value in every plan.
- Webhook replay tests with duplicate and out-of-order events (after the MVP).
