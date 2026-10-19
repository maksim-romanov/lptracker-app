# Landing

The marketing page. One section for now (the Hero) on one grid, so more sections can be added under it without changing the grid, spacing or components. The drawing is in [visual/wireframes/landing.html](visual/wireframes/landing.html); the liked prototype is [landing-one-block.html](visual/prototypes/landing-one-block.html).

## Hero parts

| Part | Content | Rule |
|---|---|---|
| Header | Logo, three links, one outline button "Open on the web" | Height 72 desktop, 56 phone; links hide on phone; no border |
| Headline | "Your DeFi yield on your Home Screen." | Three lines at desktop; fluid size, minimum 40, maximum 88 |
| Supporting line | "Widgets, and a push when it needs you." | One sentence |
| Primary button | "Track your wallet" | Height 56; full width on phone; opens Add wallet |
| Facts line | iPhone, iPad, Mac, Android; Free; Open source | Hidden on short screens; separated by dots, no check icons |
| Visual | Phone showing the real Portfolio, a push stack, widgets | Decorative; never covers a number; hidden from screen readers |
| Footer | Name, three links, "USD values are estimates." | Height 56; stacks on phone; no border |

All sizes on this page are *design-pending*.

## Push stack

One live push on top and two compressed layers behind it, with a line such as "2 more notifications". Preferred signature element. States: range exit, collapsed (count only).

## Widths

| Width | Layout |
|---|---|
| Expanded layout class (840 and up) | Two columns: text on columns 1 to 6, visual on 7 to 12; phone right, stack and widgets scattered at different angles |
| Medium layout class (600 to 839) | One column, text up to 560 wide, visual below with phone, stack and one widget; button auto width, minimum 280 |
| Compact layout class (under 600) | One column; see the options below |
| Phone landscape, height 520 or less | Two columns, phone cropped at the bottom, no facts line |

## Mobile options (undecided)

- **A.** Text, then the stack, then the phone; button pinned at the bottom.
- **B.** No phone: the stack, two widgets and one position row; lightest, least literal.
- **C.** Phone as large as possible, the stack overlapping its top edge, the supporting line next to the button.

Open: pinned button or a button that scrolls (pinned costs about 96 px of the visual); phone or no phone on mobile.

## Content under the Hero (slots)

Widgets, Alerts, Lending (Aave, Compound, Morpho as a card with a health bar; after the MVP, and a new position and alert kind that needs a spec), Platforms (device frames), Open source, a closing action.

## Rules

- Black frosted glass fills the whole background in both themes; pushes are glass. No gradient text, no glows, no check icons, no borders on header or footer.
- Copy is short. Light sans headline with tight tracking.
- Device frames: abstract, or Apple's official bezels unmodified; Apple's marketing rules forbid simulating Apple products and adding shadows, tilt or animation to bezels (not legal advice, see [research](../../research/repo/scroll-landing-practices.md)).
- Reduce Motion stops the drift; Reduce Transparency and Increase Contrast give an opaque background.
