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

### 3. SSR 冒烟（已完成）

- **结果**：Storybook 新增 `ssr` 测试项目，运行在 Node 环境（没有 `window` / `document`），对 ui-react 的
  全部 446 个 story 做 `renderToString`，要求不抛错；在导入阶段访问浏览器全局变量同样会失败。CI 在
  Storybook 检查里运行 `pnpm --filter @atom63/storybook test:ssr`。首次运行全部通过，目前没有组件在
  导入或渲染时访问浏览器全局变量。
- **覆盖范围**：6 个 story 以打开状态渲染弹层（包括 PortalContainer），服务端渲染不报错。Base UI 的
  portal 在服务端不输出内容、挂载后才在客户端渲染，所以弹层内部由浏览器端测试覆盖。
- **验证**：在 `Kbd` 的渲染里访问 `window.innerWidth`，用到它的 14 个 story 都以
  `ReferenceError: window is not defined` 失败。

### 4. 跨浏览器渲染测试

- **现状**：渲染测试只跑 Chromium。
- **做法**：渲染测试（不含截图）增加 Firefox 和 WebKit；视觉回归仍只用 Chromium，避免基线翻倍。

### 5. 暗色模式视觉覆盖

- **现状**：视觉回归只有 62 个组件的 Themes story 覆盖暗色。
- **做法**：给全部 story 增加暗色截图（多 446 张基线），或者只加核心组件；根据第 1–4 项做完后的
  CI 时长再定。

### 6. 自定义品牌色的色阶

- **现状**：`applyAutoColorRamp` 用 HSL 按固定亮度生成色阶，不同色相的感知明度差别很大，黄绿色的
  600 作为文字对比度不足，紫红色的 600 作为主按钮略低于 4.5:1。
- **做法**：改用 OKLCH 生成（每一档固定 l，按色域限制 c），前景色直接按真实亮度选择；
  在样式测试里对全部色相抽样检查主按钮和品牌文字。

## 需要你决定的（不阻塞上面几项）

- `aliases.css` 和 surface 维度重复声明的 24 个 `--surface-*` 变量：删掉会让设计师 Figma 文件的
  Foundation 集合少 24 个变量。
