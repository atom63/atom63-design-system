# 架构加固计划

> 2026-09-24。发布和 1.0 暂缓，先把架构的护栏补齐。按收益和成本排序，逐项做成 PR。

## 现状：已有的护栏

- token：DTCG 源文件 → CSS 生成检查、manifest / Figma 模型 / z-layers / Swift token 的逐字节检查，
  Figma 模型的引用类型一致性检查（#13）。
- 组件：导出清单、稳定性动作矩阵、包内文件清单、打包冒烟、npm 冒烟、体积预算。
- 渲染：446 个 story 的 Chromium 渲染测试和截图视觉回归。
- iOS：跨渲染器 contract 和 Swift token 的生成检查、`swift test`、demo UI 测试。

## 缺口和计划

### 1. 无障碍自动化测试（已完成）

- **结果**：Storybook 接入 `@storybook/addon-a11y`，446 个 story 的渲染测试都跑 axe，违规即失败。
  首次运行 108 个 story 有违规，按类型处理：
  - **story 写法问题**（约 310 处）：演示用的表单控件没有标签。给 90 个裸控件补上描述状态的
    `aria-label`；主题矩阵的说明文字从 `opacity: 0.7` 改为 `--a63-text-secondary`。
  - **组件 bug**（已修，带 changeset）：`AutocompleteInput` 的图标按钮没有名称；`CommandInput`
    缺 `aria-expanded`；`CommandSeparator` 在 listbox 里不合法。
  - **矩阵结构造成的重复 landmark**：`repeatedLandmarks` 参数只关闭两条唯一性规则，并注明原因。
  - **设计 token 造成的对比度不足**：`pendingContrastReview` 参数只关闭对比度规则，等下面的决策。
  - **顺带发现**：Calendar 的 story 用 `new Date()`，截图和 a11y 结果每天都会变；改成固定日期。
- **验证**：去掉一个 checkbox 的标签，测试失败。

#### 待你决定：对比度

- **现状**：默认主色 `#2C7FFF` 上的白字只有 3.6:1，低于 WCAG AA 正文要求的 4.5:1。按钮、选中的
  Tabs / Toggle / 日期、HoverCard 触发器等都受影响（`brand.css` 的注释说明当时有意按大字号 3:1 设计）。
  Badge 的彩色色调（黄、绿、青等）是 1.8–3.6:1。
- **选项**：
  - A. 主操作色改用 `--a63-brand-600`（更深），白字对比度达标；主按钮会整体变深一些。
  - B. 保持主色，把前景色的自动切换阈值从 3:1 提到 4.5:1：中等亮度的主色上文字会变成深色。
  - C. 维持现状，把 3:1 作为有意的例外写进规范，`pendingContrastReview` 长期保留。
  - Badge 调色板单独处理：文字改用同色相更深的一档（例如 700/800）。
- **推荐**：A + Badge 文字加深。符合 AA，品牌色相不变，只是明度加深。

### 1（原计划）无障碍自动化测试

- **现状**：仓库里没有任何 axe 或 a11y 检查，而文档和 contract 都对无障碍做了承诺。
- **做法**：Storybook 接入 `@storybook/addon-a11y`，让 446 个 story 的渲染测试顺带跑 axe。
  先用"报告"模式统计现有违规，逐类修复后改为"违规即失败"，个别确有理由的 story 单独豁免并写明原因。
- **验证**：故意去掉一个按钮的无障碍名称，测试必须失败。

### 2. 类型层面的 API 报告和包正确性（已完成）

- **结果**：
  - `pnpm api:report` 用 API Extractor 为 ui-foundation 和 ui-react 的 6 个入口生成 API 报告，提交在
    `packages/*/api/*.api.md`。CI 的 `pnpm check:api-report` 比对构建出的类型和报告，不一致即失败。
    报告按使用方的方式解析 workspace 依赖（发布的 `.d.ts`，不走 `@atom63/source` 条件）。
  - `pnpm check:package-correctness` 对 styles、ui-foundation、ui-react 的打包结果跑
    `publint --strict`，并对声明了类型的入口跑 `@arethetypeswrong/cli`（`esm-only`：Node16 ESM
    和 bundler 解析必须通过；包本身只发布 ESM，CJS 和 node10 不检查）。当前全部通过。
  - **顺带发现**：报告里记录了 26 处 `ae-forgotten-export`，即公开签名用到、但入口没有导出的类型
    （如 `CarouselOptions`、`DrawerRootProps`、`AsChildProps`），使用方无法直接引用这些类型。
    是否补导出留到后续决定。
- **验证**：给 `ContainerProps` 加一个可选 prop，`check:api-report` 失败并指出变化的报告；把一个入口的
  `types` 指向不存在的文件，publint 和 attw 都失败。

### 3. SSR 冒烟

- **现状**：组件只在浏览器里测过。Next.js 等服务端渲染的使用方如果在导入或首次渲染时碰到 `window`
  会直接报错，目前发现不了。PortalContainer 已被标为 SSR 待验证的高风险项。
- **做法**：在 Node 中对每个 story 做一次 `renderToString`，要求不抛错。
- **验证**：故意在一个组件的渲染里访问 `window`，测试必须失败。

### 4. 跨浏览器渲染测试

- **现状**：渲染测试只跑 Chromium。
- **做法**：渲染测试（不含截图）增加 Firefox 和 WebKit；视觉回归仍只用 Chromium，避免基线翻倍。

### 5. 暗色模式视觉覆盖

- **现状**：视觉回归只有 62 个组件的 Themes story 覆盖暗色。
- **做法**：给全部 story 增加暗色截图（多 446 张基线），或者只加核心组件；根据第 1–4 项做完后的
  CI 时长再定。

## 需要你决定的（不阻塞上面几项）

- `aliases.css` 和 surface 维度重复声明的 24 个 `--surface-*` 变量：删掉会让设计师 Figma 文件的
  Foundation 集合少 24 个变量。
