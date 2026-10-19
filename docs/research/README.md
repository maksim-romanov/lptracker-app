# Research

What we learned from outside sources before building, one file per topic: `docs/research/<app>/<topic>.md`, e.g. `server/view-transitions.md`, `ios-app/accessibility.md`. Written during the [research gate](../workflow.md).

```markdown
---
app: server
topic: View transitions
checked: YYYY-MM-DD
---

# <Topic>

## Decisions
- We do X because Y. [1]
- We avoid Z because W. [2]

## Facts that constrain us
- Browser or OS support, limits, known bugs, with versions. [3]

## Open questions
- What the sources did not settle.

## Sources
1. <title> — <url>
```

Rules:

- Decisions first; each cites a source.
- Prefer official docs and release notes; articles only for what docs do not cover.
- Facts carry the version they apply to; re-check a file older than one major release before relying on it.
- No summaries of things the agent already knows; only what changes what we build.
