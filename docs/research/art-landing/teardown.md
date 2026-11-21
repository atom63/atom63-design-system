# Art-landing teardown (read-only)

Source: the public showcase at https://ui.oiloil.org/art-landing/ and the public live pages it links
to (`oil-ui-gallery.vercel.app/works/<slug>/live/index.html`). Nothing here comes from the paid
product; no code, images or copy were copied. Measurements are computed styles read in a browser
(Playwright 1.65, Chromium) on 2026-11-21. Where a fact could not be seen, it says so.

Eight pages, two per category:

| Category | Pages |
| --- | --- |
| Atmospheric landscapes | Cairn (W02, glacier and basalt, treasury), Salis (W03, salt-flat mirror, grid dispatch) |
| Darkroom and optics | Forma (W07, silver-gelatin safelight, SQL database), Therm (W09, two-tone thermal, robotics telemetry) |
| Print and paper | Riso (W12, two-spot risograph, design-system publishing), Sora (W13, washi woodblock, writing app) |
| Tactile and surreal | Quicksilver (W17, liquid mercury still life, voice inference), Monolith (W19, mineral stone and titanium hardware, cards) |

Screenshots in `shots/`: `<slug>-desktop.jpg` and `<slug>-mobile.jpg` (full page, 1440 and 390
wide), `<slug>-desktop-fold.jpg` and `<slug>-mobile-fold.jpg` (first viewport, 1440×900 and
390×844). The folder is git-ignored: the shots stay on the machine that took them and never ship in a
package or a published page. Re-create them with the same URLs and widths if needed.

## 1. Hero structure

**Observed.**

- The plate fills the first viewport. The largest hero image covers 0.93–1.06 of the viewport
  area in seven of eight pages (cover-fit, slightly taller than the viewport); Monolith is the
  exception, with a product object on a flat light-grey field (`monolith-desktop-fold.jpg`).
- The plate is composed with an empty band for type. Calm sky, mist, paper or still water sits
  behind the headline; the busy subject (ice, waves, chrome, lava) sits in the bottom 40–50%
  (`cairn-desktop-fold.jpg`, `salis-desktop-fold.jpg`, `sora-desktop-fold.jpg`).
- Two hero layouts appear. Centred: badge, two-line headline, one-line subhead, two buttons, then a
  wide product window starting at about 49% of the viewport height, 62–67% of the viewport wide
  (Cairn, Salis, Sora, Quicksilver). Left: headline block on the left, a smaller product window
  docked bottom-right, about 45% wide (Forma, Therm, Riso; `forma-desktop-fold.jpg`).
- The product UI is a real interface, not a screenshot: a cash dashboard, a SQL console, a draft
  editor, telemetry cards. It is a white or dark-glass window with a large soft shadow.
- Foreground occlusion: Cairn and Salis load a second, separate hero image (`hero-fg.webp`), the
  same scene cut out, stacked above the product window (z-index 3, `pointer-events: none`). In
  Cairn the ice ridge covers the bottom edge of the dashboard; the occluded strip is only chart
  axis and empty padding, never a number or a control (`cairn-desktop-fold.jpg`). Salis instead
  shows a mirrored reflection of the window in the water below it (`salis-desktop-fold.jpg`). Forma,
  Riso, Sora and Therm have no cut-out layer; their windows simply sit on the plate.
- A row of six partner wordmarks sits on the bottom edge of the hero, on the plate
  (`forma-desktop-fold.jpg`, `salis-desktop-fold.jpg`).
- On mobile the plate shrinks to a band behind the window; the window becomes near full width and
  its side rail turns into a tab row; the occlusion layer is barely visible
  (`cairn-mobile-fold.jpg`).

**How we can use it.**

- A hero is three layers with fixed jobs: plate (back), product UI (middle), cut-out foreground
  (front, optional, inert). The cut-out is a second asset made from the plate, not a CSS trick.
- The plate brief must reserve the type band and a UI band. This is a generation constraint, not
  only a crop: put "empty upper third" and "subject in the lower half" in the plate prompt.
- Occlusion may only cover non-information: padding, axis, window chrome. That is a testable
  acceptance rule (no text node or control under the foreground mask).
- On phones, drop or crop the foreground layer and let the window lead.

## 2. Layout grammar

**Observed.**

- Content column of about 1200–1240 px inside 1440 (gutters about 100 px); full-bleed bands break
  out to the viewport edge (`forma-desktop.jpg`).
- Every page uses the same section skeleton, in about the same order: nav; hero; a capability row
  of two image cards at 1:2; a split section (tabs, short copy, two or three stats, on one side; a
  tall image on the other); a three-up feature row (Therm, Riso, Quicksilver); one dark full-bleed
  band with plate and a telemetry window; testimonial or pricing; FAQ split (questions right,
  image left); a closing call to action inside a rounded card on the plate; a five-column footer.
- Sections are 500–925 px tall at 1440; vertical rhythm is generous, and section backgrounds are
  mostly white with exactly one dark band per page, placed around the middle.
- Heading ladder (desktop / mobile): h1 66–74 px / 38–40 px, section h2 36–58 px / 26–38 px, card
  h3 18–24 px; body 15.5–18 px. Line height 1.04–1.08 for display, about 1.5 for body. Tracking is
  negative on display: about −0.025 em for the serif, −0.04 to −0.045 em for sans display.
- Pairing: five pages pair a high-contrast serif display (Playfair Display, weight 400) with a
  neutral grotesque (Inter) for body and UI; Riso, Quicksilver and Monolith use Inter semibold or
  medium as display, and Monolith mixes one serif h2 into a sans page. Six pages add a monospace
  (JetBrains Mono) for figures and code.

**How we can use it.**

- The skeleton is the reusable part. Our pipeline can ship a fixed section list and let the plate
  change; that is exactly what makes these pages look directed.
- We need a display ladder for marketing (about 40 → 72 px across breakpoints) with tight tracking,
  and a serif display role. Our `--a63-type-display` and `display-large` roles and the Brawler
  serif in fonts are the starting point; see gap.md.
- One dark band per page is a rule worth copying as a rhythm device: it is where the second plate
  lives.

## 3. Unity from hero to footer

**Observed.**

- What stays fixed across the page: the image medium (every image on Forma is grainy
  black-and-white with one red light; every image on Sora is indigo woodblock with a red sun),
  the three colours, the font pair, the pill buttons (999 px) and the card radius (14–22 px per
  page), the shadow language.
- What changes per section: framing. Hero is wide landscape; capability cards are close crops;
  the split section uses a tall vertical crop; the dark band is a wide aerial or macro; the closing
  card returns to the hero scene, often at dusk (Cairn, Sora, Forma).
- Each section image is its own asset (`card-*.webp`, `m2-*`, `m3-*` file names), generated in the
  same style, not crops of one master image.
- UI chips and small cards float on section images too (flow pills on Cairn's hedging card, a
  latency tag on Forma's curve), so the product keeps appearing inside the world.

**How we can use it.**

- Lock style tokens once from the hero plate (palette, font pair, radius, shadow), then generate
  per-section plates with the same style prompt and a different shot type: wide, close, vertical,
  aerial, macro, dusk. The shot list is part of the skill.
- The closing section reprises the hero scene: an easy, reliable way to close the loop.

## 4. Palette

**Observed.**

- Each page publishes three swatches on the showcase index: a page tone, one accent, one deep ink.
  For the eight pages: Cairn `#EEF2F6 / #0088CC / #05131E`, Salis `#F3F5F4 / #0B8A8F / #0A2A2E`,
  Forma `#E9E9E7 / #E03118 / #0C0C0C`, Therm `#07102E / #F59E0B / #FFFFFF`, Riso
  `#F5F5F2 / #FF3B30 / #1A44E6`, Sora `#E8EFF4 / #D63227 / #0B2542`, Quicksilver
  `#EFEFF2 / #B8F200 / #0A0B0D`, Monolith `#EAECEB / #5E1B28 / #2A0F14`.
- The accent is a small, saturated element inside the plate: the red light on Forma's sea, the red
  sun on Sora, glacier cyan on Cairn, molten amber on Therm. Quicksilver's hero is monochrome
  chrome, and its lime accent first appears in the dark band's plate.
- The deep ink matches the dark band background (Cairn band `rgb(7,19,29)` against `#05131E`; Sora
  band `rgb(8,27,51)` against `#0B2542`).
- UI chrome stays neutral: black or white pill buttons, white windows, grey text
  (`rgb(72,89,103)` on Cairn). The accent is used for one or two cues: the primary call to action
  in the dark band, status dots, the chart line.
- Whether the colours were sampled from the image, or the image was prompted to contain them,
  cannot be seen from the page.

**How we can use it.**

- Map plate colours to three roles, not seven: page tone → surface, deep ink → text and the dark
  band surface, one accent → `action`/`brand` cue. Everything else stays neutral. This fits rule 5
  (accent for one or two cues) as it is.
- Pick the accent from a small saturated region of the plate, and check it as a text and fill
  colour against both page tone and deep ink.

## 5. Interaction and motion

**Observed.**

- Scroll parallax is small. After a 300 px scroll the hero plate is translated about +12 to +24 px
  (it moves slower than the page), section images about −12 to −22 px; Forma's section images move
  the other way (+21 to +24 px). No sticky sections; one fixed element (the nav) per page.
- Load: the hero copy rises in a short staggered entrance (animations named `*HeroRise` on all five
  probed pages). Ambient loops: pulsing status dots, a chart line drawing in, an arrow pulse along a
  flow (`*Pulse`, `*CurveDraw`, `*LineDraw`). No video, no canvas, no WebGL.
- Hover: buttons and the product window deepen their shadow (Cairn button: none → `0 8px …`; the
  window's shadow grows from 32 to 40 px) over 0.18–0.34 s with an ease-out curve
  (`cubic-bezier(0.22, 1, 0.36, 1)` on Cairn and Forma). No observed scale-up on cards.
- Frosted glass (`backdrop-filter`) on 3–13 elements per page: pills, chips, dark windows.
- Every probed page has a `prefers-reduced-motion` rule. What it turns off cannot be seen without
  reading their code, which we did not do.
- Tabs and toggles inside the product UI work (period switches, FAQ accordions).

**How we can use it.**

- Motion budget: one entrance on load, slow parallax of at most about 8% of scroll distance,
  shadow-only hover, a couple of ambient pulses. Everything else is static. This fits our motion
  tokens and the reduced-motion rule we already enforce.
- Live product UI built from our own components (Tabs, SegmentedControl, Accordion) is the cheapest
  way to make the page feel real.

## 6. Style ↔ product character

**Observed.**

- The showcase groups styles by audience: finance and enterprise → glacier, anodized stone,
  cyanotype, described as quiet and trustworthy; AI and developer tools → infrared film,
  darkroom X-ray, silver gelatin, described as dark and precise; collaboration and consumer → sky
  collage, risograph, pool caustics, described as light and tactile.
- In the pages, the medium is also a metaphor for what the product does: salt-flat mirror ↔ grid
  balance; liquid mercury ↔ fast, fluid inference; a thermal camera ↔ robotics vision; risograph
  ↔ a design-system publishing tool; calm woodblock waves ↔ distraction-free writing.
- Dark-first plates (Therm) go with operational, monitoring products; light plates with finance
  and writing.

**How we can use it.**

- Pick a style on two axes: audience temperature (calm/trust ↔ sharp/technical ↔ bright/playful)
  and a metaphor for the product's core verb. The skill asks for both and proposes two or three
  candidates.
- For ATOM63 (motion design, tools, an OS feel) the technical/optical end is our natural ground;
  styles.md will define our own set rather than reuse these names.

---

# Art-landing 拆解（只读）

来源：公开展示页 https://ui.oiloil.org/art-landing/，以及它链接出去的公开 live 页面（`oil-ui-gallery.vercel.app/works/<slug>/live/index.html`）。没有碰付费内容，没有复制任何代码、图片和文案。数据是 2026-11-21 用 Playwright 1.65（Chromium）在浏览器里读出的计算样式；看不出来的地方直接写「看不出来」。

共 8 页，每个类别 2 页：

| 类别 | 页面 |
| --- | --- |
| 异境风光 | Cairn（W02，冰川与玄武岩，资金管理）、Salis（W03，盐沼镜面，电网调度） |
| 暗房与光学 | Forma（W07，银盐暗房安全灯，SQL 数据库）、Therm（W09，双色热成像，机器人遥测） |
| 版画与纸本 | Riso（W12，双色孔版，设计系统发布）、Sora（W13，和纸木刻，写作应用） |
| 器物与超现实 | Quicksilver（W17，液态水银静物，语音推理）、Monolith（W19，矿石与钛金属硬件，企业卡） |

截图在 `shots/`：`<slug>-desktop.jpg` 和 `<slug>-mobile.jpg` 是整页（1440 宽 / 390 宽），`<slug>-desktop-fold.jpg` 和 `<slug>-mobile-fold.jpg` 是首屏（1440×900 / 390×844）。这个目录已加进 git ignore：截图只留在拍摄的那台机器上，不进任何包或发布页面；需要时用同样的地址和宽度重拍。

## 1. 首屏结构

**观察到的事实**

- 主画面铺满首屏。8 页里有 7 页，首屏最大那张图占视口面积 0.93–1.06（cover 裁切，比视口略高）。例外是 Monolith：浅灰平底上放一个产品实物（`monolith-desktop-fold.jpg`）。
- 画面构图里预留了放字的空带：标题后面是平静的天空、雾、纸面或静水，热闹的主体（冰、浪、铬、熔岩）压在下方 40–50%（`cairn-desktop-fold.jpg`、`salis-desktop-fold.jpg`、`sora-desktop-fold.jpg`）。
- 首屏有两种版式。
  - 居中式（Cairn、Salis、Sora、Quicksilver）：徽标、两行标题、一行副标、两个按钮，下面一个宽产品窗口，上沿约在视口高度 49% 处，宽占视口 62–67%。
  - 左对齐式（Forma、Therm、Riso，`forma-desktop-fold.jpg`）：标题块在左，较小的产品窗口停在右下，约 45% 宽。
- 产品界面是真能操作的界面，不是截图：现金仪表盘、SQL 控制台、草稿编辑器、遥测卡片。外观是白色或深色毛玻璃窗口，带大面积柔和阴影。
- 前景遮挡：Cairn 和 Salis 额外加载一张独立的首屏图（`hero-fg.webp`），是同一场景的抠图，叠在产品窗口上面（z-index 3，`pointer-events: none`）。
  - Cairn 的冰脊压住仪表盘下沿，被挡住的只有图表坐标轴和空白内边距，从不挡数字或控件（`cairn-desktop-fold.jpg`）。
  - Salis 的做法不同：水面里映出窗口的倒影（`salis-desktop-fold.jpg`）。
  - Forma、Riso、Sora、Therm 没有抠图层，窗口直接放在画面上。
- 首屏底边压着一排 6 个合作方字标，直接放在画面上（`forma-desktop-fold.jpg`、`salis-desktop-fold.jpg`）。
- 手机上画面缩成窗口后面的一条背景带；窗口接近全宽，侧边栏变成一排 tab；遮挡层几乎看不到（`cairn-mobile-fold.jpg`）。

**我们可以怎么用**

- 首屏固定三层，各管一件事：画面（后）、产品 UI（中）、抠图前景（前，可选，不接收交互）。前景是从画面另做出来的一张图，不是 CSS 技巧。
- 画面 prompt 必须预留放字带和放 UI 带。这是生成阶段的约束，不能只靠裁切：prompt 里写明「上三分之一留空」「主体在下半部」。
- 遮挡只许盖住不承载信息的部分：内边距、坐标轴、窗口边框。这条可以写成验收：前景遮罩下面不能有文字节点或控件。
- 手机上去掉或裁掉前景层，让窗口成为主角。

## 2. 版式语法

**观察到的事实**

- 1440 宽下内容列约 1200–1240 px，两侧留白约 100 px；通栏色带直接撑到视口边（`forma-desktop.jpg`）。
- 每一页用的是同一套 section 骨架，顺序也基本一致：
  1. 导航；
  2. 首屏；
  3. 能力区：两张 1:2 的图卡；
  4. 左右分栏：一边是 tabs、短文案、2–3 个数字，另一边是一张竖图；
  5. 三栏特性（Therm、Riso、Quicksilver 有）；
  6. 一条深色通栏：画面加一个遥测窗口；
  7. 用户评价或定价；
  8. FAQ 分栏：问题在右，图在左；
  9. 收尾 CTA：放在画面上的圆角卡片里；
  10. 五列页脚。
- 1440 宽下每个 section 高 500–925 px，上下节奏很宽松。section 背景大多是白色，每页正好一条深色通栏，位置在页面中段。
- 字号阶梯（桌面 / 手机）：
  - h1 66–74 px / 38–40 px；
  - section 的 h2 36–58 px / 26–38 px；
  - 卡片 h3 18–24 px；
  - 正文 15.5–18 px。
- 行高：大标题 1.04–1.08，正文约 1.5。大标题字距为负：衬线约 −0.025em，无衬线大标题 −0.04 到 −0.045em。
- 字体搭配：
  - 5 页用高反差衬线做大标题（Playfair Display，字重 400），配中性无衬线（Inter）做正文和 UI；
  - Riso、Quicksilver、Monolith 用 Inter semibold / medium 做大标题，Monolith 在无衬线页面里混了一个衬线 h2；
  - 6 页另加等宽字体（JetBrains Mono）显示数字和代码。

**我们可以怎么用**

- 真正可复用的是骨架。我们的流水线可以给一份固定的 section 列表，只换画面；这些页面显得「有人在导演」，靠的正是这一点。
- 需要一套营销用的大标题阶梯（各断点约 40 → 72 px）、字距收紧，外加一个衬线 display 角色。起点是现有的 `--a63-type-display` / `display-large` 角色和 fonts 里的 Brawler 衬线，详见 gap.md。
- 「每页一条深色通栏」值得照搬，当作节奏手段：第二张画面就放在这里。

## 3. 首屏到页脚的统一

**观察到的事实**

- 全页不变的：
  - 图像媒介：Forma 每张图都是带颗粒的黑白、加一束红光；Sora 每张图都是靛蓝木刻、加一个红日；
  - 三个颜色、字体组合；
  - 胶囊按钮（999 px）和卡片圆角（每页固定在 14–22 px 之间的某个值）；
  - 阴影语言。
- 每个 section 换的是构图：
  - 首屏是宽景；
  - 能力卡是近景裁切；
  - 分栏区是竖幅；
  - 深色通栏是宽幅航拍或微距；
  - 收尾卡回到首屏场景，常换成黄昏（Cairn、Sora、Forma）。
- 每个 section 的图都是单独一张图（文件名 `card-*.webp`、`m2-*`、`m3-*`），用同一画风生成，不是从一张大图裁出来的。
- section 图片上也浮着 UI 小件（Cairn 对冲卡片上的流程胶囊、Forma 曲线上的延迟标签），产品始终出现在这个画面世界里。

**我们可以怎么用**

- 从首屏画面一次性锁定风格 token（色板、字体组合、圆角、阴影）；之后每个 section 用同一份画风 prompt、换一种镜头生成：宽景、近景、竖幅、航拍、微距、黄昏。镜头表写进 skill。
- 收尾 section 回到首屏场景，这是收住整页最省事、也最稳的办法。

## 4. 配色

**观察到的事实**

- 展示页给每个示例标了三个色：页面底色、一个强调色、一个深色墨。8 页分别是：
  - Cairn `#EEF2F6 / #0088CC / #05131E`
  - Salis `#F3F5F4 / #0B8A8F / #0A2A2E`
  - Forma `#E9E9E7 / #E03118 / #0C0C0C`
  - Therm `#07102E / #F59E0B / #FFFFFF`
  - Riso `#F5F5F2 / #FF3B30 / #1A44E6`
  - Sora `#E8EFF4 / #D63227 / #0B2542`
  - Quicksilver `#EFEFF2 / #B8F200 / #0A0B0D`
  - Monolith `#EAECEB / #5E1B28 / #2A0F14`
- 强调色是画面里一小块高饱和元素：Forma 海面上的红光、Sora 的红日、Cairn 的冰川青、Therm 的熔融琥珀。Quicksilver 的首屏是单色铬，它的青柠强调色到深色通栏的画面里才第一次出现。
- 深色墨和深色通栏的底色一致（Cairn 通栏 `rgb(7,19,29)` 对 `#05131E`；Sora 通栏 `rgb(8,27,51)` 对 `#0B2542`）。
- UI 部分保持中性：黑或白的胶囊按钮、白窗口、灰字（Cairn 正文 `rgb(72,89,103)`）。强调色只用在一两处提示上：深色通栏里的主 CTA、状态点、图表线。
- 颜色是从图里取的，还是生成时让图里包含这些颜色，看不出来。

**我们可以怎么用**

- 画面颜色映射成三个角色，不是七个：
  - 页面底色 → surface；
  - 深色墨 → 文字色和深色通栏的 surface；
  - 一个强调色 → `action` / `brand` 提示。
  其余全部中性。这和规则 5（强调色只用于一两处提示）直接吻合。
- 强调色从画面里一小块高饱和区域取，取完要分别对页面底色和深色墨，检查它做文字色和填充色时的对比度。

## 5. 交互与动效

**观察到的事实**

- 滚动视差很小：
  - 滚动 300 px 后，首屏画面位移约 +12 到 +24 px（比页面滚得慢）；
  - section 图片位移约 −12 到 −22 px；
  - Forma 的 section 图片方向相反（+21 到 +24 px）。
  没有 sticky section，每页只有一个 fixed 元素（导航）。
- 加载：首屏文字有一段短的错开入场（5 个探测页面都有名为 `*HeroRise` 的动画）。常驻小循环有三种：状态点呼吸、图表线描出、箭头沿流程脉冲（`*Pulse`、`*CurveDraw`、`*LineDraw`）。没有视频、canvas 或 WebGL。
- Hover：按钮和产品窗口只加深阴影（Cairn 按钮从无阴影变 `0 8px …`；窗口阴影从 32 px 加到 40 px），时长 0.18–0.34s，缓出曲线（Cairn 和 Forma 是 `cubic-bezier(0.22, 1, 0.36, 1)`）。没看到卡片放大。
- 每页有 3–13 个毛玻璃元素（`backdrop-filter`）：胶囊、标签、深色窗口。
- 每个探测页面都有 `prefers-reduced-motion` 规则；具体关掉了什么，不读对方代码看不出来，我们没有读。
- 产品 UI 里的 tab 和开关都能用：时间段切换、FAQ 折叠。

**我们可以怎么用**

- 动效预算：
  - 加载时一次入场；
  - 慢速视差，最多约为滚动距离的 8%；
  - hover 只变阴影；
  - 一两个常驻脉冲。
  其余都静止。这套和现有的 motion token、已经强制执行的 reduced-motion 规则都对得上。
- 用我们自己的组件（Tabs、SegmentedControl、Accordion）搭可操作的产品 UI，是让页面显得真实最便宜的办法。

## 6. 画风 ↔ 产品气质

**观察到的事实**

- 展示页按受众给画风分组：
  - 金融与企业 → 冰川、阳极氧化石材、蓝晒，定位是安静、可信；
  - AI 与开发者工具 → 红外胶片、暗房 X 光、银盐，定位是深沉、精确；
  - 协作与消费 → 天空拼贴、孔版、泳池焦散，定位是明亮、有触感。
- 具体到每一页，媒介同时也是产品功能的隐喻：
  - 盐沼镜面 ↔ 电网平衡；
  - 液态水银 ↔ 快速、流畅的推理；
  - 热成像相机 ↔ 机器人视觉；
  - 孔版印刷 ↔ 设计系统发布工具；
  - 平静的木刻海浪 ↔ 不受打扰的写作。
- 深色画面（Therm）对应运维、监控类产品；浅色画面对应金融和写作。

**我们可以怎么用**

- 选画风看两条轴：受众温度（沉静可信 ↔ 锐利技术 ↔ 明亮好玩），以及产品核心动作的隐喻。skill 两样都问，然后给 2–3 个候选。
- ATOM63 偏动态设计、工具、OS 气质，技术 / 光学这一端是我们的主场。styles.md 会定义我们自己的一套，不沿用这些名字。
