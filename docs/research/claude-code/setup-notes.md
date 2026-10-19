---
app: repository
topic: Claude Code setup
checked: 2026-10-01
---

# Claude Code setup

## Decisions
- We keep a root `CLAUDE.md` that imports `@AGENTS.md`, because a root `CLAUDE.md` makes Claude read `CLAUDE.md` files only; the import keeps `AGENTS.md` the single source and never loads it twice. [1]
- We put a `CLAUDE.md` containing `@AGENTS.md` next to every nested `AGENTS.md` (apps, integrations, packages), because with a root `CLAUDE.md` present Claude does not read subdirectory `AGENTS.md` files, while subdirectory `CLAUDE.md` files load on demand when Claude reads files there. [1]
- We disable commit and PR attribution with `"attribution": { "commit": "", "pr": "" }`, because `includeCoAuthoredBy` is deprecated and the AI policy requires `Assisted-by:` instead of `Co-Authored-By`. [2]
- We enforce hard rules with `permissions.deny`, not hooks: `Bash(git push *)`, `Edit(...)` on generated paths, lockfiles and `.env` files, `Read(...)` on `.env` files. `Edit` rules also govern the Write tool; `Write(...)` path rules are ignored. Deny rules apply before workspace trust. [3]
- We add one `PostToolUse` hook on `Edit|Write` in M0 that runs `bun run format <file>` on the edited file, prints nothing on success and only the failure otherwise, because an agent then never spends a turn on formatting and the output stays out of context. [6]
- We link each skill individually: `.claude/skills/<name>` → `../../.agents/skills/<name>`, because Claude Code supports a symlinked skill directory entry and loads it once. A new skill in `.agents/skills/` needs its own link. A skill only for Claude Code lives in `.claude/skills/<name>/` as a plain directory. [4]
- We define five read-mostly subagents in `.claude/agents/`: `researcher` (writes only `docs/research/`), `architecture-guard`, `protocol-reviewer`, `docs-reviewer`, `security-reviewer`. The `description` drives automatic delegation, so each says what and when. Per-app engineer and reviewer agents are defined in each app's approved plan. [5]

## Facts that constrain us
- Subagent frontmatter: required `name`, `description`; optional `tools` (comma-separated or list), `model`, `permissionMode`, `maxTurns`, `skills`, `memory`, `isolation`, `effort`, `omitClaudeMd`. [5]
- Hooks: `hooks.PreToolUse[].matcher` + `hooks[].type: "command"`; stdin JSON has `tool_input.command` or `tool_input.file_path`; exit 2 blocks and returns stderr to Claude; `${CLAUDE_PROJECT_DIR}` resolves the project root. [6]
- Bash deny rules also match nested commands and subshells, but not every git spelling (`git -C . push`); a push is ultimately blocked by branch protection on GitHub.
- Reading `AGENTS.md` directly needs Claude Code 2.1.277 or later; the `@AGENTS.md` import works on every version. [1]

## Open questions
- Cloud setup for Claude Code on the web (SessionStart hook installing mise and Bun) once the toolchain exists.

## Sources
1. Memory and AGENTS.md — https://code.claude.com/docs/en/memory
2. Settings reference, `attribution` — https://code.claude.com/docs/en/settings-reference
3. Permissions — https://code.claude.com/docs/en/permissions
4. Skills — https://code.claude.com/docs/en/skills
5. Subagents — https://code.claude.com/docs/en/sub-agents
6. Hooks — https://code.claude.com/docs/en/hooks
