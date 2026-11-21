# Agentic CI optimization plan

**Status:** Draft for review. This document defines the rollout; implementation belongs in
separate, reviewable pull requests.

## Goal

Turn CI from one broad repository validator into a staged verification system for frequent agent
iterations:

```text
agent preflight
  -> draft pull request: affected checks
  -> ready pull request: risk checks
  -> merge queue: integration checks
  -> main / nightly / release: durable evidence
```

Targets:

- agent preflight in at most 2 minutes;
- first actionable draft-pull-request result in at most 3 minutes;
- ordinary ready web pull requests in at most 7 minutes;
- iOS or cross-renderer pull requests in at most 10 minutes;
- a machine-readable reason for every skipped lane; and
- no reduction in release, visual, cross-browser or native coverage.

## Non-goals

This plan does not introduce a remote build cache, a monorepo build framework, self-hosted runners,
or fewer tests. It does not change release approval. It does not remove generated files before a
separate ownership review identifies which outputs ship and which are review-only evidence.

## Principles

1. An agent's completion report is a claim, not proof. CI derives the required checks from the diff
   and records independent evidence.
2. Unknown inputs fail safe: an unclassified path selects the full verification set.
3. One impact classifier drives local preflight and CI. Path rules must not be duplicated across
   workflow YAML and local scripts.
4. Draft speed must not weaken the merge bar. Expensive checks move to the ready and merge-group
   gates; they do not disappear.
5. A retry that passes is still recorded as instability.

## Phase 0: CI correctness and observability

Deliver this as one focused CI pull request.

1. Preserve every required `main` and release verification run. Reconcile the current concurrency
   configuration with the release preflight, which waits for `ci-status` on an exact commit.
2. Narrow the iOS change detector from all of `packages/ui-foundation/` to the contracts, generated
   models, source and generator paths that Swift consumes. A version-only pull request must not run
   iOS or iOS snapshots.
3. Move changeset, generated-drift, formatting and lint checks ahead of expensive smoke tests.
4. Split the Storybook command group into named steps without splitting the job, so later decisions
   use measured durations.

Verification:

- three queued `main` commits each receive a final `ci-status`;
- a Version Packages fixture skips both macOS jobs;
- a contract fixture still selects both macOS jobs;
- the same full check set remains green; and
- the workflow reports individual Storybook step durations.

## Phase 1: one impact classifier in shadow mode

Add:

```text
scripts/design-system/ci-impact.mjs
scripts/design-system/lib/ci-impact.mjs
scripts/design-system/lib/ci-impact.test.mjs
```

The command accepts a base revision and emits human-readable output or a JSON envelope:

```bash
pnpm ci:impact --base origin/main
pnpm ci:impact --base origin/main --json
```

Initial risk classes:

| Risk | Example | Required lanes |
| --- | --- | --- |
| `prose` | Human-authored Markdown and screenshots | static |
| `local-package` | One package's implementation and tests | static, affected package |
| `visual` | CSS, recipe or story | package, Storybook, visual |
| `cross-renderer` | Token, contract or shared intent | web, visual, iOS |
| `public-surface` | Export, package or create scaffold | API, pack, starter |
| `pipeline-release` | Workflow, generator or versioning | full or release |

The first rollout is advisory. CI continues to run its current checks and publishes the lanes that
the classifier would have selected. Enable skipping only after at least 20 representative pull
requests produce no false negative. Any false negative resets that observation window.

Fixtures must cover prose-only, Version Packages, React component, CSS/story, token, contract,
iOS-only, workflow/generator and unknown-path changes.

## Phase 2: changed preflight and verification manifests

Add one local entry point:

```bash
pnpm verify:changed --base origin/main
pnpm verify:changed --base origin/main --json
```

It calls the impact classifier, runs portable checks, lists checks deferred to CI and prints exact
reproduction commands. An agent cannot supply a lower risk class.

Every CI run writes a small verification manifest to the job summary and uploads it as an artifact.
It records:

- base and head revisions;
- risk and affected packages;
- selected and skipped lanes, with reasons;
- test counts, visual changes and retries;
- artifact links and reproduction commands.

Per-pull-request manifests remain CI artifacts. Only release and readiness evidence that must remain
durable is committed to the repository.

Verification:

- local and CI impact results are identical for the same revisions;
- every skip has a reason;
- every failed lane prints a focused reproduction command; and
- the manifest agrees with the final job states.

## Phase 3: split verification and accelerate draft pull requests

Split the current `verify` job into parallel lanes:

- `static`: changesets, generated drift, contracts, tokens, policies, formatting, lint and typecheck;
- `packages`: package builds, unit tests, API reports, package correctness and bundle budgets; and
- `consumer-smoke`: packed packages, registry, examples, dashboard and create starter.

Draft pull requests run `changes`, `static` and affected package checks. Ready pull requests run the
complete risk-selected set. Configure the workflow to run again on `ready_for_review`; later
synchronizations of a ready pull request keep the complete set.

`ci-status` always runs and accepts only lanes that succeeded or were deliberately skipped by the
classifier. A draft result is not merge evidence.

Verification:

- a draft gets an actionable result within 3 minutes;
- marking it ready starts the complete required set;
- an unknown input selects the full set; and
- a ready pull request cannot merge on the earlier draft result.

## Phase 4: optimize measured expensive lanes

### iOS

Benchmark the demo tests three times with two parallel workers. Promote parallel execution only if
all three runs are stable. Keep retry-on-failure, but expose retry-green results in the manifest.

### Storybook

Use the Phase 0 timing history to decide whether build, accessibility or another step merits a
separate job. Do not split it without measured evidence.

### Version-only

Run static, package correctness, API/package surface, pack smoke and release preflight. Skip visual,
cross-browser and iOS lanes when the diff contains only versions, changelogs, prerelease changesets
and their release audits.

Verification:

- median iOS duration is at most 10 minutes without a higher flaky rate;
- retry-green is visible; and
- a version-only pull request finishes within 10 minutes.

## Phase 5: merge-group and nightly verification

Add the GitHub `merge_group` event and run integration checks on the exact combined revision:

- generated drift;
- static, package, API and bundle checks;
- affected browser, visual and iOS checks; and
- consumer smoke.

Add a nightly full sweep for all packages, stories, visual baselines, Firefox/WebKit, iOS snapshots,
consumer smokes and retry/duration reporting. Nightly coverage detects impact-classifier misses but
does not replace high-risk pre-merge checks.

Verification:

- two individually green but incompatible fixture pull requests fail in the merge group;
- nightly identifies a deliberately omitted lane in a classifier test; and
- release preflight still waits for `ci-status` on its exact revision.

## Phase 6: generated-output ownership

Handle this as a separate governance proposal. Inventory generated files into:

1. package/runtime outputs that must remain committed; and
2. review-only reports that may become CI artifacts or main/nightly updates.

Provide one deterministic `pnpm regenerate:affected` entry point for the committed outputs. Do not
remove or relocate an output until its package, documentation and release consumers are proven.

## Pull request slices

1. `fix(ci): preserve verification runs and narrow iOS impact`
2. `feat(ci): classify affected verification lanes in shadow mode`
3. `feat(ci): emit verification manifests and add changed preflight`
4. `feat(ci): split verification and accelerate draft pull requests`
5. `perf(ci): parallelize verified iOS test execution`
6. `feat(ci): verify merge groups and run nightly full coverage`
7. A separate generated-output ownership proposal

## Stop-the-line conditions

Stop enabling new skips if any of these occurs:

- nightly catches a relevant check omitted from a pull request;
- a green pull request makes `main` red;
- the classifier cannot explain a skip;
- flakiness rises;
- merge-group, main and release revisions do not match their evidence; or
- an agent can lower verification scope by editing a manifest or pull-request description.

## Success decision

The rollout succeeds when the latency targets hold for two weeks, every skip remains explainable,
nightly finds no classifier miss and releases retain the current independent evidence. Speed alone
is not success if main regressions, retries or manual reruns increase.

---

# Agentic CI 优化计划

**状态：** 待评审草案。本文件只定义推进顺序；实现必须拆成独立、可审阅的 PR。

## 目标

把 CI 从一次宽泛的仓库验证，改成适合高频 agent 迭代的分层验证系统：

```text
agent preflight
  -> Draft PR：affected checks
  -> Ready PR：risk checks
  -> merge queue：integration checks
  -> main / nightly / release：durable evidence
```

目标值：

- agent preflight 不超过 2 分钟；
- Draft PR 不超过 3 分钟给出第一条可行动反馈；
- 普通 Web Ready PR 不超过 7 分钟；
- iOS 或 cross-renderer PR 不超过 10 分钟；
- 每个跳过的 lane 都有机器生成的理由；
- 不减少发布、视觉、跨浏览器和原生覆盖。

## 非目标

本计划不引入远程构建缓存、monorepo 构建框架或自托管 runner，不删测试，不改变发布审批。生成文件必须先经过单独的 ownership 评审，证明哪些参与发布、哪些只是审查证据，才允许移动或移除。

## 原则

1. agent 的完成汇报只是声明，不是证明。CI 根据 diff 独立决定检查并记录证据。
2. 未识别输入按最保守方式处理：选择完整验证集合。
3. 本地 preflight 与 CI 共用一个 impact classifier；不在 YAML 和脚本里维护两套路径规则。
4. Draft 提速不能降低合并门槛；高成本检查移动到 Ready 和 merge-group，不是消失。
5. 重试后通过仍须记录为不稳定信号。

## Phase 0：CI 正确性与可观测性

用一个聚焦的 CI PR 交付：

1. 保留每一个必须验证的 `main` 与 release run。让 concurrency 行为与按精确 commit 等待 `ci-status` 的 release preflight 一致。
2. 把 iOS 影响范围从整个 `packages/ui-foundation/` 收窄到 Swift 实际读取的 contracts、generated、src 和生成脚本。纯版本 PR 不跑 iOS 与 iOS snapshots。
3. 把 changeset、生成漂移、格式和 lint 放到昂贵 smoke 之前。
4. 把 Storybook 组合命令拆成具名 steps，但暂不拆 job，用真实耗时决定后续优化。

验证：三个连续进入队列的 `main` commit 都拿到最终 `ci-status`；Version Packages fixture 跳过两个 macOS job；contract fixture 仍选择两个 macOS job；完整检查保持绿色；Summary 能看到各 Storybook step 的耗时。

## Phase 1：统一 impact classifier，先 shadow

新增：

```text
scripts/design-system/ci-impact.mjs
scripts/design-system/lib/ci-impact.mjs
scripts/design-system/lib/ci-impact.test.mjs
```

命令接受 base revision，并输出人类可读结果或 JSON：

```bash
pnpm ci:impact --base origin/main
pnpm ci:impact --base origin/main --json
```

初始风险分类：

| 风险 | 示例 | 必需 lanes |
| --- | --- | --- |
| `prose` | 人写 Markdown 与截图 | static |
| `local-package` | 单包实现与测试 | static、affected package |
| `visual` | CSS、recipe、story | package、Storybook、visual |
| `cross-renderer` | token、contract、shared intent | web、visual、iOS |
| `public-surface` | export、package、create scaffold | API、pack、starter |
| `pipeline-release` | workflow、generator、versioning | full 或 release |

首轮只做 advisory：CI 仍运行当前检查，同时公布 classifier 原本会选择的 lanes。至少观察 20 个有代表性的 PR，且没有 false negative，才允许真正跳过。出现一次漏选，就补规则并重新累计观察窗口。

fixture 必须覆盖 prose-only、Version Packages、React component、CSS/story、token、contract、iOS-only、workflow/generator 与未知路径。

## Phase 2：changed preflight 与 verification manifest

新增统一本地入口：

```bash
pnpm verify:changed --base origin/main
pnpm verify:changed --base origin/main --json
```

它调用 classifier，执行可移植检查，列出交给 CI 的检查并打印精确复现命令。agent 不能传入更低风险等级。

每次 CI 都把 verification manifest 写进 Job Summary，并作为 artifact 上传。内容包括 base/head revision、风险、影响包、选择和跳过的 lanes 与理由、测试数量、视觉变化、重试、artifact 链接和复现命令。

PR 临时 manifest 只存在 Actions；只有 release/readiness 需要长期保存的证据才提交进仓库。

验证：相同 revision 的本地与 CI 分类一致；每个 skip 有理由；每个失败 lane 有聚焦复现命令；manifest 与最终 job 状态一致。

## Phase 3：拆 verify，给 Draft PR 提速

把当前 `verify` 拆成并行 lanes：

- `static`：changeset、生成漂移、contract、token、policy、格式、lint、typecheck；
- `packages`：包构建、单测、API report、package correctness、bundle budget；
- `consumer-smoke`：packed package、registry、examples、dashboard、create starter。

Draft PR 运行 `changes`、`static` 和受影响包检查。Ready PR 运行完整风险集合。workflow 显式监听 `ready_for_review`；Ready 后的后续同步继续跑完整集合。

`ci-status` 始终执行，只接受成功或由 classifier 明确跳过的 lanes。Draft 的绿色结果不是合并证据。

验证：Draft 3 分钟内给出反馈；标记 Ready 后自动启动完整检查；未知输入选择 full；不能使用较早的 Draft 结果合并。

## Phase 4：优化已测量的高成本 lanes

### iOS

先用两个并行 worker 手动跑三次 demo tests，三次都稳定才写进 scheme/CI。保留 retry-on-failure，但在 manifest 中暴露 retry-green。

### Storybook

根据 Phase 0 的耗时历史决定 build、a11y 或其他 step 是否值得独立成 job；没有测量证据不拆。

### Version-only

运行 static、package correctness、API/package surface、pack smoke 与 release preflight。diff 只有版本、changelog、prerelease changeset 和 release audit 时，跳过 visual、cross-browser 与 iOS。

验证：iOS 中位数不超过 10 分钟且 flake 不增加；retry-green 可见；version-only PR 不超过 10 分钟。

## Phase 5：merge-group 与 nightly

增加 GitHub `merge_group` 事件，在准确组合 revision 上运行生成漂移、static、package/API/bundle、受影响的 browser/visual/iOS 与 consumer smoke。

新增 nightly full sweep：全部 packages、stories、visual baselines、Firefox/WebKit、iOS snapshots、consumer smokes，以及 retry/耗时汇总。Nightly 用于发现 classifier 漏选，但不能替代高风险改动的合并前检查。

验证：两个单独绿色但组合冲突的 fixture PR 在 merge group 失败；nightly 能发现测试中的故意漏选；release preflight 仍等待准确 revision 的 `ci-status`。

## Phase 6：生成产物 ownership

作为独立治理提案处理。把生成文件分成：

1. 必须提交的 package/runtime 产物；
2. 可改为 CI artifact 或由 main/nightly 更新的 review-only 报告。

为必须提交的产物提供唯一、确定性的 `pnpm regenerate:affected`。在证明 package、文档和 release 消费关系之前，不移动或删除任何生成文件。

## PR 切片

1. `fix(ci): preserve verification runs and narrow iOS impact`
2. `feat(ci): classify affected verification lanes in shadow mode`
3. `feat(ci): emit verification manifests and add changed preflight`
4. `feat(ci): split verification and accelerate draft pull requests`
5. `perf(ci): parallelize verified iOS test execution`
6. `feat(ci): verify merge groups and run nightly full coverage`
7. 单独的生成产物 ownership 提案

## Stop-the-line 条件

出现以下任一情况，就停止启用新的跳过规则：

- nightly 发现 PR 漏跑相关检查；
- 绿色 PR 让 `main` 变红；
- classifier 无法解释 skip；
- flake 上升；
- merge-group、main、release 的 revision 与证据不一致；
- agent 能通过编辑 manifest 或 PR 描述降低验证范围。

## 成功判断

延迟目标连续两周成立、每个 skip 可解释、nightly 没有发现 classifier 漏选、release 保留当前独立证据，才算 rollout 成功。如果 main 回归、重试或人工 rerun 增加，仅仅更快不算成功。
