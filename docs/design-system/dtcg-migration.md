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

## 后续层

1. **语义角色**（`semantics.css`、`brand.css` 等）：大量使用 `var()` 引用和
   `color-mix()`，需要用 DTCG 引用语法 `{color.n1.1}` 表示，`color-mix()` 要么保留为 CSS，
   要么扩展生成器支持。
2. **主题和个性化维度**：按 `[data-a63-*]` 选择器重映射，需要设计多套 token 文件（每个维度值一套），
   和 Figma 的集合/模式对应。
3. 完成语义层后，再做 Figma → 代码同步（Figma 插件导出 DTCG，提 PR）。
