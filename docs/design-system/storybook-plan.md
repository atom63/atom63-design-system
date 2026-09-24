# DS Storybook 计划（第 2 步）

> 本地决策文档，待确认后再动手。

## 现状

- DS 仓库有 74 个 stories 文件（446 个 story），外加 12 个 `.mdx` 文档，全部在 `packages/ui-react/src` 下；`@storybook/react-vite` 10.5 已在 ui-react 的开发依赖里。
- **但 DS 仓库没有任何 Storybook 配置，这些 stories 目前没有地方可以运行。** 迁移前它们由 atom63-vite 的 `apps/storybook` 加载（配置里的 `packages/ui-react/src/**/*.stories.tsx` 和 `*.mdx`）；#419 迁出包时必须删掉这些路径，DS 仓库这边又没有接上。
- stories 只依赖 DS 自己的包和 lucide-react、sonner、react-hook-form、react-day-picker，可以原样迁移。
- atom63-vite 的 `preview.ts`（478 行）实现了主题、模式、品牌色、表面色调、圆角、字号、密度、OS 等个性化工具栏，全部基于 `@atom63/ui-react/theme`，可以搬过来；`decorators.tsx` 只服务 MDX 内容，不需要。
- atom63-vite 的 Storybook 继续负责应用层（widgets、os63、inform 等），不受影响。

## 执行计划（不需要拍板的部分）

1. **搭建 Storybook**：新建 `apps/storybook`（私有工作区应用），加载 `packages/ui-react/src` 下的 stories 和 mdx；移植 `preview.ts` 的个性化工具栏和预览样式；stories 通过 `@atom63/source` 条件直接读源码，改组件即时热更新。
   → 验证：`storybook build` 成功；446 个 story 全部能打开，控制台没有报错。
2. **渲染测试**：接入 `@storybook/addon-vitest`，把每个 story 变成浏览器里的渲染测试（Vitest 4 browser mode + Playwright Chromium），放进 CI。
   → 验证：本地和 CI 都跑通；故意改坏一个组件时测试会失败。
3. **视觉回归**：按决策 3 的结论实现。
4. **文档**：`CONTRIBUTING.md` 补上 Storybook 和视觉测试命令；README 链接托管地址（如果托管）。
5. **提交方式**：一个 PR 提交到 DS 仓库。

## 需要你拍板的决策

### 决策 1：Storybook 放在哪里

- **选项**：
  - A. `apps/storybook`：独立的私有应用，和 `apps/docs` 并列。
  - B. 放在 `packages/ui-react/.storybook`：离组件最近，但把开发工具配置混进要发布的包目录。
- **权衡**：A 结构清楚，以后加 SwiftUI 预览或其他包的 stories 也方便；B 少一个工作区包。
- **推荐**：A。

### 决策 2：是否托管、托管到哪里

- **背景**：托管后，设计师和外部使用者不用拉代码就能浏览所有组件状态，PR 里也能附上预览链接。
- **选项**：
  - A. 新建 Vercel 项目，域名 `storybook.atom63.io`；需要新建项目和 DNS 记录，我可以用 Vercel CLI 做，每一步先跟你确认。
  - B. 挂在文档站下，例如 `system.atom63.io/storybook`，构建时把 Storybook 产物放进文档站；不需要新项目，但文档站构建变慢，两者也耦合在一起。
  - C. 先不托管，只在本地和 CI 里用。
- **权衡**：A 独立部署、互不影响，有 PR 预览；B 少一个项目；C 最省事，但外部看不到。
- **推荐**：A。

### 决策 3：视觉回归怎么做

- **背景**：446 个 story；只算默认主题的亮色和暗色两种模式，就是 892 张截图。
- **选项**：
  - A. **Chromatic**（Storybook 官方文档推荐的云服务）：免费版每月 5,000 张快照，按每次跑全量 446 张算，大约只够 11 次；付费版起价每月 179 美元；开源项目可以申请优惠，但要单独联系。优点是审阅界面好、跨浏览器；缺点是要付费或受额度限制，基线存在第三方。
  - B. **自建：Vitest 4 的 `toMatchScreenshot`**：基线图片提交到仓库，只在 CI 的固定 Linux 环境（固定版本的 Playwright 容器）里生成和比对，避免本地字体、显卡差异造成误报。免费，完全自主；缺点是要自己写一个遍历 stories 截图的测试，基线图片会增大仓库体积（892 张约几十 MB），审阅差异要看 CI 产物里的对比图。
  - C. **先不做视觉回归**，只做第 2 步的渲染测试，以后再加。
- **权衡**：DS 仓库是公开仓库，GitHub Actions 分钟数免费，所以 B 的运行成本为零；A 的额度对这个规模明显不够用。
- **推荐**：B。

### 决策 4：视觉回归覆盖范围（决策 3 选 A 或 B 时）

- **选项**：
  - A. 全部 story × 默认主题 × 亮色、暗色：892 张。
  - B. 全部 story × 默认主题亮色（446 张），再加约 10 个核心组件（Button、Input、Select、Card、Dialog 等）× 4 个主题 × 2 种模式（约 80 张）。
  - C. 只做核心组件的主题矩阵（约 80 张）。
- **权衡**：A 覆盖最全，但暗色模式大多数问题出在 token 上，和亮色高度相关；B 在覆盖和体积之间折中；C 最小，但会漏掉非核心组件。
- **推荐**：B。

## 决策结论（2026-09-23）

1. 位置：`apps/storybook`。
2. 托管：新建 Vercel 项目；域名改为 `storybook.system.atom63.io`，因为 `storybook.atom63.io` 已被 atom63-vite 的应用层 Storybook 使用；建项目和配域名的每一步先确认。
3. 视觉回归：自建，Vitest 4 `toMatchScreenshot`，基线只在 CI 的固定 Linux 环境生成和比对。
4. 覆盖范围：全部 story 的默认主题亮色，加约 10 个核心组件 × 4 个主题 × 2 种模式。

## 实施记录（2026-09-23）

- `apps/storybook` 加载 ui-react 的 446 个 story 和 15 个文档页，全部能渲染，控制台没有报错；工具栏直接用 `@atom63/ui-react/theme` 导出的选项生成。
- 渲染测试：`@storybook/addon-vitest`，446 个全部通过；故意让 Button 抛错时，21 个相关测试失败。
- 视觉回归：Vitest `toMatchScreenshot`，每个 story 一张截图，共 446 张。有 62 个组件自带 `Themes` story（4 主题 × 亮暗），所以主题矩阵覆盖了 62 个组件，比计划的约 10 个多，截图总数不变。为了截图稳定：冻结 CSS 动画、截图前加载 Geist 字体、把远程图片（picsum、pravatar）在请求前替换成固定占位图；两个 story 的标签从系统 `monospace` 改为 `Geist Mono`。本地连续 4 轮 446 张全部一致；故意改 Button 样式时 21 张截图失败。
- 基线只在 CI 的 `mcr.microsoft.com/playwright:v1.61.1-noble` 容器里生成：本地没有 Docker，而且 macOS 和 Linux 的字体渲染不同。首次基线通过手动运行 Visual regression workflow（勾选 update）生成并提交。
- 与计划的差异：Storybook 的类型检查暂时只覆盖它自己的配置文件。story 文件存在 74 个历史类型错误（它们从来没有被类型检查过），另开任务修复。
