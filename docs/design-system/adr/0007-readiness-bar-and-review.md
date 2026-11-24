# ADR 0007: A written readiness bar, reviewed by agents with an independent verifier

**Status:** Accepted, 2026-11-18 (full-review proposal, decisions 1A to 4A; the bar approved the
same day). Rounds 0 to 2 ran 2026-11-18 to 2026-11-20; round 3 fixes in progress. The goal adds
open-source adopters under [ADR 0009](./0009-opinionated-open-source-for-ai-products.md)
(proposed 2026-11-24).

## Context

The last component-by-component pass had been on 2026-09-21. The system had many checks, but no
per-component score and no answer to "is this layer ready?". A single reviewer's impression would
not be repeatable, and reviewers who share context anchor on each other's findings.

## Decision

- **A written bar,** scored 0 to 4 per criterion across six layers: tokens and themes, contracts,
  components (one scorecard each, criteria K1 to K10), layout, architecture, and consumer and agent
  experience. A score names evidence. "Ready" means at least 3 on every criterion that applies.
  Scores map to severity: 0 is P0, 1 is P1, 2 is P2.
- **Machine checks first;** reviewers judge only what a check cannot. Two checks were added for the
  review: a token role rule and a contract consistency lint.
- **A multi-agent workflow:** one reviewer per layer and per component batch, in parallel. A second,
  independent agent verifies every P0 and P1 finding before it counts, and may confirm or
  downgrade it.
- **Taste stays with a person:** AI taste scores are a reference; they stand only after the
  maintainer has seen the batch's contact sheet.
- One register per round, shown on the dashboard, and one fix PR per finding cluster, each with a
  test or check so the finding cannot return.

## Options considered

- Goal: internal products and AI builders (chosen) vs a public 1.0 stable bar (about twice the
  work, and it would lock names still changing).
- Scope: tokens and contracts on all platforms, components on web and iOS, Figma for token parity
  only (chosen) vs web, then iOS, then Figma (token and contract problems would surface three times).
- Taste: maintainer confirms from contact sheets (chosen) vs fully automated scoring.
- Running it: a parallel multi-agent workflow (chosen) vs one reviewer at a time in one session
  (cheaper per hour, takes days, and anchors reviewers).

## Consequences

- Good: P1 findings fell from 67 (round 0, 2 P0) to 25 (round 1, 0 P0) to 9 (round 2), each round
  re-reviewed against the same bar.
- Good: verification changes results. The registers record 16, 9 and 7 findings whose severity the
  verifier changed in rounds 0, 1 and 2.
- Good: findings became checks, for example the slot check (#310) and the AGENTS.md rule check (#311).
- Bad: the bar exposed that `stable` was claimed too widely (69 of 77 contracts). The fix changed the
  rule, not the labels: `stable` now means no open P0 or P1.
- Bad: the review costs many agent runs (32 and 30 agents in the two runs whose size is recorded) and needs the maintainer's go-ahead.
- Bad: P2 counts stay high (416, 303, 286), and round 2 still has only 17 of 186 subjects ready.

## Evidence

- The bar: [readiness-bar.md](../readiness-bar.md) (approved 2026-11-18; C5 changed 2026-11-19).
- The rounds and their registers: [audits/readiness-rounds.md](../audits/readiness-rounds.md)
  (round 0 on 2026-11-18, round 1 on main `7ab4fc97`, round 2 on main `099d1eba`).
- Internal records: the full-review proposal and the review worklog.
- New checks: [#285](https://github.com/atom63/atom63-design-system/pull/285).
- Fixes for round 0 findings: [#287](https://github.com/atom63/atom63-design-system/pull/287),
  [#288](https://github.com/atom63/atom63-design-system/pull/288),
  [#290](https://github.com/atom63/atom63-design-system/pull/290) to
  [#293](https://github.com/atom63/atom63-design-system/pull/293),
  [#295](https://github.com/atom63/atom63-design-system/pull/295) to
  [#298](https://github.com/atom63/atom63-design-system/pull/298).
- Fixes for round 1 findings: [#301](https://github.com/atom63/atom63-design-system/pull/301),
  [#304](https://github.com/atom63/atom63-design-system/pull/304),
  [#305](https://github.com/atom63/atom63-design-system/pull/305),
  [#307](https://github.com/atom63/atom63-design-system/pull/307).
- Fixes for round 2 findings (fix round 3): [#310](https://github.com/atom63/atom63-design-system/pull/310) to
  [#313](https://github.com/atom63/atom63-design-system/pull/313) merged;
  [#314](https://github.com/atom63/atom63-design-system/pull/314) and
  [#315](https://github.com/atom63/atom63-design-system/pull/315) open.
- The word "skeptic" is not in the records; they describe the verifier as a second, independent
  reviewer.
