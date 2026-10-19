---
app: android-app
topic: Android SDK bootstrap for laptops, agents and CI
checked: 2026-10-01
---

# Android SDK bootstrap

Settles the open question in [skeleton](skeleton.md). Versions: AGP 9.4.0, Gradle 9.7.0, compileSdk 37, Android CLI 1.0.16486076, cmdline-tools 22.0 and 23.0, runner image ubuntu-24.04 20260920.314.1.

## Decisions

- We install the SDK with `sdkmanager` from cmdline-tools 22.0, put on the machine by the mise `android-sdk` plugin pinned to `22.0`, because 22.0 is the last version where `sdkmanager --licenses` still prompts and `yes | sdkmanager --licenses` works. 23.0 (2026-08) prints "The --licenses option is no longer needed", exits 0 without prompting, and Flutter had to rewrite its licence check. [1][2][3][4]
- We keep the package list in one committed file (`apps/android-app/sdk-packages.txt`: `platform-tools`, `platforms;android-37`, `build-tools;36.0.0`, plus `emulator` and the system image for the emulator job) and one script that runs `sdkmanager --package_file=…` after accepting licences, used identically on laptops, agents and CI, because exact `build-tools` and system-image versions are only pinnable by package path and no tool verifies checksums. [1][5]
- We do not make the Android CLI (`android sdk install`) the bootstrap, because its licence acceptance is undocumented (the `sdk` reference has no licence flag), it is a Google download with telemetry on by default, and the mise `android-cli` backend has no linux-arm64 build. We keep it as the agents' optional inspect tool from [agent-tools](agent-tools.md), run with `--no-metrics` in `~/.androidrc`. [6][7][8][ADR 0047]
- We do not pin the CLI in CI. `android-cli` stays out of `mise.toml` for the CI profile and Android CLI is installed by contributors themselves, because [agent-tools](agent-tools.md) already bans it from CI. If the owner later wants it in mise, the registry entry supports `mise lock` with `checksum_url` for macos-arm64, macos-x64 and linux-x64. [7][9]
- We run the same script in CI on `ubuntu-latest` after `jdx/mise-action`; on the runner it only adds what is missing. The image already has platforms up to android-37.0 (rev 2), build-tools 36.0.0 and 37.0.0, platform-tools 37.0.1 and cmdline-tools 12.0 under `/usr/local/lib/android/sdk`, but it has no emulator or system images and changes weekly, so we never rely on it for versions. [10]
- We run the e2e emulator through `reactivecircus/android-emulator-runner` (SHA-pinned) with `api-level: 36`, `arch: x86_64`, `target: google_apis`, and its KVM udev rule, not Gradle Managed Devices, because the Maestro smoke needs a started emulator with the installed app, and `connectedDebugAndroidTest` runs in the same job. The runner installs its own emulator and image, so the script skips them in CI (flag, not a second package file). [11][12]
- We use Gradle Managed Devices only for `:baselineprofile` (already decided in [skeleton](skeleton.md)). They need the same accepted licences, ATD images exist only for API 30, and screenshot tests that need hardware rendering do not work on ATD. CI there needs `-Pandroid.testoptions.manageddevices.emulator.gpu=swiftshader_indirect`. [13]
- We leave `android.builder.sdkDownload` at its default (on for command-line builds) as a safety net only, never as the bootstrap. It downloads missing packages only when `<sdk>/licenses/` already holds accepted licences, it cannot install the emulator or system images, and it picks the version AGP asks for, so it does not pin anything. We do not set it to `false`, because that turns a missing package into a hard failure on a fresh laptop. [14]
- We never commit licence files, hashes or a pre-filled `licenses/` directory. Accepting the Android SDK licence is a person's act; the script prints the licence names and requires `VOIDX_ACCEPT_ANDROID_SDK_LICENSES=1` (agents and CI set it in their own config, not in the repo). [1][14]
- We cache nothing for the SDK itself in CI. Gradle caching stays with `gradle/actions/setup-gradle`, which does not cache the Android SDK, and the AVD snapshot cache from the emulator runner (`~/.android/avd`, `~/.android/adb*`) is used only if the M0 spike shows it saves time. [11][15]
- On Apple Silicon laptops we use `arm64-v8a` system images (`system-images;android-36;google_apis;arm64-v8a`) and Hypervisor.Framework acceleration; on Linux CI `x86_64` with KVM. One script picks the ABI from `uname -m`. We never ship x86 images to Macs. [16]

## Comparison

| Option | Pins exact versions | Licences non-interactive | Emulator and image | Apple Silicon | Verdict |
|---|---|---|---|---|---|
| (a) mise `android-sdk` 22.0 + `sdkmanager` + package file | package paths, cmdline-tools by version; no checksums in docs | `yes \| sdkmanager --licenses` | yes | yes (arm64-v8a) | chosen |
| (b) mise `android-cli` + `android sdk install` | CLI by version with checksum; packages by path | undocumented; reads `<sdk>/licenses/android-sdk-license` | yes | CLI yes, but no linux-arm64 | agents only, optional |
| (c) runner preinstall + setup-android / emulator-runner | no; image changes weekly | setup-android accepts by default | emulator-runner installs it | n/a (CI is x86_64 Linux) | CI top-up only |
| (d) AGP `sdkDownload` | no | needs prior acceptance | no | n/a | safety net |
| (e) Gradle Managed Devices | image by API level and source | needs prior acceptance | yes, API 27+, ATD API 30 only | arm64 not documented | baseline profile only |

## Facts that constrain us

- `sdkmanager` is officially deprecated in favour of `android sdk`; docs show no checksum verification, and `--channel` 0 to 3 selects stable, beta, dev, canary. [1]
- cmdline-tools 23.0 ships the `android` binary next to `sdkmanager`. The `--licenses` option is "no longer needed" there, and consumers now read `<sdk>/licenses/android-sdk-license` from disk. [2][3][4]
- `setup-android` v4.0.4 (2026-09-17) defaults to cmdline-tools 22.0 (build 15859902), accepts licences by default, installs `platform-tools` by default and has no cache. [17][18]
- mise `android-sdk` is the vfox plugin `mise-plugins/vfox-android-sdk`: it lists versions from Google's repository XML, moves the unzipped tools to `ANDROID_HOME/cmdline-tools/<version>/`, and exposes `sdkmanager`, `avdmanager`, `lint` and others. It does not accept licences, and its download code shows no checksum. [9][19]
- mise `android-cli` is `http:android-cli`: targets macos-arm64, macos-x64, linux-x64, windows-x64; no linux-arm64. [9]
- Android CLI 1.0.16486076 (2026-10): metrics on by default, `--no-metrics` disables; non-zero exit codes since 1.0.16406183; inter-process SDK locking; `--platform` flag installs for another OS; first release 0.7 (2026-04). Release notes list no breaking changes and no stability label. [6][8]
- `android sdk install` takes `platforms/android-37` or the legacy `platforms;android-37` form, supports `--beta` and `--canary`, and can bootstrap cmdline-tools. [20]
- Gradle auto-download needs accepted licences in `<sdk>/licenses/`; copying that directory to another machine carries the acceptance. [14]
- Emulator needs KVM on Linux (no nested VM inside Docker/VMware; GitHub-hosted Linux runners work after the udev rule) and Hypervisor.Framework with `arm64-v8a` images on Apple Silicon. [11][16][21]
- Gradle Managed Devices: API 27+, ATD API 30 only, `aosp`, `google`, `aosp-atd`, `google-atd` sources. [13]
- How others do it, from their workflows on 2026-10-01: nowinandroid uses JDK 21 (Zulu), `setup-gradle` and `android-emulator-runner@v2` with the KVM udev rule, x86_64, API 26 and 34, and no explicit SDK or licence step. Element Android uses Temurin 21, `setup-gradle` and `android-emulator-runner@2.35.0` with the SDK taken from the image. Signal (`android.yml`) uses Temurin 21, SHA-pinned actions, `ubuntu-latest-8-cores`, no emulator and only default-branch cache writes. Bitwarden builds on `ubuntu-24.04` with a composite action and Temurin 21. None installs the SDK explicitly or pins `sdkmanager`; all rely on the runner image. [22][23][24][25][26]
- `setup-gradle` v6 writes cache only from the default branch and cleans up on success; the default provider is the "enhanced" one, the basic provider is MIT. [15]

## Open questions

- Does `android sdk install` or cmdline-tools 23.0 `sdkmanager --install` accept licences non-interactively, and what writes `licenses/android-sdk-license`? No Google doc says. Test in the M0 spike on a clean SDK; until then 22.0 is the fallback.
- Does the vfox plugin verify a checksum, and does `mise lock` record one for `android-sdk`? Not visible in its source files. If not, mise.lock pins only the version string.
- Should the plugin's cmdline-tools (22.0 vs `latest` in `ANDROID_HOME/cmdline-tools/`) path satisfy AGP, `avdmanager` and emulator-runner? The plugin uses `cmdline-tools/<version>/`; emulator-runner installs its own `cmdline-tools` through `cmdline-tools-version`. Verify they do not clash.
- Is `setup-gradle` v6's enhanced cache provider acceptable under ADR 0047 (no telemetry-on third-party tools)? Check its terms or use the basic provider. [15]
- Do Gradle Managed Devices on Apple Silicon pick `arm64-v8a` automatically? The docs do not say.
- Was `android-emulator-runner` v2.38.0 the latest on 2026-10-01? The releases page showed odd dates; check before SHA-pinning.

## Sources

1. sdkmanager — https://developer.android.com/tools/sdkmanager
2. flutter/flutter#191558, cmdline-tools 23+ — https://github.com/flutter/flutter/issues/191558
3. flutter/flutter#191487 — https://github.com/flutter/flutter/issues/191487
4. flutter/flutter#191826, licence check on disk — https://github.com/flutter/flutter/pull/191826
5. sdkmanager `--package_file` — https://developer.android.com/tools/sdkmanager
6. Android CLI — https://developer.android.com/tools/agents/android-cli
7. Android CLI commands — https://developer.android.com/tools/agents/android-cli/commands
8. Android CLI release notes — https://developer.android.com/tools/agents/android-cli/release-notes
9. mise registry, `android-cli.toml` and `android-sdk.toml` — https://github.com/jdx/mise/tree/main/registry ; https://mise.jdx.dev/registry.html ; http backend — https://mise.jdx.dev/dev-tools/backends/http.html
10. runner-images Ubuntu 24.04 readme — https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md
11. android-emulator-runner — https://github.com/ReactiveCircus/android-emulator-runner
12. GitHub changelog, hardware-accelerated Android virtualization — https://github.blog/changelog/2024-04-02-github-actions-hardware-accelerated-android-virtualization-now-available/
13. Gradle Managed Devices — https://developer.android.com/studio/test/gradle-managed-devices
14. Update the IDE and SDK tools, auto-download — https://developer.android.com/studio/intro/update
15. setup-gradle — https://github.com/gradle/actions/blob/main/docs/setup-gradle.md
16. Emulator hardware acceleration — https://developer.android.com/studio/run/emulator-acceleration
17. setup-android — https://github.com/android-actions/setup-android
18. setup-android releases — https://github.com/android-actions/setup-android/releases
19. vfox-android-sdk — https://github.com/mise-plugins/vfox-android-sdk
20. `android sdk` reference — https://developer.android.com/tools/agents/android-cli/commands/sdk
21. [ci](../repo/ci.md), [e2e-testing](../repo/e2e-testing.md)
22. nowinandroid Build.yaml — https://github.com/android/nowinandroid/blob/main/.github/workflows/Build.yaml
23. Element Android tests.yml — https://github.com/element-hq/element-android/blob/develop/.github/workflows/tests.yml
24. Signal-Android android.yml — https://github.com/signalapp/Signal-Android/blob/main/.github/workflows/android.yml
25. Bitwarden android build.yml — https://github.com/bitwarden/android/blob/main/.github/workflows/build.yml
26. Bitwarden setup-android-build — https://github.com/bitwarden/android/blob/main/.github/actions/setup-android-build/action.yml
