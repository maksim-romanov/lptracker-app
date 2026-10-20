# Roadmap

Every iteration below is in the MVP. An iteration is one approved spec with at most about 30 steps ([workflow](workflow.md#iterations-and-steps)). MVP clients are the web and the Apple family; Android follows the MVP ([ADR 0056](decisions/0056-android-after-the-mvp.md)). Every app, and every area of one not yet researched, starts with the [research gate](workflow.md#research-gate).

| # | Iteration | Content | Owner input |
|---|---|---|---|
| D0 | **Design** | One clickable prototype of every MVP screen on web, iPhone and iPad/Mac, light and dark, every state (loading, empty, error, partial, unpriced) and the motion in [0023](decisions/0023-motion.md); screen docs in [design book](design/book/README.md) updated. Runs in parallel with M0 | approves the prototype before M1b phase 4 |
| M0 | **Skeleton** | Repo, mise, Turborepo `check`, TS gates, `core` ports, draft `contracts` and mock, integration schemas, token pipeline, Tuist skeleton, UI kit v0 (status chip, range bar, card shell), e2e harness, agent QA setup, CI | first snapshot baselines, CI settings, iOS simulator runtime |
| M1a | **Data** | Contract with nullable prices and totals and the error model ([0039](decisions/0039-error-model.md)), plus every field the [screen pages](design/book/screens/README.md) mark *needs server field*; `uniswap-v3` on Ethereum and Arbitrum; RPC enumeration, amounts, owed fees, Redis cache; every MVP index source and native ETH in the kit; scaffold, record and replay, bronze checks; draft `add-protocol` skill from the [guide](guides/add-a-protocol.md), used for `uniswap-v3`; address-safe logs, rate limits, RPC budget, error tracking, `/readyz`; `instance.config` and a dev `docker compose` | missing addresses or start blocks |
| Ops1 | **Deploy** | Deploy pipeline with a migrate step, uptime probe | hosting and deploy secrets |
| M1b | **First screens** | SSR portfolio page (cached scopes, lazy frames, failed scope), Portfolio Cards and Rows, add wallet, first visit, Settings on iOS; web gates (Playwright, axe, html-validate, Lighthouse, visual regression) | acceptance against the prototype |
| M2 | **Architecture test** | Base and Optimism as chain files only; `uniswap-v4` (third-party subgraph, `rpc-logs`, hooks, native ETH) with zero core changes; unknown family rendered from the display descriptor; golden decode tests | accepts the ADRs |
| M3a | **Full data scope** | Both families on all four chains; silver and gold tiers; PR bot; load test of the 8 s lookup SLO. Its spec is approved only after M2's result | — |
| M3b | **Position detail** | Drawer on Cards, Spotlight on Rows, bottom sheet on phones, range view, on web and iOS | acceptance against the prototype |
| M3.5 | **USD and storage** | Postgres, migrations, backups with a restore test; worker job queue and scheduler; price sources and logo pipeline ([prices and logos](concepts/prices-and-logos.md)); USD values and partial totals; price-source cost metering | price provider keys |
| M4a | **Accounts** | Domain, RP ID and bundle id frozen first ([0044](decisions/0044-domain-as-configuration.md)); passkeys, sessions and CSRF, watchlist sync, account deletion; `/api/v1/meta`; `/api/v1` frozen with oasdiff last | the domain freeze |
| R1 | **Release** | Store pipeline ([0033](decisions/0033-release-and-versioning.md)), feature-flag evaluation ([0031](decisions/0031-feature-flags-openfeature.md)), SLO alerts | Apple developer account |
| M4b | **Apps on the real API** | iOS on the real API, sign-in, Wallets, plans, wallet limits and manual Pro grants | Apple team ID, associated domains |
| M5a | **Background** | Watch targets, stored snapshots, range alerts through OneSignal, early-warning alerts for Pro, external API budgets and brownout | OneSignal key |
| M5b | **Push** | Push handling on iOS (not macOS), alerts list, alert settings | APNs key |
| M6 | **Breadth** | Self-hosting guide, lite mode, push relay design, widgets, iPadOS and macOS polish | App Group |

- Inside an iteration, phases 0 to 3 (contracts, core, server, client logic) pass the gate `core-green-web` or `core-green-ios` before that client's UI work starts.
- The next iteration's steps may start once the current one passed its gates, but never touch `packages/contracts` or `packages/core` while the current iteration's UI steps run.
- While one iteration runs, research and the next spec are prepared, so the owner approves ahead and agents do not wait.
- M1b and M2 run in parallel: M2 changes no core package, so its integration steps and M1b's UI steps never share files.
- M2 is the test of the integration promise: if `uniswap-v4` needs a core change, the abstraction is fixed before M3a.

## After the MVP: Android

Research gate on `docs/research/android-app/`, then the Android client on the frozen contract ([ADR 0056](decisions/0056-android-after-the-mvp.md), stack in [ADR 0020](decisions/0020-android-stack.md)).

## After the MVP: personalisation

A setting for the colour scheme ([0055](decisions/0055-ghost-design-language.md)).

## After the MVP: payments

RevenueCat, Stripe Billing and web-only crypto passes become grant sources ([plans](concepts/plans-and-entitlements.md#billing-after-the-mvp)).

## After the MVP: Aero

Aerodrome and Velodrome merge into Aero. Once Aero is live: research gate on the deployed contracts, Sugar and rewards ([research/aero](research/aero/audit-notes.md)), then the `gauge` staking plugin and the Aero families.
