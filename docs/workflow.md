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

## Iterations and steps

How an approved spec becomes agent work ([decomposition research](research/agent-tools/work-decomposition.md)).

- An iteration is one roadmap milestone with one approved spec. A spec with more than about 30 steps is split before approval.
- A step is one fresh agent session in one workspace that ends when one command exits 0. Steps live in `docs/specs/<spec>.steps.json`, approved with the spec ([format](specs/README.md#steps)).
- Phases run in this order: 0 contracts, fixtures, mocks and tokens; 1 core; 2 server and data; 3 client logic; 4 UI kit; 5 screens; 6 motion check on devices; 7 audits. Client logic runs against the mock API, in parallel with the server.
- Each client (web, iOS) has its own gate step `core-green-<client>`. It depends on every step of phases 0 to 3 that client needs, and every phase 4 to 7 step of that client depends on it directly or through another step, so UI work starts only after the core it uses passes.
- UI steps build what the approved design prototype shows (iteration D0 on the [roadmap](roadmap.md)) and list it in `reads`. A screen that is not in the prototype is drawn there first.
- A component or screen step is done only with its motion, reduced-motion branch and accessibility checks passing; phase 6 checks motion budgets and parity on devices, not missing work.
- Phase 7 has three parts: an agent QA pass that drives the running app (simulator through a mobile MCP server, the web through Playwright) on fixture data only and records findings; a screenshot review against the design rubric; the owner's acceptance against the prototype. Findings become fix steps; thresholds stay ([hard rules](../AGENTS.md#hard-rules)).
- Steps run in parallel when their dependencies are done and their `owns` globs do not overlap. Steps that touch `packages/contracts` or `packages/core` run alone. How many run at once depends on step `size` and free memory ([resource limits](research/agent-tools/local-resource-limits.md)).

## Every change

| Step | Rule |
|---|---|
| Spec | Work that changes a public contract, adds a module or spans more than one workspace starts from an approved spec in `docs/specs/`; an integration uses its accepted `new-integration` issue; other multi-file changes put the plan in the PR description; doc edits need none |
| Decide | A decision that is hard to reverse gets an ADR in `docs/decisions/` |
| Build | Follow the nearest `AGENTS.md` |
| Verify | `bun run check --affected` passes locally (*planned*) |
| Docs | Docs change in the same PR as the code they describe, and pass the [fluff test](writing-docs.md#fluff-test) |
| PR | Template filled by a human; follow the [AI policy](../AI_POLICY.md) |
