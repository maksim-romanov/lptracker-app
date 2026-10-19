# 0051 · Positions in V4 hooked pools are shown with flags, never hidden

- Status: proposed
- Deciders: Maksim Romanov

## Context

A Uniswap V4 pool can attach a hook that changes how liquidity is added, removed or swapped. Some hooks take fees, redirect them or bypass the pool curve, so the standard fee and amount math may not describe what the LP will receive. The hook's permissions are encoded in its address.

## Options

- **Hide positions in hooked pools**: no wrong numbers, but users lose positions they hold.
- **Trust every hook**: complete lists, silently wrong fees for some pools.
- **Show every position and flag what the hook can change**: complete lists, honest numbers.

## Decision

Chosen **show with flags**, because a missing position is worse than a labelled one, and the hook address tells us exactly which numbers to distrust.

- Hook permission bits, read from the address without an RPC call, set `feeAccrual` and `amountsConfidence`; the bit table lives in the [data rule](../concepts/data-rule.md#v4-hooks).
- A maintainer-reviewed list of hook addresses may lift the flags per hook.
- Clients render the flags from the contract; they never infer them.

## Consequences

- Positions with an `unknown` fee accrual show no owed fees.
- Adding a hook to the reviewed list is a maintainer PR with a source for its behaviour, reviewed by `protocol-reviewer`.
- Hooks that change behaviour behind an unchanged address are not caught by bits alone; the reviewed list records the reviewed code.
