# Readiness review rounds

Each round scores every subject against the [readiness bar](../readiness-bar.md): one reviewer agent per layer or
component batch, then an independent verifier re-checks every P0 and P1 against the source before it counts. A
subject is ready when every applicable criterion scores 3 or more. Between rounds, the open P0 and P1 findings are
fixed in parallel PRs and the next round re-checks each one.

| Round | Date | Base | Scope | Subjects | Ready | P0 | P1 | P2 | P3 | Register |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 2026-11-18 | main | web, React and iOS | 222 | 15 | 2 | 67 | 416 | 141 | [readiness-r0](./readiness-r0/register.json) |
| 1 | 2026-11-19 | main 7ab4fc97 | web and React | 249 | 15 | 0 | 25 | 303 | 110 | [readiness-r1](./readiness-r1/register.json) |
| 2 | 2026-11-20 | main 099d1eba | web and React | 186 | 17 | 0 | 9 | 286 | 95 | [readiness-r2](./readiness-r2/register.json) |
| 3 | 2026-11-28 | main f7e5e419 | web and React | 186 | 39 | 0 | 0 | 225 | 104 | [readiness-r3](./readiness-r3/register.json) |

Notes:
- Round 0 included iOS; from round 1 iOS is in a backlog, so rounds 1 to 3 count web and React only.
- Subject counts differ between rounds because reviewers split some scopes differently (for example one subject per
  contract with findings). Compare P0 and P1 counts, which the verifier checks, more than subject totals.
- Each folder holds one scorecard per scope (`<scope>.json`: subjects, scores with evidence, findings) and
  `register.json` (all findings with the verifier's verdicts, plus `previous`: the status of the round before's P0
  and P1 findings).
- Round 3 found no P1 the verifier upheld: two reviewer P1s (menu's CLI answer, InformSpotlight in forced colors)
  repeat round-2 findings the verifier had already downgraded to P2, and nothing they rest on has changed. Findings
  that open pull request #377 fixes carry `"pendingIn": "#377"`.
- Local paths in the evidence were replaced with repository-relative ones before publishing.
