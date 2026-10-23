---
id: UC-02
title: Hear when a position leaves its range
status: draft
priority: P1
platforms: [web, iPhone, iPad]
related: [UC-03, UC-05]
---

# UC-02 Hear when a position leaves its range

**Situation.** Dana's ETH/USDC position earns fees only while the price stays inside 2,800 to 3,400. At night ETH jumps to 3,550. From then the position earns nothing and sits fully in USDC. Dana is asleep, then at work; she would open the protocol site on a laptop two days later.

| Without VoidX | With VoidX |
|---|---|
| Out of range for about 40 hours before anyone notices `[illustrative]` | A push on the phone within minutes: "ETH/USDC left its range, above 3,400" |
| The fees of those hours are gone for good | Dana rebalances or leaves it on purpose, but with a choice |
| She learns the cause by opening the position and reading the chart | The push opens the position with a banner that says which side and how far |

**Intent.** When a position stops earning because the price left its range, I want to know within minutes, so the time without fees is my decision and not an accident.

**Scope.** Starts: a signed-in LP watches a wallet. Ends: the LP has opened the position behind a push. Not covered: acting on the position; there is no transaction in the first release. Guarantee: one alert per position per cooldown, so a price near an edge does not flood the phone. No push on macOS.

**Trigger and preconditions.** The LP signed in with a passkey, watches a wallet and allowed push on the device.

## Main scenario

1. The LP turns on the rules once: left its range, back in range.
2. The app keeps reading the watched wallets while the LP does something else.
3. A position leaves its range.
4. The app sends a push naming the pair and the side.
5. The LP opens the push and lands on the position (UC-03).
6. Later the position returns to its range and the LP gets a second push.

## Extensions

- 1a. The device denied push: the app says alerts arrive in the Alerts list only and offers system settings. ✔
- 1b. The LP is a guest: the app explains that alerts need an account and offers a passkey sign-in. ✖
- 3a. The price crosses the edge again within the cooldown: no new push; the Alerts list records it. ✔
- 5a. The position was closed meanwhile: the app says so and returns to the portfolio. ✔
- 6a. The wallet is paused above the plan limit: it is not monitored and sends no alert. ✖

## Open questions

None.
