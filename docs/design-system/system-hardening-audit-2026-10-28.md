# Atom63 system hardening audit — 2026-10-28

## Verdict

The largest problem is not a missing token or one weak component. It is that the quality evidence is
not yet one enforceable contract from consumer instructions through release gates.

The token sources, generated contracts, React renderer, SwiftUI renderer, Figma model, package
surfaces and registry packages are healthy. The repeated failures appear one layer above them:

1. a case study can pass while violating the design-system rules;
2. consumers are told to query a CLI that they cannot install;
3. the only required GitHub status does not include the web visual-regression workflow;
4. the repeated application shell is still a copy-only draft, so each product owns safe areas,
   persistent bars and local mutations again;
5. product artwork is left to products while the rules provide no compliant product-token boundary.

**Hardening readiness: 13/20.** The core is strong enough to build on. The release and consumer
feedback loops are not yet strong enough to treat a green result as complete evidence.

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Token and contract foundation | 4/4 | DTCG, token, role, Figma, Swift and control-alignment checks pass. |
| Renderer and package correctness | 4/4 | React tests, Swift tests, iOS host tests, packed-package smoke and registry-only smoke pass. |
| Visual regression coverage | 3/4 | Storybook and pinned iOS catalog baselines exist; product-route coverage is still a non-blocking plan. |
| Consumer discoverability | 1/4 | The required `atom63 build` path is unavailable in isolated consumers. |
| Evidence and merge governance | 1/4 | Case-study quality failures can pass, and web visual regression is outside the required status. |

## Scope and evidence

This audit used the latest local `main` state at `29e5fe78` and the 13 recent web/iOS case-study
reruns. It deliberately did not reopen the component issues already fixed in PRs #223–#244.

The following checks passed:

- token generation, token roles, DTCG output, z-layers and Figma sync;
- generated component contracts, iOS accessibility contracts and frozen Swift public API;
- cross-renderer control alignment across 3 rungs and 8 axis combinations;
- all published package builds, typechecks and tests;
- 53 Swift package tests and 15 iOS demo UI tests;
- Storybook visual infrastructure, visual QA matrix integrity and monitor-evidence matrix integrity;
- packed-tarball consumer smoke, registry-only beta consumer smoke and the Vite example build;
- package surfaces, API reports, dependency version policy and root-entry dependency policy.

The current `main` web visual workflow is green. This audit is about whether a future red visual
workflow can be merged, not about a known regression on `main` today.

## Confirmed P1 hardening needs

### P1.1 — Make web visual regression part of the required merge result

**Intended claim.** A pull request cannot merge unless the reviewed visual baseline still matches.

**Implemented evidence.** The active repository ruleset requires only `ci-status`. In
`.github/workflows/ci.yml`, `ci-status` aggregates `changes`, `verify`, `docs`, `storybook`,
`cross-browser`, `ios` and `ios-snapshots`. The web visual comparison is a separate workflow in
`.github/workflows/visual.yml`, so it is not represented by the required status.

**Impact.** A Storybook screenshot regression may be visible in GitHub and still not prevent a
merge. The system has good baselines but incomplete enforcement.

**Hardening.** Add a visual job to the required aggregate, or make the visual workflow report a
stable status that the ruleset requires. Keep baseline updates manual and bot-authored.

**Regression test.** Open a test PR that deliberately changes a visual story without updating its
baseline. Merging must remain blocked until the visual status passes.

### P1.2 — Define one case-study validity gate

**Intended claim.** A successful case proves that the builder changed the source, used the system
within its rules, built the result and produced reviewable screenshots.

**Implemented evidence.** `~/Projects/atom63-case-studies/batch.sh` treats only `error` and
`build.ok` as failures. In the Codex rerun:

- `lesson-path` passed its batch result with 20 `raw-color` violations and 0% system-component share;
- `audio-player` passed with 6 `raw-color` violations and 0% system-component share;
- `product-buy` passed with a `button-without-variant` warning.

**Impact.** “All cases passed” currently means “all cases built”, not “the design system expressed
them correctly”. This can send the hardening work toward the wrong layer.

**Hardening.** A valid case result must require all of the following:

1. a source change was produced;
2. typecheck and production build passed;
3. `craft.length === 0`;
4. literal colors and palette utilities are empty, unless an explicit product-token extension is
   declared;
5. required warnings are empty;
6. screenshots exist at the declared viewport;
7. the result records the exact package tarballs/commits, builder and model settings.

System-component share should remain diagnostic, not a universal pass threshold: some references
are legitimately product-specific.

**Regression test.** Add harness fixtures for a build that succeeds with one raw color, one missing
variant and no source change. Each fixture must fail the batch.

### P1.3 — Make the prescribed CLI path available to isolated consumers

**Intended claim.** Builders query the system before writing UI, starting with
`atom63 build <idea>`.

**Implemented evidence.** `@atom63/cli` is `private: true`, version `0.0.0`, and is not in the
published-package list. The isolated case template installs the package tarballs but no CLI. Five of
the six Codex web cases explicitly reported that `atom63` was unavailable; the sixth worked from
directly inspected package APIs and did not prove the CLI path.

**Impact.** The highest-leverage part of the system—the index that connects templates, contracts,
examples and tokens—is absent exactly where an independent builder needs it. Builders then search
exports manually, miss `AppView` and other copyable assets, or hand-build replacements.

**Hardening.** Choose one supported distribution path and test it as a consumer contract:

- recommended: publish `@atom63/cli`, install it as a project dev dependency and expose the
  `atom63` binary;
- alternative: ship the generated index and a tiny executable with one of the already-published
  packages;
- harness-only fallback: pack the private CLI beside the other tarballs, but do not treat that as
  proof that real consumers can install it.

**Regression test.** The registry-only smoke project must run `atom63 build`, `atom63 component`,
`atom63 example` and `atom63 token` without access to the monorepo.

### P1.4 — Promote the application shell from copied draft to a supported primitive

**Intended claim.** Phone and full-window app surfaces share one safe-area, scrolling and persistent
bar contract.

**Implemented evidence.** `AppView` is a draft, copy-only page template. `atom63 component app-view`
returns `component.not_found`. All seven Claude r11 web reruns copied or locally referenced the
template, while the isolated `listing-detail` case reported that it could not import `AppView` and
built a local shell. Repeated gaps concern top-bar borders, bottom-bar ownership, persistent sheets,
safe-area insets and flush bottom navigation rather than page-specific content.

**Impact.** Copying is appropriate for product composition, but the repeated shell owns behavior
that should not fork: which region scrolls, who owns each safe-area inset, how persistent bars stack,
and how a phone form factor is declared.

**Hardening.** Ship the behavioral shell in `@atom63/ui-react/layout`; keep the sample music/player
composition in templates. Stabilize only the small contract: `layout`, `topBar`, `panel`, `children`,
`bottomBar` and `tabBar`, plus explicit inset/edge ownership. Do not move product-specific maps,
sheets, media controls or commerce layouts into the core.

**Regression test.** Use one desktop app case and three phone cases with different combinations of
top bar, persistent bottom action and tab bar. Verify exactly one scroll owner and one inset owner per
edge.

## Confirmed P2 hardening needs

### P2.1 — Define the boundary for product and artwork tokens

**Intended claim.** Products own illustrations and branded content, while every color still comes
from a token.

**Implemented evidence.** The agent rule says every color must be an `--a63-*` token and forbids all
literals. Existing case-study decisions leave artwork placeholders to products. No documented,
machine-checked product-token extension connects those two statements. The lesson and audio cases
therefore either violate `raw-color` or would have to misuse semantic status/category tokens.

**Impact.** Expanding the core palette for every illustration pollutes the system; forbidding product
tokens makes faithful product art impossible; reusing semantic tokens gives decoration false
meaning.

**Hardening.** Keep the core semantic palette closed and add a documented app-owned DTCG extension:

- product tokens live in an explicit namespace such as `--product-*`;
- their source values live in a product DTCG palette, not inline CSS or JSX;
- semantic UI may not consume artwork tokens;
- `check:craft` accepts declared product tokens but still rejects literal use at component sites;
- Figma import preserves the same namespace and separation.

**Regression test.** One illustration fixture passes through declared product tokens; the same values
written inline fail. A status component using an artwork token also fails.

### P2.2 — Add a semantic region experiment before adding more component variants

**Intended claim.** A subtree drawn on a dark brand hero or unknown media receives a coherent
foreground, muted foreground, control surface, border and focus ring.

**Implemented evidence.** The system has strong `on-media` tokens and individual overlay variants,
but no region-level axis. Repeated case gaps ask for on-brand fields, avatars, text and controls. PR
#244 fixed theme inheritance across portals; it did not establish a semantic region contract.

**Impact.** Adding `inverse` or `on-media` to each component independently grows axes and leaves
compound content inconsistent.

**Hardening.** Prototype a small region scope—`default`, `inverse`, `on-brand`, `on-media`—that
remaps only the semantic roles a subtree needs. Validate contrast across every theme/brand/mode before
making it public. If the experiment cannot express fields and focus safely, keep explicit component
variants instead; do not commit to a region API on naming alone.

**Regression test.** Render the same compact form, avatar row and toolbar in all regions across the
theme matrix. No component-specific color override is allowed in the fixture.

### P2.3 — Turn visual evidence into one layered matrix

**What already works.** Every Storybook story has a committed Linux baseline; the visual workflow
compares them. The iOS catalog has committed baselines on a pinned simulator. The current main runs
are green.

**Gap.** The product-route visual QA matrix itself says deterministic route baselines, complete state
coverage and repeatable reduced-motion/focus captures are still missing. Case-study screenshots are
useful research evidence but are not durable merge gates. Locally, the iOS snapshot runner falls back
to git-ignored baselines when the pinned runtime is absent and automatically records missing local
files; its successful exit is therefore non-authoritative for committed-baseline parity.

**Hardening.** Keep three explicit layers:

1. component stories: required deterministic baseline and state/interaction coverage;
2. renderer catalogs: pinned iOS/Figma parity evidence;
3. application routes: a small stable set covering app shell, theme, viewport, focus and reduced
   motion.

Every report must label evidence as `authoritative`, `diagnostic` or `inconclusive`. The local iOS
fallback should print and persist `inconclusive` rather than look identical to a committed-baseline
comparison.

### P2.4 — Replace numeric debt budgets with owned exceptions

**Implemented evidence.** `@atom63/ui-react` allows exactly 11 lint warnings. The current set includes
carousel pointer-only interaction warnings, `autoFocus`, and video-without-captions. The craft
baseline allows five mode branches as count-only keys with no owner, reason or expiry.

**Impact.** A numeric budget normalizes whichever warnings happen to occupy the slots and cannot
distinguish an accepted platform exception from accessibility debt.

**Hardening.** Use a structured exception ledger with rule, file, narrow match, reason, owner and
expiry. New exceptions fail by default; fixed entries must be removed. Accessibility warnings should
not share a budget with style or test-code warnings.

### P2.5 — Stop ratcheting one total bundle budget

**Implemented evidence.** Published `@atom63/ui-react` output is 96.1 kB gzip against a 97 kB total
budget. The budget history repeatedly raises the ceiling for each added feature. The root dependency
guard is useful but currently protects only `react-day-picker`.

**Impact.** The check can prevent the next small feature without identifying which consumer path got
slower, or it can be raised again without an architectural decision.

**Hardening.** Keep the total package metric as information, but gate representative consumer entry
graphs separately: root, layout, theme, media and calendar. Freeze new root dependencies unless a
measured consumer needs them, and move large optional families behind subpaths.

## What not to harden into the core

The reruns also found maps, mascots, proprietary wordmarks, commerce tiles, audio transport layouts,
photo mosaics, messaging wallpaper and numeric keypads. These are product patterns or assets, not
evidence that Atom63 needs corresponding core components.

Likewise, the current token architecture should not be rewritten. Selection, disabled roles, brand
gradients, pill radius, on-media tokens, generated renderer contracts and Figma/Swift parity checks
all held in this audit.

## Recommended order

1. **Evidence gate PR:** make case validity strict and bring web visual regression into the required
   status. This makes every later result trustworthy.
2. **Consumer path PR:** choose and implement an installable CLI path, then add it to registry smoke.
3. **Layout contract PR:** ship the minimal `AppView` behavioral shell under `ui-react/layout`, with
   safe-area and scroll-owner tests.
4. **Token-boundary PR:** document and enforce product-token extensions without expanding the core
   semantic palette.
5. **Region experiment:** validate the semantic region model in stories and cases before proposing a
   public API.
6. **Governance PR:** structured exception ledger and per-entry bundle budgets.

The first rerun after these changes should use a representative matrix, not every case:

- fintech/social: brand and media regions;
- settings/listing/ride: shell, safe areas and persistent surfaces;
- chat/product: compound composition;
- lesson/audio: product-token extension;
- store: tabs and indicators.

Run two independent builders for web and iOS. A case is accepted only after the validity gate passes;
visual judgment comes after validity, not instead of it.

---

# Atom63 系统加固审计 — 2026-10-28

## 结论

最大问题不是缺一个 token，也不是某个组件不够强，而是当前的质量证据还没有形成一条从消费者指令到合并门禁都可执行的完整契约。

Token 源、生成合同、React、SwiftUI、Figma、包导出和 npm beta 本身是健康的。重复失败集中在更上一层：

1. case study 即使违反设计系统规则，也可能显示为通过；
2. 消费者被要求先查询 CLI，但独立项目根本装不到它；
3. GitHub 唯一必需的状态检查不包含 Web 视觉回归；
4. 高频复用的应用壳仍是 copy-only draft，safe area、固定栏和滚动归属会继续分叉；
5. 产品插画被留给产品处理，但系统没有提供合规的产品 token 扩展边界。

**加固成熟度：13/20。** 核心足够扎实，可以继续建设；发布门禁和消费者反馈回路还不足以让“绿灯”自动等于“证据完整”。

| 维度 | 分数 | 证据 |
| --- | ---: | --- |
| Token 与合同基础 | 4/4 | DTCG、角色、Figma、Swift、控件对齐检查通过。 |
| Renderer 与包正确性 | 4/4 | React、Swift、iOS 宿主、打包消费和 registry-only smoke 通过。 |
| 视觉回归覆盖 | 3/4 | Storybook 与固定模拟器 iOS 基线存在；产品路由仍只是非阻断计划。 |
| 消费者可发现性 | 1/4 | 独立消费者无法执行规定的 `atom63 build` 路径。 |
| 证据与合并治理 | 1/4 | case 质量失败仍可通过，Web 视觉回归也不在 required status 内。 |

## 范围与验证

本次审计基于本地最新 `main` 状态 `29e5fe78`，并结合最近 13 组 Web/iOS 重跑。已经在 PR #223–#244 修掉的单组件问题不重新立项。

以下检查全部通过：

- token 生成、角色、DTCG、z-layer、Figma 同步；
- 组件合同、iOS 无障碍合同、Swift 冻结公共 API；
- 3 档尺寸、8 组轴组合的跨 renderer 控件对齐；
- 所有发布包的构建、类型检查和测试；
- 53 个 Swift package 测试、15 个 iOS demo UI 测试；
- Storybook 视觉基础设施、视觉 QA matrix、monitor evidence matrix；
- tarball 消费 smoke、registry-only beta smoke、Vite 示例构建；
- 包导出、API report、依赖版本、root-entry 依赖策略。

当前 `main` 的 Web visual workflow 是绿的。这里指出的是未来 visual 变红时仍可能合并的门禁缺口，不是说现在已有视觉回归。

## 已确认的 P1 加固项

### P1.1 — 把 Web 视觉回归纳入 required merge result

**预期。** PR 只有在审过的视觉基线仍然匹配时才能合并。

**现状证据。** 仓库 Ruleset 只要求 `ci-status`。`.github/workflows/ci.yml` 的 `ci-status` 聚合了 `changes`、`verify`、`docs`、`storybook`、`cross-browser`、`ios`、`ios-snapshots`，但 Web 视觉对比在独立的 `.github/workflows/visual.yml` 中，没有进入 required status。

**影响。** Storybook 截图回归即使在 GitHub 上清楚失败，也不一定阻止合并。基线能力是好的，执行门禁不完整。

**加固。** 把 visual job 接入 required aggregate，或让 visual workflow 上报一个固定、被 Ruleset 要求的 status。基线更新继续保持手动触发、bot 提交。

**回归验证。** 建一个测试 PR，故意修改视觉 story 且不更新基线；在 visual 通过前必须无法合并。

### P1.2 — 建立唯一的 case-study 有效性门槛

**预期。** 一个成功 case 应证明 builder 确实改了源码、遵守系统规则、构建成功，并产出了可 review 的截图。

**现状证据。** `~/Projects/atom63-case-studies/batch.sh` 只把 `error` 和 `build.ok` 当失败。Codex 重跑中：

- `lesson-path` 带着 20 个 `raw-color`、0% 系统组件占比仍被判通过；
- `audio-player` 带着 6 个 `raw-color`、0% 系统组件占比仍被判通过；
- `product-buy` 带着 `button-without-variant` warning 仍被判通过。

**影响。** 现在“全部通过”实际只表示“全部能 build”，并不能证明设计系统正确表达了这些界面，因此会把后续加固引向错误层级。

**加固。** 有效结果至少必须同时满足：

1. 确实产生源码修改；
2. typecheck 与生产构建通过；
3. `craft.length === 0`；
4. literal color 与 palette utility 为空，除非显式声明了产品 token 扩展；
5. 必须清零的 warning 为空；
6. 指定 viewport 的截图存在；
7. 结果记录精确的包 tarball/commit、builder 和 model 设置。

系统组件占比继续作为诊断指标，不设成通用硬阈值，因为有些参考本来就是产品专属。

**回归验证。** 给 harness 增加三个 fixture：build 成功但含 raw color、缺 variant、没有源码变化，三者都必须让 batch 失败。

### P1.3 — 让独立消费者真的能走规定的 CLI 路径

**预期。** Builder 写 UI 前先查询系统，从 `atom63 build <idea>` 开始。

**现状证据。** `@atom63/cli` 是 `private: true`、版本 `0.0.0`，也不在发布包列表中。独立 case 模板安装了各包 tarball，但没有 CLI。6 个 Codex Web case 中有 5 个明确记录 `atom63` 不可用；另一个只是直接读包 API，并没有证明 CLI 路径。

**影响。** 系统里杠杆最高的部分——连接 template、contract、example、token 的索引——恰好在独立 builder 最需要时缺席。结果就是手工查 export、漏掉 `AppView` 等可复制资产，或重写已有能力。

**加固。** 选择一个真正支持的分发方式，并把它当消费合同测试：

- 推荐：发布 `@atom63/cli`，作为项目 dev dependency 安装并暴露 `atom63` binary；
- 备选：把生成索引和一个极小可执行入口随已有发布包提供；
- 仅限 harness 的退路：把私有 CLI 和其他 tarball 一起 pack，但不能把它当真实外部消费者可安装的证据。

**回归验证。** registry-only smoke 项目必须在无法访问 monorepo 的情况下执行 `atom63 build`、`component`、`example`、`token`。

### P1.4 — 把应用壳从复制草稿提升为受支持 primitive

**预期。** Phone 与 full-window app 共享同一个 safe area、滚动与固定栏合同。

**现状证据。** `AppView` 目前是 draft、copy-only page template。`atom63 component app-view` 返回 `component.not_found`。7 个 Claude r11 Web 重跑全部复制或本地引用了它；独立的 `listing-detail` 则记录无法 import `AppView`，转而做本地 shell。重复 GAPS 集中在 top bar border、bottom bar ownership、persistent sheet、safe-area inset、tab bar flush，而不是具体业务内容。

**影响。** 产品组合可以复制，但 shell 所拥有的行为不应分叉：哪个区域滚动、每条边由谁吃 safe-area、固定栏怎样叠放、phone form factor 怎样声明。

**加固。** 把行为壳发布到 `@atom63/ui-react/layout`，音乐/player 示例仍留在 template。只稳定最小合同：`layout`、`topBar`、`panel`、`children`、`bottomBar`、`tabBar`，以及明确的 inset/edge ownership。地图、sheet、媒体控制、商品布局不要进 core。

**回归验证。** 用一个 desktop app case 和三个 phone case，覆盖 top bar、固定底部 action、tab bar 的不同组合；每条边只能有一个 inset owner，页面只能有一个主 scroll owner。

## 已确认的 P2 加固项

### P2.1 — 定义产品与插画 token 的边界

**预期。** 产品拥有插画和品牌内容，但颜色仍然来自 token。

**现状证据。** Agent 规则要求所有颜色都必须是 `--a63-*`，完全禁止 literal。已有 case-study 决策又把 artwork placeholder 留给产品处理。两者之间没有被文档化、也没有机器检查的产品 token 扩展机制。lesson/audio 因而只能违反 `raw-color`，或错误复用 status/category token。

**影响。** 为每张插画扩张 core palette 会污染系统；禁止产品 token 会让真实产品视觉无法表达；拿语义 token 当装饰色则会制造错误含义。

**加固。** Core semantic palette 保持封闭，同时加入明确的 app-owned DTCG 扩展：

- 产品 token 使用显式命名空间，例如 `--product-*`；
- 原始值只存在于产品 DTCG palette，不写在 CSS/JSX 使用点；
- 语义 UI 禁止消费 artwork token；
- `check:craft` 接受已声明的产品 token，但继续拒绝组件使用点的 literal；
- Figma import 保持相同 namespace 和分层。

**回归验证。** 同一张插画使用声明过的 product token 时通过，直接内联相同颜色时失败；status 组件使用 artwork token 也必须失败。

### P2.2 — 在继续增加组件 variant 前，先实验 semantic region

**预期。** 放在深色品牌 hero 或未知媒体上的 subtree，会一致获得 foreground、muted foreground、control surface、border、focus ring。

**现状证据。** 系统已有扎实的 `on-media` token 和单组件 overlay variant，但没有 region 级 axis。多个 case 重复要求 on-brand field、avatar、text、control。PR #244 解决了 portal 的 theme 继承，但没有建立 region contract。

**影响。** 给每个组件分别添加 `inverse` 或 `on-media` 会持续膨胀 axis，compound content 仍然不一致。

**加固。** 先原型验证一个很小的 region scope：`default`、`inverse`、`on-brand`、`on-media`，只重映射 subtree 真正需要的 semantic role。在所有 theme/brand/mode 下验证对比度后再决定是否公开。如果 field 和 focus 无法安全表达，就保留显式组件 variant；不能只凭命名直接承诺 region API。

**回归验证。** 同一组 compact form、avatar row、toolbar 在所有 region 和 theme matrix 下渲染，fixture 中不允许组件级颜色 override。

### P2.3 — 把视觉证据整理成一个分层 matrix

**已经成立。** 每个 Storybook story 都有提交的 Linux baseline，并由 visual workflow 对比；iOS catalog 在固定模拟器上也有提交的 baseline；当前 main 全绿。

**缺口。** 产品路由 visual QA matrix 自己已经声明：缺少确定性 route baseline、完整 state coverage、可重复的 reduced-motion/focus capture。Case-study 截图适合研究，但不是耐久合并门禁。本地缺固定 iOS runtime 时，snapshot runner 会切到 git-ignored baseline，并自动记录缺失的本地图片；因此本地命令返回成功，不等于提交基线一致。

**加固。** 保持三层证据：

1. component story：必需的确定性 baseline 与 state/interaction coverage；
2. renderer catalog：固定 iOS/Figma parity 证据；
3. application route：少量稳定路由，覆盖 app shell、theme、viewport、focus、reduced motion。

所有报告必须标注 `authoritative`、`diagnostic` 或 `inconclusive`。iOS 本地 fallback 应明确落盘为 `inconclusive`，不能看起来与 committed-baseline compare 完全相同。

### P2.4 — 用有 owner 的 exception 取代纯数字债务预算

**现状证据。** `@atom63/ui-react` 正好允许 11 个 lint warning，其中包含 Carousel pointer-only interaction、`autoFocus`、video 无 captions。Craft baseline 允许 5 个 mode branch，但只是计数 key，没有 owner、原因和到期时间。

**影响。** 数字预算会把当前恰好占坑的 warning 正常化，也无法区分合理平台例外与无障碍债务。

**加固。** 使用结构化 exception ledger：rule、file、窄范围 match、reason、owner、expiry。新例外默认失败，修掉后必须删除。无障碍 warning 不与样式或测试代码 warning 共用预算。

### P2.5 — 停止只靠一个不断上调的总 bundle budget

**现状证据。** `@atom63/ui-react` 发布 JS 总量为 96.1 kB gzip，预算 97 kB。历史注释显示每加一组能力就上调一次上限。Root dependency guard 很有价值，但目前只隔离 `react-day-picker`。

**影响。** 这个检查可能因为下一个很小功能直接阻断，却说不出哪个消费者路径变慢；也可能再次上调而没有架构决策。

**加固。** 总包体积保留为信息指标，真正门禁改为几个代表性 consumer entry graph：root、layout、theme、media、calendar。除非有测量过的消费者需求，否则冻结 root 新依赖；大型可选 family 放到 subpath。

## 不应进入 core 的内容

重跑还发现了地图、吉祥物、专属字标、商品格式卡、音频 transport layout、照片 mosaic、聊天 wallpaper、数字 keypad。这些是产品 pattern 或资产，不是 Atom63 必须新增同名 core component 的证据。

同样，不建议重写现有 token 架构。本次验证中 selection、disabled role、brand gradient、pill radius、on-media token、生成 renderer contract、Figma/Swift parity 都守住了。

## 推荐顺序

1. **Evidence gate PR：** 严格 case validity，并把 Web visual regression 接入 required status。先让后续证据可信。
2. **Consumer path PR：** 选择并实现可安装 CLI，再加入 registry smoke。
3. **Layout contract PR：** 在 `ui-react/layout` 发布最小 `AppView` 行为壳，补 safe-area 与 scroll-owner 测试。
4. **Token boundary PR：** 文档化并强制 product-token extension，不扩张 core semantic palette。
5. **Region experiment：** 先在 story 与 case 验证，再提出 public API。
6. **Governance PR：** 结构化 exception ledger 与 per-entry bundle budget。

完成这些后，不需要把所有 case 再跑一遍，先跑代表性矩阵：

- fintech/social：brand 与 media region；
- settings/listing/ride：shell、safe area、persistent surface；
- chat/product：compound composition；
- lesson/audio：product-token extension；
- store：tabs 与 indicator。

Web 与 iOS 各用两个独立 builder。先过 validity gate，再做视觉判断；视觉判断不能替代有效性检查。
