# ADR 0006: The agent interface: CLI, MCP and AGENTS.md rules that name their check; vibe tests

**Status:** Accepted. CLI and MCP decided 2026-09-25 (agent interface plan D1 to D6); vibe tests
added 2026-09-26; "every rule names its check" landed 2026-11-21.

## Context

The main users of the system are coding agents. An agent that guesses invents values, misuses
components and drifts from the system. The next-phase roadmap (2026-10) adds a finding from its
research: retrieval alone is common (20 of 21 surveyed design systems ship an MCP server), and the
only measured lever was lint feedback that blocks wrong output.

## Decision

- **One generated agent index** built from the catalog, contracts, tokens, stories and docs, shipped
  in `@atom63/cli`. CI fails when it is stale.
- **One query core, two entries:** the `atom63` command (`search`, `component`, `token`, `example`,
  later `build`, `template`, `copy`) with `--json` envelopes and stable error codes, and
  `atom63 mcp`, which serves the same commands as MCP tools.
- **AGENTS.md rules generated from one rule table** (`packages/cli/src/rules.mjs`), the same table
  `atom63 rules` prints. Since #311 each rule names the check that enforces it, or says why no
  check can. `check:agents-md` fails on a rule with neither.
- **Vibe tests:** `pnpm vibe` has isolated agents build fixed briefs with Atom63 and with plain
  React + Tailwind, measures craft violations, type errors, axe, literal colours and system-component
  share, and has a judge score anonymous screenshots.

## Options considered

- Data source: a generated index (chosen; offline, matches the installed version), reading repo
  sources at query time (only works in the repo), or fetching the live docs (network, lags).
- Packaging: one package for CLI and MCP (chosen; one index), two packages, or repo scripts only.
- Search: weighted text scoring with golden queries (chosen; deterministic, testable) or embeddings.
- Guidance: a standing AGENTS.md block (chosen; reaches agents before their first call) or rules
  only inside tool results.
- Evaluation (N7, recommended, not marked decided): keep vibe as is; or split into deterministic
  gate metrics plus VLM scores as reference only, with more briefs, repeats and confidence
  intervals.

## Consequences

- Good: agents get answers from the same data the packages are built from; the rules, the CLI and
  the checks cannot drift apart silently.
- Good: in the first full vibe baseline (2026-09-27, 4 briefs) the Atom63 arm had 0 craft, type and
  axe violations and a 92% system-component share.
- Bad: the vibe evidence is statistically weak. Four briefs run once give p = 0.0625 even if all four
  win; VLM judges are about 60% accurate on "which UI is better". The 79 vs 68 rubric result is not
  proof of quality.
- Bad: the system does not always win. In the 2026-11-02 single-brief run the plain React + Tailwind
  arm got the highest visual score (94, against 79 and 85).
- Bad: several rules (query first, one boundary per element, controls over media) are judgements
  and stay unchecked; the AGENTS.md block says so.

## Evidence

- [agent-interface-plan.md](../agent-interface-plan.md): D1 to D6.
- [roadmap.md](../roadmap.md), goal 5 and phase C and E progress notes; decision D5.
- CLI and MCP: [#61](https://github.com/atom63/atom63-design-system/pull/61),
  [#62](https://github.com/atom63/atom63-design-system/pull/62),
  [#63](https://github.com/atom63/atom63-design-system/pull/63),
  [#64](https://github.com/atom63/atom63-design-system/pull/64),
  [#97](https://github.com/atom63/atom63-design-system/pull/97) (`build`, `template`, `copy`),
  [#290](https://github.com/atom63/atom63-design-system/pull/290) (public API index).
- Rules name their checks: [#311](https://github.com/atom63/atom63-design-system/pull/311)
  (finding r2-consumer-1); the generated block in [AGENTS.md](../../../AGENTS.md).
- Vibe: [#82](https://github.com/atom63/atom63-design-system/pull/82),
  [#90](https://github.com/atom63/atom63-design-system/pull/90),
  [audits/vibe-2026-09-27.md](../audits/vibe-2026-09-27.md),
  [audits/vibe-2026-11-02.md](../audits/vibe-2026-11-02.md),
  [#265](https://github.com/atom63/atom63-design-system/pull/265).
- Evaluation critique: [roadmap-next.md](../roadmap-next.md), conclusion 2 and N7.
- Internal records: case-study rounds 12 and 13a (2026-11-17).
