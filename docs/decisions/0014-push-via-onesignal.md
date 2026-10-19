# 0014 · Push through OneSignal at the start

- Status: proposed
- Deciders: Maksim Romanov

## Context

Range alerts need push on iOS and Android. Running APNs and FCM directly means certificates, token management and two delivery paths before the first alert ships.

## Options

- **OneSignal behind the `Notifier` port**: one API for both platforms, a generous free tier.
- **Direct APNs and FCM**: no third party, more work up front.

## Decision

Chosen **OneSignal behind `Notifier`**, because it ships alerts on both platforms with one integration and costs nothing at the start.

- Apps use the OneSignal SDK behind a `PushClient` port and log in with the account id as `external_id`. Consent is required first; guests are never registered with OneSignal.
- Native macOS has no push in the MVP, because the OneSignal SDK does not support it; `PushClient` leaves room for direct APNs later.
- The worker sends to `external_id` with an opaque alert id as the only payload; apps fetch details themselves.
- WidgetKit push updates need their own APNs token and are out of scope; widgets refresh on their timeline.

## Consequences

- OneSignal learns device ids and account ids, never addresses ([0040](0040-privacy.md)).
- Switching to direct APNs and FCM is an infra change only.
- The OneSignal app and key belong to the publisher, so self-hosted servers need a relay to push ([0013](0013-official-and-self-hosted-instances.md)).
