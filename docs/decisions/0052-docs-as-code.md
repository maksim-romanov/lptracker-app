# 0052 · Docs as code: short English docs in the repo

- Status: proposed
- Deciders: Maksim Romanov

## Context

Most changes, including integrations, are written by contributors with AI agents. Agents read what is in the repo and follow it literally, so the docs are part of the build: stale, long or contradictory docs produce wrong code.

## Options

- **A wiki or docs site outside the repo**: drifts from the code and is invisible to agents.
- **Docs in the repo without limits**: files grow until agents skim them and facts repeat in several places.
- **Docs in the repo with strict size and style rules**.

## Decision

Chosen **short docs in the repo**, because docs reviewed in the same PR as the code stay true, and short docs are read whole.

- Agent instruction files: [0024](0024-agent-setup-and-ai-policy.md).
- Everything in the repo is English: docs, code, comments, commits.
- One home per fact ([writing-docs](../writing-docs.md#rules)).
- Size limits and the fluff test in [writing-docs](../writing-docs.md) apply to every doc.
- Drafts live in the gitignored `.drafts/` and are never committed.
- The repo is docs-only until M0; ADRs stay `proposed` until M2 ([GOVERNANCE](../../GOVERNANCE.md#decisions)).

## Consequences

- Docs change with the code they describe; docs-lint (lychee, markdownlint-cli2, an `AGENTS.md` path check) checks links, anchors and paths ([research/repo/ci](../research/repo/ci.md)).
- Contributors who write in another language translate before committing.
