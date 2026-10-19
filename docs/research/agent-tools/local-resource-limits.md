---
app: agent-tools
topic: Local resource limits for parallel agents (owner-local)
checked: 2026-10-19
---

# Local resource limits for parallel agents

Scope: one MacBook (Apple M5, 10 cores, 24 GB RAM, about 220 GB free) running several Claude Code agents in git worktrees. Extends [autonomy-loops](autonomy-loops.md) (its "at most two or three worktrees"). Local scope only; nothing here is committed. Versions: Gradle 9.8.1 docs, Turborepo current docs, Bun docs, Kotlin docs, Android emulator docs read 2026-10-19. Per-process RAM figures are not published by Apple or Google; every number marked *(measure)* is a starting guess to replace after the M0 spike.

## Decisions

Budget
- We run at most three agent sessions at once and at most one of each heavy job host-wide: one build slot (xcodebuild or Gradle, never both) and one device slot (one iOS Simulator or one Android emulator, never both). Light work (edit, git, `bun test`, Prism, Turbo typecheck) is unlimited. Reason: 24 GB must hold macOS and apps (about 5 GB), three Claude Code sessions (about 1 GB each *(measure)*), a Gradle daemon plus Kotlin daemon (about 6 GB at the caps below), Xcode compile peaks (several GB *(measure)*) and a device (2 to 4 GB *(measure)*); two builds at once reach swap. [4][5][9][10]
- We give each worktree its own agent but not its own device: agents queue on the device slot and every UI check starts from `simctl erase` or `-no-snapshot` state set by `prepare-device`, so a shared device does not leak state between agents. [8][autonomy-loops]
- We never run the Android emulator and an iOS Simulator together, and never build Android while an Xcode build runs. Native work therefore serialises: server agents run freely beside one native agent. [autonomy-loops]

Lock design (*planned*, in `~/.claude/voidx-loop/bin/`)
- We wrap every heavy command in `voidx-run <slot> -- <command>`; slots are `build` and `device`, locks live in `~/.claude/voidx-loop/locks/<slot>.lock`. The wrapper takes the lock with macOS `lockf -t <seconds>` (BSD `lockf(1)`; `flock(1)` is not shipped by macOS; `lockf` option set unverified, confirm with `man lockf`), because the kernel drops the lock when the process dies, so a killed agent leaves no stale lock. A `mkdir` lock plus pid file is the fallback. [11]
- We make waiting free: the wrapper blocks in the shell, not in the model. It waits up to 8 minutes, then exits 75 with the text `QUEUED: <slot> held by <worktree> since <time>; rerun the same command`. The agent reruns once per 8 minutes, so a 30-minute queue costs about four tool calls. Whether a longer Bash timeout can be set (`BASH_MAX_TIMEOUT_MS`) was not found on the settings page; confirm before raising 8 minutes. The wrapper also writes holder, command and start time to `<slot>.info` for the message. [12]
- We make the wrapper do the safety work: on exit it runs `xcrun simctl shutdown all` (device slot, iOS) or `adb emu kill` (Android), and for the build slot runs `./gradlew --stop` after the last queued Gradle job; heavy jobs release memory when idle instead of waiting for the 3 h daemon timeout. [1][8]
- We gate admission on memory: before taking a slot the wrapper reads `memory_pressure` and `sysctl vm.swapusage`; if free percentage is under 25 or swap used grew since the last check, it sleeps 60 s and rechecks up to 10 times, then exits 75 with `BACKOFF: memory`. Thresholds are rules of thumb from non-Apple guides. [13][14]
- We keep the lock wrapper allowlisted in the loop `settings.json` as `Bash(~/.claude/voidx-loop/bin/voidx-run *)` and deny raw `xcodebuild *`, `./gradlew *` and `emulator *` there, so unattended agents cannot skip the queue. [autonomy-loops]

Caps
- Gradle (`~/.gradle/gradle.properties` on the owner's machine, not in the repo): `org.gradle.jvmargs=-Xmx3g -XX:MaxMetaspaceSize=768m -XX:+UseParallelGC`, `kotlin.daemon.jvmargs=-Xmx2g`, `org.gradle.workers.max=4`, `org.gradle.daemon.idletimeout=600000` (10 min), `org.gradle.caching=true`, `org.gradle.configuration-cache=true`. Setting `org.gradle.jvmargs` replaces Gradle's default arguments, so keep the metaspace cap; the Kotlin daemon inherits `-Xmx` from it unless `kotlin.daemon.jvmargs` is set, so without the second line two JVMs would each take 3 GB. Values are starting points *(measure)*. [1][2][3][15]
- Gradle default `workers.max` equals the CPU count (10 here), `parallel` is off, daemon idle timeout is 3 h; we lower the first and last because three idle daemons pin RAM for hours. [1]
- xcodebuild: pass `-jobs 6` (needs a number; bare `-jobs` fails) and `-parallelizeTargets`; the same limit for Xcode itself is `defaults write com.apple.dt.Xcode IDEBuildOperationMaxNumberOfConcurrentCompileTasks 6`. Leaves 4 cores for the device and other agents. [16][17]
- Turborepo: `--concurrency=4` (default 10; accepts a number or a percentage such as `50%`) in the root `check` script; `turbo run` no longer uses a daemon, so there is no idle process to stop. [6]
- Emulator: one AVD, started `emulator @<avd> -no-window -no-audio -no-boot-anim -no-snapshot-save -memory 2048 -gpu swiftshader_indirect`; `-memory` allows 1536 to 8192 MB. `-no-window` removes the UI only and does not cut RAM or CPU; software GPU costs CPU, so on the Mac keep the default GPU mode and drop `-gpu` unless the GPU hangs. [4][5]
- iOS Simulator: one pinned device (see [native-agent-verification](../repo/native-agent-verification.md)), booted by `prepare-device`, shut down by the wrapper. iOS 26 simulator RAM growth on 16 GB Macs and growth across UI test runs are reported on Apple's forums, so we restart the device after each test suite, not each test. [8][18]

Shared caches and disk
- We share the Gradle user home (`~/.gradle`, default) and Gradle local build cache across all worktrees: the build cache is keyed on inputs and reused "from any earlier build in any location on the local machine". Gradle runs from different worktrees against one user home are safe because Gradle locks it; only the `build` slot serialises them for CPU. [2][3]
- We share Bun's cache at the default `~/.bun/install/cache`; on macOS `bun install` uses `clonefile`, so each worktree's `node_modules` costs almost no extra disk until a file is modified (clones still count toward the volume limit). We run `bun install` per worktree and never symlink `node_modules`. [7]
- We give every worktree its own DerivedData: `-derivedDataPath ~/.claude/voidx-loop/dd/<worktree-slug>`. Two builds into one DerivedData fail with "database is locked" on `XCBuildData/build.db`, and a shared directory would also mix module caches of different branches. The cost is a cold build per worktree (disk several GB each *(measure)*), accepted because the build slot is serial anyway. Swift package checkouts are cached per DerivedData unless `-clonedSourcePackagesDirPath ~/.claude/voidx-loop/spm` points them to one shared directory (proposed, unverified for concurrent use; safe because the build slot is serial). [19][20]
- We put Turbo's cache in one place with `TURBO_CACHE_DIR=~/.claude/voidx-loop/turbo` (default `.turbo/cache` per checkout), so a second worktree reuses first-run results. [6]
- We clean up in the launcher after each merged branch: `git worktree remove`, delete its `dd/<slug>`, and weekly `xcrun simctl delete unavailable` plus pruning DerivedData older than 7 days. Gradle prunes its own build-cache entries when unused; retention is configurable by init script (no day count in the docs). [2][8]

Measuring and backing off
- We sample with `memory_pressure` (last line: system-wide free percentage), `sysctl vm.swapusage` (growing swap during work is the signal; non-zero alone is not), and `vm_stat | grep -i compress` (counters are cumulative; compare two samples 10 s apart). Under 20% free or rising swap means stop admitting jobs; the owner sees `BACKOFF: memory` in the progress file. The pressure level is also readable as `sysctl kern.memorystatus_vm_pressure_level` (1 normal, 2 warn, 4 critical; from memory, unverified). [13][14]
- We run the launcher with a ceiling: if a Claude Code process exceeds 4 GB resident the launcher kills and restarts that session from its progress file. Normal sessions start near 300 MB (unofficial); GitHub issues report leaks up to tens of GB, mostly from huge Bash output held in memory, so agents pipe heavy output to a log file and read the tail (already the AGENTS.md rule for `check`). [21][22]

## Facts that constrain us

- Gradle 9.8.1: default daemon `-Xmx512m -XX:MaxMetaspaceSize=384m`; `workers.max` defaults to CPU count; `parallel` default false; idle timeout 3 h; `GRADLE_USER_HOME` defaults to `~/.gradle`. [1]
- Kotlin daemon inherits `-Xmx`, `MaxMetaspaceSize`, `ReservedCodeCacheSize` (default 320m) from `org.gradle.jvmargs` when not set; precedence low to high: inheritance, `kotlin.daemon.jvm.options`, `kotlin.daemon.jvmargs`, `kotlin {}` extension, task. Several Kotlin daemons run if arguments differ. [3]
- Build cache lives in the Gradle user home and is enabled by `org.gradle.caching=true`. [2]
- Turborepo `--concurrency` default 10; ignored with `--parallel`; `--cache-dir` / `TURBO_CACHE_DIR` default `.turbo/cache`. [6]
- Bun cache `~/.bun/install/cache`, `BUN_INSTALL_CACHE_DIR` overrides; macOS default backend `clonefile`. [7]
- Android emulator: `-memory` 1536 to 8192 MB overrides the AVD; `-no-snapshot-save` stops saving on exit; `-no-window` is for machines with no display. The command-line page lists no `-cores`. [4]
- `xcodebuild -jobs` needs an argument; Xcode's compile-task limit is the `IDEBuildOperationMaxNumberOfConcurrentCompileTasks` default and the CLI honours it, `-jobs` overrides per build (forum answer, Apple staff-era, not re-dated). [16][17]
- Hypervisor-based arm64 emulator already uses Apple's framework ([sdk-bootstrap](../android-app/sdk-bootstrap.md)); no source gives per-instance RAM.

## Open questions

- Real RSS of: Claude Code session, `swift-frontend` peak on the VoidX app, iOS 27 Simulator, arm64 emulator with 2 GB. Measure in the M0 spike with `ps -o rss` sampling and replace every *(measure)* value.
- Does `lockf(1)` on macOS 27 support `-t` and exit 75 as assumed? Check `man lockf`; else use the `mkdir` fallback.
- Maximum Bash tool timeout and whether `run_in_background` output wakes the agent for free; decides the 8-minute wait.
- Whether a shared `-clonedSourcePackagesDirPath` is safe with Tuist-generated projects; Tuist's own cache (`~/.tuist`) was not researched.
- Does `org.gradle.configuration-cache=true` work with AGP 9.4 and the Roborazzi/baseline-profile plugins in the skeleton? Not checked.
- Xcode 27 changes to build parallelism or simulator memory: no release notes read.
- Whether three sessions is too many for the owner; the budget assumes 24 GB and may drop to two after measurement.

## Sources

1. Gradle build environment (9.8.1) — https://docs.gradle.org/current/userguide/build_environment.html
2. Gradle build cache — https://docs.gradle.org/current/userguide/build_cache.html
3. Kotlin Gradle compilation and caches (daemon arguments) — https://kotlinlang.org/docs/gradle-compilation-and-caches.html
4. Android emulator command line — https://developer.android.com/studio/run/emulator-commandline
5. Emulator 28.1.8 canary, headless variant (2019, no RAM gain) — https://androidstudio.googleblog.com/2019/02/emulator-2818-canary.html
6. Turborepo `run` reference — https://turborepo.dev/docs/reference/run
7. Bun global cache — https://bun.sh/docs/install/cache
8. `xcrun simctl help` (shutdown, erase, delete unavailable) — local tool, not read first-hand here; Apple documents no page
9. Bitrise Gradle memory guide (article) — https://bitrise.io/blog/post/your-guide-to-fine-tuning-gradle-memory-allocations
10. Touchlab, org.gradle.jvmargs replaces defaults (article) — https://touchlab.co/gradle-jvmargs
11. `lockf(3)` semantics only; `lockf(1)` man page not read — https://www.unix.com/man_page/osx/1/lockf/
12. Claude Code settings — https://code.claude.com/docs/en/settings
13. Read memory pressure, not memory used (article) — https://mole.fit/blog/mac-memory-pressure-explained
14. Interpret memory pressure (course page) — https://flaviocopes.com/courses/macos-internals-troubleshooting/interpret-memory-pressure/
15. Gradle Daemon — https://docs.gradle.org/userguide/gradle_daemon.html
16. Apple Developer Forums, concurrent compile tasks — https://developer.apple.com/forums/thread/80073
17. xcodebuild `-jobs` needs a number (CMake issue) — https://gitlab.kitware.com/cmake/cmake/issues/18304
18. Apple Developer Forums, iOS 26 simulator memory — https://developer.apple.com/forums/thread/787337 ; simulator RAM growth — https://developer.apple.com/forums/thread/736714
19. Apple Developer Forums, "database is locked" — https://developer.apple.com/forums/thread/729968
20. Parallel iOS test jobs with separate `-derivedDataPath` — https://spin.atomicobject.com/ci-parallel-ios-test-jobs/
21. Claude Code memory leak, issue 4953 — https://claudeissues.com/issue/4953-claude-code-memory-leak-process-grows-to-120-gb-ram-and-gets-oom-killed
22. Claude Code idle sessions RAM, issue 22525 — https://claudeissues.com/issue/22525-memory-leak-idle-sessions-consume-excessive-ram-27gb
