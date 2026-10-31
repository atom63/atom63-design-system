# Worklog: system hardening

Goal: carry out [the system hardening audit](./system-hardening-audit-2026-10-28.md) one PR at a
time, in its recommended order. Current direction: PR 1, one quality gate (web visual regression in
`ci-status`, and a strict case-study validity gate). Out of scope for PR 1: component visuals, CLI
publishing, `AppView`, the token architecture, npm releases and the Version Packages PR.

## 2026-10-30

[claude] PR 1 on `claude/system-hardening-pr1`, branched from `origin/main` `29e5fe78`. The
handoff named a handoff commit and this worklog; neither existed in any branch, so YZ approved
starting from `origin/main` with a new worklog.

Done:

- The Storybook comparison moved from `visual.yml` into a `visual` job in `ci.yml`, and `ci-status`
  needs it. `visual.yml` keeps only the manual, bot-pushed baseline update (no `update` input any
  more). The ruleset still requires only `ci-status`.
- `caseValidity(result, { screenshots })` in `scripts/design-system/lib/vibe-measure.mjs`: a case is
  valid only with a source change, a passing typecheck and build, no craft violation, no literal
  color or palette utility, no warning, and every declared screenshot. Five tests: a valid case,
  then a raw color, a Button without a variant and no source change, each failing a case that
  builds, plus the remaining reasons.
- Harness, outside git: `~/Projects/atom63-case-studies/validity.mjs` (new) calls `caseValidity`;
  `batch.sh` uses it in place of the `error`/`build.ok` check for web cases. The iOS check is
  unchanged.

Verification:

- `pnpm test:scripts`: 158 tests, 158 pass. `pnpm check:craft` passes. Prettier is clean on the
  changed files. Both workflows parse; `ci-status` needs
  `changes, verify, docs, storybook, cross-browser, visual, ios, ios-snapshots`.
- Replaying every existing web result that has warnings measured: 25 valid. `lesson-path-codex-r1`
  (20 raw-color), `audio-player-codex-r1` (6 raw-color) and `product-buy-codex-r1`
  (button-without-variant) are now invalid. `validity.mjs` exits 1 for those three and 0 for
  `settings-grouped-r11`, `send-money-r11`, `store-menu-r11` and `place-card-codex-r1`.
- Gate on GitHub (#251, #252): on #251 the `visual` job ran inside CI and passed (5m42s). Draft
  #252 changed only the Badge Playground story text (plus the agent index it feeds, so `verify`
  stayed green). Run `41133841240`: `visual` failed with "Screenshot does not match the stored
  reference" (1 failed, 828 passed), and `ci-status` printed `visual: failure` and failed while
  every other job passed. #252 was closed and its branch deleted.

Open:

- The stricter gate also turns previously "passing" runs invalid: 13 others for
  button-without-variant warnings, and `social-feed-r5`/`-r11` and `ride-options-r11` (also in the
  13) for failed typechecks that `batch.sh` never checked.
- `validity.mjs` imports `caseValidity` from the main checkout, which does not have it until this PR
  is merged and that checkout is updated. Until then, run it with
  `ATOM63_REPO=<this worktree>`.
- Not covered: the audit's requirement 7 (record the exact tarballs, commits, builder and model);
  product-token extensions (PR 4) that would let lesson and audio pass; iOS literal colors.

Next: YZ reviews and merges #251, then the main checkout moves to `main` (it is on
`codex/full-mobile-ios-rerun`). Then PR 2 (installable CLI path): read-only check and a proposal
first.

---

# 工作日志：系统加固

目标：按[系统加固审计](./system-hardening-audit-2026-10-28.md)推荐的顺序，一次一个 PR 落实。当前方向：PR 1，统一质量门禁（Web 视觉回归进 `ci-status`，加严格的 case 有效性判定）。PR 1 不碰：组件视觉、CLI 发布、`AppView`、token 架构、npm 发布、Version Packages PR。

## 2026-10-30

[claude] PR 1 在 `claude/system-hardening-pr1`，从 `origin/main` `29e5fe78` 拉出。交接里提到的交接提交和本 worklog 在任何分支都不存在，YZ 同意从 `origin/main` 开始并新建 worklog。

已完成：

- Storybook 对比从 `visual.yml` 搬进 `ci.yml` 的 `visual` job，`ci-status` 依赖它。`visual.yml` 只保留手动、由 bot 推送的基线更新（去掉了 `update` 输入）。Ruleset 仍然只要求 `ci-status`。
- `scripts/design-system/lib/vibe-measure.mjs` 新增 `caseValidity(result, { screenshots })`：必须有源码改动、typecheck 和 build 通过、无 craft 违规、无 literal color 和 palette utility、无 warning、声明的截图都在，才算有效。5 个测试：一个有效 case；raw color、Button 缺 variant、无源码改动三个能 build 但必须失败的 case；以及其余失败原因。
- Harness（不在 git 里）：新增 `~/Projects/atom63-case-studies/validity.mjs` 调用 `caseValidity`；`batch.sh` 的 Web case 判定改用它，替换原来的 `error`/`build.ok`。iOS 判定未改。

验证：

- `pnpm test:scripts`：158 个测试全部通过。`pnpm check:craft` 通过。改动文件 Prettier 干净。两个 workflow 都能解析；`ci-status` 依赖 `changes, verify, docs, storybook, cross-browser, visual, ios, ios-snapshots`。
- 回放所有已测 warning 的 Web 结果：25 个有效。`lesson-path-codex-r1`（20 个 raw-color）、`audio-player-codex-r1`（6 个 raw-color）、`product-buy-codex-r1`（button-without-variant）现在都判为无效。`validity.mjs` 对这三个退出 1，对 `settings-grouped-r11`、`send-money-r11`、`store-menu-r11`、`place-card-codex-r1` 退出 0。
- GitHub 上的门禁（#251、#252）：#251 上 `visual` job 在 CI 内运行并通过（5m42s）。draft #252 只改了 Badge Playground story 的文案（外加它影响的 agent index，以保持 `verify` 为绿）。运行 `41133841240`：`visual` 报 "Screenshot does not match the stored reference" 失败（1 失败、828 通过），`ci-status` 输出 `visual: failure` 并失败，其余 job 全部通过。#252 已关闭并删除分支。

遗留：

- 新判定也让此前"通过"的结果变成无效：另有 13 个因 button-without-variant warning，`social-feed-r5`/`-r11` 和 `ride-options-r11`（也在这 13 个里）因 typecheck 失败（`batch.sh` 以前从没查过）。
- `validity.mjs` 从主 checkout 导入 `caseValidity`，PR 合并并更新主 checkout 之前那里没有这个函数。在那之前用 `ATOM63_REPO=<本 worktree>` 运行。
- 未覆盖：审计第 7 条（记录 tarball、commit、builder、model）；让 lesson/audio 能通过的产品 token 扩展（PR 4）；iOS 的 literal color。

下一步：YZ 审阅并合并 #251，然后把主 checkout 切回 `main`（目前在 `codex/full-mobile-ios-rerun`）。之后做 PR 2（可安装的 CLI 路径）：先只读检查并出方案。
