# 0038 · Passkeys, PKCE for self-hosted instances, sessions and CSRF

- Status: proposed
- Deciders: Maksim Romanov

## Context

Accounts use passkeys only ([0012](0012-accounts-guests-and-passkeys.md)). Store apps can use native passkeys only for domains compiled into them, self-hosted instances live on other domains, and web forms post without JavaScript.

## Decision

Passkeys:

- The WebAuthn relying party id is the official registrable domain (`rpId` in `instance.config`, working value `depthly.xyz`, [0044](0044-domain-as-configuration.md)) and is permanent once the first production passkey exists; changing it orphans every credential.
- iOS and macOS declare it in associated domains; Android's `assetlinks.json` lists every signing certificate, including Play signing, upload and a committed debug key.

Self-hosted sign-in from store apps:

- The system browser runs the instance's own passkey ceremony, then returns a code by PKCE.
- `state` and S256 are required; codes are single-use and live 60 seconds; the redirect URI must match exactly.
- A consent page names the app and the instance, and merging a guest watchlist into the account asks for confirmation.

Sessions:

- Web: a `__Host-` cookie, `Secure`, `HttpOnly`, `SameSite=Lax`.
- Native: an opaque access token plus a rotating refresh token, stored hashed on the server; reuse of an old refresh token revokes the whole family.
- Only the app refreshes tokens; widgets read the app's snapshot and never refresh.
- Recovery codes are shown once, stored hashed, single-use and rate-limited; using one notifies the account and revokes other sessions.

CSRF and sensitive actions:

- Unsafe methods check `Origin` or `Sec-Fetch-Site` and a per-form token; responses to POST redirect with 303.
- Deleting the account or removing a passkey requires a fresh passkey assertion.
- SSE subscriptions are derived from the session on the server; tokens never go in the query string; a revoked session closes its stream.

## Consequences

- The domain is frozen before M4a, before the first production passkey; staging and local development use their own RP IDs ([0044](0044-domain-as-configuration.md)).
- Idempotency rules for these endpoints are in [concepts/resilience.md](../concepts/resilience.md): auth ceremonies are never replayed.
