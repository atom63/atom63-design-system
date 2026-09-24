# DTCG 迁移（第 3 步）

> 决策记录。背景见 `production-ds-plan.md` 的 D1：token 源头逐层迁到 DTCG 2025.10，
> 顺序是基础原子值 → 语义角色 → 主题和个性化维度；contracts 和 recipes 仍然手写 CSS，只引用 token。

## 第 1 层：基础原子值（已完成）

- **范围**：`src/tokens/foundation/primitives.css`（416 个）和 `palette.css`（242 个），共 658 个 token。
  两个文件全是字面量，没有引用和计算，适合作为第一层。
- **源文件**：同目录下的 `primitives.tokens.json` 和 `palette.tokens.json`。CSS 改为由
  `scripts/build-css-from-dtcg.mjs` 生成，文件路径不变，所以 manifest 里记录的 `sourceFile` 也不变。
- **命名**：DTCG 分组路径用 `-` 连接就是 CSS 变量名。分组沿用 manifest 里已有的 Figma 路径
  （例如 `spacing` > `1`），和 Figma 插件保持一致。
- **既是 token 又是分组**：`z-layer-window` 同时有子 token `-ceiling` 和 `-overlay`，
  按规范用保留名 `$root` 表示分组自身的值。
- **类型映射**：`rgba()` → `color`（srgb，分量 0–1，同时写 `hex`）；`oklch()` → `color`（oklch）；
  `px`/`rem` → `dimension`；`ms`/`s` → `duration`；`cubic-bezier()` → `cubicBezier`；整数 → `number`。
  生成器会检查 `hex` 和分量是否一致，避免只改了其中一个。
- **对外**：两个 DTCG 文件作为 `@atom63/styles/tokens/foundation/*.tokens.json` 导出，
  可以直接给 Style Dictionary、Terrazzo 等工具使用。

### 验证

- 658 个 token 逐个比对：由 JSON 生成的 CSS 值和原来的字符串完全一致。
- 重新生成后 manifest、Figma 同步模型、Figma tokens、z-layers 零改动；Swift token 检查通过。
- styles 的浏览器测试通过；Storybook 视觉回归 446/446 一致。

## 第 2 层：基础引用（已完成）

- **范围**：`foundation/aliases.css`（24 个）、`fonts.css`（4 个）和 `motion.css`（11 个），共 39 个。
- **引用**：`var(--duration-150)` 写成 DTCG 引用 `{duration.150}`；生成器把引用转回
  `var(--…)`，引用目标不存在时构建失败。引用可以跨文件。
- **字体**：`fontFamily` 类型，字体名数组。DTCG 不记录引号，所以统一规则：CSS 通用族名和系统关键字
  （`serif`、`ui-monospace` 等）不加引号，其余字体名都加引号。结果 `font-family-serif` 和
  `font-family-mono` 里的 `Georgia`、`Menlo` 等多了引号，含义不变；这是 manifest 和 Figma 同步模型里
  唯一的变化。
- **格式**：生成的 CSS 按仓库的 Prettier 配置格式化。
- **发现**：`aliases.css` 和 `surface.css` 里 `n1` 的默认值在 `:root` 上重复声明了同样的 24 个
  `--surface-*` 变量，值也相同。迁移没有改变它，之后单独清理。

### 验证

- 39 个 token 逐个比对：除上述 2 个字体列表的引号外，生成的值与原值完全一致。
- Swift token 检查、styles 浏览器测试、Figma 插件测试通过；Storybook 视觉回归 446/446 一致。

## 第 3 层：surface 个性化维度（已完成）

- **范围**：`surface.css` 的 144 个 token：6 套中性色（n1–n6）× 24 个 `--surface-*` 变量。
- **格式**：DTCG Resolver Module 2025.10。`surface.resolver.json` 里一个 `surface` 修饰器，
  6 个内联 context，默认 `n1`；CSS 属性名记在 `$extensions["io.atom63.css"].attribute`
  （`data-a63-surface`）。生成器为每个 context 输出一条 `[data-a63-surface='nX']` 规则，
  默认 context 同时落在 `:root` 上，和原来的结构一致。
- **tint**：`--a63-surface-tint: 0%` 是百分比，DTCG 的 `dimension` 只支持 px 和 rem，表达不了，
  所以连同说明一起移到手写的 `semantics.css`（使用它的地方）。manifest 里只有这个 token 的来源文件变了。
- **未处理**：`aliases.css` 在 Figma 的 Foundation 集合里也有同样的 24 个 `surface/*` 变量，
  和 Surface 集合重复。删除会让设计师的 Figma 文件少 24 个变量，属于需要你决定的改动，暂时保留。

### 验证

- 144 个值逐个比对完全一致；manifest 只有 `--a63-surface-tint` 的 `sourceFile` 变化，
  Figma 同步模型零变化。
- styles 浏览器测试（包括所有个性化维度）、Swift token 检查、Figma 插件测试通过；
  Storybook 视觉回归 446/446 一致。

## Figma → 代码同步（第一版，已完成）

- **插件**：Sync 页面新增 "Export to code"。`planExport` 对比 Figma 变量和同步模型，
  只导出单模式集合里的字面量颜色和数值，输出 `atom63-token-patch.json`（按 CSS 变量名索引，
  值保持 Figma 的格式）。多模式集合、Figma 里改成引用的变量和字符串 token 会列为 "Not exported"
  并给出原因，不会静默丢弃。
- **仓库**：`pnpm --filter @atom63/styles tokens:apply <patch>` 把值写回 DTCG 源文件并重新生成。
  sRGB token 取最接近的 8 位整数并更新 `hex`；oklch token 用 Björn Ottosson 的公式从 sRGB 换算，
  保留 3 位小数；dimension、duration 按源文件原来的单位写回。任何一个 token 写不进去就全部不写。
- **不在插件里放 GitHub token**：插件只产出文件，PR 在仓库这边开，凭据不进 Figma。
- **验证**：插件端 3 个导出测试（同步后无改动、颜色和数值导出、不支持的情况带原因跳过）；
  仓库端 5 个测试（换算、各色彩空间和单位、全有或全无、格式校验）；端到端把一个补丁应用到真实源文件，
  JSON 只改了对应的值，CSS、manifest、Figma 模型随之更新。

### 真实 Figma 验证（2026-09-24）

- **代码 → Figma**：在新文件里同步，创建 13 个集合、26 个模式、984 个变量；再次预览没有任何改动。
- **发现并修复的问题**：第一次同步在 `setValueForMode` 报 "Mismatched variable resolved type"。
  原因是同步模型里有 9 个引用变量（字体族 `font/app`、`control/font/family`，缓动曲线
  `motion/ease/*` 及引用它们的 `*-feedback-ease`）按启发式被标成 FLOAT，而引用目标是 STRING；
  Figma 要求引用和目标类型一致。生成器现在让引用变量继承目标类型（沿引用链迭代），仍不一致就构建失败；
  测试里的 Figma 假 API 也加上了同样的类型校验，旧模型会让 9 个测试失败。
- **Figma → 代码**：在 Figma 里把 `spacing/4` 改成 18、`color/b1/500` 改成 `#1A66E6`，插件找到正好这 2 个，
  导出补丁；`tokens:apply` 把 Figma 的单精度浮点值精确还原成 `#1a66e6`（8 位通道）和 `18px`。
  用改后的代码重新预览，Foundation 685 个全部不变；Semantic 里由 `brand-500` 计算出的
  `--a63-action-primary-foreground` 和 `--a63-focus-ring` 随之需要更新，符合预期。测试改动随后还原，没有提交。

## 后续层

1. **语义角色**（`semantics.css`、`brand.css` 等）：大量使用 `var()` 引用和
   `color-mix()`，需要用 DTCG 引用语法 `{color.n1.1}` 表示，`color-mix()` 要么保留为 CSS，
   要么扩展生成器支持。
2. **其余个性化维度**（brand、radius、type-scale、font 等）：沿用第 3 层的 Resolver 做法；
   含 `calc()` 或 `color-mix()` 的部分要先决定保留在 CSS 还是扩展生成器。
3. 完成语义层后，再做 Figma → 代码同步（Figma 插件导出 DTCG，提 PR）。
