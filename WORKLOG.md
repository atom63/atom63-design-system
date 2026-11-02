# Worklog

Owner: codex
Branch: codex/batch-case-study-review
Goal: Run the CRM visual benchmark entirely with Codex so it consumes no Claude quota.
Done when: Builders and visual judge use isolated `codex exec` sessions; core/guided MCP access remains distinct; reports record Codex token usage rather than Claude cost; focused tests and a three-arm dry-run pass without invoking Claude.
May write: WORKLOG.md, scripts/design-system/vibe*, packages/cli/src/mcp*, docs/design-system/, .changeset/
Off limits: Full builder or judge smoke runs, component source, releases, and publishing.
Next first step: Run the first full three-arm Codex CRM sample only when YZ wants to spend Codex quota, then inspect all 60 screenshots before trusting the visual scores.
Blocked on YZ: none

## Log

- 2026-11-02 [codex] Migrated every vibe builder and the screenshot-only judge from Claude to isolated `codex exec` sessions, added hard MCP tool filtering for the core arm, and replaced dollar estimates with Codex JSONL token usage · checks: CLI tests 261/261; focused vibe tests 47/47; runner syntax, Prettier and diff checks passed; Codex MCP config parsed correctly; three-arm CRM reference dry-run passed without calling an agent and was preserved at `/tmp/atom63-vibe-codex-dry-20261102-v3`
- 2026-11-01 [codex] Replaced the mixed craft judge with a screenshot-only 100-point visual judge and moved implementation checks into gates and DS leverage · checks: unit tests 48/48; three-arm dry-run passed; target rendered to a 1440×960 PNG and inspected; syntax, diff and Prettier checks passed
- 2026-11-01 [codex] Added the five-state by four-viewport CRM capture matrix and excluded starter chrome from benchmark routes · checks: unit tests 46/46; runner syntax passed; three-arm dry-run passed and artifacts preserved at `/tmp/atom63-vibe-crm-states-dry-20261101`
- 2026-11-01 [codex] Completed the executable CRM Track R infrastructure slice and preserved a verified dry-run artifact at `/tmp/atom63-vibe-crm-dry-20261101` · checks: dry-run 3/3 arms; unit tests 45/45; syntax, diff and Prettier checks passed; target SVG rendered and inspected at 1440×960
- 2026-11-01 [codex] Implemented the CRM reference-pack slice with three benchmark arms, four capture viewports, all-viewport axe checks, and optional artifact preservation · checks: baseline 41/41; focused project/report tests 25/25; package build passed; full dry-run pending after quiet-install diagnosis
- 2026-11-01 [codex] Rescoped after YZ requested a Mobbin-grounded reconstruction benchmark; researched five product patterns and wrote the proposed two-track, three-arm plan · checks: Mobbin references inspected as images; no benchmark code changed
- 2026-11-01 [codex] Completed independent visual and evidence assessments and wrote the bilingual batch review · checks: both raw JSON files parse; both screenshot sets contain all 16 expected files
- 2026-11-01 [codex] Started batch review after YZ approved independent sub-agents · checks: agent-relay check identified detached HEAD and missing WORKLOG; created task branch
