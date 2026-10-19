# 0043 · Plans resolve to entitlements on the server; Pro is granted manually in the MVP

- Status: proposed
- Deciders: Maksim Romanov

## Context

The official instance needs Free and Pro tiers from the MVP, but no payment provider is connected yet: the owner grants Pro by hand to friends, contributors and beta testers. Later, Pro can come from three billing sources (app stores, web, crypto), plus trials and promos. Self-hosters pay their own RPC bill and can fork the AGPL code, so limits there only annoy.

## Options

- **A `plan` column on the account**, checked in each client.
- **Entitlement keys resolved on the server from grants**, clients only display.
- **Feature flags per plan.**

## Decision

Chosen **entitlement keys resolved on the server from grants**, because one account can hold several grants at once (admin, trial, store purchase) and every client must show the same limits.

- Keys are decoupled from plan names: `wallets.max`, `push.enabled`, `alerts.early_warning`, `alerts.cooldown_s`, with room for more. Plan defaults live in `packages/core` code for now.
- A grant records account, source (`admin`, `trial`, `promo`, `revenuecat`, `stripe`, `crypto`), plan or key/value, start, end, state and reason. The effective value is the most generous across active grants and the plan default. Every change writes an append-only audit row.
- The `Entitlements` port answers for the server and worker; clients read `GET /api/v1/me` and never enforce. A guest's `wallets.max` is enforced the same way: the server answers a query with more addresses than the limit for the first `wallets.max` and adds a `plan-limit` notice (*proposed*).
- In the MVP the only source is `admin`: the owner runs `bun run voidx grant` (*planned*).
- Self-hosted instances resolve to "limits off" unless the operator enables limits in `instance.config`.
- Feature flags only roll the enforcement out (`limits.enforced`); they never decide a plan ([0031](0031-feature-flags-openfeature.md)).
- Fast range alerts stay free for every account; Pro sells more wallets and early warnings, not safety.

Details: [concepts/plans-and-entitlements.md](../concepts/plans-and-entitlements.md).

## Consequences

- Trials, promos, comps and grandfathering are grants with an end date; no schema change when billing arrives.
- Each billing provider becomes an adapter that writes grants from webhooks.
- Once Pro can be bought anywhere, the iOS and Android apps must offer it through in-app purchase; crypto is sold on the web only, because Apple forbids unlocking features with cryptocurrency.
- Billing providers receive only the opaque account UUID ([0040](0040-privacy.md)).
- Related: [0012](0012-accounts-guests-and-passkeys.md), [0026](0026-worker-and-alerts.md), [0039](0039-error-model.md).
