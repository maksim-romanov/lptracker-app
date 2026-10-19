# Specs

A spec says what to build. Why lives in an ADR; how it fits lives in [architecture](../architecture.md).

File name: `<milestone or app>-<topic>.md`, e.g. `m1a-data.md`, `server-plan.md`.

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

## Steps

A milestone spec has a step list next to it, `<spec>.steps.json`, reviewed and approved with the spec ([workflow](../workflow.md#iterations-and-steps)). Step status is runtime state and is never committed.

```json
{
  "spec": "m0-skeleton",
  "steps": [
    {
      "id": "M0-S04",
      "title": "Contracts: Zod schemas, openapi.json, fixtures, mock",
      "summary": "Defines the first draft of the API contract and the mock API the apps use before a server exists.",
      "phase": 0,
      "size": "M",
      "client": "shared",
      "role": "backend",
      "workspace": "packages/contracts",
      "owns": ["packages/contracts/**"],
      "reads": ["docs/decisions/0010-wire-contract.md"],
      "depends_on": ["M0-S03"],
      "done_when": "bun run check --filter=@voidx/contracts",
      "criteria": ["A fixture with an unknown enum value decodes"],
      "owner_gate": false
    }
  ]
}
```

| Field | Rule |
|---|---|
| `id` | `<milestone>-S<nn>`, or `<milestone>-G<n>` for a gate; never reused |
| `summary` | one or two plain sentences: what the step builds and why, readable without the spec |
| `phase` | 0 to 7, or `"gate"` |
| `size` | `S`, `M` or `L`: S is a config or small module, M a package with tests, L an Xcode build, the simulator or complex core logic; sets the step's weight and model |
| `client` | `web`, `ios` or `shared`; a gate step's client names which UI it releases |
| `slots` | host-wide resources held for the whole step: `build` (Xcode), `device` (simulator); omit for none |
| `role` | `backend`, `ios`, `web`, `design-system`, `motion`, `qa`, `platform` |
| `owns` | globs the step may edit; an edit outside them fails the step |
| `reads` | the docs the step needs, no more; a UI step includes the approved design prototype |
| `depends_on` | step ids; a phase 4 to 7 step depends on its client's `core-green` gate, directly or through another step |
| `done_when` | one command; exit 0 means done |
| `criteria` | the spec's acceptance criteria this step ticks, quoted; `[]` when it ticks none |
| `owner_gate` | true when the step needs the owner (a baseline, a secret, a dependency not in the spec) |
| `owner_reason` | required when `owner_gate` is true: what the owner must do, in one sentence |
