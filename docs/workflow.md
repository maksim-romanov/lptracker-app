# Workflow

How work moves from an idea to merged code. Agents and people follow the same path.

## Research gate

Run it before the first code in an app, or before using a framework, library or platform API that has no file in `docs/research/<app>/` ([ADR 0025](decisions/0025-research-gate.md)). Skip it for doc edits, bug fixes and changes that follow existing patterns.

1. Research current official docs, best practices and recent articles for every topic the work needs.
2. Record findings in `docs/research/<app>/<topic>.md` in the [research format](research/README.md).
3. Plan in `docs/specs/<app>-plan.md`, or `<app>-<area>-plan.md` for one area, using the [spec format](specs/README.md), `status: draft`.
4. Present the plan to the owner and stop. Code starts only after `status: approved`.
5. Build against the approved plan. A change of direction goes back to step 3.

The `research-app` skill walks through steps 1–4. A PR with app code links its approved plan; CI checks the status (*planned*).

## Every change

| Step | Rule |
|---|---|
| Spec | Work that changes a public contract, adds a module or spans more than one workspace starts from an approved spec in `docs/specs/`; an integration uses its accepted `new-integration` issue; other multi-file changes put the plan in the PR description; doc edits need none |
| Decide | A decision that is hard to reverse gets an ADR in `docs/decisions/` |
| Build | Follow the nearest `AGENTS.md` |
| Verify | `bun run check --affected` passes locally (*planned*) |
| Docs | Docs change in the same PR as the code they describe, and pass the [fluff test](writing-docs.md#fluff-test) |
| PR | Template filled by a human; follow the [AI policy](../AI_POLICY.md) |
