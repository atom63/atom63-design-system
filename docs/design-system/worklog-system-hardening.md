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

[claude] PR 2a on `claude/system-hardening-pr2a`, from `main` `ca525b0f` (#251 merged). YZ chose
publishing `@atom63/cli` (audit option A), split into PR 2a, a first publish, and PR 2b, with
`0.1.0-beta.0` as the first version. The proposal is
`docs/design-system/proposal-system-hardening-pr2-cli.md` (local, not committed).

Done:

- `packages/cli` is publishable: no `private`, version `0.1.0-beta.0`, `repository` and
  `publishConfig.access: public` like the other packages, and the tests left out of `files`.
- `check:ds-pack-smoke` packs the CLI with the other three packages, installs it in the consumer
  project, and runs `atom63 build`, `component`, `example` and `token` there.
- The CLI README says how to install it in another project.

Verification: `pnpm check:ds-pack-smoke` passes with all four tarballs and the `cli` step.

Next: YZ runs `pnpm release:bootstrap packages/cli` on `main` after PR 2a merges. Then PR 2b adds
`packages/cli` to both published-package lists and makes the registry smoke install
`@atom63/cli@beta` and run the same four commands.

## 2026-11-02

[claude] First publish done: YZ ran `pnpm release:bootstrap packages/cli` on `main`. npm has
`@atom63/cli@0.1.0-beta.0` on `beta` and `latest`, and the trusted publisher for
`release-beta.yml` (environment `npm-publish`). npm also created its own `0.0.0-stage`
placeholder version.

PR 2b on `claude/cli-registry`, from `main` `9282de1b`. Done:

- `packages/cli` is in `published-packages.mjs` and `PUBLISHED_PACKAGES` in `release-beta.yml`,
  and in the package lists in `AGENTS.md` and `CONTRIBUTING.md`.
- `@atom63/cli` is a coordinated package in the dependency version policy, with policies for its
  two runtime dependencies.
- `check:ds-registry-smoke` installs `@atom63/cli@beta` as a dev dependency and runs
  `atom63 build`, `component`, `example` and `token`. Evidence regenerated.
- The package-surface and dependency-policy audits regenerated.

Verification: `pnpm check:ds-registry-smoke -- --write` (resolved `@atom63/cli@beta` ->
`0.1.0-beta.0`), `check:package-correctness` (publint passes for the CLI),
`check:package-surface`, `check:dependency-version-policy`, `test:scripts` (158 pass),
`publish-beta.mjs --dry-run` (skips the CLI as published).

Next: the case-study harness template installs the CLI from npm. Then PR 3 (AppView layout
contract), proposal first.

[claude] #256 merged. Case-study builders and the CLI, on `claude/vibe-cli`: YZ chose option A of
`docs/design-system/proposal-harness-cli.md` (local, not committed). Done:

- `vibe.mjs` packs `@atom63/cli` with the other tarballs, installs it as a dev dependency in the `ds`
  arm, and starts the MCP server from the project's own copy.
- A new case template, `tmp/atom63-vibe-dMqbCo/invoice-list/ds`, built with
  `vibe.mjs --dry-run --keep --arms ds --brief invoice-list`. In it, `pnpm exec atom63` works,
  `pnpm typecheck` and `pnpm build` pass, and the MCP server answers `initialize`. A `cp -a` copy,
  as `batch.sh` makes, runs the CLI too.
- Harness, outside git (backup in `backup-2026-11-02-cli/`): `batch.sh` uses the new template, and
  `run.mjs` starts the MCP server from each case's `node_modules`. `run-ios.mjs` keeps the repo
  CLI, because the iOS template builds against this repo's `packages/ui-ios`.

Next: a small Codex round checks that builders call `atom63` and that `validity.mjs` passes.

[claude] #257 merged. Codex round (`BUILDER=codex SUF=-codex-cli JUDGE=0`, web only) on
audio-player, chat-thread and place-card: all three build. chat-thread and place-card copied the
AppView template (`src/components/app-view.tsx`), which no `-codex-r1` run did, and no gap says
`atom63` is unavailable. audio-player fails `validity.mjs` on one `button-without-variant` warning.

PR 3 on `claude/app-view-layout`: YZ chose the recommended options of
`docs/design-system/proposal-system-hardening-pr3-app-view.md` (local, not committed). Done:

- `AppView` ships from `@atom63/ui-react/layout`, with a component contract (layouts `window` /
  `phone`, chromes `inset` / `flush`, slots). It adds `chrome="flush"` and `overlay`, and gives each
  safe-area inset one owner; its scrolling regions take focus so a keyboard can scroll them.
- Five stories with play checks: one scroll owner and one owner per inset, under emulated insets.
- The `app-view` template keeps the sample pages and imports AppView; the tab-bar block no longer
  pads itself for the home indicator. The CLI's phone kit imports AppView from the package.
- The catalog, docs, CLI index and export audit read the `./layout` entry. The craft target-size
  rule skips a `main` or `aside` that takes focus only to scroll.

Next: record the visual baselines for the new stories, then a case round (one desktop, three phone)
checks that builders import AppView instead of copying it.

[claude] #258 merged. Case round on a template rebuilt from `main` `88bf7961`
(`tmp/atom63-vibe-3E12wP`), web only, no judge: analytics-overview, chat-thread, listing-detail
and fintech-home, each with Claude (`-av-claude`) and Codex (`-av-codex`).

- All eight import AppView from `@atom63/ui-react/layout`; none copies it. Both analytics-overview
  runs use `chrome="flush"`, both chat-thread runs use `overlay`.
- Four are invalid, none because of AppView: three Button warnings (`button-without-variant`,
  `multiple-primary`), and fintech-home-av-claude fails typecheck after rewriting the routes to
  drop the site header and footer.
- Gaps left on AppView: the side panel is a fixed 18rem (analytics-overview-av-claude overrode it
  with a slot selector), and a full-window page cannot leave the site header and footer without
  editing the router (chat-thread, fintech-home).

On `claude/app-view-panel-width`: AppView takes `panelWidth`, which sets
`--a63-app-view-panel-width` (18rem by default). The route question gets its own proposal.

[claude] #259 merged (`panelWidth`). #260 merged: YZ chose option A of
`docs/design-system/proposal-full-window-routes.md` (local, not committed). The `site` and `docs`
starters draw the header and footer in a pathless `site` layout route, as the `app` starter draws its
shell; the root route draws only the outlet, so a full-window page is a child of `rootRoute`. The
not-found page keeps the chrome, and the post and doc pages read params from `/site/...`.

Rerun on a template from `main` `a588fc14` (`tmp/atom63-vibe-9g2qO6`), web only, no judge:
chat-thread and fintech-home with Claude (`-rt-claude`) and Codex (`-rt-codex`). All four typecheck
and build, add the page as a child of `rootRoute`, and record no gap about the site header or footer.
Both fintech-home runs are invalid on one `button-without-variant` warning each.

#261 (auto-merge on): YZ found the suggested-prompts row scrolling vertically. `ScrollableList`
passed `overflow-y-hidden` as a class, but Base UI sets `overflow: scroll` inline on the viewport;
the list now sets `overflow-y: hidden` inline.

Open: `button-without-variant` invalidates a run on every round, while rule 3 tells builders to rely
on component defaults. The two disagree about a Button with the default variant.

From now on, YZ asked for auto-merge on every PR Claude opens (not the Version Packages PR).

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

[claude] PR 2a 在 `claude/system-hardening-pr2a`，从 `main` `ca525b0f`（#251 已合并）拉出。YZ 选定发布 `@atom63/cli`（审计方案 A），拆成 PR 2a、首发、PR 2b，首个版本 `0.1.0-beta.0`。方案在 `docs/design-system/proposal-system-hardening-pr2-cli.md`（本地，未提交）。

已完成：

- `packages/cli` 可发布：去掉 `private`，版本 `0.1.0-beta.0`，像其他包一样加 `repository` 和 `publishConfig.access: public`，`files` 不再包含测试。
- `check:ds-pack-smoke` 把 CLI 和另外三个包一起 pack，装进消费者项目，并在那里跑 `atom63 build`、`component`、`example`、`token`。
- CLI README 写明在其他项目里怎么安装。

验证：`pnpm check:ds-pack-smoke` 通过，四个 tarball 和 `cli` 步骤都过。

下一步：PR 2a 合并后，YZ 在 `main` 上跑 `pnpm release:bootstrap packages/cli`。之后 PR 2b 把 `packages/cli` 加进两份发布包列表，并让 registry smoke 安装 `@atom63/cli@beta`、跑同样四条命令。

## 2026-11-02

[claude] 首发完成：YZ 在 `main` 上跑了 `pnpm release:bootstrap packages/cli`。npm 上 `@atom63/cli@0.1.0-beta.0` 在 `beta` 和 `latest` 两个 tag，`release-beta.yml`（environment `npm-publish`）的 trusted publisher 已建好。npm 还自己建了一个 `0.0.0-stage` 占位版本。

PR 2b 在 `claude/cli-registry`，从 `main` `9282de1b` 拉出。已完成：

- `packages/cli` 加进 `published-packages.mjs`、`release-beta.yml` 的 `PUBLISHED_PACKAGES`，以及 `AGENTS.md`、`CONTRIBUTING.md` 的包列表。
- 依赖版本策略把 `@atom63/cli` 列为协同包，并给它的两个运行时依赖定了策略。
- `check:ds-registry-smoke` 把 `@atom63/cli@beta` 装成 dev 依赖，跑 `atom63 build`、`component`、`example`、`token`；证据已重新生成。
- package-surface 和依赖策略两份审计已重新生成。

验证：`pnpm check:ds-registry-smoke -- --write`（`@atom63/cli@beta` 解析为 `0.1.0-beta.0`）、`check:package-correctness`（CLI 的 publint 通过）、`check:package-surface`、`check:dependency-version-policy`、`test:scripts`（158 通过）、`publish-beta.mjs --dry-run`（CLI 已发布，跳过）。

下一步：case-study harness 模板改为从 npm 安装 CLI。然后是 PR 3（AppView 布局契约），先出方案。

[claude] #256 已合并。case-study builder 接入 CLI，在 `claude/vibe-cli`：YZ 选了 `docs/design-system/proposal-harness-cli.md`（本地，未提交）的方案 A。已完成：

- `vibe.mjs` 把 `@atom63/cli` 和其他 tarball 一起 pack，在 `ds` 组装成 dev 依赖，MCP server 从项目自己装的那份启动。
- 用 `vibe.mjs --dry-run --keep --arms ds --brief invoice-list` 生成了新的 case 模板 `tmp/atom63-vibe-dMqbCo/invoice-list/ds`。模板里 `pnpm exec atom63` 能用，`pnpm typecheck` 和 `pnpm build` 通过，MCP server 能响应 `initialize`。按 `batch.sh` 的方式 `cp -a` 出来的副本也能跑 CLI。
- harness（不在 git 里，备份在 `backup-2026-11-02-cli/`）：`batch.sh` 改用新模板，`run.mjs` 从每个 case 的 `node_modules` 启动 MCP server。`run-ios.mjs` 仍用仓库里的 CLI，因为 iOS 模板编译的是本仓库的 `packages/ui-ios`。

下一步：跑一小轮 Codex case，确认 builder 调用了 `atom63`，并且 `validity.mjs` 通过。

[claude] #257 已合并。Codex 一轮（`BUILDER=codex SUF=-codex-cli JUDGE=0`，只跑 web）跑了 audio-player、chat-thread、place-card：三个都能 build。chat-thread 和 place-card 拷了 AppView 模板（`src/components/app-view.tsx`），`-codex-r1` 一个都没有；也没有 gap 再说 `atom63` 不可用。audio-player 因为一个 `button-without-variant` warning 没过 `validity.mjs`。

PR 3 在 `claude/app-view-layout`：YZ 选了 `docs/design-system/proposal-system-hardening-pr3-app-view.md`（本地，未提交）的推荐项。已完成：

- `AppView` 从 `@atom63/ui-react/layout` 发布，带组件契约（layout `window` / `phone`，chrome `inset` / `flush`，slots）。新增 `chrome="flush"` 和 `overlay`，每个 safe-area inset 只有一个归属者；滚动区可以聚焦，键盘能滚动。
- 五个 story 带 play 检查：在模拟 inset 下，只有一个滚动归属者，每条边只有一个 inset 归属者。
- `app-view` 模板只留示例页并改为 import AppView；tab-bar block 不再自己给 home indicator 留空。CLI 的手机套件改为从包里 import AppView。
- 组件目录、文档、CLI 索引和导出审计都读 `./layout` 入口。craft 的 target-size 规则跳过只为滚动而可聚焦的 `main` 或 `aside`。

下一步：给新 story 录视觉基线，然后跑一轮 case（一个桌面、三个手机），确认 builder 是 import AppView 而不是复制。

[claude] #258 已合并。用 `main` `88bf7961` 重建的模板（`tmp/atom63-vibe-3E12wP`）跑了一轮 case，只跑 web、不跑 judge：analytics-overview、chat-thread、listing-detail、fintech-home，Claude（`-av-claude`）和 Codex（`-av-codex`）各一遍。

- 8 个全部从 `@atom63/ui-react/layout` import AppView，没有一个复制。两次 analytics-overview 都用了 `chrome="flush"`，两次 chat-thread 都用了 `overlay`。
- 4 个无效，都不是 AppView 的问题：3 个是 Button warning（`button-without-variant`、`multiple-primary`）；fintech-home-av-claude 为了去掉站点 header 和 footer 改写了路由，typecheck 失败。
- AppView 剩下的缺口：侧栏固定 18rem（analytics-overview-av-claude 用 slot 选择器覆盖）；全窗口页面不改路由就去不掉站点 header 和 footer（chat-thread、fintech-home）。

在 `claude/app-view-panel-width`：AppView 新增 `panelWidth`，设置 `--a63-app-view-panel-width`（默认 18rem）。路由问题单独出方案。

[claude] #259 已合并（`panelWidth`）。#260 已合并：YZ 选了 `docs/design-system/proposal-full-window-routes.md`（本地，未提交）的方案 A。`site` 和 `docs` starter 改为在无路径的 `site` layout route 里画 header 和 footer，和 `app` starter 画外壳的方式一样；根路由只画 outlet，全窗口页面挂在 `rootRoute` 下。404 页面保留外框，文章页和文档页从 `/site/...` 读参数。

用 `main` `a588fc14` 的模板（`tmp/atom63-vibe-9g2qO6`）重跑，只跑 web、不跑 judge：chat-thread 和 fintech-home，Claude（`-rt-claude`）和 Codex（`-rt-codex`）各一遍。四个都能 typecheck 和 build，新页面都挂在 `rootRoute` 下，GAPS 里没有再提站点 header 或 footer。两个 fintech-home 各因一个 `button-without-variant` warning 无效。

#261（已开 auto-merge）：YZ 发现 suggested prompts 那一行能竖向滚动。`ScrollableList` 用 class 传 `overflow-y-hidden`，但 Base UI 在 viewport 上用行内样式写了 `overflow: scroll`；现在改为用行内样式设置 `overflow-y: hidden`。

待定：`button-without-variant` 每一轮都会让 case 无效，而规则 3 要 builder 依赖组件默认值。两者对「用默认 variant 的 Button」说法不一致。

从现在起，YZ 要求 Claude 开的每个 PR 都开 auto-merge（Version Packages PR 除外）。
