# Use cases

What a person does with VoidX, one goal per file. They explain the product; specs, screens and tests take their detail from [specs/](../../specs/README.md), [screens](../../design/book/screens/README.md) and [ADR 0048](../../decisions/0048-e2e-testing.md).

## Writing rules

- One case, one goal, one sitting. Each opens with a concrete situation and a Without / With table, so the value is visible before the steps.
- Main scenario: 5 to 8 steps, one intent each. No screens, widgets or endpoints.
- Extensions: `<step><letter>. <fact>: <reaction>. <exit>`; exit is `↩ n`, `✔` or `✖`.
- Terms from the [glossary](../../glossary.md). IDs `UC-NN` are never renumbered or reused.
- Statuses: `draft`, `review`, `ready`.

## Index

| ID | Goal | Priority | Status |
|---|---|---|---|
| [UC-01](UC-01-see-all-positions.md) | Morning check of all my positions | P1 | draft |
| [UC-02](UC-02-out-of-range-alert.md) | Hear when a position leaves its range | P1 | draft |
| [UC-03](UC-03-inspect-a-position.md) | Decide what to do with one position | P1 | draft |
| [UC-04](UC-04-find-a-staked-position.md) | Find a position that is not in my wallet | P2 | draft |
| [UC-05](UC-05-early-warning.md) | Get warned before a position leaves its range | P2 | draft |
| [UC-06](UC-06-glance-widget.md) | Glance at my positions without opening the app | P1 | draft |

Scope of the first release: [vision](../prd.md#mvp-scope).
