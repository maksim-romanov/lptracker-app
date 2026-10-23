---
id: UC-03
title: Decide what to do with one position
status: draft
priority: P1
platforms: [web, iPhone, iPad, Mac]
related: [UC-01, UC-02]
---

# UC-03 Decide what to do with one position

**Situation.** A push says Dana's ETH/USDC position left its range. She is on her phone, away from the laptop, and must decide in a few minutes: collect fees and re-open the range, wait for the price to come back, or leave it.

| Without VoidX | With VoidX |
|---|---|
| Open a desktop protocol page on a phone, find the position id, read ticks and convert them to prices | The range bar shows the current price against the lower and upper price |
| Work out how much of the position is now in one token | Principal per token, exact |
| Guess whether fees are worth collecting | Owed fees per token, with a note on what they are |

**Intent.** When I look at one position, I want its value, range and owed fees at one chain block, so I can decide without opening anything else.

**Scope.** Starts: the LP opens a position from the portfolio, an alert or a link. Ends: the LP decides outside the app. Not covered: collecting or changing the position. Guarantee: values come from the chain at one block and show their age; USD is labelled an estimate.

## Main scenario

1. The LP opens the position.
2. The app shows the pair, protocol, fee tier, chain and value.
3. If out of range, a banner says on which side.
4. The app draws the range bar: current price against the lower and upper price.
5. The app lists the principal per token and the owed fees per token.
6. The app shows where the position lives: custody, id, owner, and an explorer link.
7. The LP sets an alert for this position, shares it, or goes to the explorer to act.

## Extensions

- 4a. The position has no range: no range bar. ↩ 5
- 5a. The protocol redirects or compounds fees: the owed fees section becomes a line saying where they go. ↩ 6
- 5b. A V4 hook can bypass the pool curve: a note says amounts are low confidence. ↩ 6
- 7a. The LP is a guest: Set alert opens sign-in with the reason. ✔
- 1a. The position is closed or no longer watched: the app says so and returns to the portfolio. ✖

## Open questions

None.
