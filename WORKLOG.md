# Worklog

Owner: codex
Branch: codex/batch-case-study-review
Goal: Produce a valid, visually inspected three-arm CRM benchmark entirely with Codex.
Done when: All three Codex builders change measured source, 60 implementation screenshots are present and inspected, and the Codex judge report contains valid scores, gates and token usage.
May write: WORKLOG.md, scripts/design-system/vibe*, docs/design-system/audits/, and an external artifact directory for the run.
Off limits: Component source, releases, publishing, and Claude calls.
Next first step: Repeat the valid CRM sample twice before treating the 94 / 85 / 79 ordering as stable, or first fix the DS empty-state and tablet responsiveness gaps if YZ prefers iteration over measurement.
Blocked on YZ: none

## Log

- 2026-11-02 [codex] Completed the first valid all-Codex CRM reference sample and manually inspected the full 3-arm × 5-state × 4-viewport matrix; visual scores were plain 94, guided 85 and core 79, while every arm still failed the serious contrast qualification gate · checks: 20 PNG per arm; all typechecks/builds passed with no console errors; raw JSON parses; report has 12 thumbnails; full evidence preserved at `/tmp/atom63-vibe-codex-crm-full-20261102-r2`
- 2026-11-02 [codex] Added the approved unattended execution language and a hard failure when a builder changes no measured source, preventing confirmation-only runs from reaching screenshots or the judge · checks: focused project/measure/report/MCP tests 64/64; runner syntax, Prettier and diff checks passed
- 2026-11-02 [codex] Ran the first full Codex CRM sample and inspected all 60 screenshots; plain implemented the target and scored 89, while both DS agents stopped at a confirmation request and rendered the starter 404 in all 40 DS screenshots, so the run is invalid for DS comparison · checks: 20 PNG per arm; all three builds/typechecks passed; raw events and visual inspection identify zero measured source changes in both DS arms; preserved full evidence at `/tmp/atom63-vibe-codex-crm-full-20261102-r1`
- 2026-11-02 [codex] Migrated every vibe builder and the screenshot-only judge from Claude to isolated `codex exec` sessions, added hard MCP tool filtering for the core arm, and replaced dollar estimates with Codex JSONL token usage · checks: CLI tests 261/261; focused vibe tests 47/47; runner syntax, Prettier and diff checks passed; Codex MCP config parsed correctly; three-arm CRM reference dry-run passed without calling an agent and was preserved at `/tmp/atom63-vibe-codex-dry-20261102-v3`
- 2026-11-01 [codex] Replaced the mixed craft judge with a screenshot-only 100-point visual judge and moved implementation checks into gates and DS leverage · checks: unit tests 48/48; three-arm dry-run passed; target rendered to a 1440×960 PNG and inspected; syntax, diff and Prettier checks passed
- 2026-11-01 [codex] Added the five-state by four-viewport CRM capture matrix and excluded starter chrome from benchmark routes · checks: unit tests 46/46; runner syntax passed; three-arm dry-run passed and artifacts preserved at `/tmp/atom63-vibe-crm-states-dry-20261101`
- 2026-11-01 [codex] Completed the executable CRM Track R infrastructure slice and preserved a verified dry-run artifact at `/tmp/atom63-vibe-crm-dry-20261101` · checks: dry-run 3/3 arms; unit tests 45/45; syntax, diff and Prettier checks passed; target SVG rendered and inspected at 1440×960
- 2026-11-01 [codex] Implemented the CRM reference-pack slice with three benchmark arms, four capture viewports, all-viewport axe checks, and optional artifact preservation · checks: baseline 41/41; focused project/report tests 25/25; package build passed; full dry-run pending after quiet-install diagnosis
- 2026-11-01 [codex] Rescoped after YZ requested a Mobbin-grounded reconstruction benchmark; researched five product patterns and wrote the proposed two-track, three-arm plan · checks: Mobbin references inspected as images; no benchmark code changed
- 2026-11-01 [codex] Completed independent visual and evidence assessments and wrote the bilingual batch review · checks: both raw JSON files parse; both screenshot sets contain all 16 expected files
- 2026-11-01 [codex] Started batch review after YZ approved independent sub-agents · checks: agent-relay check identified detached HEAD and missing WORKLOG; created task branch
