# Problem

## Pains

1. **Tools for your own assets are built for the desktop.** Wallet extensions, protocol dashboards and explorers assume a large screen and a browser tab. On a phone they do not fit, and nothing tells you when to look.
2. **Positions are scattered.** An LP holds positions in several protocols on several chains. Each protocol app shows only its own, so the full picture needs one app per protocol and chain.
3. **Staked positions disappear.** When a position token sits in a staking contract, the wallet no longer holds it and wallet views stop listing it.
4. **Range status takes several apps to check.** Whether a position is in range, what fees it has earned and which rewards it has accrued are spread across protocol UIs and explorers.
5. **Leaving the range goes unnoticed.** A position outside its range earns no fees. The LP finds out when they next open an app.
6. **Trust in numbers.** Aggregators mix indexed data with chain data, so an amount can be stale or wrong with no way to tell.
7. **Adding a protocol is slow.** Trackers support the protocols their team has time for; a new chain or protocol waits for that team.

## What VoidX changes

| Pain | Answer |
|---|---|
| 1 | Native apps for iPhone, iPad and Mac, push and widgets: the job fits in a pocket ([UC-06](use-cases/UC-06-glance-widget.md)) |
| 2 | One portfolio for every watched wallet across supported protocols and chains ([UC-01](use-cases/UC-01-see-all-positions.md)) |
| 3 | Custody is part of the position model; staked positions are listed with where they sit, once a staking plugin lands ([UC-04](use-cases/UC-04-find-a-staked-position.md)) |
| 4 | One position view: value, range bar, principal, owed fees ([UC-03](use-cases/UC-03-inspect-a-position.md)) |
| 5 | Push on range exit and re-entry, early warnings on Pro ([UC-02](use-cases/UC-02-out-of-range-alert.md), [UC-05](use-cases/UC-05-early-warning.md)) |
| 6 | The index only finds positions; every quantity is read from the chain ([data rule](../concepts/data-rule.md)) |
| 7 | An integration is a folder a contributor adds by pull request; core never changes ([ADR 0006](../decisions/0006-integration-unit.md)) |
