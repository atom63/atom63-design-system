# Art-landing gap analysis

Compares [teardown.md](./teardown.md) with Atom63 as it is on `main` (f6e5415e). Docs only; no
code is written until YZ confirms the priorities and the open decisions at the end.

Use cases this serves: a product landing page built "plate first", and the creative layer of the
portfolio starter (project heroes, case-study covers, a chapter band in a long case study). Items
marked **portfolio** serve both.

## 1. What we already have

| Need from the teardown | Atom63 today | Use as is? |
| --- | --- | --- |
| Page frame, content column, section rhythm | `Page`, `Container` (`maxWidth`), `Section` (`spacing` tight → spacious), `SectionHeader` from `@atom63/ui-react/layout` | Yes |
| Image cards with copy on the picture (capability row) | `Card` + `CardMedia`, `CardMediaOverlay*`, `CardMediaOverlayScrim` | Yes |
| Controls and text over a picture | `--a63-on-media-*`, `--a63-media-*` tokens (rule 8) | Yes, for chips and buttons on plates |
| Pill buttons, one accent cue | `Button` (`default` neutral solid, one `primary`), rule 5 | Yes |
| Live product UI in the hero | `Frame` (window chrome), `Tabs`, `SegmentedControl`, `Accordion`, `Table`, `Badge`, `Kbd`, widgets | Yes |
| Logo strip | `Marquee` (or a static row) | Yes |
| Frosted chips | `ProgressiveBlur`; surface tokens | Yes |
| Shadow ladder | `--effect-shadow-2xs … 2xl` | Yes; the hero window needs `xl`/`2xl` |
| Stacking | `--z-layer-below`, `-base`, `-default`, `-raised` (in-context band) | Yes, see LayeredScene |
| Lazy images | `Image` (`lazy`, `priority`, `fetchPriority`, `aspectRatio`) | Partly: no `srcset`/`sizes`, no art direction |
| Motion and reduced motion | motion tokens, `useReducedMotion` patterns | Yes |
| Accent from an image | `brand="auto"`: `extractDominantColor` + `applyAutoColorRamp` derive the brand ramp from the wallpaper | Partly: hue/saturation only, runtime only, no surface or ink |
| Serif face | `--font-family-serif` (Brawler); `data-a63-font="serif"` | Partly: switches the whole app, no display-only role |
| Display sizes | `--a63-type-display` 40 px, `display-large` 56 px | Partly: hero needs about 64–72 px and tighter tracking |
| Scroll story with pinned media | `ScrollStage` (`@atom63/mdx/blocks`) | Yes for a case study; not needed for the demo |

Seen in passing, not part of this work: `SectionHeader`'s index-hero class uses `font-secondary`,
which no stylesheet defines, so it falls back to the inherited font.

## 2. What to add, by priority

### P0-1 ArtPlate **portfolio**

A full-bleed picture that owns the crop and leaves room for type and UI.

```ts
interface ArtPlateProps {
  src: string                          // desktop plate
  srcMobile?: string                   // art-directed phone plate (<picture> source)
  alt: string                          // '' when purely decorative
  focus?: { x: number; y: number }     // 0–1 focal point → object-position
  focusMobile?: { x: number; y: number }
  size?: 'viewport' | 'band' | 'card'  // 100svh hero, section band, inset card
  safeArea?: 'top' | 'bottom' | 'start' | 'end' | 'center' // where content may sit
  veil?: 'none' | 'soft' | 'strong'    // on-media veil behind the safe area
  parallax?: boolean                   // ≤8% of scroll, off under reduced motion
  priority?: boolean                   // hero: eager + fetchpriority=high
  children?: ReactNode                 // content placed in the safe area
}
```

Tokens: `--a63-on-media-veil`, `--a63-on-media-veil-strong`, `--a63-media-stage` (fill while
loading), `--z-layer-below`, motion duration/ease tokens, `Container` widths. New: none expected.

Accept when: the hero plate is the LCP element and loads eagerly, every other plate is lazy; the
focal point stays in frame at 390, 768, 1440 and 1920 (screenshot test); content stays inside the
safe area at all four widths; parallax is off with `prefers-reduced-motion`; the story passes axe;
`check:craft` is clean.

### P0-2 LayeredScene **portfolio**

Three fixed layers: plate (back), stage (product UI or a project shot), foreground cut-out (front,
inert).

```tsx
<LayeredScene>
  <LayeredScene.Plate src="…" alt="" focus={{ x: 0.5, y: 0.7 }} />
  <LayeredScene.Stage placement="center-bottom" width="wide">{/* Frame with live UI */}</LayeredScene.Stage>
  <LayeredScene.Foreground src="…-fg.webp" hideBelow="md" />
</LayeredScene>
```

- `Stage.placement`: `center-bottom` | `end-bottom` | `start-bottom`; `width`: `wide` (about 62–67%) | `half`.
- `Foreground`: always `aria-hidden`, `pointer-events: none`, same box as the plate so the cut-out
  lines up; `hideBelow` drops it on phones.

Tokens: reuse the in-context band (`--z-layer-below` plate, `--z-layer-default` stage,
`--z-layer-raised` foreground) instead of adding scene tokens; `--effect-shadow-2xl` for the stage.

Accept when: a test proves no text node or focusable element of the stage lies under an opaque
foreground pixel (sample `elementsFromPoint` over the stage at 1440 and 390); the foreground never
takes focus or clicks; the stage keeps its own surface tokens; the story and docs show both
placements.

### P0-3 Plate-derived theme (plate → palette → semantic tokens)

The teardown shows three roles do the work: page tone, deep ink, one accent. Proposed flow:

1. `atom63 plate palette <image>` (CLI, build time) extracts 5–7 candidate colours, proposes the
   three roles plus two neutrals, and prints contrast for text-on-page, text-on-ink,
   accent-on-page, accent-on-ink and the accent's foreground (WCAG AA 4.5:1 text, 3:1 large text
   and UI).
2. It writes one scoped stylesheet, `[data-a63-plate="<id>"] { … }`, that sets the brand ramp the
   same way `brand="auto"` does (`--color-auto-50 … 950`) and overrides only the page surface, the
   primary/secondary text and the inverse band surface. Every other token keeps following the
   theme.
3. `<PlateScope id="…">` (or the attribute on any element) applies it to a page or one section,
   so a portfolio can give each project its own palette.

Tokens touched: `--a63-surface-page`, an inverse surface for the dark band, `--a63-text-primary`,
`--a63-text-secondary`, the brand ramp → `--a63-action-primary*`. The exact names are checked with
`atom63 token` before writing.

Accept when: the generated scope passes AA for every pair listed in step 1, or the CLI refuses and
says which pair fails; switching `data-a63-mode` still works; removing the attribute restores the
theme; `check:theme-authoring` and `check:craft` pass; a unit test pins the extraction on a fixture
image.

### P0-4 Display type for marketing **portfolio**

- A hero role above `display-large`: `--a63-type-display-hero-*` (font-size, line-height,
  weight), fluid from about 40 px at 390 to 72 px at 1440 with `clamp()`, line height about 1.05.
- Display tracking: `--a63-type-display-*-letter-spacing`, about −0.025 em (serif) and −0.04 em
  (sans). Today the type roles have no tracking token.
- A display font role, `--a63-font-display`, defaulting to `--a63-font-app`, so a plate scope or a
  portfolio can set serif headlines while the UI stays sans. Brawler is the serif we ship.

Accept when: the tokens are generated from DTCG sources with Figma paths; the SwiftUI side is
listed as a follow-up for YZ (no Swift changes here); `SectionHeader variant="display"` can use
the new role; the typography docs page shows the ladder.

### P1-1 Section band and rhythm rules

- `Section` gets an opt-in full-bleed `band` prop (`tone="inverse"` with an `ArtPlate`) for the
  one dark band per page.
- A short docs page states the rules: one dark band per page, in the middle third; section images
  change framing (wide → close → vertical → aerial → reprise), never style; no hard dividers between
  sections, only spacing and the band.

Accept when: the demo page follows the rules, and the rules are in SKILL.md's checklist.

### P1-2 Responsive art direction in `Image`

Add `sources` (`<picture>`), `sizes` and `srcSet` to `Image`, so ArtPlate does not need its own
loader. Accept when: an existing `Image` story renders unchanged and the bundle size check passes.

### P1-3 Ambient motion helpers

A tiny `useParallax` (transform only, ≤8%, reduced-motion aware) and a staggered hero entrance
using the existing motion tokens. Accept when: animations are transform/opacity only and pause
under reduced motion.

### P2 later

- Occlusion lint as a reusable test helper for other pages.
- A `plate check` mode that scores a finished page screenshot against its plate (palette drift).
- More scene placements (reflection under the stage, as on the salt-flat page).

## 3. Decisions for YZ

Each is written out; the recommendation is first.

1. **Where the reference screenshots live.** *Background:* `shots/` holds 32 JPEGs (6.8 MB) of a
   third-party site. The repo is public, so committing them republishes them.
   *Options:* (a) keep them local and git-ignored, commit only the teardown; (b) commit them.
   *Trade-off:* (a) loses the images for other contributors; (b) carries copyright and repo-size
   risk. *Recommend (a).*
2. **Plate theme: build time or runtime.** *Background:* `brand="auto"` already extracts a hue at
   runtime from a wallpaper. *Options:* (a) build-time CLI that writes a scoped stylesheet;
   (b) extend the runtime controller to also derive surface and ink. *Trade-off:* (a) has no flash
   on load, works with static sites, can refuse a failing contrast before publishing; (b) suits
   user-uploaded images in a portfolio but needs the inline-token rule relaxed. *Recommend (a)
   now, (b) later if the portfolio needs uploads.*
3. **Where the demo page lives.** *Options:* (a) a new `examples/art-landing` Vite app, like
   `examples/vite-basic`; (b) a standalone route in `apps/docs`. *Trade-off:* (a) is isolated and
   gives clean Lighthouse numbers, and the docs home is not touched; (b) is visible on
   system.atom63.io immediately. *Recommend (a); link it from the component docs.*
4. **Package home for ArtPlate and LayeredScene.** *Options:* (a) `@atom63/ui-react` through
   `pnpm ds:new` (contract, recipe, docs, tests, web only); (b) a new `@atom63/ui-react/marketing`
   entry. *Trade-off:* (a) follows the repo rules and the agent index as they are; (b) keeps the
   root bundle smaller. *Recommend (a); revisit if the size check complains.*
5. **Serif for display.** *Options:* (a) Brawler, already shipped; (b) add a higher-contrast
   display serif. *Trade-off:* (a) costs nothing; (b) is closer to the editorial look but adds a
   font licence and weight. *Recommend (a) for the demo, judged on screenshots.*
6. **Plate-01.** P5 needs `/assets/art-landing/plate-01.(webp|png)` from YZ, ideally with a
   cut-out foreground and a phone crop. Without it P5 stops.

## 4. Decisions (2026-11-21)

YZ asked the coordinating session to decide; all six follow the recommendation.

1. Reference screenshots stay local: `docs/research/art-landing/shots/` is git-ignored and only the
   teardown is committed. The teardown does not quote the reference pages' copy.
2. The plate theme is generated at build time by a CLI.
3. The demo lives in `examples/art-landing`; later it deploys with the other use cases under
   `system.atom63.io/showcase/`.
4. ArtPlate and LayeredScene go into `@atom63/ui-react` through `pnpm ds:new` (since #313 the root
   entry tree-shakes and single imports have a size budget).
5. Headlines use Brawler first; the choice is reviewed on screenshots.
6. YZ provides plate-01 (an existing image, or one generated from the P3 prompt template with a
   model YZ picks). P5 stops until it arrives; everything else goes ahead.

Priority changes:

- P1-2 (`sources`, `srcSet`, `sizes` on `Image`) joins P0-1 and goes first; ArtPlate uses it instead
  of its own loader.
- Order: P0-1 ArtPlate + Image → P0-4 display type → P0-2 LayeredScene → P0-3 PlateScope.
- P0-3 waits for #315, which adds the `rescope` mechanism that re-declares colour roles on nested
  scopes (`addModeRescope` in `packages/styles/scripts/build-css-from-dtcg.mjs`). PlateScope is
  built on it, not on a parallel system.
- P0-4 only adds optional roles (`display-hero`, display tracking, `--a63-font-display`); the
  values of `display` and `display-large` stay as they are, so screenshot baselines do not move.
- P3 (SKILL.md) and P4 (styles.md) run alongside the components, with our own style names and
  combinations.
- The undefined `font-secondary` in `SectionHeader` stays a note under "seen in passing"; it is
  not fixed on this branch.

---

# Art-landing 差距分析

把 [teardown.md](./teardown.md) 和 `main`（f6e5415e）上的 Atom63 对照。只写文档；YZ 确认优先级和文末待定事项之前，不写代码。

服务的用例有两个：一是「先出画面」的产品落地页，二是作品集 starter 的创意层（项目首屏、案例封面、长案例里的章节通栏）。标了 **作品集** 的项两边都用得上。

## 1. 已有、可直接用的

| teardown 里的需求 | Atom63 现状 | 能直接用吗 |
| --- | --- | --- |
| 页面框架、内容列、section 节奏 | `@atom63/ui-react/layout` 里的 `Page`、`Container`（`maxWidth`）、`Section`（`spacing` 从 tight 到 spacious）、`SectionHeader` | 能 |
| 文字压在图上的图卡（能力区） | `Card` + `CardMedia`、`CardMediaOverlay*`、`CardMediaOverlayScrim` | 能 |
| 图上的控件和文字 | `--a63-on-media-*`、`--a63-media-*`（规则 8） | 能，用于画面上的胶囊和按钮 |
| 胶囊按钮、只用一处强调色 | `Button`（`default` 中性实底，只有一个 `primary`），规则 5 | 能 |
| 首屏里可操作的产品 UI | `Frame`（窗口外框）、`Tabs`、`SegmentedControl`、`Accordion`、`Table`、`Badge`、`Kbd`、widgets | 能 |
| 合作方字标条 | `Marquee`（或静态一行） | 能 |
| 毛玻璃小件 | `ProgressiveBlur`、surface token | 能 |
| 阴影阶梯 | `--effect-shadow-2xs … 2xl` | 能；首屏窗口要用 `xl` / `2xl` |
| 层级 | `--z-layer-below`、`-base`、`-default`、`-raised`（组件内层级段） | 能，见 LayeredScene |
| 图片懒加载 | `Image`（`lazy`、`priority`、`fetchPriority`、`aspectRatio`） | 部分：没有 `srcset` / `sizes`，不能按断点换图 |
| 动效与减弱动效 | motion token、`useReducedMotion` 用法 | 能 |
| 从图里取强调色 | `brand="auto"`：`extractDominantColor` + `applyAutoColorRamp` 从壁纸派生品牌色阶 | 部分：只取色相和饱和度，只在运行时，不管底色和墨色 |
| 衬线字体 | `--font-family-serif`（Brawler）；`data-a63-font="serif"` | 部分：会切换整个应用的字体，没有只管大标题的角色 |
| 大标题字号 | `--a63-type-display` 40 px，`display-large` 56 px | 部分：首屏要 64–72 px，字距也要更紧 |
| 媒体固定、文字滚动的叙事 | `ScrollStage`（`@atom63/mdx/blocks`） | 案例页能用；demo 用不到 |

顺带发现、不在本次范围内：`SectionHeader` 的 index-hero 类名用了 `font-secondary`，但没有任何样式表定义它，所以实际继承了父级字体。

## 2. 需要新增的，按优先级

### P0-1 ArtPlate **作品集**

全幅画面，自己管裁切，并给文字和 UI 留出位置。

```ts
interface ArtPlateProps {
  src: string                          // 桌面画面
  srcMobile?: string                   // 手机单独构图（<picture> source）
  alt: string                          // 纯装饰时为 ''
  focus?: { x: number; y: number }     // 0–1 焦点 → object-position
  focusMobile?: { x: number; y: number }
  size?: 'viewport' | 'band' | 'card'  // 100svh 首屏 / section 通栏 / 内嵌卡片
  safeArea?: 'top' | 'bottom' | 'start' | 'end' | 'center' // 内容可放的区域
  veil?: 'none' | 'soft' | 'strong'    // 安全区后面的 on-media 薄纱
  parallax?: boolean                   // ≤ 滚动距离 8%，减弱动效时关闭
  priority?: boolean                   // 首屏：立即加载 + fetchpriority=high
  children?: ReactNode                 // 放在安全区里的内容
}
```

依赖的 token：`--a63-on-media-veil`、`--a63-on-media-veil-strong`、`--a63-media-stage`（加载时的底色）、`--z-layer-below`、motion 时长 / 缓动 token、`Container` 宽度。预计不新增 token。

验收标准：
- 首屏画面是 LCP 元素，立即加载；其余画面都懒加载；
- 在 390、768、1440、1920 四个宽度下，焦点都不出框（截图测试）；
- 四个宽度下内容都不越出安全区；
- `prefers-reduced-motion` 下视差关闭；
- story 过 axe，`check:craft` 无问题。

### P0-2 LayeredScene **作品集**

固定三层：画面（后）、舞台（产品 UI 或项目截图）、抠图前景（前，不接收交互）。

```tsx
<LayeredScene>
  <LayeredScene.Plate src="…" alt="" focus={{ x: 0.5, y: 0.7 }} />
  <LayeredScene.Stage placement="center-bottom" width="wide">{/* 装着可操作 UI 的 Frame */}</LayeredScene.Stage>
  <LayeredScene.Foreground src="…-fg.webp" hideBelow="md" />
</LayeredScene>
```

- `Stage.placement`：`center-bottom` | `end-bottom` | `start-bottom`；`width`：`wide`（约 62–67%）| `half`。
- `Foreground`：始终 `aria-hidden`、`pointer-events: none`，尺寸和画面同框，保证抠图对齐；`hideBelow` 控制手机上隐藏。

依赖的 token：复用组件内层级段（画面 `--z-layer-below`、舞台 `--z-layer-default`、前景 `--z-layer-raised`），不新增 scene 专用 token；舞台阴影用 `--effect-shadow-2xl`。

验收标准：
- 有测试证明舞台的文字节点和可聚焦元素都不在前景的不透明像素下面（在 1440 和 390 宽下，对舞台区域采样 `elementsFromPoint`）；
- 前景永远拿不到焦点、接不到点击；
- 舞台保持自己的 surface token；
- story 和文档展示两种摆放方式。

### P0-3 由画面派生的主题（plate → palette → semantic tokens）

teardown 显示真正起作用的只有三个角色：页面底色、深色墨、一个强调色。流程如下：

1. 构建时运行 CLI `atom63 plate palette <image>`：
   - 提取 5–7 个候选色，给出三个角色加两个中性色；
   - 打印这些组合的对比度：正文 / 底色、正文 / 墨色、强调色 / 底色、强调色 / 墨色、强调色上的前景字；
   - 标准是 WCAG AA：正文 4.5:1，大字和 UI 3:1。
2. 生成一份作用域样式表 `[data-a63-plate="<id>"] { … }`：
   - 用和 `brand="auto"` 相同的方式设置品牌色阶（`--color-auto-50 … 950`）；
   - 只覆盖页面底色、主 / 次文字色和深色通栏的反色底；
   - 其余 token 继续跟随主题。
3. 用 `<PlateScope id="…">`（或在任意元素上加这个属性）把它作用到整页或单个 section；作品集里每个项目可以有自己的色板。

会改到的 token：`--a63-surface-page`、深色通栏用的反色 surface、`--a63-text-primary`、`--a63-text-secondary`、品牌色阶 → `--a63-action-primary*`。写之前用 `atom63 token` 核对准确名称。

验收标准：
- 生成的作用域在第 1 步列出的每一对颜色上都过 AA；不过时 CLI 拒绝生成，并说明是哪一对没过；
- 切换 `data-a63-mode` 仍然有效；去掉属性就恢复原主题；
- `check:theme-authoring` 和 `check:craft` 通过；
- 有单测在一张固定的测试图上钉住提取结果。

### P0-4 营销用大标题字体 **作品集**

- 在 `display-large` 之上加一个首屏角色 `--a63-type-display-hero-*`（字号、行高、字重）：用 `clamp()` 从 390 宽的约 40 px 流动到 1440 宽的 72 px，行高约 1.05。
- 大标题字距 `--a63-type-display-*-letter-spacing`：衬线约 −0.025em，无衬线约 −0.04em。现在的字体角色没有字距 token。
- 大标题字体角色 `--a63-font-display`，默认等于 `--a63-font-app`。这样 plate 作用域或作品集可以把标题设成衬线、UI 仍用无衬线。衬线字体用已经打包的 Brawler。

验收标准：
- token 从 DTCG 源生成，带 Figma 路径；
- SwiftUI 侧列为 YZ 的后续事项（这次不动 Swift）；
- `SectionHeader variant="display"` 能用上新角色；
- 字体文档页展示这套阶梯。

### P1-1 Section 通栏与节奏规则

- `Section` 加一个可选的全幅 `band` 属性（`tone="inverse"` 配一个 `ArtPlate`），用于每页那一条深色通栏。
- 写一页简短文档说明规则：
  - 每页一条深色通栏，放在中间三分之一；
  - section 图片换构图（宽景 → 近景 → 竖幅 → 航拍 → 回到首屏场景），不换画风；
  - section 之间不用硬分隔线，只靠留白和通栏区分。

验收标准：demo 页遵守这些规则，规则写进 SKILL.md 的验收清单。

### P1-2 `Image` 支持按断点换图

给 `Image` 加 `sources`（`<picture>`）、`sizes`、`srcSet`，ArtPlate 就不需要自己写加载器。

验收标准：现有 `Image` story 渲染不变，bundle size 检查通过。

### P1-3 常驻小动效工具

一个很小的 `useParallax`（只用 transform，≤8%，感知减弱动效），加一个用现有 motion token 的首屏错开入场。

验收标准：动画只用 transform / opacity，减弱动效时暂停。

### P2 以后再做

- 把遮挡检查做成通用测试工具，给其他页面用。
- `plate check` 模式：把成品页截图和 plate 对比打分（色板偏移）。
- 更多场景摆放方式（比如盐沼那页舞台下方的倒影）。

## 3. 请 YZ 拍板

每条都写全了；推荐项放在第一位。

1. **参考截图放哪。**
   - 背景：`shots/` 里有 32 张第三方网站的 JPEG（6.8 MB）。仓库是公开的，提交进去等于再发布一次。
   - 选项：(a) 只留在本地并加进 git ignore，只提交 teardown；(b) 提交进仓库。
   - 权衡：(a) 其他贡献者看不到图；(b) 有版权和仓库体积风险。
   - 推荐 (a)。
2. **plate 主题在构建时生成还是运行时生成。**
   - 背景：`brand="auto"` 已经能在运行时从壁纸取色相。
   - 选项：(a) 构建时用 CLI 生成作用域样式表；(b) 扩展运行时控制器，让它也派生底色和墨色。
   - 权衡：(a) 加载时不闪、静态站也能用、发布前就能拦下对比度不合格的配色；(b) 适合作品集里用户自己上传图片，但要放宽「JS 不写 inline 语义 token」这条规则。
   - 推荐现在做 (a)；作品集真需要上传时再做 (b)。
3. **demo 页放哪。**
   - 选项：(a) 新建 `examples/art-landing` Vite 应用，和 `examples/vite-basic` 一样；(b) 在 `apps/docs` 里加一个独立路由。
   - 权衡：(a) 隔离，Lighthouse 数据干净，也不碰 docs 首页；(b) 马上能在 system.atom63.io 上看到。
   - 推荐 (a)，从组件文档里加链接过去。
4. **ArtPlate 和 LayeredScene 放哪个包。**
   - 选项：(a) 用 `pnpm ds:new` 放进 `@atom63/ui-react`（contract、recipe、文档、测试，只做 Web）；(b) 新开一个 `@atom63/ui-react/marketing` 入口。
   - 权衡：(a) 完全照现有仓库规则和 agent 索引走；(b) 主包体积更小。
   - 推荐 (a)；体积检查报警时再考虑 (b)。
5. **大标题衬线用哪款。**
   - 选项：(a) 已经打包的 Brawler；(b) 新增一款反差更高的 display 衬线。
   - 权衡：(a) 零成本；(b) 更接近杂志感，但多一份字体授权和体积。
   - 推荐 demo 先用 (a)，看截图再定。
6. **Plate-01。** P5 需要 YZ 提供 `/assets/art-landing/plate-01.(webp|png)`，最好附带抠好的前景图和一张手机构图。没有就停在 P5 前。

## 4. 决定（2026-11-21）

YZ 请主 session 代为评估决定；6 项全部按推荐执行。

1. 参考截图只留本地：`docs/research/art-landing/shots/` 加进 .gitignore，只提交 teardown；teardown 里不引用参考页的原文。
2. plate 主题在构建时用 CLI 生成。
3. demo 放在 `examples/art-landing`；以后和其他用例一起部署到 `system.atom63.io/showcase/`。
4. ArtPlate 和 LayeredScene 用 `pnpm ds:new` 放进 `@atom63/ui-react`（#313 之后根入口已能按需引入，单个组件引入也有体积预算）。
5. 大标题先用 Brawler，看截图再定。
6. plate-01 由 YZ 提供（现成的图，或者等 P3 的 prompt 模板写好后由 YZ 选模型生成）。拿到之前 P5 停下，其余照做。

优先级调整：

- P1-2（`Image` 的 `sources`、`srcSet`、`sizes`）并进 P0-1，最先做；ArtPlate 用它，不自己写加载器。
- 顺序：P0-1 ArtPlate + Image → P0-4 大标题字体 → P0-2 LayeredScene → P0-3 PlateScope。
- P0-3 等 #315 合并。#315 给嵌套作用域加了重新声明颜色角色的 `rescope` 机制（`packages/styles/scripts/build-css-from-dtcg.mjs` 里的 `addModeRescope`）；PlateScope 建在这套机制上，不另起一套。
- P0-4 只新增可选角色（`display-hero`、大标题字距、`--a63-font-display`），不改现有 `display` / `display-large` 的数值，避免截图基线大面积变化。
- P3（SKILL.md）和 P4（styles.md）与组件同时做，风格命名和组合用我们自己的。
- `SectionHeader` 里未定义的 `font-secondary` 只记在「顺带发现」里，不在本分支修。
