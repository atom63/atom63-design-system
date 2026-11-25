# Token 架构优化计划

> 2026-11-25。依据 [ADR 0009](./adr/0009-opinionated-open-source-for-ai-products.md)（提议中）第 4 条和它的开放问题 1。
> 结论：扩展只走 token 层，消费方不加组件 variant。前提是补上三样东西：一层稳定的公开 token、
> 用一个种子色生成品牌、每个组件都列出 token 槽。另外有两项配套：给消费方的 AI 护栏，以及 dogfood 应用的清理。
> 文中的数字和文件来自 2026-11-24 的只读评估：本仓库 `main`，加上 atom63-vite 的 `main`（08beb78）。

## 目标与完成标准

做完以后，一个开源用户或一个 coding agent 只读公开 token 就能把 Atom63 改成自己的产品，
而且改不坏。具体是：

1. 有一份不大的公开 token 清单，每个都标 `stable`，有文档、有 Swift 名和 Figma 路径。
   其余 token 标 `internal`，消费方用到时会收到警告。
2. 消费方写在自己 CSS 里的覆盖一定生效，不看加载顺序，也不看选择器写法。
3. `brand="#3b82f6"` 或 `atom63 brand <颜色>` 就能生成一套完整品牌：色阶、前景色、
   对比度报告，CSS、Swift、Figma 三端一致。b1–b6 改成六个预设种子，加一个品牌不用再改 8 个手写清单。
4. 80 个组件 contract 都列出 token 槽，recipe 里用到的组件变量全部在 manifest 里，
   并有检查保证两边一致。
5. 消费方默认拿不到 Tailwind 原色板，`atom63 check` 能在消费方仓库里跑和本仓库同一套 craft 规则。
6. atom63-vite 的四个 dogfood 应用零原色板 utility、零十六进制颜色、零覆盖内部 token。

## 现状（2026-11-24）

**底子是好的：**

- DTCG 源头，每个轴一个 resolver，由 `build-css-from-dtcg.mjs` 生成 CSS、Swift 和 Figma 模型。
- 四层结构：foundation 839 条、semantic 650、contract 478、theme 236。
  合计 2,203 条声明，1,218 个不同变量。
- 个性化轴正交，radius、density、type scale 都是单一乘数（见 [roadmap-next.md](./roadmap-next.md) N4）。

**问题在于“哪些能碰”没有边界：**

- **全是 preview。** manifest（`packages/styles/generated/atom63.tokens.json`）里 1,218 个变量的
  `lifecycle` 都是 `preview`，没有一个承诺稳定，也没有标出哪些是内部实现。
- **覆盖靠运气。** token 声明不在 cascade layer 里（只有 `typography.css` 的几条 utility 在 `@layer base`）。
  语义色写在 `:root, [data-a63-mode='light']` 和 `:is(.dark,[data-a63-mode='dark'])` 上，
  主题写在 `[data-a63-theme='…']` 上。消费方在 `:root` 里改一个颜色，到了暗色模式或某个主题下又会被盖回去，
  结果取决于加载顺序和选择器权重。
- **加品牌要改 8 处手写清单。** 按 [`theme-authoring.md`](./theme-authoring.md)，加一个品牌要改：
  - `ui-foundation/src/axes.ts`
  - `generate-figma-sync.mjs`
  - `ui-ios` 的 `theme-graph.mjs`
  - `contrast.browser.test.ts`
  - `figma-parity.browser.test.ts`
  - `color-primitives.stories.tsx`
  - 文档的 `token-meta.ts`
  - `brand-scale-row.tsx`
- **auto 品牌另有一套 JS。** `applyAutoColorRamp`（`ui-react/src/theme/core/auto-primary.ts`）
  原本是给壁纸取色用的。它在 JS 里按 `RAMP_STEPS`（照抄 b1 的 OKLCH 曲线）写 `--color-auto-*`，
  CSS 和 Swift 都拿不到同样的结果。
- **组件槽只覆盖了 10%。** 80 个组件 contract 里只有 8 个写了 `tokenSlots`：
  button、input、select、switch、textarea、toggle、toggle-group、tooltip。
  recipe 里约有 2,885 处 `var(--a63-*)`，约 60% 落在 contract 层。另有 66 个变量不在 manifest 里，
  比如 app-view 的宽度和 art-plate 的几个参数。
- **主题有 283 行写不进 DTCG。** `*.native.css` 里装的是 DTCG 表达不了的值。
  aqua 最多，17 个变量、29 行 gradient 或 color-mix；terminal 11 个、modern 5 个、retro 7 个；
  contract 层还有 9 个文件，各 1–8 个变量。
- **原色板默认就给了。** `tokens/foundation.css:9` 引入 `foundation/palette.css`，
  这是整套 Tailwind 默认色板，22 个色相、243 个颜色。`tailwind/theme.css` 有 407 个 `--color-*`，
  其中约 124 个是语义色，其余是原色（b1–b6、状态色阶、白、黑）。
  所以 agent 写 `bg-blue-500` 不会报错，而 `check:craft` 只在本仓库跑。
- **dogfood 已经在漂移。** atom63-vite `main` 粗略统计：
  - tsx 里约 61 处 Tailwind 原色板 utility：atom63.io 5 个文件，windows-shell 3 个，widgets 2 个，
    os63 和 `packages/os63` 各 1 个；
  - tsx 里约 74 处十六进制颜色（粗 grep，含注释和测试数据，要逐个看）；
  - `apps/learn/src/styles/index.css:85-86` 在 `.docs-shell [data-slot='button'][data-variant='primary']`
    上把 `--a63-action-primary` 设成 `--a63-brand-600`。这条已经过时：设计系统本身就用 600；
  - `packages/timeline/src/ui/controls/toolbar.css` 改了 `--a63-control-radius`，
    detail-drawer 的 CSS 改了 `--a63-drawer-viewport-gutter`。两者都是内部变量。

## 阶段总览

| 阶段 | 内容 | 依赖 | 和路线图的关系 | 适合交给 Codex |
| --- | --- | --- | --- | --- |
| T1 | 公开 token 层：清单、`tier` 字段、cascade layer、`internal-token` 规则 | F1a-1 的角色表 | 和 F1a 一起做 | 否 |
| T2 | 种子色品牌：CSS 生成色阶、`atom63 brand`、品牌单一来源 | T1 定下种子 token 的名字 | F1a 之后，F2 之前 | 部分（单一来源迁移） |
| T3 | 组件 token 槽：80 个 contract 补齐、66 个变量归位、一致性检查 | T1 的 `tier`；F1b 的 contract JSON | 和 F1b 一起做 | 是（按组件族分批） |
| T4 | 主题 native 值收进 DTCG | T1 | F1c 之后 | 部分 |
| T5 | 消费方 AI 护栏：原色板改为可选、`atom63 check`、llms.txt 的 token 部分 | T5a 要等 T6；T5b 要等 T1 | T5b、T5c 并入 F5a | T5b 的规则移植可以 |
| T6 | atom63-vite dogfood 清理 | 无（T1 之后再收尾一次） | 现在就能做 | 是 |

建议顺序：**T6 和 T1 先并行**，T5b、T5c 跟着 F5a 走，接着做 T2 和 T3，T5a 在 T6 做完、
发出一个 beta 之后再做，T4 放最后。

---

## T1 公开 token 层

### T1-1 定清单和命名

- **做什么：**
  - 在 DTCG 源头加一个扩展字段 `io.atom63.tier`，取值 `public` 或 `internal`。
    生成器把它写进 manifest，`atom63 token` 和文档都显示出来。
  - 公开清单控制在 60 个以内，分五组：
    - **语义角色：** F1a-1 那张 shadcn 角色名表（N3），比如 background、foreground、primary、
      primary-foreground、muted、accent、destructive、border、ring，
      以及 success、warning、info 和 chart-1..5；
    - **品牌：** 一个种子（T2 定名，暂定 `--a63-brand-seed`）和色阶 `--a63-brand-50…950`（只读）；
    - **刻度旋钮：** `--radius-multiplier`、density、`--typography-scale`、`--a63-font-app`；
    - **表面：** page、card、popover、control 四个表面和它们的前景；
    - **媒体：** `--a63-on-media-*`、`--a63-media-*`。
  - 公开 token 的 `lifecycle` 改成 `stable`，其余保持 `preview`，并标 `internal`。
  - 写一页文档“扩展 Atom63”：可以改哪些、怎么写主题、为什么不开放组件 variant。
- **破坏性：** 无，只是加标注。
- **验证：** `pnpm --filter @atom63/styles generate:tokens`，然后 `check:dtcg`、`check:tokens`；
  `pnpm --filter @atom63/cli generate:index` 和 `pnpm check:agent-index`；
  manifest 里 `tier: public` 的条数与清单一致。
- **changeset：** `@atom63/styles` minor、`@atom63/cli` patch。

### T1-2 cascade layer：消费方的覆盖一定生效

- **做什么：**
  - 所有 token 声明（foundation、semantic、contract、theme）包进一个具名 layer，
    并在入口最前面声明顺序：`@layer a63.tokens, a63.themes, theme, base, components, utilities;`。
    `theme` 之后的几个是 Tailwind v4 自己的 layer。
  - 这样消费方写在任何 layer 之外的覆盖，比如 `:root { --a63-primary: … }` 或
    `[data-a63-theme='mine'] { … }`，一定赢过 Atom63 的默认值，不管加载顺序。
  - 文档给出覆盖的标准写法：明暗分开写在 `[data-a63-mode]` 上，自定义主题写在 `[data-a63-theme]` 上。
- **破坏性：** 有。今天靠加载顺序“碰巧赢”的覆盖结果不变；把覆盖写在 `@layer base` 之类 layer 里的消费方，
  结果会变。要在 atom63-vite 的四个应用里跑一遍视觉对比再发。
- **验证：** 新增 `theme-overrides.browser.test.ts` 用例：在浅色、暗色和四个主题下，
  消费方在 layer 之外覆盖一个公开 token，都生效；本仓库 Storybook 视觉基线零变化；
  atom63-vite 的 Storybook 截图比对（#510 加的那套）零变化。
- **changeset：** `@atom63/styles` minor，写明 layer 顺序。

### T1-3 `internal-token` 规则

- **做什么：** `check:craft` 加一条规则 `internal-token`：
  在组件包之外的代码里，读或写 `tier: internal` 的 token 时给警告，并提示最接近的公开 token。
  本仓库的 recipe 不受这条规则约束。T5b 会把它带到消费方。
- **破坏性：** 无，只是警告。
- **验证：** `pnpm check:craft` 加单测；对 atom63-vite 跑一次，应能命中 learn、timeline、drawer 那几处。
- **changeset：** `pnpm changeset --empty`（工具链）。

## T2 种子色生成品牌

### T2-1 CSS 里由种子生成色阶

- **做什么：**
  - 新增 `--a63-brand-seed`。`--a63-brand-50…950` 改为用 CSS 相对颜色从种子算出，
    比如 `oklch(from var(--a63-brand-seed) <L> calc(c * <k>) h)`。
    L 曲线和 chroma 系数取自现在 b1 的 OKLCH 曲线，也就是 `RAMP_STEPS` 的来源。
  - 前景色沿用已经有的自动对比公式（`clamp(0.15, (0.57 - l) * 1000, 0.985)`）。
  - `brand` 轴新增一种取值：任意颜色。React 里写 `brand="#3b82f6"` 或 `brand="oklch(…)"`，
    由 `UIProvider` 写到 `--a63-brand-seed`。
  - `applyAutoColorRamp` 改成只写种子，删掉 JS 里那份色阶。
- **破坏性：** b1–b6 的值要和现在逐级比对。L、C 有偏差时，用每级一个修正值补齐，保证视觉零变化。
- **验证：**
  - `contrast.browser.test.ts` 加一组抽样种子：24 个色相 × 3 档 chroma，
    检查 primary-foreground 和 text-accent 在浅色、暗色下都达 AA；
  - 超出 sRGB 色域的种子要被夹回色域，测试里列出最差的几个；
  - b1–b6 的导出值快照不变。
- **changeset：** `@atom63/styles`、`@atom63/ui-react` minor。

### T2-2 品牌只有一个来源

- **做什么：**
  - 新增 `packages/styles/src/tokens/brands.json`：每个预设品牌一个种子、一个名字、一句说明。
  - 上面列的 8 个手写清单全部改为读这份文件，或由生成器写出。
  - Swift 和 Figma 拿不到 CSS 相对颜色，由生成器把每个预设展开成静态色阶。
- **破坏性：** 无。
- **验证：** `check:figma`、`pnpm --filter @atom63/ui-ios check:swift-tokens`、
  `figma-parity.browser.test.ts`；加一个假品牌 b7 只改 `brands.json`，全部检查通过后删掉。
- **changeset：** `@atom63/styles` patch、`@atom63/ui-foundation` patch。
- **Codex：** 适合。8 个清单的迁移是机械活，一个清单一个提交。

### T2-3 `atom63 brand <颜色>`

- **做什么：** CLI 新命令。输入一个颜色，输出：
  - 色阶，可选 CSS、DTCG JSON、Swift 三种格式；
  - 对比度报告，哪些组合达不到 AA，以及最接近的可用种子；
  - 一段可以直接贴进项目的主题 CSS。

  MCP server 同时提供同名工具，agent 可以直接调用。
- **破坏性：** 无。
- **验证：** CLI 单测：同一个种子，CLI 输出和浏览器里 CSS 算出的值一致（误差在 ΔE 0.5 以内）。
- **changeset：** `@atom63/cli` minor。

## T3 组件 token 槽

### T3-1 一致性检查先行

- **做什么：** 新增 `check:token-slots`：
  - 扫每个组件 recipe 里用到的 `--a63-<component>-*` 变量；
  - 和 contract JSON 的 `tokenSlots`、manifest 两边对账；
  - 先以基线模式落地：记录今天的缺口，只允许缺口变小。
- **破坏性：** 无。
- **验证：** 基线文件里应正好是 72 个没写槽的组件和那 66 个不在 manifest 里的变量。
- **changeset：** `pnpm changeset --empty`。

### T3-2 补齐 72 个组件

- **做什么：**
  - 按组件族分批补 `tokenSlots`：表单控件、浮层、导航、数据展示、媒体、chat 和 AI pattern、布局。
  - 每个槽标 `public` 或 `internal`，规则跟 T1 一样。公开槽只放主题作者真会改的：
    底色、前景、边框、圆角、阴影、高度、内边距。
  - 这一步要等 F1b 把 contract 源头改成 JSON 之后再做。
- **破坏性：** 无，只是加数据。
- **验证：** `generate:contracts`、`check:token-slots` 基线缩小、`pnpm check:agent-index`；
  `atom63 component <slug>` 能列出槽。
- **changeset：** `@atom63/ui-foundation` minor。
- **Codex：** 适合，一个组件族一个 PR。

### T3-3 66 个不在 manifest 里的变量归位

- **做什么：** 逐个分到两类：
  - 主题作者该能改的，比如 app-view 宽度，写进对应 contract 的 DTCG 源头，进 manifest；
  - 纯实现细节，比如 art-plate 的几个参数，改名为私有前缀 `--_a63-*`，并写明不受支持。
- **破坏性：** 改名的那批对消费方是破坏性的。先在 atom63-vite 里 grep 确认没人用，再改。
- **验证：** `check:token-slots` 里这一项清零；视觉基线零变化。
- **changeset：** `@atom63/styles`、`@atom63/ui-react` minor。

## T4 主题 native 值收进 DTCG

- **做什么：**
  - 用已经有的 `io.atom63.derive` 扩展（`brand-action.resolver.json` 里的 brand gradient 就是这么写的）
    表达 gradient 和 color-mix，把 aqua 的 29 行、terminal 和 modern 的 3 行搬进 resolver。
  - 搬不动的，比如依赖媒体查询或上下文作用域的值，留在 `*.native.css`，
    但每一条都登记进 `native-values.json` 并写明原因。
  - 目标：写一个新主题只需要一个 resolver 文件。
- **破坏性：** 无，输出的 CSS 应逐字节相同，或者只有格式差异。
- **验证：** 生成 CSS 的 diff 只有格式差异；`check:figma`；四个主题的视觉基线零变化。
- **changeset：** `@atom63/styles` patch。
- **Codex：** 部分适合。retro、modern、terminal 可以交出去；aqua 量大，要人看。

## T5 消费方的 AI 护栏

### T5a 原色板改为可选

- **做什么：**
  - 默认入口不再引入 `foundation/palette.css`，改为可选子路径 `@atom63/styles/palette`。
    `package.json` 里已经有 `./tokens/foundation/palette` 这个导出。
  - `tailwind/theme.css` 默认只保留语义色、分类色（`category-*`，F1a-2）和 `chart-*`。
    b1–b6、状态色阶这些原色挪到可选的 `./tailwind/primitives`。
  - 结果：agent 写 `bg-blue-500` 时，Tailwind 不生成样式，类型检查和 `atom63 check` 都会报。
- **破坏性：** 有，用了原色板的消费方会掉样式。先发一个 beta 打废弃警告，下一个 minor beta 再改默认。
  atom63-vite 要先做完 T6。
- **验证：** atom63-vite 的 `check:app-consumption` 和 Storybook 截图比对；本仓库的 `check:starter`；
  在 starter 里写一个 `bg-blue-500`，确认不生效且被检查报出。
- **changeset：** `@atom63/styles` minor，写迁移说明。

### T5b `atom63 check`

- **做什么：**
  - 把 `scripts/design-system/lib/craft-rules.mjs` 里适用于应用的规则搬进 `@atom63/cli`，
    让 `atom63 check [paths]` 在消费方仓库里跑：`raw-color`、`unknown-token`、`token-role`、
    `physical-properties`、`focus-visible`、`focus-ring-outline`、`mode-branch`，加上 T1-3 的 `internal-token`。
  - 本仓库的 `check:craft` 改为调用同一份规则，避免两份。
  - 支持 `--json`；MCP server 加一个 `check` 工具，agent 写完就能自查。
  - starter 的 `AGENTS.md` 和 `package.json` 加上这条命令。
- **破坏性：** 无。
- **验证：** CLI 单测用 craft-rules 现有的测试用例；对 atom63-vite 跑一次，结果和 T6 的清单对得上。
- **changeset：** `@atom63/cli` minor。
- **Codex：** 规则移植部分适合。

### T5c 写给 agent 的 token 说明

- **做什么：** F5a 的 `llms.txt` 和消费方 `AGENTS.md` 里加一节 token：
  - 只列公开 token，并指向 `atom63 token` 和 `atom63 brand`；
  - 讲清三件事：怎么换品牌、怎么写覆盖、哪些不能碰。

  内容由 manifest 的 `tier` 生成，不手写。
- **破坏性：** 无。
- **验证：** `pnpm --filter @atom63/cli sync:agents-md`；`check:agent-index`。
- **changeset：** 随 F5a。

## T6 atom63-vite dogfood 清理

在 atom63-vite 仓库做，不改设计系统，所以现在就能开始。

- **做什么：**
  - **T6-1：** 删掉 `apps/learn/src/styles/index.css:85-86` 那条过时的覆盖。
  - **T6-2：** 把约 61 处原色板 utility 换成语义 utility 或 `category-*`，按应用分批：
    atom63.io、windows-shell、widgets、os63 和 `packages/os63`。
  - **T6-3：** 逐个看约 74 处十六进制颜色：
    - 真用于界面的，换成 token；
    - 测试数据、品牌素材、canvas 计算里的保留，并加注释说明。
  - **T6-4：** timeline toolbar 的 `--a63-control-radius` 和 drawer 的 `--a63-drawer-viewport-gutter`：
    - 如果是设计系统该给的公开槽，在设计系统开 issue，等 T3 补上；
    - 否则改用公开 token。
  - **T6-5：** T1-3 和 T5b 做好以后，在 atom63-vite 的 CI 里加 `atom63 check`，
    先以警告模式跑，清零后改为报错。
- **破坏性：** 视觉上应该零变化。凡是变了的地方，说明原来的颜色不在系统里，要逐个确认。
- **验证：** `pnpm check:app-consumption`、各应用 `typecheck`、Storybook 截图比对、
  `node skills/verify-atom63/scripts/verify.mjs journey` 走一遍首页。
- **Codex：** 适合。T6-2 一个应用一个 PR；T6-3 要人看每处是不是界面颜色。

---

## 需要拍板的事

1. **不开放组件 variant**（ADR 0009 第 4 条）。建议：确认不开放。主题作者通过公开 token 和公开槽改外观，
   要新行为就组合组件或提 issue。
2. **公开 token 用 shadcn 角色名**（N3）。建议：是。agent 最熟这套名字，也和 `compat/shadcn` 对得上。
3. **cascade layer**（T1-2）。会改变“写在 layer 里”的覆盖的结果。建议：做，跟 F1a 同一个 minor 发。
4. **原色板改为可选**（T5a）。对用了原色板的消费方是破坏性的。建议：先打废弃警告，下一个 minor beta 改默认。
5. **b1–b6 的去留**（T2-2）。建议：保留，改成六个预设种子。

## 不做的事

- 不开放组件 variant 的扩展点，也不做 contract 继承。
- 不在 Figma 里做种子色生成。Figma 是草稿本（roadmap-next.md 前提 5），只收生成好的预设。
- 不为每个组件槽单独做 Figma 变量。槽数据给 agent 和文档用，Figma 仍按 N9 的三层结构。
