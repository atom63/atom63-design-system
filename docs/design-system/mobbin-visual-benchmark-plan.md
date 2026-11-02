# Mobbin-grounded visual benchmark

## Goal

Measure two different strengths of Atom63:

1. Can an agent reproduce a high-quality product interface while staying inside Atom63 contracts?
2. Can Atom63 lead an agent toward the same product patterns when the reference images are removed?

The benchmark does not treat token compliance as visual quality. Token use, component share, and
override count are reported as design-system metrics beside the visual result.

## Research base

The cases are composites. They reproduce structures repeated across several products instead of
copying one product screen.

| Pattern | References | What the case takes from them |
| --- | --- | --- |
| Operations dashboard | [Plane](https://mobbin.com/screens/8a0d7652-7b45-4a3d-ae48-86490ec11520), [HoneyBook](https://mobbin.com/screens/1afda499-c538-4a00-8900-d0a43dffcdfe), [Airtable](https://mobbin.com/screens/30176fb7-8ab7-424a-bd43-109b4b6720d9) | App shell, summary row, mixed chart and list content, contextual side panel |
| CRM contacts workspace | [Quo](https://mobbin.com/screens/bfd73254-7838-4609-a508-18f823d248b9), [Unify](https://mobbin.com/screens/67175309-e399-4414-9467-ad79bc4c7037), [Square](https://mobbin.com/screens/aa3675a7-aeda-4249-8c7d-e43062c9135e), [Calendly](https://mobbin.com/screens/a6435bf5-8a84-4263-9ba5-fa6377fc360a) | Dense table, saved filters, selection, column controls, details panel, completion toast |
| Notification center | [Quicken](https://mobbin.com/screens/46110088-09e5-4a53-b4bb-e3e12e3b2962), [Linear](https://mobbin.com/screens/a0ffb988-a36b-4f3a-b4f6-b14310088981), [Air](https://mobbin.com/screens/37bb2ee4-6859-48e1-aa5d-9b99af7900e4), [Otter AI](https://mobbin.com/screens/5f50fe20-16ef-4103-a53e-f76541a30009) | Global pause, channel controls, grouped events, locked choices, save state |
| AI agent workspace | [Searchable](https://mobbin.com/screens/5b1c6193-7557-47b2-9c17-f5fb0d2e10d2), [Base44](https://mobbin.com/screens/e3c8f50f-2ee3-4140-9331-937d4ccb77d4), [Plane](https://mobbin.com/screens/c02b60e7-2633-460e-844f-bec457ac0d1f), [Voicenotes](https://mobbin.com/screens/d3ad659d-8738-4cb7-bda2-2426b02ca5ae) | Conversation navigation, empty prompt, thinking state, tool progress, composer controls |
| Project onboarding | [Asana](https://mobbin.com/flows/d9cb02c4-7fab-408c-9bc3-8e24fdfae041), [Jira](https://mobbin.com/flows/500d53cb-6fab-464c-b0f5-93c5e694a9e4), [Plane](https://mobbin.com/flows/057f02a0-fd1d-448f-8c31-f71ad02faf52) | Progress, short questions, branching choices, product preview, transition into a real workspace |

## Two test tracks

### Track R: reference reconstruction

Every arm receives the same reference pack:

- one approved desktop target screenshot;
- one annotated layout map;
- the required content and interaction states;
- neutral replacement copy and data;
- no source code, component names, token names, or measurements copied from the target.

This track measures fidelity and constraint cost. A plain arm may use arbitrary Tailwind utilities.
An Atom63 arm must stay within component contracts and tokens unless the reference cannot be reached
without an override. Every override is recorded instead of prohibited.

### Track G: pattern generalization

Every arm receives the same product brief and required states, but no target screenshot or layout
map. The brief is distilled from the reference panel rather than written from Atom63 components.

This track measures whether Atom63 components, templates, CLI guidance, and examples lead an agent
toward the product pattern without a visual target.

Track R answers “can the system express this interface?” Track G answers “does the system lead an
agent toward this interface?” A design system can pass one and fail the other.

## Experimental arms

| Arm | Available tools | Purpose |
| --- | --- | --- |
| Plain | React, TypeScript, Tailwind, Lucide | Open implementation baseline |
| DS core | Atom63 components, tokens, contracts, and component search; templates disabled | Measures component and token expressiveness |
| DS guided | Same Atom63 commit plus `atom63 build`, page templates, blocks, and examples | Measures guidance and composition leverage |

All three arms use the same model, context length, runtime, permissions, dependency versions, and
starting project shell. The evaluation chrome does not appear inside screenshots.

## Benchmark cases

### Phase 1 pilot

#### 1. CRM contacts workspace

Required desktop composition:

- product sidebar;
- page title, search, saved filter chips, filter and column controls;
- dense selectable contact table;
- selected-contact details panel;
- import completion toast.

Required states:

- default list;
- one selected contact with details open;
- filtered empty result with a clear-filter action;
- import in progress and import complete.

Why it is in the pilot: it tests density, table alignment, overlays, status feedback, and how much
custom layout Atom63 needs around existing components.

#### 2. Notification center

Required desktop composition:

- settings navigation;
- global pause control;
- channel-level controls;
- grouped event rows with per-channel choices;
- one locked security notification with a reason;
- save and discard actions.

Required states:

- unchanged;
- dirty;
- saving;
- saved;
- save error;
- quiet-hours enabled.

Why it is in the pilot: it tests repeated controls, matrix alignment, disabled explanations, state
transitions, and responsive reflow.

#### 3. AI agent workspace

Required desktop composition:

- product sidebar with recent conversations;
- empty conversation state with starter prompts;
- message composer with attachment and send controls;
- model or mode selector;
- answer area with tool progress.

Required states:

- empty;
- composing;
- thinking;
- tool running with two completed steps and one current step;
- complete answer;
- failed tool with retry.

Why it is in the pilot: it tests the `@atom63/agent` and chat component boundary, streaming states,
long content, composer ergonomics, and status hierarchy.

### Phase 2 expansion

#### 4. Operations dashboard

Tests page composition, summary density, chart framing, activity content, and contextual details.

#### 5. Project onboarding

Tests a multi-screen journey: profile, workspace, team size, project structure, teammate invitation,
and the first populated workspace. This case is evaluated as a flow, not as one attractive screen.

## Viewports

Track R uses the desktop target as the fidelity reference. Responsive views are evaluated as product
adaptations because the Mobbin web references in this research set do not provide matching mobile
web screens.

Capture every required state at:

- 1440 × 960, primary desktop fidelity;
- 1024 × 768, constrained desktop;
- 768 × 1024, tablet reflow;
- 390 × 844, phone reflow.

The phone result must not be a scaled desktop. Each case defines the information that stays visible,
moves into disclosure, or becomes a separate details view.

## Evaluation

### Visual and product score, 100 points

| Category | Points | Evidence |
| --- | ---: | --- |
| Reference fidelity | 25 | Region geometry, relative spacing, density, typography roles, and control placement |
| Task structure | 20 | Required information, primary task path, and domain context |
| Responsive adaptation | 15 | No overflow, preserved priorities, first-screen density, and touch layout |
| State completeness | 15 | Scripted states render, explain the state, and preserve layout |
| Interaction quality | 10 | Keyboard path, focus return, feedback timing, cancel and retry behavior |
| Accessibility | 10 | axe, names, headings, focus visibility, contrast, zoom, and target size |
| Product specificity | 5 | The result reads as the named product task rather than a component gallery |

`token-use` is not part of this 100-point score.

### Design-system leverage, reported separately

- system component share;
- number and size of local components;
- number of component `className` overrides;
- raw values and unknown tokens;
- CSS lines added;
- contract violations;
- template or block IDs queried and copied;
- percentage of copied template code changed;
- builder time, turns, and cost;
- denied tool calls;
- build and typecheck result.

This report shows whether Atom63 reaches the target through its public system or through local repair.
A visually strong result with heavy overrides is an expressiveness warning, not a clean DS win.

### Deterministic visual checks

- screenshot dimensions and crop consistency;
- horizontal overflow at all viewports;
- control and row height consistency;
- shared alignment edges and near-miss alignment;
- table numeric alignment and tabular figures;
- number of distinct radii, shadows, type sizes, and spacing steps;
- first-screen task-content area after excluding product navigation;
- layout shift between required states;
- pixel and perceptual diff against the approved Track R target by region.

Pixel diff is evidence, not the final verdict. Text rendering and legitimate responsive changes are
masked or scored by region.

### Judges

1. A visual-only judge sees screenshots, the target, and the required-state checklist. It cannot see
   source, imports, arm names, or token data.
2. A behavior and accessibility judge sees interaction recordings, axe output, and the accessibility
   tree. Deterministic failures override model claims.
3. A code judge reviews contract use and override burden. Its score is reported under DS leverage,
   not visual quality.

Pairwise visual judging runs in both orders. The builder and visual judge use different model
families. Each arm and case is repeated at least three times in the pilot.

## Pilot size

The pilot contains:

- 3 cases;
- 2 tracks;
- 3 arms;
- 3 repeated samples;
- 54 builder results before judges.

Start with the CRM case in Track R only. That first slice is nine builders and establishes the
reference-pack format, screenshot comparison, override accounting, and three-arm isolation before
the larger pilot spends money.

## Pass conditions

Atom63 is strong for a case when:

1. DS core matches or beats plain on the visual and product score within the confidence interval.
2. DS guided improves median score, time, or override burden over DS core.
3. No required state, viewport, keyboard path, or deterministic accessibility check fails.
4. The result uses the public component and token system without a large local styling layer.

A case exposes a system gap when DS arms need repeated overrides for the same structure, lose
responsive information priority, or score well only because compliance is mixed into visual quality.

## Implementation order

1. Freeze the CRM reference pack and neutral product copy.
2. Add a third `ds-core` arm and explicit template-disable switch.
3. Remove starter navigation and appearance controls from evaluation screenshots.
4. Preserve generated projects, full-page images, interaction traces, and tool logs.
5. Add scripted states and four viewport captures.
6. Split visual quality from DS leverage in the report.
7. Run the nine-builder CRM Track R pilot manually.
8. Review the pilot before adding the remaining cases or a schedule.

---

# 基于 Mobbin 的视觉 Benchmark

## 目标

这套测试分别测 Atom63 的两种能力：

1. Agent 在遵守 Atom63 contract 的前提下，能否还原高质量产品界面。
2. 去掉参考截图后，Atom63 能否把 agent 带向同一种产品模式。

测试不再把 token 合规当成视觉质量。Token use、组件采用率和 override 数量作为设计系统指标，
与视觉结果分开报告。

## 调研依据

每个 case 都是组合参考，不逐像素复制单一产品。

| 模式 | 参考 | 提取的结构 |
| --- | --- | --- |
| 运营仪表盘 | [Plane](https://mobbin.com/screens/8a0d7652-7b45-4a3d-ae48-86490ec11520)、[HoneyBook](https://mobbin.com/screens/1afda499-c538-4a00-8900-d0a43dffcdfe)、[Airtable](https://mobbin.com/screens/30176fb7-8ab7-424a-bd43-109b4b6720d9) | App shell、摘要、图表和列表混排、上下文侧栏 |
| CRM 联系人工作区 | [Quo](https://mobbin.com/screens/bfd73254-7838-4609-a508-18f823d248b9)、[Unify](https://mobbin.com/screens/67175309-e399-4414-9467-ad79bc4c7037)、[Square](https://mobbin.com/screens/aa3675a7-aeda-4249-8c7d-e43062c9135e)、[Calendly](https://mobbin.com/screens/a6435bf5-8a84-4263-9ba5-fa6377fc360a) | 高密度表格、保存筛选、选择、列控制、详情侧栏、完成 toast |
| 通知中心 | [Quicken](https://mobbin.com/screens/46110088-09e5-4a53-b4bb-e3e12e3b2962)、[Linear](https://mobbin.com/screens/a0ffb988-a36b-4f3a-b4f6-b14310088981)、[Air](https://mobbin.com/screens/37bb2ee4-6859-48e1-aa5d-9b99af7900e4)、[Otter AI](https://mobbin.com/screens/5f50fe20-16ef-4103-a53e-f76541a30009) | 全局暂停、渠道控制、事件分组、锁定选项、保存状态 |
| AI agent 工作区 | [Searchable](https://mobbin.com/screens/5b1c6193-7557-47b2-9c17-f5fb0d2e10d2)、[Base44](https://mobbin.com/screens/e3c8f50f-2ee3-4140-9331-937d4ccb77d4)、[Plane](https://mobbin.com/screens/c02b60e7-2633-460e-844f-bec457ac0d1f)、[Voicenotes](https://mobbin.com/screens/d3ad659d-8738-4cb7-bda2-2426b02ca5ae) | 会话导航、空状态、thinking、tool progress、composer |
| 项目 onboarding | [Asana](https://mobbin.com/flows/d9cb02c4-7fab-408c-9bc3-8e24fdfae041)、[Jira](https://mobbin.com/flows/500d53cb-6fab-464c-b0f5-93c5e694a9e4)、[Plane](https://mobbin.com/flows/057f02a0-fd1d-448f-8c31-f71ad02faf52) | 进度、短问题、分支选择、产品预览、进入真实工作区 |

## 两条测试轨道

### Track R：参考还原

所有 arm 拿到同一套参考包：一张确认过的桌面目标图、一张布局标注图、必须实现的内容与交互状态、
中性替换文案和数据。参考包不提供源码、组件名、token 名或从目标图抄出的尺寸。

这条轨道测还原度和约束成本。Plain 可以使用任意 Tailwind utility；Atom63 必须优先遵守组件 contract
和 token。无法还原时允许 override，但逐项记录，不把它们藏起来。

### Track G：模式泛化

所有 arm 只拿到相同的产品 brief 和必须状态，不拿目标截图与布局标注。Brief 从参考组中提炼，不能按
Atom63 组件反向编写。

Track R 回答“这个系统能否表达该界面”；Track G 回答“这个系统能否把 agent 带向该界面”。

## 实验组

| Arm | 可用能力 | 测试目的 |
| --- | --- | --- |
| Plain | React、TypeScript、Tailwind、Lucide | 开放实现基线 |
| DS core | Atom63 组件、token、contract 和组件查询，禁用模板 | 测组件和 token 表达力 |
| DS guided | 同一 Atom63 commit，额外开放 `atom63 build`、页面模板、block 和示例 | 测指导与组合杠杆 |

三组使用同一模型、上下文长度、runtime、权限、依赖版本和起始 shell。评测 chrome 不进入截图。

## Benchmark Cases

### 第一阶段 Pilot

#### 1. CRM 联系人工作区

桌面必须包含产品侧栏、页面标题、搜索、保存筛选、filter 与 columns、高密度可选择表格、选中联系人
详情侧栏和导入完成 toast。

必须状态：默认列表、选中详情、筛选空结果、导入中、导入完成。

它测试密度、表格对齐、overlay、状态反馈，以及 Atom63 在现有组件之外需要多少本地布局。

#### 2. 通知中心

桌面必须包含设置导航、全局暂停、渠道级控制、分组事件行、一个带原因的锁定安全通知，以及 save / discard。

必须状态：未修改、dirty、saving、saved、save error、quiet hours enabled。

它测试重复控件、矩阵对齐、disabled 解释、状态转换和响应式重排。

#### 3. AI Agent 工作区

桌面必须包含最近会话侧栏、空会话 starter prompts、带附件和发送控件的 composer、模式选择和带 tool
progress 的回答区。

必须状态：empty、composing、thinking、tool running、complete answer、failed tool with retry。

它测试 `@atom63/agent` 与 UI 的边界、streaming state、长内容、composer 和状态层级。

### 第二阶段

运营仪表盘测试页面组合、摘要密度、图表 frame、activity 和上下文详情。项目 onboarding 按完整 flow
测试 profile、workspace、team size、项目结构、邀请成员和最终工作区，不再只看一个漂亮的空状态。

## Viewports

Track R 以桌面目标图做 fidelity 基准。本轮 Mobbin web 参考没有成对的 mobile web 图，因此响应式结果
按产品适配评分，不能声称与 Mobbin 手机参考一致。

每个状态捕获：

- 1440 × 960，主要桌面还原；
- 1024 × 768，受限桌面；
- 768 × 1024，tablet reflow；
- 390 × 844，phone reflow。

手机结果不能只是缩小桌面。每个 case 都要预先定义哪些信息保持可见、进入 disclosure 或转到独立详情页。

## 评分

### 视觉与产品分，100 分

| 类别 | 分值 | 证据 |
| --- | ---: | --- |
| 参考还原 | 25 | 区域几何、相对间距、密度、字级角色、控件位置 |
| 任务结构 | 20 | 必要信息、主任务路径、领域上下文 |
| 响应式适配 | 15 | 无溢出、优先级保持、首屏密度、触控布局 |
| 状态完整性 | 15 | 脚本状态可达、解释状态、布局稳定 |
| 交互质量 | 10 | 键盘、focus return、反馈时机、cancel 与 retry |
| 无障碍 | 10 | axe、name、heading、focus、contrast、zoom、target size |
| 产品特异性 | 5 | 像指定产品任务，而不是组件展厅 |

`token-use` 不进入这 100 分。

### 设计系统杠杆，单独报告

- 系统组件采用率；
- 本地组件数量和体积；
- `className` override 数量；
- raw value 与 unknown token；
- 新增 CSS 行数；
- contract violation；
- 查询和复制的 template / block ID；
- 复制模板后的改动比例；
- builder 时间、turn、成本；
- denied tool call；
- build 与 typecheck。

视觉好但 override 很重，表示 Atom63 表达力有缺口，不能算纯粹的 DS 胜利。

### 自动检查

检查截图尺寸、横向溢出、control 与 row 高度、共享对齐边、近似错位、数字对齐、radius / shadow / type /
spacing 种类、去掉产品导航后的首屏任务面积、状态切换 layout shift，以及按区域计算的 pixel / perceptual diff。

Pixel diff 只是证据。字体渲染和合理响应式变化需要 mask 或按区域评分。

### Judge

1. Visual-only judge 只看截图、目标图和状态清单，看不到源码、import、arm 名和 token 数据。
2. Behavior / accessibility judge 看交互录像、axe 和 accessibility tree。确定性失败优先于模型判断。
3. Code judge 只评 contract 使用和 override 成本，结果进入 DS leverage，不进入视觉分。

Pairwise visual judge 交换顺序跑两次。Builder 与 visual judge 使用不同模型家族。Pilot 中每个 arm / case
至少重复三次。

## Pilot 规模

完整 pilot 是 3 case × 2 track × 3 arm × 3 sample，共 54 个 builder result。

先只跑 CRM 的 Track R。该切片是 9 个 builder，可以先验证 reference pack、视觉对比、override 记录和
三臂隔离，再决定是否扩大成本。

## 通过条件

一个 case 中 Atom63 足够强，需要同时满足：

1. DS core 的视觉与产品分在置信区间内不低于 plain。
2. DS guided 相比 DS core 改善中位分数、时间或 override 成本。
3. 没有 required state、viewport、键盘路径或确定性无障碍检查失败。
4. 主要通过公开组件和 token 达到目标，不依赖大块本地样式修补。

如果 DS arm 反复为同一结构写 override、丢失响应式信息优先级，或必须把 compliance 混入视觉分才显得
领先，该 case 就暴露了系统缺口。

## 实施顺序

1. 固定 CRM reference pack 和中性产品文案。
2. 添加 `ds-core` arm 和明确的模板禁用开关。
3. 从评测截图移除 starter 导航和 appearance controls。
4. 保存生成项目、full-page image、interaction trace 和 tool log。
5. 加入脚本状态和四个 viewport。
6. 报告中拆开视觉质量与 DS leverage。
7. 手动运行 9-builder CRM Track R pilot。
8. 复审 pilot 后再增加 case 或定时任务。
