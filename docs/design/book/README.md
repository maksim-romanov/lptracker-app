# Design book

A design-neutral base for building the web, iOS, iPadOS and macOS clients from scratch; Android sections apply when Android starts ([ADR 0056](../../decisions/0056-android-after-the-mvp.md)). It fixes structure, names, rules and behaviour and fixes colour roles and leaves shape details and imagery for a later design pass.

Read in this order: [foundations](foundations/README.md), [components](components/README.md), then the [screen](screens/README.md) or [widget](widgets/README.md) you build.

## Rules for an agent building from this book

- Use DM Sans, the Scheme values from [ADR 0027](../../decisions/0027-design-tokens.md) (neutral placeholders for the rest), the shared motion tokens until a design pass supplies values.
- Every visual value is a token. A literal colour, size or duration in a component is a defect (token lint, *planned*, M0). Mark a visual choice that has no token with a `design-pending` comment (*convention*).
- The typeface may still change: see [font independence](foundations/font-independence.md).
- Numbers are derived on the server; clients format them with the shared formatter and compute nothing ([AGENTS.md](../../../AGENTS.md)).
- Pending items are not decisions. Do not invent values for them; ask the owner or leave the token at its placeholder.
- Every visual change is screenshotted at 1280 px and 390 px, light and dark, before it is called done (*convention*).
- Where a page and an ADR disagree, quote both lines and ask ([AGENTS.md](../../../AGENTS.md)).

## Contents

| Part | What it holds |
|---|---|
| [foundations/](foundations/README.md) | Token layers and naming, colour roles, type roles, spacing, layout classes, motion, layers |
| [components/](components/README.md) | 21 components: anatomy, data, states, size, behaviour, accessibility, tokens |
| [screens/](screens/README.md) | 9 MVP screens: regions, data, states, navigation and focus |
| [widgets/](widgets/README.md) | Home Screen, Lock Screen and Android widgets |
| [landing.md](landing.md) | Marketing landing structure and mobile options |
| [open-questions.md](open-questions.md) | What waits for the owner |
| [prototypes.md](prototypes.md) | HTML prototypes behind the decisions |
| [drawings/](drawings/README.md) | Wireframe and prototype previews |
| [visual/wireframes/](visual/wireframes/foundations.html) | The same sections as drawings; open in a browser |
