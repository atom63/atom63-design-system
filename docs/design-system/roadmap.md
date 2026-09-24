# Atom63 Design System 路线图

> 2026-09-24。根据你提出的 5 个目标，结合三份调研写成：对标库 Astryx、atom63-vite 各包评估、本仓库差距审计。
> 2026-09-24 已拍板：D1–D5 全部采用推荐选项，按阶段 A → E 执行。决定记录见最后一节。

## 结论先行

1. **分离已经基本完成，但"哪些包该进 system"的判断需要修正。** `widgets` 和 `agent` 整体上**不是** headless：
   两个包大部分是带样式的作品集 UI，只有局部是 system 级别的代码。适合迁入的是它们的内核，外加 `inform`。
2. **当前最大的问题是：真正的源头是手写 CSS，不是 DTCG。** DTCG 只覆盖了约 56% 的 token；语义层、品牌、
   contract、主题都是手写 CSS。Figma 和 iOS 只能看到其中一部分，iOS 已经出现了偏差（见下文）。
   这正好对应你说的"黑盒"和"漂移"。
3. **和 Astryx 比，我们在 token 架构上领先，在"流水线"上落后。** DTCG、SwiftUI 原生输出、Figma 双向同步、
   多品牌，这些 Astryx 都没有。但它有组件脚手架、由 CLI 生成的文档、MCP、craft lint 规则、模板库，
   还有用 AI 评分的 vibe tests，这些正是"流程化产出"的关键。
4. **建议顺序：** 先修 iOS 偏差（小而紧急）→ 把 token 真正统一到一个源头（最大的一步）→ 搭建流水线 → 迁入 pattern 包。

---

## 目标 1：DS 脱离 atom63，atom63-vite 保持作品集定位

### 现状

- DS 的 4 个包已经离开 atom63-vite；16 个使用方全部通过 npm 版本号依赖，没有路径引用。
- 清理 PR（atom63-vite #424）删除了 USAGE.md 中 DS 的章节、`archive/`，以及已迁到 DS 的 token story。

### 各包评估（atom63-vite `origin/main`）

| 包 | 判断 | 理由 |
|---|---|---|
| `inform`（消息、引导） | **整包迁入 DS** | `src/core/` 没有 React 依赖，真正 headless；和作品集没有耦合；README 已经指向 DS 里并不存在的文档页 |
| `agent` | **拆分** | `src/runtime/`（约 750 行：zustand store、可替换的 transport、消息类型）是 headless 的聊天引擎，可以迁入；`src/react/` 是带样式的聊天 UI，还依赖 `@atom63/mdx`，先留下 |
| `widgets` | **拆分** | `src/foundation/`（约 4k 行：布局单位、网格缩放、WidgetCard/Surface、加载 / 错误状态）是 DS 已有 `contracts/widget.css` 在 React 侧的实现，应该进 DS；各个小组件（天气固定在洛杉矶、GitHub 统计、Behance 等）是作品集产品，留下。README 里的"headless"指的是"不自己取数据"，组件本身带大量 Tailwind 样式（约 600 处 `className=`） |
| `brand` | **拆分** | Logo 基础组件迁入 DS，替换掉 DS docs 里现有的逐字节副本；SEO 数据是你的个人信息，留下 |
| `icons` | **清理 + 拆分** | `AnimatedCheck`、`Spinner` 与 DS 重复，删除；系统图标映射迁入；公司 logo、Behance、艺术素材留下 |
| `mdx` | **拆分**（2026-09-25 修正，原判断为"留下"） | DS 文档站的 `apps/docs/src/mdx-kit` 是从 `@atom63/mdx` 复制的一部分：68 个文件相同来源，其中 4 个已经不一致，属于正在发生的漂移。排版 primitives（aside、bleed、grid、stack、reveal、stagger、motion token）、通用 block（callout、code-block、tabs、steps、accordion、figure、compare、mermaid、目录等）、MDX provider 和样式迁入 DS，文档站和 atom63-vite 都从同一个包使用，删除 `mdx-kit`。`credits-block`、`craft-demos`、`page-meta` 这类和作品集内容绑定的部分留下。另外 mdx 自带一套基于 photoswipe 的 lightbox，与 ui-react 的 `media-lightbox` 重复，迁入时合并为一套 |
| `os63`、`timeline`、`portfolio-content`、`app-services`、`dev`、`create-atom63` | **留在 atom63-vite** | 产品或内容。`dev` 只有两个开发用 hook（快捷键、调试 class），没有 token 或组件 |
| `dialkit` | **留下或单独成仓** | 是 vendored 的上游项目，自带主题，不用 `--a63` token；是开发工具，不是 DS 组件 |
| `slides`、`resume`、`create-deck`、`create-resume` | **可单独成仓**（"文档引擎"） | 已发布，与 DS、作品集都无关；`resume` 有自己的纸张 token 体系 |
| `ascii-loader` | **保持独立包** | 已经是独立发布的包 |

**iOS 方面：** 这些包在 SwiftUI 里都没有对应实现。`inform` 大部分可以用现有的 `AtomNotice`、`AtomToast` 和 sheet 拼出来；
`widgets/foundation` 需要新写 Swift 视图，工作量较大；`agent` 的 runtime 没有 UI，不需要 Swift 版本。

### 建议的迁入顺序

1. brand 的 logo 组件（约 150 行，顺带消除 DS docs 里的副本）
2. icons 清理（删除重复组件，迁入系统图标映射；6 个使用方要改导入）
3. `mdx` 的通用部分（消除 DS docs 里的 `mdx-kit` 副本，它已经在漂移；同时合并两套 lightbox）
4. `inform`（发布 + 写 DS 文档页；iOS 版本后补）
5. `agent` 的 runtime 和 controller hook（先移除用不到的 `portfolio-content` 依赖）
6. `widgets/foundation`（价值最高、工作量最大：把 Tailwind class 改成 DS 的 CSS / token，还要写 Swift 版本）

---

## 目标 2：对标 Astryx

Astryx 是 Meta 开源的 React 设计系统（MIT，2026-06 公开 beta，0.6.x，组件约 160 个，仅支持 Web，基于 StyleX）。

### 我们领先的地方

- 标准的 DTCG token 源文件；Astryx 没有 DTCG，也没有原生平台输出。
- 同一套 token 生成 SwiftUI；Astryx 只支持 Web。
- Figma **双向**同步 token；Astryx 只做代码 → Figma 的单向同步，而且同步的是组件，不是 token。
- 明确的多品牌色阶和自定义品牌。

### 值得学习的地方（按对"流水线 + craft"的帮助排序）

1. **模板 + 可检索的示例库作为 agent 的入口。** `astryx build` 在设计师挑选过的页面、区块、示例里做排序检索，
   每条结果都附带硬规则（布局不用 div、不写行内样式、一律使用 token）。想提升流程化产出的质量，最快的办法就是给 agent 优秀的范例去照着做。
2. **Vibe tests：** 每晚用固定的一组需求，分别让子 agent 用 Astryx、Tailwind、shadcn、原生 HTML 各实现一遍，
   再由另一个 agent 对照参考图评分，覆盖正确性、可访问性、代码质量、设计等维度。这样"品味"就成了可以做回归测试的指标。
3. **把 craft 写成 lint 规则：** `no-raw-color`、`no-physical-properties`、`focus-outline-keyboard-only`、
   `no-hover-on-disabled`、`no-style-only-wrapper` 等。成本低，能机械地拦住手艺上的失误。
4. **a11y 规格即合约：** 每个 APG 交互模式只写一次数据合约，组件绑定这个合约，再用真实的无障碍树校验。
   比逐个 story 跑 axe 更强；同一份合约还可以同时约束 React 和 SwiftUI。
5. **用几个参数生成整套刻度：** 字号 = 基准 × 比例^档位，圆角 = 基准 × 倍数，动效时长 = 基准 × 比例。
   正好对应我们的个性化轴，给品牌方一组少而安全的调节旋钮。
6. **把适配条件写成 token 规则：** 例如 `when: { pointer: coarse, width < md, contrast: more }`，
   可以把密度、OS chrome 等分散的处理统一成声明式数据。
7. **按组件、按语义目标的主题覆盖 + 自定义变体：** 主题可以写 `button: { 'variant:ghost': … }`，
   新的 `prop:value` 构建后会变成带类型的 prop。这让 aqua、retro 这类主题有可控的扩展方式，不用 fork。
8. **CLI / MCP 是文档的唯一来源：** 文档站由 CLI 的输出生成，另外提供 JSON 输出、稳定的错误码和 manifest，
   文档不会因为存在第二份副本而过期。
9. **每个破坏性变更都附带 codemod，并在 CI 里验证；** 另有 `lab` 包，组件在进入 `core` 之前先在 lab 里孵化。
10. **程序化的设计准则：** 例如由外到内的四阶段布局法、"最弱容器"原则、紧 / 松间距的节奏、"高频操作不做动画"。
    这些是 agent 能直接遵循的规则，而不是空泛的原则。

---

## 目标 3：一个 DS 同时服务 React/Web 和 iOS

### 现状

- **iOS 的颜色来自生成器里一张手写映射表，完全绕过了 `semantics.css`，已经发生偏差：**
  - iOS 的主色仍是 `#2C7FFF`（b1-500）。白字在它上面只有 3.6:1，正是我们在 Web 上刚修掉的 AA 问题。
  - 主色前景色的规则不同；success / warning 状态色用的档位也不同（Web 500，iOS 600）。
  - overlay 表面、`text-accent`、焦点环、表面色调等语义在 iOS 上都没有。
- **个性化轴只有 1 个到了 iOS：** 13 个轴中只有亮 / 暗模式；品牌、主题、表面、密度、圆角、字号比例都没有。
- **组件数量：** React 69 个组件，iOS 约 27 个 `Atom*` 视图；跨渲染器 contract 有 27 个。
- **没有值级别的一致性检查：** 现有检查只对比状态和行为，以及 Swift 文件是否是最新生成的，
  不比较 Web 和 iOS 实际解析出来的颜色值。

### 方向

1. **立刻：** Swift 颜色改为从 token manifest 的语义条目按模式、品牌生成，删除手写映射表；
   同时新增值级别的一致性检查（Chromium 解析出的值对比 Swift 字面值），放进 CI。
2. **之后：** `AtomTheme` 改为运行时解析器，读取按轴生成的数据表，让品牌、密度等轴也能在 iOS 上生效（范围见决定 D2）。

---

## 目标 4：统一 token 架构，消除黑盒和漂移，Figma 1:1，贴近 Tailwind + shadcn 习惯

### 现状

**DTCG 生成的 token 只占 841 / 1491（约 56%），其余是手写 CSS：**

- `brand.css`：品牌色阶映射、主操作色、`oklch(from …)` 自动对比度公式、焦点环
- `semantics.css`：全部语义角色、亮 / 暗两套、22 个 `color-mix()` 表面色调公式
- `contracts/*.css`：18 个文件，约 330 条
- 字体、圆角、效果等 foundation 文件

**有一部分连 token manifest 都看不到，所以 Figma 和 iOS 也看不到：**

- 4 个主题文件（aqua / modern / retro / terminal）：每个 66 条以上，共 187 个公式
- `os/macos.css`、`os/windows.css`
- 组件 recipe CSS 里的 184 个局部变量

**Figma：** 13 个集合、989 个变量，模式、品牌、表面、密度等都是真正的 Figma mode。

- **主题轴、OS 轴没有进入 Figma。** 表面色调固定为 0%。
- **公式被展开成了固定值。** 设计意图因此丢失。
- **阴影和字体变成了普通变量**，而不是 effect style 和 text style。

**Figma 回写代码：** 只支持单模式集合中、定义在 `.tokens.json` 里的字面值。实际上设计师只能改 foundation 的原始值和调色板，
语义层一个都改不了。

**Tailwind / shadcn：** `bg-primary`、`text-muted-foreground`、`ring-ring`、`border-border` 这些角色都能直接用。缺口有：

- 缺少 `--chart-1..5` 和 `--destructive-foreground`；`secondary` 映射到了 muted。
- 组件基于 Base UI（不是 Radix），使用 `render` prop，样式是 `.a63-*` 加 `data-variant`，不是 cva。
  所以"写法像 shadcn"，但不能直接替换。
- 没有 shadcn registry。

### 方向：DTCG 成为唯一源头，CSS / Swift / Figma 全部由它生成

1. **语义、品牌、contract 迁入 DTCG。** 亮 / 暗、品牌等写成 resolver modifier，CSS 变成纯输出。
2. **主题也写成 resolver modifier。** 这样它能在 Figma 里成为 mode、在 iOS 里成为 `AtomTheme` 的取值。
3. **公式在 DTCG 的 `$extensions` 里声明派生规则（如 `io.atom63.derive`）。** 生成器为每个模式预先算好值给 Figma，
   并在插件里标为只读、注明来源，让设计师知道"这个值是算出来的，要改就改输入"。
4. **打通 Figma 回写。** 完成第 1 步后，`token-patch` 扩展到多模式集合、别名和字符串。
5. **阴影、字体生成 Figma 的 effect style 和 text style；** 为已有 contract 的组件加 Code Connect。
6. **Tailwind / shadcn：** 补上 `--chart-*`、`--destructive-foreground`；是否做 registry 见决定 D4。
7. **提高上限：** 引入 Astryx 式的"参数生成刻度"和"适配规则"，作为个性化轴的声明式来源。

**需要注意的约束：** Figma 一个集合只有一个 mode 维度，同时随两个轴变化的 token（例如品牌 × 模式）无法直接表示。
设计 DTCG 结构时要让每个 token 只沿一个轴变化，跨轴的部分用别名串联（例如语义色随模式变化，再引用随品牌变化的品牌色）。
这也是"Figma 1:1"能否成立的关键。

---

## 目标 5：流水线式产出，同时把控 craft 和 taste

### 现状

**已有：**

- contract 先行（69 个 TypeScript contract）
- Storybook 446 个 story：axe、SSR、Firefox / WebKit、完整尺寸视觉回归
- API 报告、包正确性检查、体积预算、打包冒烟测试
- 15 个以上的审计脚本、changesets、PR 模板

**缺少：**

- **组件脚手架：** 现在 contract、recipe CSS、组件、story、测试、文档、Swift 全靠手工拼装。
- **自动生成的文档：** 69 个组件里只有 7 个有文档页，而且都是手写的。
- **设计评审环节：** 没有设计师审批，也没有 Figma 设计与实际渲染的对比。
- **iOS 截图测试。**
- **写进 CI 的 craft 标准。**

### 方向（参考 Astryx，结合我们已有的基础）

1. **`pnpm ds:new <name>` 脚手架：** 一次生成 contract、recipe、React 组件、story、测试、MDX、Swift 桩代码，
   并自动接入所有检查。
2. **contract 作为唯一规格：** 同一个 contract 驱动 React 的 props 类型、Swift API、Figma 组件属性（Code Connect）、
   文档页和 a11y 规格。
3. **模板和区块库 + agent 入口：** 精选页面和区块作为范例；提供 MCP 或 CLI，以及 `AGENTS.md`，让 agent 先检索范例再动手。
4. **craft lint 规则：** 先做代价最低的一批：禁止原始颜色值、禁止物理方向属性、焦点环只在键盘操作时显示、禁用态不响应 hover。
5. **vibe tests：** 固定一组需求，每晚生成并评分，把"品味"变成有基线的指标。
6. **lab → core 的孵化流程，** 破坏性变更附带 codemod。

---

## 我的额外建议

- **把"品味"落到可以检查的东西上：** 一份 craft 评分表（间距节奏、层级、对齐、动效、状态完整性），
  用在设计评审和 vibe tests 的打分里；再配一个精选的"好例子"截图库，作为评审时的参照。
- **iOS 截图测试：** 用 swift-snapshot-testing 给 27 个 iOS 组件加截图，和 Web 的视觉回归对称。
- **给 system 做一个"产品化"的样板应用**（例如一个小工具或一个页面模板），把 DS、pattern、模板串起来走一遍完整流程，
  用它来检验"流水线"是否真的可用。它应该放在 DS 仓库里作为 example，而不是放在作品集里。

---

## 建议的阶段安排

| 阶段 | 内容 | 目的 | 进度 |
|---|---|---|---|
| A. 正确性（近期、小） | Swift 颜色改从语义 token 生成；新增 Web / iOS 值级别一致性检查 | 修复已经存在的漂移 | 已完成（#24） |
| B. 唯一源头（最大的一步） | 语义、品牌、contract、主题迁入 DTCG + resolver；公式写成派生规则；主题进入 Figma mode；打通 Figma 回写 | 消除黑盒，实现 Figma 1:1 | 已完成：B1–B7（#25–#32）、B8a（#45）、B8b（响应式字号） |
| C. 流水线 | 脚手架、由 contract 生成文档、MCP / CLI、craft lint、模板库 | 流程化产出 | 未开始 |
| D. pattern 迁入 | brand logo、icons 清理、mdx 通用部分、inform、agent runtime、widgets foundation | 完成分离 | 未开始 |
| E. 质量标杆 | a11y 规格合约、vibe tests、iOS 截图测试 | 把控 craft 与 taste | 未开始 |

A 可以马上开始。B 需要先定下 D1；D 和 C 可以部分并行。（2026-09-25 更新：token manifest 的 1669 条中，1603 条由 DTCG 生成；其余 66 条是 DTCG 无法表达类型的 CSS 原生值，放在 `*.native.css` 中，每条都在 `native-values.json` 里写明原因；没有其他手写 token。）

---

## 决定记录（2026-09-24 已拍板）

| 决定 | 结论 |
|---|---|
| D1 | A：全部迁入 DTCG，分两步（先语义和品牌，再 contract 和主题） |
| D2 | B：模式 + 品牌 + 主题；密度、字号等跟随 iOS 系统机制 |
| D3 | A：每个 pattern 一个包，`./core` 与 `./react` 子路径分开 |
| D4 | 先 A（补 token），阶段 C 再做 B（shadcn registry） |
| D5 | A：与脚手架一起在阶段 C 做 |
| 遗留 1 | 补上 26 个公开类型的导出 |
| 遗留 2 | 报告 WebKit bug：内容由 Claude 起草，你用自己的账号提交 |
| 遗留 3 | 24 个重复的 `--surface-*` 变量在阶段 B 中删除 |

以下保留各决定的背景、选项和权衡，供日后查阅。


### D1. "DTCG 为唯一源头"做到哪一层

- **背景：** 现在 DTCG 只覆盖 foundation 层；语义、品牌、contract、主题都是手写 CSS。
- **选项：**
  - **A. 全部迁入：** foundation、语义、品牌、contract、主题全部进 DTCG，CSS、Swift、Figma 都是生成物。
  - **B. 迁到语义层为止：** 主题和 contract 仍然手写 CSS，只保证语义层以下 1:1。
  - **C. 维持现状：** 只补一个"CSS → manifest"的完整性检查。
- **权衡：** A 工作量最大（约 650 条 token，外加 187 个主题公式），但只有它能真正消除黑盒、让主题进入 Figma 和 iOS。
  B 的工作量约为 A 的一半，但主题会继续是黑盒。C 最省事，但达不到你的目标 4。
- **推荐：A，分两步走：** 先迁语义和品牌，验证 resolver 与 Figma mode 的结构；再迁 contract 和主题。

### D2. iOS 的范围

- **背景：** iOS 现在只支持亮 / 暗模式，组件约 27 个。
- **选项：**
  - **A. 全部轴都对齐 Web**
  - **B. 模式 + 品牌 + 主题，** 密度、圆角、字号比例等用 iOS 系统自己的机制（Dynamic Type 等）
  - **C. 只保持模式，** 先把颜色语义对齐
- **权衡：** A 成本最高，而且和 iOS 平台习惯有冲突（例如字号应该跟随 Dynamic Type）。B 兼顾品牌一致性和平台习惯。
  C 最省事，但"一个 DS 服务两端"只停留在颜色层面。
- **推荐：B。** 阶段 A 先完成颜色对齐（相当于 C），之后再逐步扩展到 B。

### D3. pattern 层的包结构

- **背景：** inform、agent runtime、widgets foundation 迁入后需要一个位置。
- **选项：**
  - **A. 每个 pattern 一个包：** 如 `@atom63/inform`，用子路径区分 `./core`（headless）和 `./react`（渲染）
  - **B. 一个统一的 `@atom63/patterns` 包**
  - **C. 放进 `@atom63/ui-react`**
- **权衡：** A 边界最清楚，可以单独发布和做版本管理，iOS 也可以按需实现，但包的数量会变多。
  B 管理简单，但体积和版本会耦合在一起。C 最省事，但 headless 内核会被迫依赖 React 渲染层，违背你说的 headless 架构。
- **推荐：A。**

### D4. 对 shadcn 的兼容程度

- **背景：** 现在"角色名一致、写法相似"，但组件不能直接替换 shadcn。
- **选项：**
  - **A. 保持现状，** 补上 chart、destructive-foreground 等 token
  - **B. 另外提供 shadcn registry，** 让使用方可以把 recipe 复制到自己的项目里
  - **C. 组件 API 全面对齐 shadcn**
- **权衡：** C 需要大量重写，还会失去 Base UI 的优势。B 能满足"熟悉 shadcn 的人上手快"，同时保留我们的实现。A 成本最低。
- **推荐：先 A，阶段 C 时再做 B。**

### D5. agent 工具（MCP / CLI）的优先级

- **背景：** Astryx 的核心竞争力之一是"CLI 即文档"和 MCP；我们现在两者都没有。
- **选项：**
  - **A. 放在阶段 C 和脚手架一起做**
  - **B. 提前做，** 先用现有的 contract 和 manifest 提供一个只读的 MCP
- **权衡：** B 能更早让 agent 产出更稳定，但在唯一源头（阶段 B）完成之前，暴露出去的数据还会变动。
- **推荐：A。**

### 之前遗留、仍待你决定的

1. **26 个没有导出的公开类型**（如 `CarouselOptions`、`DrawerRootProps`）：推荐补上导出。
2. **是否向 bugs.webkit.org 报告 WebKit 26.5 的 mask 崩溃：** 推荐报告，我可以把报告内容写好，由你提交。
3. **`aliases.css` 与 surface 重复的 24 个 `--surface-*` 变量：** 推荐在阶段 B 中统一处理，届时一并删除。
