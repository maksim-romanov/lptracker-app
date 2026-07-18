---
paths:
  - "**/CLAUDE.md"
  - ".claude/rules/**"
  - ".claude/skills/**/SKILL.md"
---

# Writing CLAUDE.md / rules / skills in this repo

Before adding or expanding one of these files, check it against the list below. When in doubt, write less.

- **Incident-driven, not aspirational.** A line belongs only when it would have prevented an actual mistake (yours or a past session's) — not because it seems like useful context. If you can't point to a concrete wrong turn it heads off, cut it.
- **Don't do the linter's job.** Never document something Biome/`tsc`/a Turbo task already enforces (import order, formatting, strict-mode nulls). If it's enforceable, enforce it in config, don't spend agent attention on it every session.
- **Structure and rules, not data.** File maps, layering, conventions, gotchas — yes. Current color values, hex codes, chain lists, capability arrays, exact numbers — no. They drift, and a stale copy is worse than none; read the source instead.
- **One fact, one home.** If it's already in root `CLAUDE.md`'s monorepo table or a real `docs/*.md`, don't re-describe it in a package's own file — link to it.
- **Same rule scattered across ≥2 directories → `.claude/rules/`, path-scoped.** A convention owned by exactly one directory → that directory's own `CLAUDE.md`. Don't copy-paste the same gotcha into every package that happens to need it.
- **Multi-step, tool-using procedure → a skill, not CLAUDE.md prose.** CLAUDE.md says what exists; a skill says how to do the multi-step thing (deploy, scaffold a new package). Roughly: CLAUDE.md/rules are *reference*, skills are *how-to*, `docs/*.md` are *explanation* — don't blend the three.
- **No file for a directory with no real nuance.** A leaf package with nothing beyond "here's what it is" doesn't earn a `CLAUDE.md` — a one-liner in root's monorepo table is enough.
- **Verify against current source before writing, not memory or old docs.** Re-check file paths, function names, and counts (networks, chains, entries) against the actual code — stale reference docs are exactly what causes this kind of drift.
- **Keep it short.** Root `CLAUDE.md` and per-app files stay well under ~200 lines. This isn't just tidiness — instruction-following measurably degrades once a model is tracking more than ~150-200 directives at once, so bloat here has a real cost, not just a maintenance one.
