---
target: Claude vibe case-study batch review
total_score: 22
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 2
target_identity: "file:/Users/yz/.codex-workspaces/worktrees/ios-6e643e92-ec0c-43e2-891a-9ea10cda6769/atom63-design-system/docs/design-system/audits/vibe/2026-09-27-templates"
timestamp: 2026-11-02T05-23-27Z
slug: n-system-audits-vibe-2026-09-27-templates-688edde5
---
# Vibe case-study batch review, 2026-11-01

This review revisits the four committed Vibe cases from 2026-09-27: sign-in, invoice list,
notification settings, and onboarding empty state. It compares the Atom63 and plain arms at
desktop and mobile widths, and compares the baseline run with the later templates-available run.

## Method

Two independent assessments were used. The visual assessment reviewed all 32 archived screenshots
without reading the existing scores. The evidence assessment reviewed the Markdown reports, raw
JSON, briefs, and runner protocol without seeing the visual findings. The original temporary apps
and full-page captures were not retained, so interaction, DOM, and below-the-fold claims could not
be replayed.

The later run is called “templates-available,” not “template-caused.” It changed the repository
commit, runtime, model context, and random generation sample as well as making templates available.
Only notification settings and sign-in have explicit builder evidence of template use.

## Pairwise visual verdicts

| Case | Baseline desktop | Baseline mobile | Templates-available desktop | Templates-available mobile |
| --- | --- | --- | --- | --- |
| Sign-in | Plain | Plain | Plain | Plain |
| Invoice list | Plain | Plain, clearly | Plain | Plain, clearly |
| Notification settings | Plain | Plain, clearly | Plain | Tie |
| Onboarding empty state | Plain | Plain | Plain | Plain |

The visual verdict is not that Atom63 is poor. Atom63 is consistently coherent, restrained, and
predictable. The plain arm usually wins because it adds more product identity, task context, and
mobile information density. The permanent Vibe navigation and appearance controls also consume
valuable task space, especially on mobile.

## What the measurements actually show

| Run | Judge score, DS / plain | Score without token-use, DS / plain | DS / plain builder cost | DS / plain builder time |
| --- | ---: | ---: | ---: | ---: |
| Baseline | 79 / 68 | **67 / 64** | $2.95 / $1.44 | 452s / 367s |
| Templates available | 78 / 68 | **67 / 64** | $2.29 / $1.35 | 395s / 344s |

All eight plain samples scored 1 on token use by construction. Because the original pass rule
rejects any result with a criterion scored 1, the plain arm could not pass regardless of its other
six scores. The headline “4 of 4 pass versus 0 of 4” therefore demonstrates Atom63 token compliance,
not a general visual-quality win. System-component share is likewise an adoption metric rather than
a neutral quality metric.

The deterministic checks remain useful within their proper scope. In the templates-available run,
all arms built and typechecked. Atom63 had zero craft-rule findings and zero palette utilities, while
the plain arm used Tailwind palette utilities heavily. Accessibility was not fully clean: Atom63
onboarding had one `heading-order` axe finding, and plain sign-in had one `region` rule affecting two
nodes.

## Case findings

### Sign-in

Plain wins all four comparisons. Its centered card, brand lockup, product identity, and password
visibility affordance make it feel like a real Tally sign-in. Atom63's form is orderly, but the Vibe
header and six appearance choices dilute the first task and push the card down on mobile. The later
Atom63 result does not show a meaningful compositional improvement.

### Invoice list

Plain wins all four comparisons and has the largest mobile advantage. It preserves result count,
total amount, and denser invoice cards. Atom63's desktop table is clean and its status badges scan
well, but it omits the financial summary. In the later mobile result, every field becomes a vertical
label/value pair, making each invoice card much taller and reducing comparison throughput.

### Notification settings

This is the strongest Atom63 improvement in the later run. The baseline mobile result clips the
In-app column and risks hiding controls; the later result reflows channels into readable rows and
reaches a visual tie with plain. Desktop still favors plain because its matrix, section icons, and
grouping establish a faster mental model. The screenshots do not show save success, failure, dirty
state, or leave-page protection.

### Onboarding empty state

Plain wins all four comparisons through product identity, a personalized welcome, and a stronger
step narrative. The later Atom63 result is materially better than its baseline: it becomes a true
empty state with a clear first action and checklist. It remains visually generic, and the Vibe chrome
and generous vertical gaps delay the first checklist item on mobile.

## Cross-case findings

### Strengths

1. Atom63 maintains consistent action hierarchy, component behavior cues, typography roles, and
   restrained status color across unrelated tasks.
2. Status badges and form/control styling are calm and predictable without turning the page into
   color noise.
3. The later notification and onboarding results show that templates can carry useful page-level
   structure when they are actually used and match the task.

### Priority issues

1. **P1 — Separate evaluation chrome from the product surface.** Move Vibe navigation and appearance
   controls outside captured product pages or into one compact developer menu. They weaken focus,
   product identity, and mobile viewport efficiency.
2. **P1 — Define mobile information-reflow contracts.** Table-to-card templates need explicit
   primary, paired, secondary, and collapsible fields. Require 375px overflow and first-screen-density
   review. The baseline notification clipping and later invoice long cards are the clearest failures.
3. **P2 — Add required domain context to templates.** Financial lists need summaries; sign-in needs
   identity and trust; notification settings need save-state feedback; onboarding needs user or
   organization context. Component assembly alone is not a product page.
4. **P2 — Separate compliance from general craft in the benchmark.** Report token use, craft lint,
   and system share as Atom63 compliance metrics. Use the six non-token criteria, behavior checks,
   and visual-only judging for the neutral quality result.
5. **P2 — Isolate the template treatment.** Compare no-template and template arms from the same
   commit, runtime, model, and permissions; record actual template uptake and repeat each cell.

## Design-health score for the templates-available Atom63 screenshots

This score covers visible evidence only. It does not replace interaction or accessibility testing.

| # | Heuristic | Score | Main limitation |
| --- | --- | ---: | --- |
| 1 | Visibility of system status | 2 | Loading, success, failure, and dirty states are not shown |
| 2 | Match with the real world | 3 | Language is natural, but some pages remain component-generic |
| 3 | User control and freedom | 2 | Limited visible undo, clear-filter, or leave-protection evidence |
| 4 | Consistency and standards | 3 | Components are consistent; responsive information architecture is not |
| 5 | Error prevention | 2 | Constraints and destructive-action protection are not demonstrated |
| 6 | Recognition rather than recall | 3 | Main actions are visible; row actions and help remain hidden |
| 7 | Flexibility and efficiency | 1 | Little evidence of bulk actions, presets, sorting, or accelerators |
| 8 | Aesthetic and minimalist design | 3 | Clean, but demo chrome, excess whitespace, and long cards waste space |
| 9 | Error recognition and recovery | 1 | No archived inline-error or recovery states |
| 10 | Help and documentation | 2 | Onboarding guidance exists; contextual help is uneven |
| **Total** |  | **22/40** | **Acceptable; significant improvement needed** |

## Benchmark redesign

Run three arms from one frozen commit: plain React/Tailwind, Atom63 without templates, and Atom63
with templates. Repeat each brief/arm cell, randomize order, and report confidence intervals and
effect sizes. Use a visual-only judge that cannot see imports, a separate code/accessibility judge,
and a model family different from the builders. Preserve each generated project, diff, lockfile,
full-page PNG, interaction trace, CLI/MCP log, denied-call log, and template-use record. Include
desktop/mobile axe, keyboard, focus return, error/save/loading, RTL, dark mode, and reduced motion.

## Limits

- The archive contains 32 first-screen JPEGs, not the original full-page images.
- The original generated apps and DOM are gone, so detector and browser overlay replay are impossible.
- Running Impeccable detector on the JPEG directory returned `[]`, but scanned zero markup files;
  this is zero coverage, not a clean result.
- Screenshot review cannot verify focus, keyboard behavior, accessible names, contrast, touch target
  size, state persistence, or post-action feedback.
- Cross-run changes cannot be attributed to templates because the treatment was not isolated.

---

# Vibe case study 批量复审，2026-11-01

本次复审覆盖 2026-09-27 归档的四个 Vibe case：登录、账单列表、通知设置和 onboarding
空状态。比较维度包括 Atom63 / plain、桌面 / 手机，以及 baseline / templates-available
两批结果。

## 方法

本轮使用两份互相隔离的评估。视觉评估只查看 32 张截图，不读取 Claude 原评分；证据评估只读取
Markdown 报告、原始 JSON、brief 和 runner 协议，不读取视觉结论。原临时 app 和 full-page
截图没有保留，因此无法重放交互、DOM 和首屏以下内容。

后续批次应称为“模板可用”，不能称为“模板导致”。该批次同时改变了 commit、runtime、模型上下文和
随机生成样本；只有 notification settings 与 sign-in 有明确的 builder 模板使用证据。

## 成对视觉结论

| Case | Baseline 桌面 | Baseline 手机 | 模板可用桌面 | 模板可用手机 |
| --- | --- | --- | --- | --- |
| Sign-in | Plain | Plain | Plain | Plain |
| Invoice list | Plain | Plain 明显胜 | Plain | Plain 明显胜 |
| Notification settings | Plain | Plain 明显胜 | Plain | 平局 |
| Onboarding empty state | Plain | Plain | Plain | Plain |

这不表示 Atom63 的视觉质量差。Atom63 稳定、克制、可预测；plain 多数胜出，是因为它加入了更多
产品身份、任务上下文和移动信息密度。永久存在的 Vibe 导航和外观控件也持续侵占任务空间，手机端尤其明显。

## 数据真正支持什么

| 批次 | Judge 总分 DS / plain | 去掉 token-use 后 DS / plain | Builder 成本 DS / plain | Builder 时间 DS / plain |
| --- | ---: | ---: | ---: | ---: |
| Baseline | 79 / 68 | **67 / 64** | $2.95 / $1.44 | 452s / 367s |
| 模板可用 | 78 / 68 | **67 / 64** | $2.29 / $1.35 | 395s / 344s |

8 个 plain 样本的 token-use 都因实验设定固定为 1 分；原 pass 规则又规定任何一项为 1 就 fail。
所以 plain 无论其他六项多好都无法通过。“4/4 pass 对 0/4 pass”主要证明 Atom63 token 合规，
不能证明普遍视觉质量胜出。System-component share 同样是采用率指标，不是中性质量指标。

确定性检查在正确范围内仍然有价值。模板可用批次中，所有 arm 都能 build 和 typecheck；Atom63
的 craft findings 与 palette utility 均为 0。无障碍并非完全干净：Atom63 onboarding 有一个
`heading-order` axe finding；plain sign-in 有一个 `region` rule，影响两个节点。

## 分 case 结论

### Sign-in

Plain 四组全胜。居中卡片、品牌 lockup、产品身份和密码显示控件让它更像真实的 Tally 登录页。
Atom63 表单秩序良好，但 Vibe header 和六个外观选项稀释首要任务，手机端还会把卡片明显下推。
后续 Atom63 结果没有呈现出实质性的构图提升。

### Invoice list

Plain 四组全胜，手机优势最大。它保留匹配数量、总金额和更紧凑的 invoice card。Atom63 桌面表格
干净，状态 badge 也容易扫描，但缺少财务摘要。后续手机结果把每个字段都改成纵向 label/value，
导致单卡显著变高，多账单比较效率下降。

### Notification settings

这是 Atom63 后续批次改善最明显的 case。baseline 手机端会裁掉 In-app 列，部分控件可能无法触达；
后续版本把渠道重排成可读行，与 plain 达到视觉平局。桌面端仍由 plain 获胜，因为它的矩阵、区块图标
和分组更快建立心智模型。截图没有展示保存成功、失败、dirty state 或离开保护。

### Onboarding empty state

Plain 四组全胜，优势来自产品身份、个性化欢迎和更强的步骤叙事。后续 Atom63 比 baseline 明显好：
它变成了真正的 empty state，有明确首要操作和 checklist。但整体仍然通用，Vibe chrome 和较大的
纵向间距会让手机端第一条 checklist 落到更深的位置。

## 跨 case 结论

### 优点

1. Atom63 在不同任务中维持了稳定的操作层级、组件行为提示、字级角色和克制的状态颜色。
2. 状态 badge 与表单控件安静、可预测，没有把页面变成彩色噪声。
3. 后续 notification 和 onboarding 说明：当模板确实被采用且与任务匹配时，它能提供有价值的页面级结构。

### 优先问题

1. **P1 — 把评测 chrome 与产品界面分离。** Vibe 导航和外观控件应移出被截图的产品页，或收进一个
   紧凑的开发者菜单；目前它们削弱焦点、产品身份和手机 viewport 效率。
2. **P1 — 建立明确的移动信息重排契约。** table-to-card 模板应定义主字段、并排字段、次要字段和
   可折叠字段；验收必须包含 375px 横向溢出与首屏信息量。baseline notification 裁切和后续
   invoice 长卡是最明显的失败。
3. **P2 — 给模板补上不可省略的领域上下文。** 财务列表需要摘要，登录需要身份和信任，通知设置需要
   保存反馈，onboarding 需要用户或组织上下文。组件组合本身还不是产品页。
4. **P2 — 在 benchmark 中分开合规性与一般 craft。** token use、craft lint、system share 应作为
   Atom63 compliance 指标；中性质量结论应使用去 token 的六项、行为测试和 visual-only judge。
5. **P2 — 隔离模板变量。** no-template / template 必须使用同一 commit、runtime、模型和权限，记录
   实际模板采用情况，并对每个 cell 重复采样。

## 模板可用 Atom63 截图的 Design Health Score

该分数只覆盖截图可见证据，不能替代交互和无障碍测试。

| # | Heuristic | 分数 | 主要限制 |
| --- | --- | ---: | --- |
| 1 | 系统状态可见性 | 2 | 没有展示 loading、成功、失败与 dirty state |
| 2 | 与现实世界匹配 | 3 | 语言自然，但部分页面仍像通用组件组合 |
| 3 | 用户控制与自由 | 2 | 缺少 undo、clear filter、离开保护的可见证据 |
| 4 | 一致性与标准 | 3 | 组件一致，响应式信息架构不一致 |
| 5 | 错误预防 | 2 | 未展示输入约束和危险操作保护 |
| 6 | 识别优于回忆 | 3 | 主操作可见，行级操作和帮助仍隐藏 |
| 7 | 灵活性与效率 | 1 | 几乎没有批量操作、preset、排序和快捷路径证据 |
| 8 | 美学与极简设计 | 3 | 干净，但 demo chrome、过多留白和长卡浪费空间 |
| 9 | 错误识别、诊断与恢复 | 1 | 没有归档 inline error 与恢复状态 |
| 10 | 帮助与文档 | 2 | onboarding 有引导，上下文帮助不稳定 |
| **总计** |  | **22/40** | **可接受，但需要显著改善** |

## 下一轮 benchmark 设计

从同一个冻结 commit 运行三臂：plain React/Tailwind、Atom63 不使用模板、Atom63 使用模板。每个
brief/arm cell 重复运行、随机化执行顺序，并报告置信区间和 effect size。visual-only judge 不应看到
import；代码/无障碍 judge 单独评分；评审模型应与 builder 使用不同家族。保存每次完整生成项目、diff、
lockfile、full-page PNG、交互记录、CLI/MCP 日志、denied-call 日志和模板使用记录。行为测试应覆盖
desktop/mobile axe、键盘、focus return、错误/保存/loading、RTL、dark mode 与 reduced motion。

## 限制

- 归档只有 32 张首屏 JPEG，不是原始 full-page 截图。
- 原生成 app 和 DOM 已删除，无法重放 detector 与 browser overlay。
- 对 JPEG 目录运行 Impeccable detector 得到 `[]`，但扫描到的 markup 是 0；这是零覆盖，不是 clean。
- 截图无法验证 focus、键盘、accessible name、对比度、touch target、状态持久化和操作后反馈。
- 两批变化不能归因于模板，因为实验没有隔离该变量。
