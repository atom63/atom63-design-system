# F1 实施方案：冻结意图层

> 2026-10-10。依据 [`roadmap-next.md`](./roadmap-next.md) 中已确认的决定：N1（组件意图用中立数据）、N2（语义轴）、N3（shadcn 角色名）、N4（旋钮放刻度层，主题作为第四层）、N9（Figma 三层）、N10（单向同步）、N13（HIG 字体角色）。
> 事实来自三路只读调研：token 词汇层、组件意图数据层、Figma 生成链路。文中的文件和行号指写作时的 `main`。

## 目标与完成标准

F1 要把“设计意图”冻结成一份中立的数据，各端只做适配。完成时满足：

1. 语义角色、字体角色、尺寸刻度都只有一个源头；Tailwind 主题和 shadcn 兼容层由生成器写出，不再手写两份。
2. 69 个组件 contract 的源头是 JSON；TypeScript、Swift、文档和 agent 索引都由它生成；Button、Badge、Input 三个组件按语义轴（N2）定义。
3. Figma 草稿本按 N9 的三层结构重新生成，Professional 套餐装得下；iOS 用的渲染模型和草稿本模型分开。
4. 每一步都能证明“没有意外变化”：API 报告零 diff、导出值快照一致、生成物 `--check` 通过、视觉基线只在预期处变化。

## 前置条件

- **#146（Windows 兼容）先合并。** 本方案的 PR 都从合并后的 `main` 开分支；在此之前开的分支以 #146 为基础。
- **Playwright Chromium：** `generate:tokens`、`check:figma` 和所有 `*.browser.test.ts` 都要用。CI 里已经有；本地要先跑 `pnpm exec playwright install chromium`。
- **macOS：** Swift 的构建和测试只能在 CI 的 iOS 任务里跑，涉及 Swift 的 PR 以 CI 结果为准。

## 调研中更正的事实

- **多轴依赖的 token 是 57 个，不是 183 个。** 183 条是 Figma 同步模型的跳过记录（99 个 token），原因是字符串类型、媒体查询条件、上下文作用域等。真正随多个轴变化的是 57 个 `computed` 项，分布见 F1c。路线图已经更正。
- **状态色的前景色有对比度 bug。** `--a63-status-{success,warning,info}-foreground` 都是白色（`semantics.css:122-124`），在实心底上不达 AA：warning 浅色 3.60:1、深色 2.15:1，success 3.95:1、2.46:1，info 深色 3.51:1。
- **shadcn 桥接写了两份。** `tailwind/theme.css:344-376` 和 `compat/shadcn.css:11-52` 是同一套映射，手写、互不校验。
- **字号刻度是 xs–9xl 共 13 档**，不是 xs–5xl；而且有两套比例（`[data-a63-type-scale]` 的 0.9–1.2，和 `.text-scale-*` 的 0.8–1.4）。
- **iOS 的 token 生成直接读 Figma 同步模型**（`ui-ios/Scripts/lib/theme-graph.mjs`、`generate-swift-tokens.mjs`）。所以 Figma 的结构不能直接改，要先把“渲染端模型”和“草稿本模型”分开。

---

## F1a 冻结词汇

### F1a-1 语义角色只有一个源头，并补齐角色

- **做什么：**
  - 在 DTCG 里新增一份角色表：shadcn 角色名 → `--a63-*` token。由生成器写出 `tailwind/theme.css` 的语义部分和 `compat/shadcn.css`，加一个 `--check`。
  - 补齐角色（N3）：
    - `destructive-foreground` → `action-danger-foreground`；
    - `success`、`warning`、`info` 的 `-foreground`：改用和 `primary-foreground` 相同的自动对比度公式（`oklch(from <底色> clamp(...) …)`）。这一项同时修掉上面的对比度 bug；
    - `surface-sunken` → `surface-control`；
    - `selected` / `selected-foreground`：新值（`action-primary` 12% 混透明 / `text-accent`），需要视觉评审；
    - `chart-1..5`：`chart-1` 用 `action-primary`，`chart-2..5` 用 teal、amber、violet、rose（浅色 500、深色 400）。
  - 在文档里写明 `accent` 的含义：中性的悬停或高亮底色，不是品牌色。
  - 更新 Swift 生成器的颜色表（`generate-swift-tokens.mjs:163`、`:354`），重新生成 agent 索引。
- **破坏性：** 全部是新增；只有状态色前景从白色改为自动对比色，视觉上会变（这是修 bug）。
- **验证：** `pnpm --filter @atom63/styles generate:tokens`，然后 `check:dtcg`、`check:tokens`、`check:figma`、`test`；`pnpm --filter @atom63/ui-ios check:swift-tokens`；`pnpm check:agent-index`；Storybook 视觉基线只在状态色处变化。
- **changeset：** `@atom63/styles` minor。

### F1a-2 tint 配对和分类色

- **做什么：**
  - 新增 `{destructive,success,warning,info}-subtle` 和 `-subtle-foreground`，统一用 14% 的浓度。现在 Badge 里分别是 14%、12%、15%。
  - 新增 `category-<hue>`、`-subtle`、`-subtle-foreground`，覆盖 22 个色相，补上 slate、gray、zinc、stone 这 4 个中性色调。
  - amber 的分类色改为 warning 色阶的别名，让两者变成同一个色相。
  - 把 `badge.resolver.json` 和 Badge recipe 改为引用这些角色。
- **破坏性：** Badge 的视觉会小幅变化（浓度统一、amber 换成 warning 色阶），视觉基线要更新。
- **验证：** 同 F1a-1，加上 `pnpm --filter @atom63/ui-react check:utilities`、`pnpm check:craft`、Storybook 视觉测试。
- **changeset：** `@atom63/styles`、`@atom63/ui-react` minor。

### F1a-3 媒体表面、11px 字号和 HIG 字体角色

- **做什么：**
  - 新增 `--a63-media-surface`，取 `surface-dark-2`。它跟随 surface 色族，但不随明暗模式变化。
  - 字号刻度新增 `2xs`：11px，行高 13px。
  - 字体角色（N13）作为 DTCG 的 typography 复合 token，每个角色记录各平台的取值：
    - Web：取哪一档刻度、字重；
    - iOS：`textStyle`、字重、Dynamic Type 策略（`system`、`bounded` 或 `fixed`）。
  - 生成 `--a63-type-<role>-*` 和 `text-<role>` utility，iOS 生成 `Font.TextStyle` 的映射。
- **Web 的映射**（字号分别是 xs / sm / md 三档窗口宽度下的 px）：

  | 角色 | Web | iOS 默认 |
  |---|---|---|
  | large-title | 6xl：28 / 31 / 34 | 34 |
  | title-1 | 5xl：26 / 28 / 30 | 28 |
  | title-2 | 3xl：21 / 23 / 24 | 22 |
  | title-3 | 2xl：19 / 20 / 21 | 20 |
  | headline | base，字重 600 | 17 |
  | body | base | 17 |
  | callout | base | 16 |
  | subhead | sm | 15 |
  | footnote | xs | 13 |
  | caption-1 | xs | 12 |
  | caption-2 | 2xs | 11 |

  `-strong` 变体：title 类用 700，其余用 600。iOS 的数值已经和 Apple HIG 的数据核对过。
- **决定（按推荐直接执行）：** Web 的正文保持 15px，不跟 iOS 的 17px 对齐。Web 和 iOS 本来就各有习惯字号，角色层只保证“同一个意图”，具体数值按平台给。
- **验证：** 同 F1a-1，加上 `pnpm check:theme-authoring`、`check:token-economy`、`pnpm api:report`。
- **changeset：** `@atom63/styles` minor。

### F1a-4 色板按需引入、锁定 Tailwind 主题（等 N6）

- **做什么：**
  - 从 `foundation.css` 里去掉 `palette.css`；
  - 把 `tailwind/theme` 拆成两份：一份只有语义角色，开头用 `--color-*: initial` 清空默认色板；另一份是 `tailwind/primitives`，作为显式的逃生口；
  - 同步更新文档站、starter 和 Badge（Badge 的分类色在 F1a-2 之后就不再直接依赖色板）。
- **状态：** 依赖 N6（Tailwind 锁到什么程度），**N6 确认后才做**。
- **验证：** `pnpm check:starter`、`pnpm build:docs`、`check:package-surface`、`check:ds-pack-smoke`、视觉测试。

---

## F1b 组件意图数据

### F1b-1 schema、导入器和生成器（行为不变）

- **做什么：**
  - 新增 `packages/ui-foundation/contracts/schema/component-intent.schema.json`。
  - 写一个一次性的导入器：用 Vite SSR 加载现有的 69 个 TS contract，机械地写成 `contracts/components/<slug>.json`。`input` 包含 `parts.group`；共用的 selection token slot 放进 `contracts/shared/`。
  - 把 `cross-renderer-contracts.json` 的 27 条并进同一份数据，删掉冗余的 `foundationContract` 字段。
  - 生成器写回 `src/components/<slug>/<slug>-contract.ts`：路径、导出名、元组顺序都和现在一样，文件头标明 Generated。同时生成 barrel，并去掉现在用正则读 TS 的代码。
- **一次性切换全部 69 个，不让两套源头并存。** 这一步不改任何轴，只换源头。
- **证明没有变化：**
  - 切换前，通过 SSR 把 `src/index.ts` 的所有导出值 dump 成快照；切换后逐项比较；
  - `pnpm check:api-report` 零 diff；
  - `generate:contracts --check`、`check:a11y-ios`、`check:agent-index` 通过；
  - React 和 Swift 的 conformance 测试通过；
  - `pnpm --filter @atom63/figma test`、`check:components` 通过（它们用相对路径读 Button 的 contract）。
- **changeset：** `--empty`。

### F1b-2 文档、CLI 和脚手架改读 JSON

- **做什么：**
  - 文档站的 contract 读取逻辑（`apps/docs/src/lib/component-contract.ts`）改读 JSON，去掉按导出名猜轴的启发式代码（`:91-136`）；
  - 组件目录的 `status` 由 `maturity` 字段决定，替代 `component-catalog.ts:650` 里写死的 `stable`；
  - `ds:new` 改为写 JSON，并且每次都运行生成器（现在只有加 `--ios` 时才运行）。
- **验证：** 文档站的测试和类型检查、`pnpm check:agent-index`、CLI 测试、`pnpm test:scripts`、CI 里那条 `ds:new scaffold-probe --dry-run --ios …` 探测命令。

### F1b-3 在 Button、Badge、Input 上试做语义轴（React API 不变）

- **做什么：** 意图层加上 `tone`、`emphasis`、`size`（带 `visualHeight`、`minHitTarget`、`labelTypographyRole`），Web 的映射写进 `platforms.web`。Web 独有的值放进 `extensions`。再加一个不变量测试：每个平台上 `minHitTarget ≥ visualHeight`。
- **Button 的映射：**

  | React variant | tone × emphasis |
  |---|---|
  | default | neutral × solid |
  | primary | primary × solid |
  | secondary | neutral × soft |
  | outline | neutral × outline |
  | ghost | neutral × ghost |
  | destructive | destructive × solid |
  | destructive-outline | destructive × soft |
  | link、overlay、glass | Web 扩展（glass 标为 overlay 的弃用别名） |

  尺寸：sm、md、lg 进意图层；xs、xl、tile 是 Web 扩展；`icon-*` 改写成 `content: icon-only` 乘以对应尺寸。
- **Badge：** 意图层定为 `tone`（neutral、primary、info、success、warning、error）× `emphasis`（solid、soft、outline）；18 个调色板色相作为 Web 的 `hue` 扩展。
- **Input：** 尺寸 sm、md、lg；`unstyled`、`shadow`、`nativeInput` 和数字型的 `size` 属性都是 Web 扩展。
- **决定（按推荐直接执行）：**
  - `destructive-outline` 映射成 destructive × soft，因为它实际画了 10% 的浅色填充（`button.css:293-298`）。React 名字不变。
  - `link` 只作为 Web 扩展，不进 emphasis。意图层保持最小，iOS 没有对应的样式。
  - 状态名的不一致（`focusVisible`、`focus-visible`、`focus`，以及 `resting` 和 `rest`）先在数据里记一张对照表，统一改名留到下一个 breaking beta，避免这一步就动导出。
- **验证：** `check:contracts`、`pnpm check:api-report` 零 diff、ui-react 测试、Storybook 的 a11y 测试。

### F1b-4 生成 Swift 枚举，调整 iOS API

- **做什么：**
  - 由数据生成 `AtomButtonTone`、`AtomButtonEmphasis` 和 `AtomControlSize`；
  - `AtomButtonStyle` 改为公开，以便套在原生 `Button` 上（N8）；
  - 旧的 `AtomButtonVariant` 保留一层兼容并标为弃用；
  - Badge 的 tone 统一用 `error` 并补上 `info`，旧名 `danger` 保留兼容；
  - 文本框加上尺寸信息。
- **验证：** `check:swift-tokens`、`check:api:write` 之后审 diff、CI 的 iOS 任务（`swift test`、演示 app 测试、快照）。
- **changeset：** iOS 包的变更说明，`@atom63/ui-foundation` minor。

### F1b-5 CI 加固

- **做什么：**
  - `check:contracts` 加进 Linux 的 verify 任务（现在只在 macOS 的 iOS 任务里跑，`ci.yml:361-363`）；
  - 用 zod 校验 JSON schema（CLI 已经依赖 zod）；
  - 加一个审阅用的 story：每个值在各平台的取值并排展示。

---

## F1c Figma 草稿本

### F1c-1 拆开渲染端模型和草稿本模型（行为不变）

- **做什么：** 把现在的同步模型改名为内部的渲染端模型，iOS 生成器、`theme-graph` 和两个一致性测试改为指向它；`figma-sync.json` 先保持逐字节不变。
- **验证：** `check:figma`、styles 的浏览器测试、`generate-swift-tokens --check`、CI 的 iOS 任务。

### F1c-2 按层级生成草稿本

- **做什么：**
  - 用一张层级表（token 规则 → 集合）替代现在按轴分配的 `axes` / `classify()`。层级表在 `figma-sync-rules.mjs` 里，有单元测试；有 token 没被分配到任何集合时直接报错。
  - 生成 8 个集合：

    | 集合 | mode | 说明 |
    |---|---|---|
    | Primitive | 1 个 | 不发布，scope 为空 |
    | Alias | b1–b6 加 custom | custom 由生成器合成 |
    | Semantic | Light、Dark | 名字用 shadcn 角色名 |
    | Semantic Dimension | 1 个 | |
    | Radius | none、subtle、default、round | |
    | Spacing | comfortable、compact | 控件高度也放这里，存预先算好的值 |
    | Type | md、sm、xs（窗口宽度） | |
    | Font | sans、serif、mono、pixel | 只放每个字体栈的第一个字体族 |

  - 解析时固定：theme 取 modern，neutral 取 n1，design-language 取 web，input 取 pointer，type-scale 取 normal；去掉 contract 层和 Theme 集合。
  - 加一条单元测试：每个集合不超过 10 个 mode。
- **决定（按推荐直接执行）：**
  - 变量名用角色名（如 `primary`）；codeSyntax 继续用 `var(--a63-…)`。它在引擎里是变量的身份，而且 `--a63-*` 才是真正的源头变量，`--primary` 只有引入了兼容层才会存在。
  - Surface（neutral）不是公开的轴（N4），固定在 n1。
  - 57 个多轴 token 的处理：surface-tint 标为 experimental，不进草稿本；控件高度和 menu 的间距都只随 density 变化；阴影改成颜色绑定到品牌变量的 effect style；type-scale 不进草稿本。
- **验证：** `generate:figma` 和 `check:figma`、`pnpm test:scripts`、新增的草稿本一致性浏览器测试（默认环境加每个旋钮各测一遍）。
- **changeset：** `@atom63/styles`。`./figma-sync.json` 是公开导出，这一步对 beta 来说是破坏性变更。

### F1c-3 引擎和插件

- **做什么：**
  - plan/apply 支持 `hiddenFromPublishing`；
  - 改掉“最多 6 个 mode”的提示文字（Alias 需要 7 个）；
  - 为 HIG 字体角色生成 text style；
  - Font 集合只存第一个字体族，修好现在字体绑定总是回退的问题；
  - 插件里那条“解析超过 100,000 字符的 JSON”的测试按新模型调整；
  - 同步更新 `sync.test.ts`、`design-system.test.ts` 等依赖真实模型的测试。
- **决定（按推荐直接执行）：** 草稿本暂时不生成组件，Button 的组件生成器保留但不接入草稿本（N9：“只生成少量核心组件，或者干脆不生成”）。冻结 token-patch 回写：在文档里写明，删掉 CONTRIBUTING 里已经过时的说明（N10）。
- **验证：** CI 的 figma 任务；之后在 Professional 套餐里新建一个文件，手动构建一次。

---

## 顺序和依赖

```
F1a-1 ─┬─ F1a-2
       └─ F1a-3 ──┐
F1b-1 ─ F1b-2 ─ F1b-3 ─ F1b-4 ─ F1b-5
F1c-1 ─────────────── F1c-2（还依赖 F1a-1、F1a-3）─ F1c-3
F1a-4：等 N6
```

- F1a-1、F1b-1、F1c-1 互不依赖，可以并行。
- **先做 F1a-1。** 它最小，而且顺带修掉一个真实的对比度 bug；F1a 后面的 PR 和 F1c-2 都依赖它定下来的角色名。
- 每个 PR 单独评审、单独合并；生成物的 `--check` 都要进 CI。

## 风险

- **视觉变化：** 预期的变化只有三处：F1a-1 的状态色前景、F1a-2 的 Badge、F1a-1 新增的 `selected`。视觉基线在对应的 PR 里更新，并在 PR 描述里逐项说明。
- **一次性切换 69 个 contract：** 靠导出值快照和 API 报告零 diff 兜底；任何一项不一致都不合并。
- **iOS：** 只能在 CI 里验证，F1b-4 和 F1c-1 的周期会比较长。
- **Figma 套餐限制：** 用单元测试锁住“每个集合不超过 10 个 mode”。
