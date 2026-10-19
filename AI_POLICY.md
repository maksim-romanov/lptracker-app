# AI policy

AI coding agents are welcome here; most of VoidX is written with them. A person is responsible for every contribution.

1. You understand every line of your PR and can explain it without an AI.
2. You reply to reviewers yourself; no AI-generated replies.
3. Commits an AI helped write carry an `Assisted-by: <tool>` trailer, e.g. `Assisted-by: Claude Code`; no `Co-Authored-By` for AI.
4. Agents do not open PRs, issues or comments on their own.
5. Addresses, start blocks and ABIs come from cited sources, never from a model's memory.
6. Users' watched addresses never go into third-party tools, MCP servers or prompts; use test wallets or public protocol wallets.

CI runs the checks; you do not need to paste their output.

## Slop

A PR is labelled `slop` when it has:

- an empty or unfilled PR template;
- checks that were never run or fail with no attempt to fix them;
- addresses, start blocks or ABIs without sources;
- code the author cannot explain when asked.

The first time, a maintainer comments with the reasons and the PR stays open for 7 days. If it is not fixed, the PR is closed; you may reopen it once it meets this policy.

AI review runs only after deterministic checks pass and only for trusted authors: people with 2 merged PRs.
