---
app: repo
topic: CI on GitHub Actions
checked: 2026-09-30
---

# CI on GitHub Actions

## Decisions

- We keep the repo public and use only standard GitHub-hosted runners, because they are free for public repos, and the January 2026 price change kept it that way. [5] [6]
- We run one `ci.yml` workflow with no `paths:` filter. A `changes` job decides which platform jobs run and skips the rest with a job-level `if`. A workflow skipped by a path filter leaves its required checks `Pending` and blocks merge, while a job skipped by `if` reports `Success`. [22]
- We make one aggregator job, `ci-ok` (`needs:` all jobs, `if: always()`, fails if any needed job failed or was cancelled), the only required status check in the `main` ruleset, with GitHub Actions as its expected source. This way, adding or skipping jobs never touches branch settings. [22] [25]
- We run `bun run check --affected` with a full-history checkout (`fetch-depth: 0`, `filter: blob:none`). A shallow checkout makes Turborepo treat every package as changed. Turbo ≥ 2.2 picks the PR base, or the previous commit on push, from the GitHub context without `TURBO_SCM_BASE`. [9] [10]
- We split `check` by OS. The Linux job runs `--affected` on everything except `@voidx/ios`, and the iOS job runs `check --filter=@voidx/ios` on macOS, because Swift checks need Xcode (AGENTS.md).
- We run iOS jobs on the `xcode-27` image while it is in preview, then on `macos-26` once it ships Xcode 27 ([M0 owner decision 1](../../specs/m0-skeleton.md#owner-decisions)), and select Xcode explicitly with `xcode-select`, never `macos-latest`. `macos-latest` moved to `macos-26` in June to July 2026 and will move again. The image ships several Xcode 26.x versions with 26.4.1 as default. [1] [2]
- We hold at most two macOS jobs per PR, because the Free plan caps macOS at 5 concurrent jobs out of 20 total. [4]
- We run Android on `ubuntu-latest`, not macOS. JVM-side checks (lint, unit, Roborazzi) need no emulator. When `connectedCheck` arrives, we enable KVM with the documented udev rule on the standard Linux runner. [7] [24]
- We install every toolchain through `jdx/mise-action@v4` with a pinned mise `version` and its built-in cache, and do not use `setup-bun` or `setup-node`, so CI, agents and laptops read one `mise.toml`. [23]
- We install JS dependencies with `bun ci`, which equals `--frozen-lockfile` and fails on lockfile drift, as ADR 0037 requires. We cache `~/.bun/install/cache` keyed on `bun.lock`. [13]
- We cache Gradle with `gradle/actions/setup-gradle@v6`. Its default cache provider is free for public repos and writes only from the default branch, so PR runs only read. [14]
- We do not use a Turborepo remote cache in M0. It is free on Vercel [12], but CI authenticates through OIDC (`id-token: write`) [11], and ADR 0037 wants PR jobs with a read-only token and nothing else. Instead we cache `.turbo` with `actions/cache`: saved on `main`, restore-only on PRs. [9] [11]
- We cache SPM checkouts keyed on `Package.resolved` and skip DerivedData and Tuist binary caches in M0, because the repo cache is 10 GB with LRU eviction and 7-day retention, and DerivedData alone would evict everything else. [8]
- We run PR code only under `pull_request` and never use `pull_request_target`. Fork PRs get a read-only `GITHUB_TOKEN` and no secrets. A `pull_request_target` workflow that checks out PR code shares the privileged main-branch cache and secrets. [17] [20]
- We set the repo default token to read-only and declare `permissions: contents: read` at the top of every workflow, raising scopes per job only. [17]
- We pin every action to a full commit SHA with a version comment, and turn on the repo policy that fails workflows using unpinned actions. [17] [18]
- We let Renovate update action SHAs and mise tools (`helpers:pinGitHubActionDigests`, `mise` manager) with a `minimumReleaseAge` of 7 days. With the default `internalChecksFilter: strict`, Renovate opens no branch before that age. We make one group for `github-actions` and one for `mise` tools, weekly. [15] [16]
- We cancel superseded PR runs with the concurrency group `${{ github.workflow }}-${{ github.head_ref || github.run_id }}` and `cancel-in-progress: true`. The `run_id` fallback keeps every `main` push running. [21]
- We require maintainer approval before workflows run for all outside collaborators, not only first-time contributors, because a fork run can use up the macOS concurrency cap. [20]
- We run zizmor and actionlint in `guard` when `.github/` changes.
- The DCO check exempts the Renovate bot, or Renovate signs off its commits (`commitBody` with `Signed-off-by`).
- We enable Renovate `lockFileMaintenance` weekly, covering `bun.lock` and `mise.lock`.

## Facts that constrain us

- Public repos on standard runners: free, 20 concurrent jobs, 5 concurrent macOS jobs, 6 h per job. [4] [5]
- `ubuntu-latest` = Ubuntu 24.04, 4 vCPU, 16 GB RAM, 14 GB SSD. `macos-26` = 3 × M1, 7 GB RAM, 14 GB SSD. Simulator jobs are tight on RAM. [7]
- `macos-26` became GA on 2026-02-26. Labels: `macos-26` (arm64), `macos-26-intel`; `-large` and `-xlarge` are paid. Installed Xcode: 26.0.1, 26.1.1, 26.2, 26.3, 26.4.1 (default), 26.5. [1] [2]
- Xcode 27 is only on the separate `xcode-27` image label, in preview since 2026-07-16 and now based on macOS 27. It includes Xcode 27.0 (default), 27.1 and 27.2 beta as of 2026-09-21. [3]
- Actions cache: 10 GB per repo free, LRU eviction, 7-day retention default. Going beyond 10 GB needs a paid account. [8]
- Caches written by PR runs are scoped to that PR. Caches written on `main` are readable by every PR. [17]
- `pull_request_target` has always run the default branch's workflow file and ref since 2025-12-08. [19]
- Fork PRs from first-time contributors land in an approval-required state until someone with write access approves them. [20]
- Renovate ≥ 42 treats a release without a timestamp as too young. `minimumReleaseAge` also applies to GitHub Actions digests. [15]
- Gradle's default ("enhanced") cache provider is proprietary and free only for public repos. `cache-provider: basic` wraps `actions/cache` and is free everywhere. [14]
- `mise-action` delays mise's own releases by 24 h by default (`minimum_release_age`). [23]
- Hardware-accelerated Android emulators work on standard Linux runners after the KVM udev rule. [24]

## Proposed M0 workflow set

| Workflow | Trigger | Jobs |
|---|---|---|
| `ci.yml` | `pull_request` to `main`, `push` to `main` | `changes` (ubuntu; `turbo query affected` → outputs `web`, `ios`, `android`, `integrations_only`); `guard` (ubuntu, always runs: lockfile guard and the allowlist path scope for integration PRs, `codegen` drift check, `reuse lint`, license check, DCO check, docs-lint; zizmor and actionlint when `.github/` changes); `check` (ubuntu: `bun run check --affected` minus iOS); `ios` (`xcode-27`, if `ios`: Maestro smoke step, `check --filter=@voidx/ios`, accessibility audit, snapshots); `android` (ubuntu, if `android`: Gradle lint, unit, Roborazzi); `e2e-android` (ubuntu with KVM, if `android`: Maestro smoke on the emulator, [e2e-testing](e2e-testing.md)); `ci-ok` (aggregator, the only required check) |
| Renovate | Mend-hosted GitHub App, no workflow file | configuration lives in `renovate.json` |

Not in M0: `/record` (ADR 0037), release-please and signing (ADR 0033), nightly performance runs on physical devices (ADR 0023), AI review for trusted authors (ADR 0024).

## Open questions

- Resolved: [ios-app audit notes](../ios-app/audit-notes.md) say "Xcode and Tuist are pinned in `mise.toml`", but mise cannot install Xcode. Tuist is pinned in `mise.toml`; Xcode comes from the runner image and is checked by `compatibleXcodeVersions` in `Tuist.swift` ([M0 owner decision 1](../../specs/m0-skeleton.md#owner-decisions)).
- Resolved: CI splits `check` by OS with filters, not the task graph: Linux runs `--filter='!@voidx/ios'`, macOS runs `--filter=@voidx/ios` ([M0 spec](../../specs/m0-skeleton.md)).
- Tuist cache: tuist.dev docs and pricing returned 403. We have not verified whether the module cache needs a Tuist server account, or whether there is an OSS tier.
- Should PRs use Vercel Remote Cache read-only (`--cache=remote:r`) [9]? Same-repo PRs would need `id-token: write`, which bends ADR 0037.
- Gradle: stay on the proprietary default cache provider or use `basic` for supply-chain purity? [14]
- When App Store submissions require the Xcode 27 SDK, how long will `macos-26` get Xcode 27 before we must use the `xcode-27` preview label? [3]

## Sources

1. macos-26 is now generally available for GitHub-hosted runners — https://github.blog/changelog/2026-02-26-macos-26-is-now-generally-available-for-github-hosted-runners/
2. [macOS] macos-latest label will use macos-26 in June 2026 — https://github.com/actions/runner-images/issues/14167
3. [macOS] Xcode 27 is now available as a public preview — https://github.com/actions/runner-images/issues/14404
4. Actions limits — https://docs.github.com/en/actions/reference/limits
5. Billing and usage — https://docs.github.com/en/actions/concepts/billing-and-usage
6. Simpler pricing for GitHub Actions — https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/
7. GitHub-hosted runners reference — https://docs.github.com/en/actions/reference/runners/github-hosted-runners
8. Actions cache size can now exceed 10 GB — https://github.blog/changelog/2025-11-20-github-actions-cache-size-can-now-exceed-10-gb-per-repository/
9. turbo run reference (`--affected`, `--cache`) — https://turborepo.dev/docs/reference/run
10. Turborepo 2.2 — https://turborepo.dev/blog/turbo-2-2-0
11. Turborepo GitHub Actions guide — https://turborepo.dev/docs/guides/ci-vendors/github-actions
12. Vercel Remote Cache is now free — https://vercel.com/changelog/free-vercel-remote-cache
13. bun install (bun ci, cache dir) — https://bun.com/docs/pm/cli/install
14. gradle/actions setup-gradle — https://github.com/gradle/actions/blob/main/docs/setup-gradle.md
15. Renovate minimum release age (v44) — https://docs.renovatebot.com/key-concepts/minimum-release-age/
16. Renovate github-actions manager — https://docs.renovatebot.com/modules/manager/github-actions/
17. Secure use reference — https://docs.github.com/en/actions/reference/security/secure-use
18. Actions policy supports blocking and SHA pinning — https://github.blog/changelog/2025-08-15-github-actions-policy-now-supports-blocking-and-sha-pinning-actions/
19. pull_request_target and environment branch protection changes — https://github.blog/changelog/2025-11-07-actions-pull_request_target-and-environment-branch-protections-changes/
20. Triggering a workflow (forks, approval) — https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow
21. Control workflow concurrency — https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency
22. Troubleshooting required status checks — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks
23. jdx/mise-action — https://github.com/jdx/mise-action
24. Hardware-accelerated Android virtualization — https://github.blog/changelog/2024-04-02-github-actions-hardware-accelerated-android-virtualization-now-available/
25. Available rules for rulesets — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
