---
app: repo
topic: Penpot for prototypes
checked: 2026-10-11
---

# Penpot for prototypes

Research on 2026-10-11: self-hosted Penpot with the Penpot MCP server as the prototyping tool for the owner and AI agents. Three parallel reviews of official pages and the `penpot/penpot` repo. Nothing was tested hands-on. V = read on the official page, S = search result or secondary source, M = from memory.

## Findings

| Area | Finding | Source |
|---|---|---|
| Version and licence | Stable 2.18.3 (2026-10-06); minor release every 4 to 8 weeks; MPL-2.0. Self-hosted images trail the cloud release | V |
| Self-hosting | Docker Compose, Kubernetes (Helm), Elestio, TrueNAS. Recommended 4 CPU and 16 GB RAM. Postgres, Valkey or Redis, exporter, `fs` or S3 storage. Proxy must forward `/ws/notifications` and `/mcp/ws`; HTTPS needed for the clipboard. Upgrade in small steps | V ([docs](https://help.penpot.app/technical-guide/getting-started/)) |
| Tokens | Native colour, dimension, spacing, sizing, radius, opacity, shadow, typography; sets and themes; aliases with math. Font size px only, spacing tokens only on flex boards, no tokens on groups | V ([docs](https://help.penpot.app/user-guide/design-systems/design-tokens/)) |
| Token format | Docs say "W3C DTCG draft". Issue #9413 (open, 2026-05-07): import and export follow a 2022 draft, not 2025.10. A user reports the export is Tokens Studio multi-set JSON with hex-string colours and unit strings. Colour `$value` accepts hex only (#9305) | V, S ([thread](https://community.penpot.app/t/token-export-is-tokens-studio-format-not-dtcg-2025-10/10544)) |
| Git sync | Plugins exist (Tokens Studio GitHub sync, a DTCG folder sync); native GitHub sync is only planned (#11711) | S |
| MCP | Official, in `penpot/penpot/mcp`. Works through a plugin in an open browser tab on the focused page, one tab at a time; local `@penpot/mcp@stable` (Node 22) or hosted with an MCP key. Tools: `execute_code`, `high_level_overview`, `penpot_api_info`, `export_shape`, `import_image` | V ([docs](https://help.penpot.app/mcp/)) |
| MCP security | One key per user; no permission scopes, read-only keys or sandbox documented. Layer names and text in a file are a prompt-injection path | V, inference |
| Code output | Inspect gives CSS, SVG and HTML. No Swift or Kotlin | S |
| Native kits | Community Material 3 kit exists; no Apple kit. Apple's resource and SF Symbols licences restrict redistribution (check before committing) | S, M |
| Prototype fidelity | Click and hover interactions, overlays, simple transitions, shareable view links. No logic or device-native behaviour | M, unverified |

## Decisions

- Penpot is a poor primary tool for this workflow: the token round trip needs an adapter in both directions, there is no Apple kit, the MCP is one arbitrary-code tool that needs a live browser tab, and prototypes lose to single-file HTML on motion and agent editability.
- Repo tokens stay the source of truth. Push them to Penpot one way if Penpot is used at all.
- Figma with its official MCP is the stronger canvas option if a canvas is wanted; Pencil.dev is a lighter local option. Both unverified here.
- Confidence about 70 percent that Penpot should not be the primary tool.

## One-day spike, if the owner wants to verify

1. Self-host with Docker Compose. Import the Terrazzo DTCG tokens, export, diff against the source.
2. Run the MCP plugin on the instance. Have an agent build a screen with token-bound fills, then edit it. Check whether it works without a visible tab.
3. Check whether any call returns layout or CSS data; compare with the design book on one screen.
4. Time a 200-frame file, create a prototype link, test sharing.
5. Repeat step 2 with Figma's Dev Mode MCP and compare.
