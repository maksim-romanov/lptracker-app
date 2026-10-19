# Security policy

## Reporting a vulnerability

Report privately through GitHub: **Security → Report a vulnerability** on this repository. Do not open a public issue, PR or discussion.

Include what is affected (app, package, integration or instance), how to reproduce it, and the impact you expect.

| Step | Target |
|---|---|
| Acknowledge the report | 3 business days |
| First assessment | 7 days |
| Fix or mitigation for critical issues | 30 days |
| Public advisory | After a fix ships, credited to you unless you ask otherwise |

## Supported versions

| Component | Supported |
|---|---|
| `server`, `worker` | Latest release |
| `ios-app`, `android-app` | Latest store release and the previous one |
| Integrations | As shipped in the latest server release |

No release exists yet; this table applies from the first release.

## In scope

- The apps, packages and integrations in this repository, including community-contributed adapters.
- The official instance.
- Self-hosting defaults: configurations shipped in this repository that are insecure out of the box.

Self-hosters are notified through GitHub Security Advisories on this repository; watch releases and advisories to receive them.

## Out of scope

- Vulnerabilities in third-party protocols, contracts or RPC providers. Report those to their owners.
- Denial of service through volume alone on the official instance.
- Findings from automated scanners without a demonstrated impact.
