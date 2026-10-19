# Refresh

How values get into the widget.

| Source | Behaviour |
|---|---|
| App in the foreground | Writes the snapshot, then asks the widget to reload. Does not use the reload budget. |
| Background refresh | The app writes a new snapshot when the system allows it. |
| Timeline reload | The system gives each widget a limited daily budget; plan for 40 reloads a day, entries at least 5 minutes apart (a design target, not a platform promise). |
| Push | After the MVP. Push updates for a widget supplement the timeline; they need the push infrastructure. |
| Android | The app updates the widget after writing the snapshot; long work goes to a background worker. |
| Limits | Widgets never bypass plan limits; they read cached data. On-demand refresh limit: [plans](../../../concepts/plans-and-entitlements.md#enforcement). |
