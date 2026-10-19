# 0044 · The domain is configuration, frozen before M4

- Status: proposed
- Deciders: Maksim Romanov

## Context

Depthly is the brand and VoidX the product; the owner holds `depthly.xyz` but may change it before release. Four things depend on the domain: the web and API origin, problem type URIs, app ids, and the passkey relying party id. App ids become permanent at the first store submission, and the RP ID at the first production passkey ([0038](0038-auth-sessions-csrf.md)).

## Options

- **Pick the final domain now** and hard-code it.
- **Keep the domain in one place per platform** with working values, and freeze it before M4.

## Decision

Chosen **one place per platform, frozen before M4**, because a change before the first real user then costs a config edit, not a refactor.

| Platform | Where the domain lives |
|---|---|
| Server | `instance.config`: `publicOrigin`, `rpId` |
| iOS, iPadOS, macOS | One Tuist constant: bundle ids, associated domains, App Group |
| Android | One Gradle property: `applicationId`, App Links host |

Working values:

- Official instance: `https://voidx.depthly.xyz`, web and `/api/v1` on one origin ([0013](0013-official-and-self-hosted-instances.md)).
- RP ID: `depthly.xyz`, so one passkey works across Depthly products.
- iOS: `xyz.depthly.voidx`, widget `xyz.depthly.voidx.widgets`, App Group `group.xyz.depthly.voidx`. Android: `applicationId` `xyz.depthly.voidx`.
- `apple-app-site-association` and `assetlinks.json` are served on `depthly.xyz` (RP ID) and `voidx.depthly.xyz` (Universal Links and App Links).
- Self-hosted instances keep `voidx://auth` with PKCE ([0038](0038-auth-sessions-csrf.md)).
- Staging uses RP ID `staging.voidx.depthly.xyz`, local development `localhost`; neither ever uses the production RP ID.
- Problem type URIs are built from `publicOrigin` ([0039](0039-error-model.md)).

Internal names never depend on the domain: `@voidx/*` packages, `voidx-*` apps, the `voidx` CLI, Swift modules and the Kotlin package.

## Consequences

- Freezing the domain is an M4 checklist item, done before the first production passkey and the first store submission; after that, changing it orphans every passkey and needs new store listings.
- The `depthly.xyz` apex must serve both `.well-known` files for as long as the RP ID is in use, whatever else runs there.
- Until the freeze, test passkeys and signed builds are disposable.
