# 0011 · Token amounts are the primary value; USD comes later as an estimate

- Status: proposed
- Deciders: Maksim Romanov

## Context

USD values need price sources, confidence rules, spam handling and fallbacks. What an LP needs first is how much of each token a position holds, what fees it has earned and what rewards it has accrued.

## Options

- **Token amounts first**, USD prices as a later milestone.
- **USD values from the start**.

## Decision

Chosen **token amounts first**, because it keeps price sourcing off the critical path of the first milestones without losing what users check most. USD prices and totals arrive in M3.5 as estimates ([0045](0045-token-prices.md)).

- A position shows principal per token, owed fees per token and, after the MVP, rewards per token, read on chain by the staking plugin.
- The range is shown in pool price terms (one token per the other), not in USD.

## Consequences

- Prices, values and totals are additive optional fields that older apps ignore ([0010](0010-wire-contract.md)).
- Token amounts stay on screen next to every USD value, because an amount is exact and a price is not. Totals across tokens (the portfolio and a wallet) are the exception: they show USD only, labelled as an estimate.
