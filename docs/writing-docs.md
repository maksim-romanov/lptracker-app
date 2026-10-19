# Writing docs

Every doc in this repo is read by coding agents first and people second. Each line costs context, so it has to earn its place. Why docs live here and work this way: [ADR 0052](decisions/0052-docs-as-code.md).

## Rules

- Write only what an agent cannot learn from the code, the file tree, a manifest or `--help`.
- Test every line: if deleting it would not cause a mistake, delete it.
- Be concrete: a command, a path, a name, a number. Never "consider", "e.g." where one value is meant, or ranges like "15–30 s".
- Say what to do. Add "because …" when the reason is not obvious, so the rule generalizes correctly.
- No shouting (ALL CAPS, "CRITICAL", "MUST!!!"). At most one emphasized line per file.
- One term per concept, exactly as in [glossary.md](glossary.md).
- One home per fact. Link to it; never restate it. Where facts live:

| Kind of fact | Home |
|---|---|
| Why the product exists, scope, non-goals | [vision.md](vision.md) |
| Why a decision was made | [decisions/](decisions/), one ADR each; `proposed` ADRs may be edited, `accepted` ones are superseded |
| What exists now and how it fits together | [architecture.md](architecture.md) and [concepts/](concepts/) |
| How to do a task | `docs/guides/` (from M1a) or a skill in `.agents/skills/` |
| What an agent must run or never do in a folder | that folder's `AGENTS.md` |
| What to build next | [specs/](specs/) |
| What we learned from outside sources | [research/](research/) |

- A rule an agent must follow names the check that enforces it. A rule with no check is labelled *convention*.
- Lists that drift (chains, protocol support, commands) are generated, not written by hand.
- No dates or versions in prose; versions live in `mise.toml` and lockfiles. ADRs, `research/` and `specs/` may name versions because they record a moment.
- Diagrams are Mermaid inside the doc that owns the fact.

## Size limits

| File | Limit |
|---|---|
| Root `AGENTS.md` | 100 lines |
| Nested `AGENTS.md` | 40 lines, never repeating the root |
| Concept doc | 120 lines |
| ADR | 60 lines |
| `SKILL.md` | Body under 500 lines; the `description` says what it does and when to use it |

## Fluff test

Run it on every doc before a PR.

- [ ] Nothing here is derivable from code, tree, manifest or `--help`.
- [ ] Deleting any line would cause a real mistake.
- [ ] No generic advice ("be careful", "follow best practices").
- [ ] Nothing a linter, formatter, hook or CI already enforces, except as a pointer to that tool.
- [ ] Every rule is concrete and phrased as what to do.
- [ ] No shouting.
- [ ] Nothing duplicated from another doc.
- [ ] Only loads every session if it matters every session.
- [ ] No stale dates or versions.
- [ ] Terms match the glossary.
- [ ] Every path and command named exists or is marked *planned*.
