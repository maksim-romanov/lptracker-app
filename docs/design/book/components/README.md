# Components

Every block has the same fields so an agent can find what it needs. Sizes are rules in points, not pixels for one device. Colours are the roles of the colour page, named in Tokens.

| Field | Meaning |
|---|---|
| Anatomy | Parts, in order |
| Variants and states | Every state must exist before the component is done |
| Size | Rule with a range or a minimum |
| Behaviour | What input does |
| A11y | Names, roles, focus |
| Tokens | Roles the component may use; nothing else |
| Data | Wire fields it shows (see the position model); the client computes nothing and only formats |

> **Font independence.** No component sizes itself to a measured string or to one face. Widths come from the grid or from content, text never has a fixed height, and every row has a stacked layout for large text. The typeface will change; see Foundations.

> **Definition of done.** A component is done when every listed state renders, every listed token is used and no other value is, it passes the accessibility row, and its reduced-motion version exists.
