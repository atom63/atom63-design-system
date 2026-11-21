# Architecture decision records

Each record states one decision: its context, the options weighed, the consequences (good and bad)
and links to the pull requests, commits, docs and checks where it landed. Where a record could not
be found, the ADR says "not recorded". Records drawn from working notes that are not in the
repository are cited as internal records.

| # | Title | Status | Summary |
| --- | --- | --- | --- |
| [0001](./0001-base-ui-primitive-layer.md) | Base UI as the primitive layer | Accepted (date not recorded) | React components wrap Base UI for behaviour; Atom63 owns styling, contracts and tests. |
| [0002](./0002-dtcg-single-token-source.md) | DTCG as the single token source | Accepted, 2026-09-24 | Every token layer is DTCG; CSS, Swift and the Figma model are generated. |
| [0003](./0003-one-component-contract.md) | One component contract for React, SwiftUI and Figma | Accepted, 2026-10-10 | A JSON contract per component, with semantic axes each renderer maps. |
| [0004](./0004-shadcn-close-not-identical.md) | A component API close to shadcn, not identical | Accepted, 2026-09-24 | shadcn-like props and role names, plus role bridges and a registry, instead of a 1:1 API. |
| [0005](./0005-themes-as-axes.md) | Themes as orthogonal axes, with contrast checked in CI | Accepted (axes predate the repo; N4 2026-10-10) | Mode, brand, theme and size knobs compose; declared contrast pairs are tested per theme, mode and brand. |
| [0006](./0006-agent-interface.md) | The agent interface: CLI, MCP and rules that name their check | Accepted, 2026-09-25 | One generated index behind a CLI and an MCP server; AGENTS.md rules each name a check; vibe tests. |
| [0007](./0007-readiness-bar-and-review.md) | A written readiness bar, reviewed by agents with an independent verifier | Accepted, 2026-11-18 | Scored criteria per layer; P1 findings 67, 25, 9 over rounds 0 to 2. |
| [0008](./0008-figma-scratchpad-code-source.md) | Figma is a scratchpad, code is the source | Accepted, 2026-10-10 | One-way sync from code; no Organization-only Figma features; restructure not built yet. |
