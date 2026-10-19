# Specs

A spec says what to build. Why lives in an ADR; how it fits lives in [architecture](../architecture.md).

File name: `<milestone or app>-<topic>.md`, e.g. `m1-thin-slice.md`, `server-plan.md`.

```markdown
---
status: draft | approved | implemented
owner: <name>
issue: <link>
---

# <Title>

## Problem
Two or three sentences.

## Scope
- What is built.

## Out of scope
- What is not.

## Contract changes
None | the fields and endpoints added.

## Acceptance criteria
- [ ] A command that must pass, e.g. `bun run check --affected`.
- [ ] An observable result, e.g. `POST /api/v1/portfolio/query` for <fixture address> returns 2 positions.

## Research
Links to docs/research/<app>/<topic>.md this spec relies on.
```

Rules:

- Acceptance criteria are commands or observable results, never adjectives.
- An app plan is not built until `status: approved` by the owner ([workflow](../workflow.md)).
- The implementation plan for a PR goes in the PR description, not in the repo.
