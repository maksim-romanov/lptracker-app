# Design book

The base for building the web, iOS, iPadOS and macOS clients; Android sections apply when Android starts ([ADR 0056](../../decisions/0056-android-after-the-mvp.md)). The look is Ghost ([ADR 0055](../../decisions/0055-ghost-design-language.md)); the approved [prototypes](prototypes.md) show it.

Read in this order: [foundations](foundations/README.md), [components](components/README.md), [screen state](foundations/screen-state.md), then the [screen](screens/README.md) or [widget](widgets/README.md) you build, with its prototype open.

## Which source wins

1. An ADR. While a conflict with it is listed in [open questions](open-questions.md), build what the ADR says.
2. An approved prototype, on visual values only: colour, size, radius, layout, the look of each component. Its [known deviations](prototypes.md#known-deviations) do not count.
3. The screen or widget page: regions, data, states, navigation and focus.
4. The component page.

Behaviour, accessibility and motion never come from a prototype: they come from [ADR 0022](../../decisions/0022-accessibility.md), [ADR 0023](../../decisions/0023-motion.md) and the pages, even where an approved prototype does something else.

A draft or in-progress prototype ranks below the pages. When two sources disagree, quote both lines and ask ([AGENTS.md](../../../AGENTS.md)); never pick one silently.

## Rules for an agent building from this book

- Use DM Sans, the Scheme values from [ADR 0027](../../decisions/0027-design-tokens.md) and the shared motion tokens. A visual value with no token yet is read from the approved prototype and added as a token.
- Every visual value is a token. A literal colour, size or duration in a component is a defect (token lint, *planned*, M0). A token whose value is not final carries a `design-pending` comment in the token file; a component never uses a literal instead (*convention*).
- The typeface may still change: see [font independence](foundations/font-independence.md).
- Numbers: [AGENTS.md](../../../AGENTS.md) hard rules.
- A value the approved prototypes do not show is pending: ask the owner or leave the token at its placeholder; never invent it.
- Every visual change is screenshotted in the [rubric](rubric.md) matrix before it is called done (*convention*).

## Contents

| Part | What it holds |
|---|---|
| [foundations/](foundations/README.md) | Token layers and naming, colour roles, type roles, spacing, layout classes, motion, layers, screen state |
| [components/](components/README.md) | 23 components: anatomy, data, states, size, behaviour, accessibility, tokens |
| [screens/](screens/README.md) | 9 MVP screens: regions, data, states, navigation and focus |
| [widgets/](widgets/README.md) | Home Screen, Lock Screen and Android widgets |
| [landing.md](landing.md) | Marketing landing structure and mobile options |
| [rubric.md](rubric.md) | The screenshot review of phase 7b |
| [open-questions.md](open-questions.md) | What waits for the owner |
| [prototypes.md](prototypes.md) | HTML prototypes behind the decisions |
| [drawings/](drawings/README.md) | Wireframe and prototype previews |
| [visual/wireframes/](visual/wireframes/foundations.html) | The same sections as drawings; open in a browser |
