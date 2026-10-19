---
name: research-app
description: Researches current official docs, best practices and recent articles for a VoidX app or one area of it, records findings with sources in docs/research/, drafts the plan in docs/specs/, and stops for the owner's approval. Use before the first code in an app (server, worker, ios-app, android-app) or before using a framework, library or platform API with no file in docs/research/<app>/. Not for doc edits, bug fixes or changes that follow existing patterns.
---

# Research before building

0. **Reuse.** Read existing `docs/research/<app>/*.md`. Re-check only files older than one major release of their subject.
1. **Scope.** Whole app: list every topic it needs (framework, architecture, state, navigation, networking, storage, auth, accessibility, motion, testing, performance, CI, platform features). One area: list only that area's topics and the neighbours it touches. Read the app's `AGENTS.md`, its `docs/` and the ADRs they link first.
2. **Search.** Official docs and release notes first, then recent articles and well-known open-source repos. Run topics in parallel with subagents; keep their findings in files, not in chat.
3. **Record.** One file per topic, `docs/research/<app>/<topic>.md`, with the sections in [docs/research/README.md](../../../docs/research/README.md): Decisions, Facts that constrain us, Open questions, Sources. Flag anything that conflicts with an ADR instead of deviating.
4. **Plan.** `docs/specs/<app>-plan.md` (or `<app>-<area>-plan.md`) using the template in [docs/specs/README.md](../../../docs/specs/README.md), plus sections Modules and Libraries. `status: draft`.
5. **Stop.** Present the plan with a short summary and the open questions. Write no app code until the owner sets `status: approved`.
