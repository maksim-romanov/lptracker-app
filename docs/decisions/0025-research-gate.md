# 0025 · Research gate before building each app

- Status: proposed
- Deciders: Maksim Romanov

## Context

Agents' knowledge of frameworks goes stale. Before building an app, the agent needs a complete, current picture of everything that app uses, and the owner wants to approve each app's plan.

## Options

- **Build from the architecture docs directly**.
- **Research, plan, owner approval, then build**.

## Decision

Chosen **the research gate**, applied before the first code in an app, or before using a framework, library or platform API with no file in `docs/research/<app>/`; not for doc edits, bug fixes or changes that follow existing patterns:

1. Research current official docs, best practices and recent articles.
2. Write findings to `docs/research/<app>/<topic>.md` with sources and the date checked.
3. Write the app plan to `docs/specs/<app>-plan.md`.
4. The owner approves it (`status: approved`).
5. Only then write the app's code.

## Consequences

- The `research-app` skill walks agents through steps 1–4 and stops before code.
- A PR with app code links its approved plan; CI checks the plan's status.
- Research files are reused by later agents instead of repeating searches.
- Related: [workflow](../workflow.md), [0024](0024-agent-setup-and-ai-policy.md).
