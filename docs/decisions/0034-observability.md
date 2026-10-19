# 0034 · Lean observability one maintainer can run

- Status: proposed
- Deciders: Maksim Romanov

## Context

The system fans out to many providers per chain, but one person operates it. A full metrics and tracing platform with high-cardinality labels would cost more attention than it saves.

## Options

- **Full OpenTelemetry auto-instrumentation** with traces and per-endpoint labels everywhere.
- **Lean stack**: a few manual metrics with capped labels, structured logs, error tracking, an external probe.

## Decision

Chosen **the lean stack**, because it answers "is it up, is it correct, what does it cost" without a platform to maintain.

- Metrics: manual OpenTelemetry metrics exported to Grafana Cloud free tier, or Prometheus and Grafana for self-hosters. Labels are capped: route, dependency, chain, status class; no addresses, no per-URL labels beyond the provider name.
- Logs: JSON, with addresses replaced by an HMAC ([0040](0040-privacy.md)); retention per [0035](0035-data-lifecycle.md).
- Errors: Sentry or self-hosted GlitchTip for server, worker, iOS and Android, including native crash reporting.
- An external uptime probe checks `/readyz`.
- Page on four signals only: probe down, alert outbox older than 10 minutes, job queue lag above 10 minutes, external API budget at 80%. Everything else goes into a daily digest.

SLOs, each counted only over windows with at least 100 events:

- 99.5% of guest portfolio lookups finish within 8 seconds.
- 97% of lookups return every scope `ok` (complete-scopes SLI).
- 99% of alerts are delivered within 5 minutes of the transition.

## Consequences

- No distributed tracing at first; add it when a latency problem cannot be explained with metrics.
- Chaos tests keep the metrics honest ([concepts/resilience.md](../concepts/resilience.md)).
