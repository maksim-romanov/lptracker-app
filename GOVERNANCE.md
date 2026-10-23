# Governance

## Roles

| Role | Who | Can |
|---|---|---|
| Owner | Maksim Romanov | Everything below; approves specs and ADRs; appoints maintainers |
| Maintainer | Appointed by the owner | Merge PRs, accept `new-integration` issues, review every `adapter.ts`, run `/record` and `/live-test`, promote and deprecate integrations |
| Integration owner | Named in a family's `manifest.json` | Review and answer for that integration; a bot mentions them on every PR touching it |
| Contributor | Anyone | Open issues and PRs under [CONTRIBUTING.md](CONTRIBUTING.md) and the [AI policy](AI_POLICY.md) |

`CODEOWNERS` lists maintainers only, because GitHub ignores entries for people without write access.

## Decisions

- Architecture and process decisions are ADRs in [docs/decisions/](docs/decisions/). A `proposed` ADR may be edited; an `accepted` one changes only by a superseding ADR.
- The owner accepts or rejects ADRs and approves specs (`status: approved`). Order: 0016, 0054 and the tooling ADRs (0001, 0004, 0005, 0010, 0027, 0037, 0049, 0052) before the first push; the rest in groups at the end of the iteration that relies on them.

## Integrations

| Event | Rule |
|---|---|
| New integration issue | A maintainer labels it `accepted`. A pure fork (`extends`, deployments only) is accepted automatically once its checks pass. |
| Merge | Bronze tier and a maintainer review; the family lands at `alpha` ([state model](docs/concepts/state-model.md)). |
| Promotion | `alpha` → `beta` automatically when silver-tier checks pass and the family has spent 30 days at `alpha` with no open correctness bug ([state model](docs/concepts/state-model.md)); `beta` → `stable` at gold tier with a maintainer's approval. |
| Silence | A bot pings integration owners on every correctness issue. No reply from any owner for 6 weeks marks the family `unmaintained`. |
| Adoption | Anyone may adopt an `unmaintained` family by a PR that adds themselves as owner and passes silver-tier checks; it returns to `beta`. |
| Deprecation | A family is marked `deprecated` with 90 days' notice in the release notes before its deployments are sunset. |

## Continuity

- At least two people hold admin rights on the repository, the official instance and the app-store accounts. The owner names the second admin before R1.
- Credentials for the official instance live in a shared secret store, never with one person. The store is chosen in the Ops1 spec.
- If the owner is unreachable for 90 days, the maintainers decide by majority.
