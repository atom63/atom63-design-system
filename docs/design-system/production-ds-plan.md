# Production open-source DS plan (decision draft)

Status: approved 2026-09-23 with every recommendation below. The Figma plugin is Cipher, moved into this repo and repurposed as the DS companion plugin: features the DS does not need are removed and missing sync features are added.

## Goal

Ship Atom63 DS as a production-grade open-source design system, benchmarked against
[Astryx](https://astryx.atmeta.com/) (Meta) and [Frosted UI](https://github.com/whopio/frosted-ui) (Whop):

1. One token architecture serves every consumption platform: web React and iOS SwiftUI first.
2. `atom63-vite` apps are the first consumers and the real-world test bed.
3. A Figma plugin keeps Figma and code aligned in both directions.

## Benchmarks

| Capability | Astryx | Frosted UI | Atom63 DS today |
| --- | --- | --- | --- |
| Web components | 170+ React, StyleX | React on Radix | ~68 React on Base UI |
| Native platforms | Not documented | `frosted-ui-react-native`, `frosted-ui-native-colors` | `ui-ios` SwiftUI, still in `atom63-vite` |
| Themes | Separate npm theme packages + `theme template` CLI | `Theme` component + CSS | 4 themes + 10 axes inside `@atom63/styles` |
| Figma | Not documented | Figma UI kit + `figma-icon-sync-plugin` in repo | Plugin exists, still in `atom63-vite` |
| Docs | Docs site: guides, foundations, components, templates, playground | Storybook + guides | Docs site + Storybook, still in `atom63-vite` |
| AI / CLI | CLI + MCP for docs, tokens, templates | `CLAUDE.md` | Not public |
| Repo shape | Core + themes + CLI packages | One monorepo: web, native, colors, icons, Figma plugin | Web packages only |

## Current state (facts)

- **Two copies of the DS code.** `atom63-vite/packages/{styles,ui-foundation,ui-react}` still exist.
  `ui-react` differs in 47 files from this repo; `atom63-vite` has had no commits to those packages
  since the extraction (2026-09-21), so this repo is ahead and the `atom63-vite` copies are stale forks.
  `atom63-vite` apps still build against the stale copies by default; published-package use is opt-in
  (`A63_USE_PUBLISHED_DS=1`).
- **Still outside this repo:** `packages/ui-ios` (30+ SwiftUI components, SPM), `apps/figma-plugin`
  (depends on `cipher-core` / `cipher-boilerplate`), `apps/design-system` (docs site), `apps/storybook`,
  `apps/ios-demo`.
- **Tokens are authored as CSS, then parsed three separate times by regex:**
  `styles/scripts/generate-token-manifest.mjs` (manifest JSON), `ui-ios/Scripts/generate-swift-tokens.mjs`
  (reads 4 CSS files directly), and `figma-plugin/scripts/generate-atom63-preset.ts` (reads 5 CSS files
  directly). Each platform can drift from the others, and nothing can write back from Figma.

## Decisions needed

### D1. Token source of truth

**Background.** Figma → code sync needs a machine-writable source. Hand-authored CSS with selectors per
theme, mode, and brand cannot be rewritten safely by a plugin. The DTCG format reached its first stable
version (2025.10) in October 2025 and is supported by Figma, Tokens Studio, Style Dictionary, and Terrazzo.

- **Option A: keep CSS as the source; make the generated DTCG manifest the only interface.** iOS and the
  Figma plugin read only the manifest, never CSS. Low cost, one parser instead of three. Figma → code
  stays manual.
- **Option B: DTCG JSON becomes the source; CSS, Swift, and Figma variables are all generated.** This is
  the industry pattern and the only one that supports real two-way sync. Large migration: themes,
  modes, brands, and contracts must be expressed as token sets and modes.

**Recommendation.** Do A first (days), then migrate to B one layer at a time: foundation primitives →
semantic roles → themes and axes. Contracts and recipe CSS stay hand-written CSS that references tokens.

### D2. What moves into this repo

**Background.** Astryx and Frosted UI keep web, native, and design-tool code in one place, so one change
and one release covers every platform.

- **Option A: move `ui-ios`, the Figma plugin, the docs site, and Storybook here; delete the stale copies
  from `atom63-vite`.**
- **Option B: move only `ui-ios` and the Figma plugin; keep docs and Storybook in `atom63-vite`.**

**Recommendation.** A. Docs and Storybook document this repo's API and must change in the same PR as the
components. `cipher-core` / `cipher-boilerplate` come along only if the plugin cannot drop them.

**Constraint to verify.** Swift Package Manager resolves a package from the `Package.swift` at the
repository root. Either add a root `Package.swift` whose targets point into `packages/ui-ios`, or publish
iOS from a mirror repository.

### D3. How `atom63-vite` consumes the DS

- **Option A: published `beta` only.** Most realistic test, but every DS fix waits for a release.
- **Option B: Changesets snapshot releases (`0.0.0-canary-<sha>`) for day-to-day, `beta` for releases.**
  Real npm installs with a fast loop; Astryx runs a similar canary channel.
- **Option C: link local checkouts.** Fastest loop, but does not test packaging (the Vite dev bug fixed on
  2026-09-23 would have been missed).

**Recommendation.** B, with the stale workspace copies removed so `atom63-vite` cannot fall back to them.

### D4. Figma plugin scope

- **Phase 1: code → Figma.** The plugin imports the DTCG manifest into Figma variables (collections and
  modes) and styles, and reruns without drift. This already closes the current Figma stable blocker.
- **Phase 2: Figma → code.** The plugin exports changed variables as DTCG JSON and opens a pull request
  through the GitHub API. CI regenerates CSS and Swift and runs the visual and token checks. This needs
  D1 option B.

**Recommendation.** Phase 1 now, phase 2 after D1 B covers the layers designers edit.

## Proposed phases

1. **Single source (1-2 weeks).** Move `ui-ios` and the Figma plugin into this repo, delete the stale
   copies from `atom63-vite`, switch it to snapshot or beta packages, and route iOS and Figma through the
   one manifest (D1 A).
2. **Stable web + iOS release (2-4 weeks).** Close the two stable blockers: real-browser and
   assistive-technology evidence for high-risk components, and Figma phase 1 QA. Tag the first stable
   release on npm and SPM.
3. **DTCG source + two-way Figma (4-8 weeks).** D1 B, then Figma phase 2.
4. **Open-source polish.** Public docs site, Storybook, `CONTRIBUTING.md`, theme packages, and a CLI/MCP
   for AI tools, following Astryx.

## Progress (2026-09-23)

Phase 1 is in progress. Done and verified in CI unless noted:

- **iOS in this repo.** `packages/ui-ios` and `examples/ios-demo` moved here; the root `Package.swift` serves SwiftPM consumers. A macOS CI job checks generated contracts and Swift tokens, the frozen public API, `swift test`, and the demo app tests on the latest stable Xcode.
- **One token interface.** The Swift token generator reads the token manifest instead of CSS; its output is byte-identical.
- **Figma model.** `@atom63/styles/figma-sync.json` maps every personalization axis to its own Figma collection (the CSS never varies a token on two axes), keeps `var()` references as aliases, and resolves everything else in Chromium. 984 variables, 430 alias values; 278 of 278 literal colors match their CSS source.
- **Companion plugin.** Cipher moved to `apps/figma-plugin`, lost the generic generator, component, import, and export features, and gained a Sync page that previews, applies, and re-verifies the model. Tests on an in-memory Figma API prove a second sync plans zero changes. Not yet verified in a real Figma file.
- **Packaging fix found on the way.** 31 ui-react files rely on Tailwind utilities, so consumers without Tailwind got unstyled layouts and toasts. `styles.css` now ships those utilities precompiled.
- **Next beta prepared.** styles `0.1.0-beta.2`, ui-foundation `0.1.1-beta.1`, ui-react `0.2.0-beta.5`; the release dry run passes. Publishing needs the npm-publish environment approval.

Adjusted decisions:

- **D3.** Start with `beta` only. Every publish, canary included, needs the npm-publish approval, so a canary channel would not shorten the loop yet.
- **D2.** The docs site moved here as `apps/docs` in phase 1 rather than phase 4: it shares ui-react with mdx and widgets, so it could not stay in atom63-vite once those switch to npm. The chat agent is removed, the MDX components it uses are copied into `src/mdx-kit`, product pages are dropped, and the home and architecture pages are rewritten. It is not deployed yet; that needs a Vercel project for this repo. The atom63-vite Storybook mostly shows widgets and OS63 and stays there; the DS gets its own Storybook in phase 4.

Remaining in phase 1: publish the beta, then switch atom63-vite apps and packages to the published packages and delete its stale copies (in progress on the atom63-vite branch `feat/ds-consume-published`).

---

# 生产级开源 DS 规划（待拍板草案）

状态：2026-09-23 已批准，按下文全部推荐方案执行。Figma 插件就是 Cipher，搬进本仓库后转型为 DS 配套插件：删掉 DS 用不到的功能，补上缺少的同步功能。

## 目标

对标 [Astryx](https://astryx.atmeta.com/)（Meta）和 [Frosted UI](https://github.com/whopio/frosted-ui)（Whop），
把 Atom63 DS 做成生产级别的开源设计系统：

1. 同一套 token 架构服务所有使用平台，先支持 Web React 和 iOS SwiftUI。
2. `atom63-vite` 里的 app 是第一批使用者，也是真实的测试场。
3. 配一个 Figma 插件，让 Figma 和代码双向保持一致。

## 参照系统对比

| 能力 | Astryx | Frosted UI | Atom63 DS 现状 |
| --- | --- | --- | --- |
| Web 组件 | 170+ 个 React 组件，StyleX | 基于 Radix 的 React 组件 | 约 68 个 React 组件，基于 Base UI |
| 原生平台 | 文档没有提到 | `frosted-ui-react-native`、`frosted-ui-native-colors` | `ui-ios`（SwiftUI），还在 `atom63-vite` 里 |
| 主题 | 独立的 npm 主题包，CLI 可生成主题模板 | `Theme` 组件 + CSS | 4 个主题 + 10 个个性化维度，都在 `@atom63/styles` 里 |
| Figma | 文档没有提到 | Figma 组件库 + 仓库内的 `figma-icon-sync-plugin` | 插件已有，还在 `atom63-vite` 里 |
| 文档 | 文档站：指南、基础、组件、模板、在线试玩 | Storybook + 指南 | 文档站和 Storybook 都还在 `atom63-vite` 里 |
| AI / CLI | CLI + MCP，可查文档、token、模板 | `CLAUDE.md` | 没有公开 |
| 仓库结构 | 核心包 + 主题包 + CLI 包 | 一个 monorepo：Web、原生、颜色、图标、Figma 插件 | 只有 Web 包 |

## 现状（已核实）

- **DS 代码有两份。** `atom63-vite/packages/{styles,ui-foundation,ui-react}` 还在，其中 `ui-react`
  和本仓库有 47 个文件不同。拆分（2026-09-21）之后 `atom63-vite` 没有再改过这三个包，所以本仓库更新，
  `atom63-vite` 里的是过期副本。但 `atom63-vite` 的 app 默认仍用这份过期副本构建，只有设置
  `A63_USE_PUBLISHED_DS=1` 时才用 npm 上的包。
- **还在本仓库之外：** `packages/ui-ios`（30 多个 SwiftUI 组件，通过 SPM 分发）、`apps/figma-plugin`
  （依赖 `cipher-core` / `cipher-boilerplate`）、`apps/design-system`（文档站）、`apps/storybook`、
  `apps/ios-demo`。
- **token 用 CSS 手写，再被三个脚本分别用正则解析：** `styles/scripts/generate-token-manifest.mjs`
  生成 manifest JSON，`ui-ios/Scripts/generate-swift-tokens.mjs` 直接读 4 个 CSS 文件，
  `figma-plugin/scripts/generate-atom63-preset.ts` 直接读 5 个 CSS 文件。三个平台可能各自漂移，
  而且 Figma 端的修改没法写回代码。

## 待拍板

### D1. token 的唯一来源

**背景。** 要从 Figma 同步回代码，来源必须是程序能安全改写的格式。按主题、明暗、品牌写了各种选择器的
手写 CSS，插件没法安全改写。DTCG 格式在 2025 年 10 月发布了第一个稳定版（2025.10），Figma、
Tokens Studio、Style Dictionary、Terrazzo 都已支持。

- **方案 A：CSS 仍是来源，把生成的 DTCG manifest 作为唯一对外接口。** iOS 和 Figma 插件只读 manifest，
  不再直接读 CSS。成本低，三个解析器合成一个；但 Figma 改动同步回代码仍需手工。
- **方案 B：DTCG JSON 作为来源，CSS、Swift 和 Figma 变量全部生成。** 这是业界通行做法，也是唯一能真正
  双向同步的方案。迁移量大：主题、明暗、品牌和组件规范都要改写成 token 集合和模式。

**推荐。** 先做 A（几天），再按层逐步迁到 B：基础色板等原始值 → 语义角色 → 主题和个性化维度。组件规范和
组件样式仍保留手写 CSS，只引用 token。

### D2. 哪些搬进本仓库

**背景。** Astryx 和 Frosted UI 都把 Web、原生和设计工具的代码放在一起，一次改动、一次发布就覆盖所有平台。

- **方案 A：`ui-ios`、Figma 插件、文档站、Storybook 全部搬进来，并删掉 `atom63-vite` 里的过期副本。**
- **方案 B：只搬 `ui-ios` 和 Figma 插件，文档站和 Storybook 留在 `atom63-vite`。**

**推荐。** A。文档站和 Storybook 记录的是本仓库的 API，应该和组件在同一个 PR 里一起改。
`cipher-core` / `cipher-boilerplate` 只在插件离不开时才一起搬。

**待核实的限制。** Swift Package Manager 从仓库根目录的 `Package.swift` 解析包。要么在根目录加一个
`Package.swift`，让它的 target 指向 `packages/ui-ios`；要么另建一个镜像仓库专门发布 iOS 包。

### D3. `atom63-vite` 怎么使用 DS

- **方案 A：只用发布出去的 `beta`。** 最接近真实使用，但每个 DS 修复都要等发版。
- **方案 B：日常用 Changesets 快照版（`0.0.0-canary-<sha>`），正式版本用 `beta`。** 装的是真实的 npm 包，
  迭代也快；Astryx 也有类似的 canary 渠道。
- **方案 C：直接链接本地代码。** 迭代最快，但测不到打包问题，比如 2026-09-23 修的 Vite 开发模式报错就会漏掉。

**推荐。** B，同时删掉过期副本，让 `atom63-vite` 没法再退回去用它们。

### D4. Figma 插件的范围

- **第一阶段：代码 → Figma。** 插件把 DTCG manifest 导入成 Figma 变量（集合和模式）和样式，并且重复导入
  不产生差异。做完这一步，当前稳定版的 Figma 阻塞项也就解决了。
- **第二阶段：Figma → 代码。** 插件把改过的变量导出成 DTCG JSON，通过 GitHub API 提 PR；CI 重新生成 CSS
  和 Swift，并跑视觉和 token 检查。这一步依赖 D1 的方案 B。

**推荐。** 现在做第一阶段；等 D1 方案 B 覆盖到设计师会改的那几层，再做第二阶段。

## 建议的阶段

1. **统一来源（1-2 周）。** 把 `ui-ios` 和 Figma 插件搬进本仓库，删掉 `atom63-vite` 里的过期副本，
   让它改用快照版或 beta 包；iOS 和 Figma 都改为只读同一份 manifest（D1 方案 A）。
2. **Web + iOS 稳定版（2-4 周）。** 解决稳定版的两个阻塞项：高风险组件在真实浏览器和读屏软件上的测试
   证据，以及 Figma 第一阶段验收。在 npm 和 SPM 上发布第一个稳定版。
3. **DTCG 作为来源 + Figma 双向同步（4-8 周）。** 完成 D1 方案 B，再做 Figma 第二阶段。
4. **开源打磨。** 公开文档站和 Storybook，补 `CONTRIBUTING.md`，拆出独立主题包，参考 Astryx 提供面向 AI
   工具的 CLI/MCP。

## 进展（2026-09-23）

第一阶段进行中。除特别注明外，以下各项均已完成并通过 CI 验证：

- **iOS 已进入本仓库。** `packages/ui-ios` 和 `examples/ios-demo` 已搬入，根目录 `Package.swift` 供 SwiftPM 使用者解析。macOS CI 任务会检查生成的契约和 Swift token、冻结的公开 API，运行 `swift test`，并在最新稳定版 Xcode 上跑示例 app 测试。
- **统一的 token 接口。** Swift token 生成器改为读取 token 清单，不再解析 CSS，输出逐字节不变。
- **Figma 模型。** `@atom63/styles/figma-sync.json` 让每个个性化维度各成一个 Figma 集合（CSS 中没有 token 同时随两个维度变化），`var()` 引用保留为别名，其余值在 Chromium 中解析。共 984 个变量、430 个别名值；278 个字面量颜色全部与 CSS 源值一致。
- **配套插件。** Cipher 已搬到 `apps/figma-plugin`，删掉了通用生成器、组件、导入和导出功能，新增同步页，可预览、应用并重新校验模型。基于内存 Figma API 的测试证明第二次同步零变化。尚未在真实 Figma 文件中验证。
- **顺带发现的打包问题。** ui-react 有 31 个文件依赖 Tailwind 工具类，不用 Tailwind 的使用者会看到布局和 toast 缺样式。现在 `styles.css` 已内置预编译的工具类。
- **新 beta 已就绪。** styles `0.1.0-beta.2`、ui-foundation `0.1.1-beta.1`、ui-react `0.2.0-beta.5`；发布试运行已通过，正式发布需要 npm-publish 环境审批。

调整过的决定：

- **D3。** 先只用 `beta`。包括 canary 在内的每次发布都需要 npm-publish 审批，所以 canary 渠道暂时不能缩短迭代周期。
- **D2。** 文档站提前到第一阶段搬入本仓库，位于 `apps/docs`，没有等到第四阶段：它和 mdx、widgets 共用 ui-react，这些包一旦切到 npm，它就无法继续留在 atom63-vite。聊天 agent 已删除，用到的 MDX 组件复制到 `src/mdx-kit`，产品类页面已删除，首页和架构页已重写。目前尚未部署，需要为本仓库新建 Vercel 项目。atom63-vite 的 Storybook 主要展示 widgets 和 OS63，继续留在那边；DS 会在第四阶段拥有自己的 Storybook。

第一阶段剩余工作：发布 beta，然后把 atom63-vite 的 app 和包切换到已发布的包，并删除其中的过期副本（正在 atom63-vite 的 `feat/ds-consume-published` 分支上进行）。
