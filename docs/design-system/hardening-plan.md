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
  - **设计 token 造成的对比度不足**：先用临时参数关闭对比度规则，按下面的方案 A 修复后已移除，对比度规则全面生效。
  - **顺带发现**：Calendar 的 story 用 `new Date()`，截图和 a11y 结果每天都会变；改成固定日期。
- **验证**：去掉一个 checkbox 的标签，测试失败。

#### 对比度（已决定：方案 A，已完成）

- **问题**：默认主色 `#2C7FFF`（brand-500）上的白字只有 3.6:1，低于 WCAG AA 正文要求的 4.5:1；
  Badge 的彩色色调文字只有 1.8–3.6:1。
- **备选**：A. 主操作色改用 brand-600；B. 保持主色，前景色阈值提到 4.5:1；C. 把 3:1 写成例外。
- **结论**：A + Badge 文字加深。
- **结果**：
  - `--a63-action-primary` 改用 brand-600（b3 绿色较亮，用 700），hover 相应加深一档。
  - 新增 `--a63-text-accent`：品牌色作为文字（链接、强调）时使用；亮色模式用每个品牌的 `--a63-brand-text`
    （默认 600，b2 和 b3 用 700），暗色模式用 brand-400。组件里把主色当文字用的地方都改用它。
  - Badge 亮色文字改用 700（橙、琥珀、黄、青柠、绿、翡翠、蓝绿、青用 800），状态色新增前景 token。
  - 自定义品牌色（`auto`）的前景色切换点从 3:1 对应的位置移到白字和黑字对比度相等的位置
    （CSS oklch l 0.665 → 0.57，JS Y 0.30 → 0.18），抽样 108 个色相/饱和度，不达标从约 50 个降到 2 个。
  - 新增测试：6 个品牌 × 4 个主题 × 2 个模式，主按钮和品牌文字都要达到 4.5:1。
- **遗留**：自定义品牌色的色阶用 HSL 生成，黄、绿色相的 600 太亮，作为文字在页面上只有 1.7–2.9:1；
  紫红色相的主按钮约 4:1。需要把色阶改为 OKLCH 生成（固定明度），列为第 6 项。

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

### 3. SSR 冒烟（已完成）

- **结果**：Storybook 新增 `ssr` 测试项目，运行在 Node 环境（没有 `window` / `document`），对 ui-react 的
  全部 446 个 story 做 `renderToString`，要求不抛错；在导入阶段访问浏览器全局变量同样会失败。CI 在
  Storybook 检查里运行 `pnpm --filter @atom63/storybook test:ssr`。首次运行全部通过，目前没有组件在
  导入或渲染时访问浏览器全局变量。
- **覆盖范围**：6 个 story 以打开状态渲染弹层（包括 PortalContainer），服务端渲染不报错。Base UI 的
  portal 在服务端不输出内容、挂载后才在客户端渲染，所以弹层内部由浏览器端测试覆盖。
- **验证**：在 `Kbd` 的渲染里访问 `window.innerWidth`，用到它的 14 个 story 都以
  `ReferenceError: window is not defined` 失败。

### 4. 跨浏览器渲染测试（已完成）

- **结果**：Storybook 新增 `cross-browser` 项目，在 Firefox 和 WebKit 中渲染全部 446 个 story（共 892 个
  测试，本地约 72 秒）。CI 新增与 `verify` 并行的 `cross-browser` job。只做渲染：axe 和视觉回归仍在
  Chromium 中运行，基线不翻倍。当前全部通过。
- **发现：WebKit 回归 bug**：WebKit 26.5（Playwright 自带版本）中，元素有 2 层以上 `mask-image` 时，
  读取计算后的 `mask` 简写属性（`getComputedStyle(el).getPropertyValue('mask')`）会让页面进程崩溃
  （`SIGSEGV`，位于 `extractFillLayerPropertyShorthand`）。ScrollArea 的 `scrollFade` 遮罩有 4 层，
  axe 检查元素可见性时会读取 `mask`，所以 Command 等使用带淡出效果的 ScrollArea 的 story 会崩溃。
  最小复现只需 3 行 HTML。用真实的 Safari 26.3.1 打开同样的页面不会崩溃，说明这是较新版 WebKit
  的回归，组件代码没有问题。`cross-browser` 项目因此通过自己的 setup 文件关闭 axe。
- **踩坑**：最初用 Vite 的 `define` 关闭 axe，但几个浏览器项目共用同一个 Vite 服务器，替换泄漏到
  Chromium 项目，把 a11y 检查整个关掉了。改为只属于该项目的 setup 文件后，用一个没有标签的输入框
  验证：Chromium 项目失败，`cross-browser` 项目通过。
- **后续**：可以向 bugs.webkit.org 报告这个回归（需要用你的账号提交）。

### 5. 暗色模式视觉覆盖（已完成）

- **决定**：不给全部 story 加暗色截图。74 个 story 文件中已有 62 个带 Themes 矩阵（4 个主题 × 亮 / 暗），
  只给其余 12 个文件各加一个 `Dark` story（通过 story 级 `globals` 设置 `mode: 'dark'`，作用于
  `<html>`，所以 portal 里的浮层也是暗色）。多 12 张基线，而不是 462 张。
- **发现：视觉回归原本只比较了截图的一部分**：
  - vitest 会把测试 iframe 缩放到外层 Playwright 页面的大小，外层用的是默认尺寸，所以全部基线都是
    按 0.75 缩小拍的（宽 960 而不是 1280）。
  - 截图只渲染视口内的内容，比视口高的 story 下半部分是空白。25 张基线受影响，其中 Themes 矩阵
    只拍到了 modern 的两行，aqua、retro、terminal 的亮 / 暗 6 行实际上没有被比较。
  - 修复：外层页面设为 1280×10000，截图前把 iframe 调到页面高度（上限 10000）。现在截图是 1:1
    的完整高度，全部基线重新生成。
- **验证**：本地连续两次跑完整视觉回归，第二次 458 个全部与第一次一致（其中 1 个第一次未生成
  参考图，单独重跑两次均一致）；完整比较一次约 55 秒。12 个 `Dark` story 的渲染和 axe 检查全部通过。

### 6. 自定义品牌色的色阶（已完成）

- **结果**：`applyAutoColorRamp` 改用 OKLCH 生成色阶。每一档的亮度（L）和色度（C）取内置 b1 色阶的
  实际值，色度按输入饱和度缩放，超出 sRGB 色域时逐步降低色度。OKLCH 亮度是感知亮度，所以任何色相
  在同一档的明暗一致，对比度可以预期。公开 API（`applyAutoColorRamp(root, { hue, saturation })`）
  和取色逻辑不变。
- **测试**：新增扫描测试，覆盖 36 个色相 × 4 个饱和度（144 种组合），每种都要满足：600 上白字、
  600 作为浅色页面上的文字、400 作为深色页面上的文字，全部 ≥ 4.5:1。
- **验证**：换回原来的 HSL 实现，扫描测试有 148 项不达标；OKLCH 实现全部通过。

## 已决定的遗留项

- `aliases.css` 和 surface 维度重复声明的 24 个 `--surface-*` 变量：2026-09-24 按路线图删除（阶段 B 的 B5）。
  默认表面色阶只由 `surface.resolver.json` 的 n1 上下文提供。Figma 同步模型没有变化：它原本就只在
  Surface 集合里列出这些变量一次（之前"Foundation 集合会少 24 个变量"的估计有误）。
