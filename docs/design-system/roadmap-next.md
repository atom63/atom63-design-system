# Atom63 下一阶段路线图（草案）

> 2026-10-09 草案，待拍板。上一份路线图 `roadmap.md` 的阶段 A–E 和模板库已于 2026-09-28 完成。
> 依据：本次全面审查（tokens、React、iOS + Figma、pattern 包、工具链与 CI 五个方向），以及调研报告
> [`research/agent-design-system-harness.md`](research/agent-design-system-harness.md)（2026 年 agent 用设计系统格局、AI 视觉漂移度量、设计师认可的 token 架构），
> 以及使用方漂移基线 [`audits/consumer-drift-2026-10-09.md`](audits/consumer-drift-2026-10-09.md)。

## 已确认的前提

1. **目标排序：**
   - 商用级质量：架构、评测和门禁经得起外部审视；
   - 维护者自己的产品设计开发走这套 harness：更高效、更一致，不重复造轮子，做出来的东西能复用；
   - 开源让别人采用：有更好，不是必须。
2. **主要使用方是 agent。** 人在环时（比如快速做原型），会直接用 Tailwind / shadcn 的习惯改样式。
3. **维护者的产品以 React + Vite + Tailwind 为主。** iOS 端倾向 SwiftUI。
4. **平台无关：** 设计意图是唯一源头，各平台按适合自己的方式采用。
5. **Figma 是草稿本。** 代码是唯一源头，Figma 用 system token 快速探索想法。Figma 结构不依赖 Organization 或 Enterprise 才有的功能（Code Connect、extended collections、变量 REST API），每个集合不超过 10 个 mode。
6. **守卫规则：** 凡是会阻塞 CI，或者要发给使用方的检查，都必须带至少一个已知是坏的反例 fixture。这一条已定，见 N7。

## 结论先行

1. **架构定位升级：** 从“一套 token、三个渲染端”升级为“一份设计意图、多个适配端”。
   - token 层已经做到；
   - 组件层的意图现在写在 TypeScript 里，而且轴带着很重的 Web 味道（见第一节）。这是下一步的结构性工作。
2. **重心转移：** 从“给 agent 提供上下文”转为“agent 写错时被确定性检查拦住”，并且先在维护者自己的 React + Vite + Tailwind 项目里做到。调研里唯一被实测证明有效的手段就是这个：
   - `@shadcn/lint` 自报的评测：给了 lint 反馈后，五个模型的违规都降到 0；
   - 同期，21 个主流设计系统里有 20 个提供 MCP。检索层已经是标配，算不上差异点。
3. **顺序约束：** 先冻结词汇（语义角色名、组件意图轴），再上门禁。lint 会把现有名字固化下来；Figma 里改名或移集合会断引用。
4. **三处收缩：**
   - Figma 收成草稿本：回到 Primitive → Alias → Semantic 三层，单向同步；
   - iOS 按自己 app 的实际需要拉动，不去追 React 的 70 个组件；
   - shadcn 分发放到最后。
5. **质量证明靠什么：** 可复现的评测、能带进别的项目的门禁、真实产品在用。不靠组件数量，也不靠单次 79 比 68 的 vibe 结果。

---

## 一、架构：意图层与适配层

| 层 | 意图（唯一源头） | 现状 | Web 适配 | iOS 适配 | Figma 适配 |
|---|---|---|---|---|---|
| Foundation | DTCG token：值和语义角色 | 已是中立数据，1,603 / 1,669 条由 DTCG 生成 | CSS 变量 + Tailwind theme | 生成 Swift | 变量（草稿本） |
| Component | 组件意图：用途、轴、状态、slot、a11y pattern、共同结果、token slot | 分散在两处：TS contract（69 个，轴带 Web 味）、`cross-renderer-contracts.json`（27 个，已经有 `intent` 字段） | `ui-react`（Base UI + recipe） | 公开的 SwiftUI style 套在原生控件上，外加少量组合视图 | 少量生成组件（可选） |
| Composition | 版式和品味：craft rubric、规则、模板 | rubric 是中立的；模板只有 React 版 | 模板 + registry | 按需写参照实现 | 不做 |
| Harness | 规则表（AGENTS 规则） | 规则本身是中立的，但只在 DS 仓库里执行，而且只管 Web | lint + Tailwind 锁定 + `atom63 check` | Swift 字面值检查 + iOS 版 AGENTS | 可选的 Figma 侧 lint |

**组件层的问题，拿 Button 当例子：**

- React contract（`packages/ui-foundation/src/components/button/button-contract.ts`）有 10 个 variant，混了三类东西：
  - 层级 / 语气：`default`、`primary`、`secondary`、`destructive`；
  - 处理方式：`outline`、`ghost`、`link`、`destructive-outline`；
  - Web 特有的表现：`overlay`、`glass`。
- 尺寸有 11 个，也混进了 Web 特有的 `tile` 和 `icon-*`。
- iOS 映射不了这套轴，于是在 `AtomButton.swift:3-16` 手写了 6 个 variant 和 `compact/regular/large/icon` 四个尺寸，而且没有任何检查。
- `AtomButtonStyle` 是 `private` 的（`AtomButton.swift:170`），原生 `Button` 用不上 Atom 的样式，只能改用 `AtomButton`。

**React 的定位：** React 仍然是参照渲染端，意图先在这里被看见、被验证。这和 `react-first-executable-design-system.md` 的思路一致：Design once, express consistently, implement appropriately。但唯一源头是意图数据，不是 React 代码。

---

## 二、决策点

### N1. 组件意图用什么格式做源头

- **背景：**
  - contract 现在是 `ui-foundation` 里的 TS 文件（`as const` 元组加 `satisfies`）。
  - 跨端生成器用正则读 TS（`generate-cross-renderer-contracts.mjs:84-86`），Badge 已经要靠特例表才能读。
  - iOS 的轴靠手写；`cross-renderer-contracts.json` 是另一份数据，和 TS 是并行的两份。
- **选项：**
  - **A. TS 继续做源头：** 生成器改用 TypeScript 编译器 API 读取，再生成 Swift 枚举。
  - **B. 中立数据做源头：** 用 JSON（或 YAML）加 JSON Schema，从它生成 TS 类型、Swift 枚举、文档页和 agent index；`cross-renderer-contracts.json` 并进同一份数据。
  - **C. 放进 DTCG 的 `$extensions`。**
- **权衡：**
  - A 改动最小，但源头还在一种平台语言里，“平台无关”名不副实。
  - B 的生成链最干净，一份数据管所有端；代价是迁移 69 个 contract。`ui-react` 改为从生成物取类型，调用方不受影响。
  - C 把组件意图塞进 token 文件，DTCG 不是为这个设计的，工具也不认。
- **推荐：B。**

### N2. 组件的轴怎么定义

- **背景：** 见第一节的 Button。SwiftUI 原生用 role（`.destructive`、`.cancel`）加 button style（prominent、bordered、borderless）来表达按钮。shadcn 的 Button 用 `variant` 值：`default`、`secondary`、`destructive`、`outline`、`ghost`、`link`。agent 对这套写法有很强的先验。
- **选项：**
  - **A. 保留现有 Web 轴：** 在数据里声明每个平台支持哪些值，iOS 只取一个子集。
  - **B. 意图层按语义拆轴，各适配层自己映射：**
    - 意图层拆成 `tone`（neutral / primary / destructive）× `emphasis`（solid / soft / outline / ghost / link）× `size`（sm / md / lg）；
    - React 适配层继续暴露 shadcn 写法的 `variant`，由它映射到意图轴；`glass`、`overlay`、`tile` 这类 Web 特有值，标成平台扩展；
    - Swift 适配层映射到 role 加原生 style。
  - **C. iOS 另起一套轴。**
- **权衡：**
  - A 成本最低，但意图仍然以 Web 为中心。
  - B 同时满足三件事：平台无关、贴近 SwiftUI 的模型、保留 agent 熟悉的 shadcn API。代价是 contract 要重新整理一遍，而且必须在 1.0 之前做完。
  - C 等于放弃单一源头。
- **推荐：B。** 先拿 Button、Badge、Input 这三个轴最复杂的组件试做，验证可行后再推广。

### N3. 语义角色怎么命名

- **背景：**
  - 现在用的是 `--a63-action-primary`、`--a63-surface-page`、`--a63-text-secondary` 这类名字，`packages/styles/src/tailwind/theme.css` 再把它们桥接成 `--color-primary` 等。
  - Figma 里没有任何 shadcn 角色名，变量的 codeSyntax 写的是 `var(--a63-…)`。
  - 调研结果：
    - 没有对照研究证明某种命名能提高 agent 的准确率；
    - lint 反馈可以把命名的差别抹平；
    - 生态兼容是实打实的，v0 明确假设项目遵循 shadcn 的 CSS 变量标准。
  - shadcn 的官方集合缺几类东西：状态色（success / warning / info）、表面层级、`destructive-foreground`、选中态。
- **选项：**
  - **A. shadcn 原名，按同样的语法补齐：**
    - 原名有 `background/foreground`、`card`、`popover`、`primary`、`secondary`、`muted`、`accent`、`destructive`、`border`、`input`、`ring`、`chart-1..5`、`sidebar-*`；
    - 补上 `destructive-foreground`、`success`、`warning`、`info`（各带 `-foreground`）、表面层级、`selected`。
  - **B. 保留 a63 命名，只做桥接。**
  - **C. 改用 Material 3 风格。**
- **权衡：**
  - A 让四处用同一套词：人写 Tailwind、设计师在 Figma 里探索、agent 写代码、Swift 的 `Color.atom.primary`。
  - B 不用改，但每个使用方都要面对两套词汇。
  - C 角色最完整，但和 Tailwind / shadcn 生态不通。
- **推荐：A。**
  - 角色名就是意图层的名字；
  - CSS 内部保留 `--a63-` 前缀，避免和使用方自己的变量冲突，同时输出 shadcn 兼容的别名；
  - `accent` 的含义要写清楚，各家对它的理解都不一样；
  - hover、pressed 这些状态留给组件 recipe 处理，不进语义层。

### N4. 1.0 公开哪些个性化轴

- **背景：**
  - 现在有 13 个轴，每多一个轴，视觉基线、iOS 组合和 Figma mode 的成本都会成倍增加。
  - 有 183 个 token 同时随两个轴变化，所以 Figma 和 resolver 都表示不了。
  - 目标 2 只需要自己产品用得上的轴。
- **选项：**
  - **A. 全部公开。**
  - **B. 公开 mode、brand、radius、density 四个：**
    - brand 支持“输入一个品牌色，自动生成色阶”；
    - aqua、retro、terminal 降级为 preset；
    - 其余轴标 experimental。
  - **C. 只公开 mode 和 brand。**
- **权衡：**
  - A 对 agent 来说自由度最大，漂移机会也最多。
  - B 覆盖了品牌化的核心需求，表面积可控。
  - C 最省事，但 radius 和 density 是常见的品牌化手段。
- **推荐：B。** 同时把 token 轴正交化：每个公开的轴只管它自己那批 token，跨轴的部分用别名串起来，消掉那 183 个被跳过的 token。
- **个性化分两类，归属不同：**
  - **独立旋钮**（radius、density、font、type-scale）：属于尺寸这条链，位置在刻度层，作用是给整条刻度做参数化，和颜色链上品牌所在的 Alias 层是同一个位置。现在的代码就是这么实现的：
    - `[data-a63-radius]` 只改 `--radius-multiplier`（0 / 0.5 / 1 / 1.5），整条 `--radius-*` 刻度一起缩放（`tokens/radius.css`）；
    - density 只改 `--a63-space-unit`，控件高度等都从它推导（`contracts/environment.css`、`contracts/control.css`）。
    - type-scale 只改 `--typography-scale`（0.9 / 1 / 1.1 / 1.2），整条字号和行高刻度一起缩放（`tokens/type-scale.css`、`tokens/foundation/typography.css`）。
    - font 的机制不一样，它不是乘数，而是选择：`[data-a63-font]` 把 `--a63-font-app` 指向四个字体族之一（`tokens/font.css`）。这和品牌在 Alias 层“选色相”是同一种动作。
    - window size 不是用户旋钮，而是环境：媒体查询改的是 `2xl`–`5xl` 的展示字号。这些字号同时还乘了 type-scale，所以是同一批 token 上叠了两个轴。CSS 做乘法没有问题，但 Figma 只能预先算好所有组合（4 × 3 = 12 个 mode，超过 Pro 上限）。
  - **尺寸链和颜色链的对应关系：**
    - 颜色：Primitive 色板 → Alias（品牌选色相）→ Semantic（明暗）→ Theme（处理规则）；
    - 尺寸：Scale（旋钮缩放整条刻度）→ Semantic（`radius/control` 取刻度上的哪一档）→ Theme（换一档）。
  - **主题和旋钮不会冲突：** 主题决定“取哪一档”，比如 retro 的 `control-radius` 取 `radius-sm`；旋钮决定“整条刻度多大”。两者相乘：retro 加 round 就是 `radius-sm × 1.5`。`retro.css` 的注释也明确写了：radius 是个性化轴，不是主题常量。
  - **主题**（modern、aqua、retro、terminal）：是一组风格处理的打包。实测四个主题覆盖的大多是组件层 token：
    - aqua 60 条，其中 segment 17、weather 9、surface 8、control 6；
    - retro 44 条，大部分是 segment、weather、control。
    - 只有 terminal 动了 14 个语义色（`text-*`、`border-*`、`action-*`、`surface-*`）。
    - 渐变、光泽、辉光写在 `*.native.css` 里，DTCG 和 Figma 变量都表达不了。
  - **所以主题是第四层，位置在 Semantic 之上：** Primitive → Alias（品牌）→ Semantic（明暗）→ Theme/Component（主题）。
    - 主题默认只覆盖组件层；需要改语义色的主题（如 terminal）放进一张白名单，覆盖的语义 token 按明暗拆开命名，保持“一层只管一个轴”。
    - **判断一个东西归品牌还是归主题：** 品牌决定“用哪些颜色”（身份），主题决定“颜色怎么用”（处理规则）。检验办法是看它和品牌是否正交，也就是能不能套在任意品牌上。
      - terminal 符合这一条：它的语义色不是写死的绿色，而是从品牌色派生出来的，比如 `text-primary: color-mix(in oklch, var(--a63-action-primary) 62%, white)`，表面也混入品牌色。换一个品牌，就得到另一种颜色的磷光屏。
      - 所以 terminal 属于主题层，不该拆成品牌。
    - preset 是“旋钮取值加一个主题”的组合，不新增 token。

### N5. 使用方项目里的门禁做成什么形态

- **背景：**
  - `check:craft` 只在 DS 仓库里跑；
  - `pnpm create:app` 生成的项目只要求 `typecheck` 和 `build` 通过。
  - `@shadcn/lint`（2026-09）的情况：
    - 自称 “agent-first linter for Tailwind design systems”，不要求项目用 shadcn/ui，支持 ESLint 和 Oxlint；
    - 规则有 `no-raw-colors`、`no-arbitrary-values`、`no-unknown-classes`、`no-inline-styles`、`no-restyle`、`require-static-classes`；
    - 厂商自报的评测：150 多次任务，各模型在 lint 反馈下违规都降到 0。
- **选项：**
  - **A. 采用 `@shadcn/lint` 配 Atom63 主题：** Atom63 独有的规则（物理方向、`:focus-visible`、焦点环用 outline）做成一个小的 ESLint 插件；`atom63 check` 只是一层薄壳，统一调用这两样，再加 token 检查。
  - **B. 把 `check:craft` 整套产品化成 `atom63 check`，全部自研。**
  - **C. 只靠 AGENTS 里的规则。**
- **权衡：**
  - A 不重复造轮子，而且有评测数据。风险是它是 0.x 的新项目，能不能加自定义规则还没确认。
  - B 完全可控，但等于重写一个已经存在的工具。
  - C 就是现状，调研表明不够。
- **推荐：A。** 先用第四节的实验验证它和 Atom63 主题配不配得上。验证通过后，把 `atom63 check` 写进 starter 和 AGENTS 的“完成定义”：agent 必须先跑通 check 才算交付。

### N6. Tailwind 锁到什么程度

- **背景：** starter 是 `@import 'tailwindcss'` 全量引入，默认调色板、`p-[13px]` 这类任意值都能用。`theme.css` 还把 `b1-50…b6-950` 这些品牌色阶暴露成了 utility。
- **选项：**
  - **A. 完全锁定：** 重置默认调色板，只暴露语义角色，primitive 不进 utility；另外提供一个显式的 open 变体，作为逃生口。
  - **B. 只锁颜色，不锁尺寸。**
  - **C. 不锁，全靠 lint。**
- **权衡：**
  - A 从源头上拿掉体系外的选项。人做原型时还是用 Tailwind 的习惯写，只是选不到体系外的值。
  - B 和 C 依赖 lint 一直开着。
- **推荐：A。** lint 的 `no-raw-colors` 和 `no-unknown-classes` 再兜一层底。

### N7. 守卫与评测

- **已定（守卫）：**
  - 每个门禁都带反例 fixture，再加一个元检查，确认每个 `check:*` 都有反例；
  - 先修已知会空过的检查：
    - iOS 路径过滤漏掉了 ui-react；
    - 动效检查用的是字符串匹配；
    - iOS conformance 比对的是手抄副本；
    - manifest 的类型和 Figma 集合是推断出来的；
    - `tokenSlots` 没人校验；
    - 逐字节比对在 CRLF 下失效。
- **评测的背景：**
  - vibe 只有 4 个 brief、每个只跑一次。就算四局全胜，单侧 p 也只有 0.0625。
  - 用视觉模型判断两张 UI 哪张更好，准确率约 60%；“易用性”一项接近随机。
  - 同家族的评审模型可能偏向自己生成的结果。
  - Astryx 自己的夜间记录是基线赢 50 次、Astryx 赢 19 次。
- **评测选项：**
  - **A. 保持现有的 vibe。**
  - **B. 拆成两层：**
    - 门禁层：从渲染后的计算样式算确定性的一致性指标，包括 token 遵守率、刻度外的数值、圆角和阴影的种类数、差一点就对齐的元素；
    - 参考层：VLM 评分只作参考。vibe 扩到 15–30 个 brief，每个跑 3–5 次，换用其他模型家族来评审，成对比较时两种顺序都评，报告置信区间。
  - **C. 只用确定性指标。**
- **权衡：**
  - A 的结论在统计上站不住，也撑不起质量证明。
  - B 的成本约为每轮 90–300 次构建，所以要手动或每周跑，不能每晚跑。
  - C 测不到品味。
- **推荐：B。** 评测结果公开，包括 Atom63 输掉的场景。诚实的评测本身就是质量证明。

### N8. iOS 的范围和采用方式

- **背景：** Atom63UI 现在大约有 22 个视图；`AtomButtonStyle` 是私有的；维护者的 iOS 产品倾向 SwiftUI。
- **选项：**
  - **A. 追平 React 的组件数量。**
  - **B. 按自己 app 的需要拉动：**
    - token 走生成；
    - 主要提供公开的 SwiftUI style（ButtonStyle、ToggleStyle、TextFieldStyle 等），套在原生控件上；
    - 外加少量组合视图；
    - 轴由 N1 生成。
  - **C. 冻结 iOS。**
- **权衡：**
  - A 和目标 2 无关，维护成本巨大。
  - B 最符合“按平台合适的方式采用”：原生控件的行为和无障碍能力都白拿。
  - C 浪费了已有的 token 生成和快照基线。
- **推荐：B。** 同时把 harness 带到 Swift：
  - Swift 的字面值检查（现在 craft 规则不扫 Swift）；
  - iOS 版的 AGENTS 规则。

### N9. Figma 草稿本的结构（不依赖高阶套餐）

- **背景：**
  - 现在有 14 个集合，按个性化轴拆分。结果是语义色散落各处：`action/primary` 在 Brand，`action/danger` 在 Mode，`border/control` 在 Theme。
  - Pro 每个集合最多 10 个 mode；Code Connect 要 Organization 及以上；extended collections 只有 Enterprise 能用。
  - Figma 官方 skill 里写的仍是过时的上限（Pro 4、Organization / Enterprise 40）。
  - 改名或跨集合移动变量会断引用。
- **选项：**
  - **A. 保持现状。**
  - **B. 回到 Primitive → Alias → Semantic 三层，每层只承担一个轴：**
    - `Primitive`：调色板和数值刻度（颜色色阶、spacing、radius、字号）。单 mode，不发布，scope 为空。
    - `Alias`：品牌映射，比如 `brand/500` → `blue/500`。mode 为 b1–b6 加自定义品牌，对应 DTCG 里的 `brand-ramp`、`brand-action`。
    - `Semantic`：N3 的角色名（`primary`、`muted-foreground`……）。mode 为 Light / Dark，别名指向 Alias 或 Primitive。
    - 尺寸链和颜色链并列：
      - 刻度集合每个旋钮一个：`Radius`（none / subtle / default / round）、`Spacing`（comfortable / compact）。Figma 变量不能做乘法，所以每个 mode 都存预先算好的整条刻度。
      - `Type` 的 mode 用 window size（md / sm / xs），type-scale 固定为 normal。草稿本里按桌面或手机做设计，比调无障碍字号更常用；type-scale 留在代码里切换。
      - `Font` 单独一个集合，4 个 mode（sans / serif / mono / pixel），值是 STRING 类型的字体族名。只能写单个字体族，取 CSS 字体栈的第一个；这个字体族要在 Figma 里能用。
      - `Semantic Dimension`（`radius/control`、`space/inset`、`control/height`……）单 mode，别名指向刻度集合。
      - 这样在 Figma 里切旋钮，和代码里一样是整条刻度一起变。
    - 品牌 × 模式靠别名链来表达：`Semantic`（按 Light/Dark 解析）→ `Alias`（按品牌解析）→ `Primitive`。Figma 沿链的每一跳都按“使用节点在那个集合选中的 mode”来解析，所以不需要 extended collections。
    - 主题层（见 N4）默认不进草稿本，contract 层（组件原型 token）也不进。理由：
      - 主题覆盖的主要是组件层；
      - 主题 × 明暗放进一个集合，现在就是 8 个 mode，加第五个主题就到了每个集合 10 个 mode 的上限；
      - 渐变、光泽这类处理，Figma 变量本来就表达不了。
    - 要在 Figma 里探索某个主题，就按主题单独生成一份草稿本文件，把主题的语义覆盖直接写进 Semantic 的值里。
    - 像 terminal 这种“从品牌色派生”的主题，Figma 变量表达不了这种混色（composed color 只支持“别名 + 不透明度”），只能预先算好值，每份文件固定一个品牌；如果要同时切换品牌和明暗，mode 会是 7 × 2 = 14 个，超过 Pro 的 10 个上限。
    - 组件只生成少量核心组件，或者干脆不生成。
    - 这也是维护者早期 Figma 文件采用的三层结构（见第三节）。插件的 Import 模式已经在为项目生成类似形状（Palette、Semantic Light/Dark、Brand，变量用 `primary` 这类角色名）；Atom63 自己的模型反而按轴拆成了 14 个集合，这一项是把它收回来。
  - **C. 两层：只要 `Primitive` 和 `Semantic`，品牌不做成 mode。**
- **权衡：**
  - A 对“草稿本”来说太重，设计师也找不到要用的 token。
  - B 是设计师最熟悉的分层，和 Figma 官方参考库 Simple Design System、官方 skill 的推荐一致。一共约 7 个集合，mode 最多的是 Alias（7 个：b1–b6 加自定义），Pro 装得下。
  - C 最轻，但探索品牌时得切换文件。
- **推荐：B。** 既然 Figma 只是草稿本，旧文件不迁移，直接重新生成一个新文件，避开断引用的问题。

### N10. Figma 的同步方向和工具

- **背景：**
  - 现在支持 token-patch 回写，也就是从 Figma 改回代码。
  - Cipher 插件有 Create、Import、构建设计系统三种模式；`@atom63/figma` 另有一条 MCP 同步路径。
  - 插件的主线程、视图和 Figma 适配层都没有测试，lint 允许 36 个警告。
- **选项：**
  - **A. 保持双向同步，插件和 MCP 两条路都留。**
  - **B. 只做单向（代码 → Figma）：**
    - 冻结 token-patch 回写；
    - 引擎只保留一份；对人的入口留插件（不需要高阶套餐，也不依赖 MCP 写入的 beta）；MCP 同步停在现状；
    - 把 Create 的品牌色阶生成器搬到 CLI 或 Web，作为 preset 生成器。
  - **C. 放弃 Figma。**
- **权衡：**
  - A 和“代码是唯一源头”冲突，维护面也最大。
  - B 符合草稿本的定位。在 Figma 里探索出来的东西，这样回到代码：agent 通过 MCP 读设计（只读就够），在代码里实现，再重新同步。
  - C 丢掉了快速探索的能力。
- **推荐：B。**

### N11. 什么时候做开源分发

- **背景：**
  - shadcn 的 CLI v4 提供 `registry:base`、preset 和 skills。
  - v0 Design Systems 2.0（2026-06）把 shadcn registry 这条路标成了 legacy，改为直接从 GitHub 或 npm 导入。
  - Figma Make 的 kit 走的是 npm 包。
- **选项：**
  - **A. 现在就做。**
  - **B. 等 N1–N6 完成后再做：** 词汇冻结，并且 harness 已经在自有项目里证明过有效。届时提供 `registry:base`、preset 生成器和 Atom63 skill。
  - **C. 不做。**
- **推荐：B。** 这一项主要服务目标 3。

### N12. pattern 包怎么定位（inform、agent、widgets、mdx）

- **背景：** 这四个包已经以 beta 发布，唯一的使用方是 atom63-vite。widgets 里有大约 14 处写死的 atom63.io / portfolio 引用。
- **选项：**
  - **A. 全部进 1.0。**
  - **B. 继续保持 beta，作为 patterns，不进稳定承诺。** widgets 在去掉作品集耦合之前不再扩展。
  - **C. 移回 atom63-vite。**
- **推荐：B。**

### N13. 字体用什么角色命名

- **背景：**
  - 现在 Web 用的是尺寸档位名 `typography-xs` 到 `5xl`。iOS 没有从 token 取字体，而是在各个视图里直接挑系统字体样式：`.footnote` 14 处、`.subheadline` 12 处、`.headline` 3 处，等等。两端之间没有共同的字体意图。
  - 早期的 Figma 文件（见第三节）用的是 Apple HIG 的字体角色：large-title、title-1/2/3、headline、body、callout、subhead、footnote、caption-1/2，每个角色还有 `-strong` 变体。这些角色由 `responsive` 集合按 desktop / tablet / mobile 切换字号。
- **选项：**
  - **A. 保持尺寸档位名。**
  - **B. 角色名做语义层，尺寸档位退到 primitive 层：**
    - Web：角色映射到响应式字号，提供 `text-body`、`text-title-1` 这类 utility；
    - iOS：角色直接映射到 `Font.TextStyle`（`.largeTitle`、`.title`、`.title2`、`.body`……）；
    - Figma：角色就是 text style。
  - **C. 两套都公开，不分层。**
- **权衡：**
  - A 改动最小，但 iOS 永远对不上。
  - B 是“设计意图是唯一源头”在字体上最直接的体现：
    - iOS 白拿 Dynamic Type，在 iOS 上 type-scale 旋钮由系统设置代替；
    - Figma 的 text style 名和代码里的名字一致；
    - 代价是 agent 习惯写 `text-sm`、`text-lg`。这一点用 lint 引导：尺寸档位在 utility 里保留，但语义层优先。
  - C 等于给 agent 两条路，本身就是漂移来源。
- **推荐：B。** 和 N3 一起做，这样词汇只需要冻结一次。

---

## 三、早期 Figma 文件的取舍（Design System - A63）

来源：维护者早期的一个私有 Figma 文件。2026-10-09 只读检查过它的变量和样式。

**它的结构：** 4 个集合，就是 Primitive → Alias → Semantic 三层，再加一个响应式集合。

| 集合 | mode | 内容 |
|---|---|---|
| `primitives`（172 个） | 1 | 黑白透明度阶、Radix 风格的 12 档灰（light 和 dark 各一套）、spacing / sizes / container、动效时长和缓动、断点、设备宽度、字体族 |
| `abstractions`（134 个） | 1 | 共 134 个，主要有：`surface/light|dark/1–12` 别名到灰阶；`accent/primary` 和状态色；`rounded/*`；`duration/*`；`zLayer/*`；按断点拆开的字号 |
| `semantics`（45 个） | Light / Dark | `shadcn/*` 36 个角色（含 success / warning / info，sidebar 角色别名到其他语义角色）、`backplate/1–4`、`theme/isDark` |
| `responsive`（23 个） | desktop / tablet / mobile | 11 个字体角色的字号和行高，外加 `viewport/screen` |

另外还有 22 个 text style（HIG 字体角色）、12 个 effect style（`shadow/0–6`、`blur/1–4`、`backdrop-blur/1`），以及 43 个 paint style。

**拿过来的（只取符合现在方向的）：**

1. **HIG 字体角色加响应式集合：** 见 N13，这一项对平台无关最有价值。草稿本的 `Type` 集合（N9）照这个形状生成：角色是 text style，按 window size 切换字号。
2. **shadcn 角色加同语法的状态色（`success`、`warning`、`info`）：** 见 N3，和调研建议补的那几项一致。
3. **分层本身：** 它已经是 Primitive → Alias → Semantic 三层，N9 就是在这个基础上，给 Alias 层加上品牌 mode。

其余内容（具体取值、paint style、`backplate`、动效刻度、z-layer 等）不跟进。现在的 DTCG 源头里已经有各自的版本，需要时以代码为准。

---

## 四、阶段安排

| 阶段 | 内容 | 主要服务的目标 | 依赖 |
|---|---|---|---|
| **F0 前置清理** | Windows 兼容（`.gitattributes`、pnpm 子进程）、发布积压（Version PR #89、`latest` 标签、`@atom63/figma` 的发布状态）、CI 漏洞 | 2 | 无 |
| **F1 冻结意图** | N1–N4、N13：组件意图迁到中立数据、轴按语义重整、角色名、轴收窄和正交化；一套主题 API | 1、2 | F0 |
| **F2 harness 进自有项目** | N5–N7：lint 加 Tailwind 锁定，`atom63 check` 写进 starter 和完成定义；反例 fixture 规则；评测拆成两层 | 2、1 | F1（第四节的实验可以提前做） |
| **F3 iOS 按需** | N8 | 2 | F1 |
| **F4 Figma 草稿本** | N9、N10 | 1 | F1 |
| **F5 开源分发** | N11、N12 | 3 | F1、F2 |

F3 和 F4 互相独立，可以并行。

## 五、最便宜的第一步：验证实验

在一个自有的 React + Vite + Tailwind 产品仓库里做（没有合适的，就用 `pnpm create:app` 生成一个）：

1. 接入 `@shadcn/lint`，配上 Atom63 主题；Tailwind 换成锁定版主题。
2. 准备一组固定任务（8–10 个真实需求），让 agent 分别在开 lint 和关 lint 两种条件下完成。
3. 记录：违规数、修正轮数、token 消耗；再把截图按 craft rubric 评一下，只作参考。

这一个实验同时回答四个问题：
- `@shadcn/lint` 能不能识别 Atom63 的主题，能不能加自定义规则（N5）？
- 锁定 Tailwind 会不会妨碍人做原型（N6）？
- harness 对目标 2 实际有多大用？
- 目标 1 的第一份可复现证据。

这是一次性的实验，跑在词汇冻结之前也没关系，不会把名字固化下来。

## 六、证据质量与缺口

- 领域的横向数据大多来自同一位审计者的 2026-07 快照：Kaelig Deloumeau-Prigent 的 State of AI in Design Systems。
- `@shadcn/lint` 的效果是厂商自报的，每个模型只跑了一次，而且只在 shadcn 词汇内部测过。
- VLM 评审可靠性的研究，用的是上一代模型。
- 没有任何研究直接比较过不同 token 命名对 agent 准确率的影响。
- DTCG resolver 的工具支持很薄：Style Dictionary 不支持，Terrazzo 的文档前后说法不一，Figma 原生导入只能按 mode 逐个处理。所以自研的生成器要保留，但不再扩张。

## 决定记录（待填）

| 决定 | 推荐 | 结论 |
|---|---|---|
| N1 组件意图格式 | B：中立数据加 Schema | |
| N2 组件轴 | B：语义轴，各适配层映射 | |
| N3 语义角色命名 | A：shadcn 原名加同语法扩展 | |
| N4 公开的轴 | B：mode、brand、radius、density | |
| N5 使用方门禁 | A：`@shadcn/lint` 加 Atom63 规则，先做实验 | |
| N6 Tailwind 锁定 | A：完全锁定，留显式逃生口 | |
| N7 评测 | B：两层评测，结果公开 | |
| N8 iOS | B：按需拉动，公开 style | |
| N9 Figma 结构 | B：Primitive → Alias → Semantic 三层，重新生成 | |
| N10 Figma 同步 | B：单向，引擎只留一份 | |
| N11 开源分发 | B：F1 和 F2 之后 | |
| N12 pattern 包 | B：保持 beta | |
| N13 字体角色 | B：HIG 字体角色做语义层 | |
