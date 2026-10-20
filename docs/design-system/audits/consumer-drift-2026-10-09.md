# 使用方漂移基线（2026-10-09）

> 只读审计。对象是维护者私有仓库 atom63-vite 中使用 Atom63 的 5 个应用和 4 个 UI 包，共 1,116 个源文件（测试、story 和 `.d.ts` 不计入）。
> 规则直接复用本仓库的 `scripts/design-system/lib/craft-rules.mjs`（`raw-color`、`physical-properties`、`focus-visible`、`focus-ring-outline`），也就是 DS 仓库自己 CI 里那套 craft 检查。另外用正则统计了任意值、行内样式和 `dark:` 分支。正则统计是近似值，比如 `aspect-[16/9]` 这类任意值本身是合理的。
> 私有仓库的路径和代码不在这里展开，只保留汇总数字和结论。

## 结果

| 指标 | DS 仓库自身 | 使用方合计 |
|---|---|---|
| 字面颜色（`raw-color`） | 0 | 376 |
| 用阴影画的焦点环（`focus-ring-outline`） | 0 | 180 |
| 物理方向（`physical-properties`） | 0 | 129 |
| `:focus` 而非 `:focus-visible` | 0 | 13 |
| `dark:` 分支 | — | 84 |
| Tailwind 任意值 | — | 629 |
| 行内样式 | — | 191 |

另有 242 处字面颜色来自一个已经没有任何地方导入的样式文件，属于死代码，表里没有计入。

## 主要发现

1. **DS 仓库自己的 craft 基线是 0，但使用方合计有 376 处字面颜色、180 处阴影焦点环、84 处 `dark:` 分支。** 这是 harness 没有跟着走到使用方的直接证据（见 [`../roadmap-next.md`](../roadmap-next.md) 的 N5、N6）。
2. **漂移以“重新实现系统已有的东西”为主，不只是随手写的值：**
   - 最大的一处（88 处字面颜色）是用 Tailwind 色板加 `dark:` 手写了一整套分类徽章配色，而 Badge 本身已经有这些颜色 variant；
   - 焦点环普遍写成 `focus-visible:ring-2 ring-offset-2`，违反规则 8。
3. **DS 自己在分发 Tailwind 默认色板：** `@atom63/styles` 的 `tokens/foundation/palette.css` 是完整的 22 个色相 × 11 档，所以 `bg-orange-500` 在使用方里是合法可用的。N6 的锁定需要从 DS 这一侧做起。
4. **组件复用率不低：** 188 个文件导入了 `@atom63/ui-react`。漂移集中在值和样式层，这正是 lint 最擅长拦截的那一类。
5. **各使用方差异很大：** 最干净的一个应用字面颜色为 0，最重的是作品集网站和作品集 widget 包。后续的 harness 试点选在最重的那个上，前后对比最明显。

## 复现

审计脚本没有入库。对 atom63-vite 的检出目录跑 `craft-rules.mjs` 的 `scanCss` 和 `scanSource`，再加上文中列出的几条正则，就能重新得到这些数字。
