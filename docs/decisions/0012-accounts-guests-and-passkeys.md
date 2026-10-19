# 0012 · Guests first, passkey accounts for sync and alerts

- Status: proposed
- Deciders: Maksim Romanov

## Context

VoidX is watch-only: people paste addresses, no wallet is connected. The app must be useful without sign-up, yet sync and push alerts need an identity, and store apps must also work against self-hosted servers.

## Options

- **Guest mode plus passkey accounts**.
- **Mandatory accounts**: simpler data model, higher barrier.
- **Third-party sign-in** (Apple, Google, email links): more providers to maintain.

## Decision

Chosen **guest mode plus passkey accounts**, because a tracker should work before sign-up and passkeys need no passwords or providers.

- Guests keep up to the guest `wallets.max` on the device or, on the web, in a signed cookie; the server stores nothing about them. Plan limits: [0043](0043-plans-and-entitlements.md).
- Signing in merges the guest watchlist into the account through the same locked add: wallets are added up to the account's `wallets.max`, the rest are not added and the person is told, and it enables sync and push.
- Recovery codes are issued at sign-up, and adding a second passkey is prompted.
- Native passkeys work on the official instance only, because associated domains are compiled into the app. Against a self-hosted instance, apps sign in through the system browser with PKCE: `state`, S256, single-use codes valid for 60 s, an exact redirect URI and a consent page naming the app and instance.
- The guest watchlist is merged only after the person confirms it, so a forged callback cannot plant addresses in an account.
- The web uses an `HttpOnly` session cookie; native apps use an opaque bearer token with a rotating refresh token in Keychain or Keystore. Refresh tokens are stored hashed with reuse detection; recovery codes are hashed and single-use. Details in [0038](0038-auth-sessions-csrf.md).

## Consequences

- The relying party id and origin are required instance config and never change after launch.
- Wallet connection (Sign-In with Ethereum, transactions) is out of the MVP.
