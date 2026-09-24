# Web / iOS component token parity — assessment

> **Status.** Sequencing step A0 has **shipped** — see
> [What shipped](#what-shipped) for the measured before/after and
> [Proposed sequencing](#proposed-sequencing) for what is still open. The rest of
> this page documents the gap between the web component-token architecture
> (`packages/styles/src/contracts/*`) and the native SwiftUI renderer
> (`packages/ui-ios`), so the remaining fixes can be scheduled deliberately
> rather than discovered one drift at a time.
>
> Companion docs: [cross-renderer-contracts.md](./cross-renderer-contracts.md)
> (what parity currently *means*), [personalization-axes.md](./personalization-axes.md)
> (what the axes own), [authoring-surfaces.md](./authoring-surfaces.md) (where values live).

> **Update 2026-09-24:** the colour side is fixed. `generate-swift-tokens.mjs` now
> resolves every Swift colour from its web semantic or contract token through the
> Figma sync model, with the defaults an app starts with (theme modern, brand b1,
> surface n1), and the hand-written map is gone. The Swift file names the token
> above each colour, and `packages/styles/src/tokens/swift-parity.browser.test.ts`
> compares each one with the value Chromium paints, in light and dark mode. Brand,
> theme and surface are still not native axes on iOS; see section C.

## Summary

The web side is sound. Contracts are layered, axes are orthogonal, and the
component-token namespace (`--a63-*`) is the single place recipes read from.

The iOS side does not consume that architecture. `packages/ui-ios` runs a
**parallel, hand-authored pipeline** that reads foundation primitives directly and
re-declares the semantic layer in JavaScript. Every finding below follows from
that one fact.

Nothing here is a rendering bug today. It is an *absence of coupling*: web values
can change and iOS will keep shipping the old ones with no failing check.

Measurement of four shipping iOS apps (see below) independently supports this
reading, and surfaces a **second, separate problem that is not about iOS at all**:
the control height ramp collapses to the touch target on every phone, in the web
renderer as well as the native one.

## The two pipelines (as assessed, before A0)

Since A0 and phase B, colours take one path to both renderers:

```txt
DTCG sources (tokens · contracts · themes)
  → generated CSS                         → recipes in @atom63/ui-react
  → Figma sync model, resolved in Chromium
    → Scripts/generate-swift-tokens.mjs   → Generated/Atom63Tokens.generated.swift
```

Space, radius and motion on iOS still follow the old path below.

```txt
Web:
  tokens/foundation/*.css
    → tokens/semantics.css + brand.css + surface.css + radius.css …
      → contracts/*.css              (18 namespaces)
        → recipes in @atom63/ui-react
  ↑ 13 personalization axes inject at the semantic / contract layers

iOS:
  tokens/foundation/primitives.css
    → Scripts/generate-swift-tokens.mjs   ← hand-written semantic map lives HERE
      → Generated/Atom63Tokens.generated.swift   (Color / Space / Radius / Motion only)
        → per-component literals inside Atom*.swift
  ↑ only `mode` (light/dark) exists as an axis
```

`generate-swift-tokens.mjs` reads exactly one file (`primitives.css`) and then
maps semantics by hand:

```js
actionPrimary: ['color-b1-500'],
borderSubtle:  ['color-n1-light-4', 'color-n1-dark-6'],
```

That is a second source of truth for what "primary" and "subtle border" mean. The
`--check` mode only verifies the generated Swift file is not stale relative to the
generator's own output — it cannot detect that `semantics.css` moved on.

## Finding 1 — the iOS component token maps are dead files

`packages/ui-ios/tokens/button.json`, `input.json`, `switch.json` declare slot →
Swift property maps (`button.background`, `field.radius`, `selection.accent`).

| Check | Result |
| --- | --- |
| Read by a generator? | No |
| Read by a test or check script? | No |
| Referenced anywhere outside `package.json` `exports`? | No |
| Namespace matches web contracts? | No — `button.*` vs `--a63-action-*` |
| Coverage | 3 files vs 18 web contract namespaces |

They describe an intended bridge that was never built. Either wire them into the
generator as the authoritative slot map, or delete them — as-is they read like a
contract and enforce nothing.

Web contract namespaces for reference: `environment`, `control`, `action`, `field`,
`selection`, `choice`, `segment`, `toggle`, `trigger`, `menu`, `overlay`, `surface`,
`track`, `marker`, `widget`, `badge`, `skeleton`.

## Finding 2 — numeric drift in Button

Web reference is `[data-a63-design-language='ios']` in
`packages/styles/src/contracts/environment.css` (`--a63-space-unit` = 4px).
Native reference is `packages/ui-ios/Sources/Atom63UI/AtomButton.swift`.

| Concern | Web iOS design language | SwiftUI implementation | Assessment |
| --- | --- | --- | --- |
| Size ramp | xs/sm/md/lg/xl = 36/40/44/48/52 | `compact`/`regular`/`icon` = 44, `large` = 52 | 3 rungs missing; `compact` collapses to `regular` |
| Inline padding | 12 / 14 / 16 / 20 / 24 | `compact` 12, `regular` 16, `large` 20 | `large` pairs the **xl** height (52) with the **lg** padding (20) — internally inconsistent |
| Corner radius | `--a63-radius-control` → `--radius-lg`, one value, scaled by `--radius-multiplier` | varies by size: `Radius.medium` / `.large` / `.extraLarge` | Violates the documented rule that design language never owns radius; also bypasses the radius axis |
| Press feedback | `scale(0.97)`, `--a63-motion-ease-emphasized` | `scale(0.98)`, `.easeOut` | Drift on both axes |
| Disabled | `--a63-action-disabled-opacity: 0.56` | `opacity(0.48)` | Drift |
| Min touch target | `--a63-control-min-target`, overridable by the `input` axis | literal `44` in Swift, plus a duplicate `minimumTouchTarget: 44` in the dead JSON | Value stated in three places, enforced in none |
| Variants | 9 (`default`, `primary`, `destructive`, `destructive-outline`, `secondary`, `outline`, `ghost`, `link`, `overlay`) | 6 (`primary`, `neutral`, `secondary`, `destructive`, `outline`, `ghost`) | Reduction is defensible on iOS, but it is not declared in `platformAdaptations.swiftUI` — per the contract doc, an undeclared difference is a conformance gap |

Vertical padding (`Space.x2`) and the `.subheadline` / `.body` / `.headline` type
ramp are additionally invented at the component, with no contract counterpart.
Dynamic Type is arguably the *right* iOS choice — it just needs to be a declared
adaptation rather than an implicit one.

## Finding 3 — axis coverage is 1 of 13

| Axis | Web | iOS native |
| --- | --- | --- |
| Mode | ✅ | ✅ |
| Design language | ✅ | n/a (iOS *is* the design language) |
| Brand (b1–b6) | ✅ | ❌ default b1 only (resolved from the semantic tokens) |
| Theme (modern/aqua/retro/terminal) | ✅ | ❌ |
| Surface (n1–n6) | ✅ | ❌ |
| Surface tint | ✅ | ❌ |
| Type scale | ✅ | ❌ |
| Radius | ✅ | ❌ |
| Font | ✅ | ❌ |
| Density | ✅ | ❌ |
| Input | ✅ | ❌ (44 is fixed) |
| OS | ✅ | n/a |
| Icon theme | ✅ | ❌ |

`AtomTheme` is a static `.standard` value with a fixed colour set. Supporting any
appearance axis natively means turning it into a resolver, which is a product
decision, not a cleanup. It should be decided explicitly rather than drifting.

## Finding 4 — the parity checks do not cover token values

`cross-renderer-contracts.md` reports all 27 contracts as `verified`. That claim is
accurate for what it measures: required states, shared outcomes, accessibility
outcomes, and motion recipes. Verification is deliberately **outcome-based**, so it
does not look at a single token value. No existing check would fail on any row in
Finding 2.

## Finding 5 — documented commands that do not exist

The following appear in docs but are not defined in the root `package.json`:

| Documented as | Where | Reality |
| --- | --- | --- |
| `pnpm check:ios-tokens` | [README.md](./README.md) "Checks that guard the system" | not a script |
| `pnpm check:component-contracts` | [cross-renderer-contracts.md](./cross-renderer-contracts.md) | not a script |

The real commands are package-scoped:

```bash
pnpm --filter @atom63/ui-ios check:swift-tokens
pnpm --filter @atom63/ui-ios check:api
pnpm --filter @atom63/ui-ios check:consumer
```

## Finding 6 — the iOS workflow cannot see its own input

`packages/ui-ios` declares no `lint`, `typecheck`, or `test` script, so it is
entirely outside `pnpm precheck` (`turbo run lint typecheck test`). It is guarded
only by `.github/workflows/ios.yml`.

That workflow's `paths` filter covers `packages/ui-ios/**`,
`packages/ui-foundation/contracts/**`, `apps/ios-demo/**`, and the contract
generator — but **not `packages/styles/**`**, which is the generator's only input.

Consequence: a PR that edits `primitives.css` does not trigger the iOS workflow, so
`generate-swift-tokens.mjs --check` never runs and the stale-token guard is silently
skipped. The one check that does exist is unreachable on the change it protects
against. This is the cheapest fix on the page.

## Reference measurements from shipping iOS apps

Four screenshots of production iOS apps (dark mode) were measured to test whether
our ramp is plausible. Method, so it is reproducible and falsifiable:

- All four render at 920×2000 px. `2000/920 = 2.1739`, which matches the
  **402×874 pt** logical size (iPhone 16/17 Pro) to 4 significant figures
  (`874/402 = 2.1741`). The 393×852 pt class would give 1994 px, not 2000.
- Therefore **1 pt = 920/402 = 2.2886 image px**, and every value below is a
  measured pixel count divided by that constant.
- Control rects were found by connected-component analysis on quantised colour,
  keeping components with area > 2500 px and bounding-box fill > 0.55.
- Corner radius was fitted against the circle model
  `inset(dy) = R − sqrt(R² − (R−dy)²)`.

### Measured control heights

| Height (pt) | Occurrences | What |
| --- | --- | --- |
| 30.6 – 31.5 | 5 | Small filled action pill (X "Follow" ×4) |
| 36.7 – 37.6 | 7 | Nav-bar buttons, inline rows, secondary controls |
| 39.3 – 39.8 | 5 | Search / text fields — **identical 39.8 pt in two unrelated apps** |
| 42.4 – 44.1 | 4 | Primary rows and full-width controls |
| 48.9 | 1 | Outlier |
| 55.1 | 3 | Circular avatars (not controls) |
| 65.1 – 67.3 | 2 | Cards / bubbles (not controls) |

Horizontal screen gutter measured **16.2 pt** (37 px) in two different apps.

The X "Follow" button is a **true pill**: 72×242 px (31.5 × 105.7 pt), and the
circle model predicts its measured width to within 1 px at dy = 4, 16 and 32.
Field radii fit around 10–18 pt — large rounded rects, not pills. So iOS radius is
**control-class dependent**, not one global value.

### Not a unit-conversion artefact

Worth ruling out explicitly, because it is the obvious suspicion.

1. **The scale factor is self-derived, not assumed.** `2000/920 = 2.17391`. Of the
   iPhone logical sizes, only 402×874 pt matches (`874/402 = 2.17413`, 0.01 %
   error). 393×852 gives 2.16794, 390×844 gives 2.16410, 430×932 gives 2.16744 —
   all off by more than an order of magnitude more. The device class is pinned by
   the aspect ratio alone, and `px/pt` follows from the width.
2. **Corroboration:** the Dynamic Island measures 84 px tall in two screenshots.
   Against its 36.67 pt spec height that implies 2.291 px/pt — 0.1 % from the
   2.2886 derived above.
3. **There is no conversion to get wrong.** On iOS, 1 CSS px ≡ 1 pt. Our
   `--a63-control-min-target: 2.75rem` = 44 px = 44 pt. The comparison is direct.

The controls really are smaller than 44 pt. That is the finding, not an error.

### What this says about our ramp

| | xs | sm | md | lg | xl |
| --- | --- | --- | --- | --- | --- |
| Web `[data-a63-design-language='ios']` | 36 | 40 | 44 | 48 | 52 |
| Measured evidence | ✅ 36.7–37.6 (7×) | ✅ 39.3–39.8 (5×) | ✅ 42.4–44.1 (4×) | ⚠️ one 48.9 | ❌ none |
| Native `AtomButton` | 44 | 44 | 44 | — | 52 |

Two conclusions, and they point in opposite directions:

1. **The web iOS ramp is well calibrated at xs/sm/md.** 36 / 40 / 44 land almost
   exactly on the three densest measured clusters. The *token values* need no
   change.
2. **Neither renderer can actually produce them on a phone.** See below — this is
   the correction to an earlier reading of this page that blamed only the native
   side.

There is also a rung **below** our `xs`: a ~31 pt small filled pill, used five
times across two apps. Worth considering as an `2xs`, since it is exactly the
"inline action next to a list row" case.

### The conflation this exposes — both renderers, not just iOS

`environment.css` models the right *concept*: it keeps `--a63-control-height-*`
(visual geometry) separate from `--a63-control-min-target` (ergonomics).

But the button-class recipes then fold one into the other. From
`packages/ui-react/src/components/button/button.css`:

```css
--button-height: max(
  calc(var(--a63-control-height-md) * var(--a63-density-scale, 1)),
  var(--a63-control-min-target)
);
/* … */
height: var(--button-height);
min-height: var(--button-height);
```

`--a63-control-min-target` becomes `2.75rem` on **any** coarse pointer — applied
automatically by the `@media (pointer: coarse)` block, no opt-in required. So on
every phone:

| Size | Height token | Min target | Rendered `max()` |
| --- | --- | --- | --- |
| xs | 36 | 44 | **44** |
| sm | 40 | 44 | **44** |
| md | 44 | 44 | **44** |
| lg | 48 | 48 | 48 |
| xl | 52 | 52 | 52 |

The 36 / 40 rungs are unreachable on touch. `AtomButton.swift`'s
`frame(minHeight: 44)` is not a native-only bug — it is the *same* decision,
hard-coded. Both renderers agree, and the references say both are wrong.

Against the measurements: our smallest possible button on a phone is 44 pt; X's
Follow pill is 31.5 pt (**+40 %**), and the measured field height is 39.8 pt
(**+11 %**). Nothing observed reaches our `lg` (48) or `xl` (52).

**The codebase already contains the correct pattern.** `checkbox.css` keeps
`--checkbox-size` as the rendered box and expands the hit region with a
pseudo-element:

```css
.a63-Checkbox::after {
  position: absolute;
  inset: 50%;
  min-width: var(--a63-control-min-target);
  min-height: var(--a63-control-min-target);
  translate: -50% -50%;
}
```

`switch.css` does the same with a negative `inset`. So the system knows how to
separate visual size from touch target — it just applies that treatment only to
"compact markers" and inflates everything button-shaped instead. The reference
apps apply it to button-shaped controls too: a 31.5 pt pill sitting inside a 44 pt
tappable row.

That is the actual fix. It shipped — see [What shipped](#what-shipped) — though
the clipping constraints meant it landed as a rendered-floor split rather than
per-component hit-area expansion everywhere.

### Caveat

Only one of the four screenshots could be viewed directly; the other three were
analysed by pixel measurement alone. The numbers are sound, but the *semantic*
labels in the table ("nav-bar button", "card") are inferred from geometry and
position, not read. Confirm the control identities before hard-coding a ramp from
this table.

## What shipped

Sequencing item A0, plus a bug it uncovered. Everything below was measured in a
real browser at a 402×874 viewport with touch emulation, not reasoned about.

### The rendered-floor / interaction-floor split

`--a63-control-min-size` (+ `-lg` / `-xl`) is new and owns **rendered** geometry:
24px, raised only to 32px on coarse pointers. `--a63-control-min-target` keeps its
meaning as the **interaction** floor (44px on touch). All 64 height formulas
across 20 recipes now floor with `min-size`.

Every control sits on the same rendered ramp — including square icon buttons.
An earlier revision kept icon buttons floored at `min-target`, which put a 44px
icon button beside a 32px text button in the same toolbar row on coarse
pointers. Same size token must mean same height; sibling alignment outranks the
"small in both axes" argument. The 44px interaction floor is delivered by a
hit-area pseudo-element instead.

### The iOS design language was inert

Found while verifying the above: setting `data-a63-design-language="ios"` changed
nothing at all. `[data-a63-design-language='ios']` and `control.css`'s `:root`
declare the same tokens at identical `(0,1,0)` specificity, and
`contracts/index.css` imported `environment.css` **first** — so the web defaults
won every time. Heights, inline padding, the type ramp, font weight and press
feedback had never applied.

The selector cannot simply be strengthened to `:root:is(…)`, because the axis must
also work when scoped to a nested `UIProvider`. Control now imports first.

This had no test. `personalization-axes.browser.test.ts` covered radius, type
scale, font, brand and OS, but not design language or input. Both now have
browser tests that resolve through a real property, and both were confirmed to
fail against the old code before being kept.

### Measured before / after (touch, 402×874)

| Control | Before | After — web DL | After — iOS DL |
| --- | --- | --- | --- |
| Button xs | 44 | 32 | **36** |
| Button sm | 44 | 32 | **40** |
| Button md | 44 | 32 | **44** |
| Button lg | 48 | 36 | **48** |
| Button xl | 52 | 40 | **52** |
| Button icon | 44 | 44 | 44 |
| Toggle sm | 44 | 32 | **40** |
| Input md | 44 | 32 | **44** |
| Item default | 50.5 | 50.5 | **44** |
| Item sm | 44 | 42.5 | **40** |
| Item xs | 44 | 34.5 | **36** |
| Item + description | 72.5 | 72.5 | **59.4** |

"Before" is identical across both design languages because the iOS block was
inert. The new iOS column lands on 36 / 40 / 44 — the three densest clusters in
the reference measurements (36.7, 39.8, 42.4–44.1) — and rows land on ~44 and
~59 to match the measured rows.

Measuring this correctly took three attempts. The first probe omitted the real
component classes, the second omitted `reset.css`, and the third still rendered
outside `.a63-UIProvider` (which is what the scoped reset keys on) and without
Tailwind preflight, so `box-sizing` was `content-box` and `<p>` kept its UA
margin. Those three mistakes inflated Item by ~22px and the two-line row by
another 24px. Any future measurement of this system has to render inside a
provider with preflight, or the numbers are fiction.

**Desktop is unchanged.** At `pointer` / `keyboard`, `min-size` and `min-target`
are both 1.5rem, and measured heights are identical to before (24/28/32/36/40).

### Native

`AtomButton` now reads heights, inline padding, press scale, disabled opacity and
feedback easing from `AtomTokens.Control` / `AtomTokens.Motion`, which the
generator derives from the shared CSS rather than Swift literals. It renders at
the ramp and expands the hit region to 44pt with an outer frame plus
`contentShape`, instead of inflating the box. The `large` height/padding
mismatch (52pt box, `lg` padding) is resolved by moving `large` to the `lg` rung.

### Not done

- **Hit-area expansion for SegmentedControl and Tabs.** Their tracks clip the
  items, so an overflowing pseudo-element is cut off. Expanding each item
  horizontally would also overlap its neighbours — the track is the right owner
  of the 44px target there, which is a separate change. Button and Toggle are
  done: Toggle moved its clipping to `.a63-Toggle-content`, and Button's
  icon-size `overflow: hidden` is now scoped to the only theme that paints a
  gloss (aqua), guarded by a test.
- **A distinct xs/sm/md ramp on touch under the `web` design language.** The
  32px rendered floor flattens the web ramp's bottom three rungs (24/28/32 all
  become 32). The floor is evidence-backed — nothing measured shipped below
  30.6pt — so the alternative is for mobile surfaces to opt into
  `data-a63-design-language="ios"`, which is now a real option.
- Everything in sections B and C below.

## Cross-system validation

Added after the fact, because the measurement study on its own could not say
whether 44pt-everywhere was a convention we were failing to meet or a mistake.

### Apple separates the two values explicitly

This is the decisive citation, and it is Apple's own:

- Buttons page: "a button needs a **hit region** of at least 44x44 pt". The term
  is *hit region*. Apple nowhere requires a control to **render** at 44pt.
  <https://developer.apple.com/design/human-interface-guidelines/buttons>
- Accessibility page publishes a per-platform table whose iOS row reads
  **Default control size 44×44 pt / Minimum control size 28×28 pt**.
  <https://developer.apple.com/design/human-interface-guidelines/accessibility>

So our 32pt coarse-pointer rendered floor sits **above Apple's documented iOS
minimum and below its default** — exactly the band Apple describes.

⚠️ The 28/32/44/52/64 button ramp in the HIG is in the **visionOS** section only.
It is not an iOS ramp. Likewise the 68pt tab bar is tvOS. Do not cite either here.

### Published height ramps

| System | xs | sm | md | lg | xl | Unit |
| --- | --- | --- | --- | --- | --- | --- |
| GitHub Primer | 24 | 28 | **32** | 40 | 48 | px |
| IBM Carbon | 24 | 32 | 40 | 48 | 64 | px |
| Adobe Spectrum (desktop) | — | 24 | **32** | 40 | 48 | px |
| Adobe Spectrum (mobile) | — | 30 | **40** | 50 | 60 | px |
| Shopify Polaris (touch) | — | 28 | 32 | **36** | — | px |
| Material 3 | 32 | 40 | 56 | 96 | 136 | dp |
| Atlassian | — | 24 | 32 | — | — | px |
| **Atom63 iOS** | 36 | 40 | 44 | 48 | 52 | pt |

Apple, X and OpenAI publish **no** control-height specification at all.

### Who separates rendered height from touch target

| Separates explicitly | Mechanism |
| --- | --- |
| Apple HIG | "hit region" 44pt vs published 28pt minimum control size |
| Material 3 | `minimumInteractiveComponentSize()` *reserves* 48dp around a container that may be 32dp; `MinHeight` also branches 36dp/40dp on pointer precision |
| **GitHub Primer** | ships `size-coarse.json5` / `size-fine.json5` with `control.minTarget` 44px vs 16px, independent of the 24/28/32/40/48 height ramp |
| WCAG | both SCs constrain "the target for pointer inputs", never the rendered box |

**Primer is this system's twin.** Its default control is 32px with a 44px
coarse-pointer `minTarget` — the same split we landed on, reached independently.

Spectrum and Polaris vary height by platform/viewport and have no touch-target
concept at all; Polaris's *largest* touch button is 36px, so a mature commerce
system deliberately declines to inflate to 44.

### WCAG

- **2.5.8 Target Size (Minimum), AA** — 24×24 CSS px, with spacing/inline/
  equivalent/user-agent/essential exceptions. Our 32pt floor clears this on size
  alone. <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>
- **2.5.5 Target Size (Enhanced), AAA** — 44×44 CSS px, no spacing exception.
  Our 44pt interaction target meets **AAA**.
  <https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html>

### Live measurement of the named references

Mobile web at 402×874 with an iPhone UA, same script for every site:

| Product | Dominant control heights |
| --- | --- |
| ChatGPT | **44** ×8, 48 |
| Claude | **40** ×11 |
| GitHub | **28** ×8, 40, 32, 41, 44 |
| X (logged out) | 32 (pill), 40, 46, 48 |
| Atom63 **before** | **44** ×15, 48 ×3, 52 |
| Atom63 after, `web` DL | **32** ×13, 36 ×3, 44 ×2 |
| Atom63 after, `ios` DL | **44** ×11, 40 ×3, 48 ×3, 36, 52 |

X's 32px pill independently corroborates the 31.5pt Follow button measured from
the native screenshot.

ChatGPT is the one product that really does render nearly everything at 44 — so
our previous behaviour matched ChatGPT and nothing else, with no ramp at all.

### Corrections this research forced

Earlier revisions of this page, and several code comments, justified the row
spec with "UIKit cell heights: 44pt single-line, 58pt subtitle" and cited
UISwitch 51×31 / UISegmentedControl 32pt. **None of those are traceable to a
current Apple primary source.** The legacy archive HIG that carried bar metrics
now 301s, `UISwitch` docs carry no dimensions, and `SwiftUI.ControlSize` is
documented purely qualitatively. Those figures are blog-propagated. The row
targets are retained because our own measurements support them, but the UIKit
attribution has been removed everywhere.

Also unverified: the 16pt iOS screen gutter. It matches our 16.2pt measurement,
but Apple's Layout page publishes no iOS margin value.

## Proposed sequencing

### A — align reality (low risk, no architecture change)

Items 3, 4 and 5 are **done** — see [What shipped](#what-shipped). Remaining:

1. Add `packages/styles/**` to the `paths` filter in `.github/workflows/ios.yml`.
   Still the cheapest item on this page.
2. Fix or remove the two non-existent commands in the docs.
6. Decide radius: the reference apps show radius varying by control class (pill for
   small action buttons, ~10–18 pt for fields), which argues *against* one global
   `--a63-radius-control` on iOS. Either accept that and declare it as an explicit
   `platformAdaptations.swiftUI` entry, or add a radius contract per control class.
   What is not defensible is the current state: radius keyed to `size`, undeclared.
7. Declare the Button variant subset and the Dynamic Type ramp as adaptations.
8. Unblock hit-area expansion for Toggle, SegmentedControl and Tabs by moving
   their clipping off the interactive root.
9. `pnpm --filter @atom63/ui-ios check:api` does not set `DEVELOPER_DIR`, unlike
   its sibling scripts, so it fails on any machine where `xcode-select -p` points
   at the Command Line Tools. Pre-existing; left alone.

### B — close the pipeline (the real fix)

Item 1 is **partially done**: the generator now also reads `contracts/control.css`,
`contracts/environment.css`, `contracts/action.css` and `foundation/motion.css` for
the control ramp, press scale, disabled opacity and easing. The hand-written
`colors` map is still the semantic source of truth. Remaining:

1. ~~Point the colour side at `semantics.css` too, and delete the hand-written map.~~
   Done 2026-09-24 (colours resolve through the Figma sync model).
2. Wire `tokens/*.json` in as the authoritative slot map, or delete them, and extend
   coverage past Button/Input/Switch.
3. ~~Add a check that compares resolved web values against the generated Swift
   values.~~ Done 2026-09-24 for colours, as `swift-parity.browser.test.ts` in the
   styles browser tests, which CI already runs.
4. Give `packages/ui-ios` a `test` script so `precheck` reaches it.

### C — product decision (not a cleanup)

Do `brand`, `theme`, `surface`, and `density` ship natively? That determines
whether `AtomTheme` stays a static value or becomes a runtime axis resolver, and it
sets the ceiling on how much of B is worth building.

---

## Addendum — the row floor, and measuring targets instead of declaring them

The rendered/target split above says a control keeps its rendered ramp on touch
and reaches 44px by expanding its interaction area with a pseudo-element. Auditing
every recipe in a browser (hit-testing outward from each control's centre with
`elementFromPoint`) showed that rule has a structural limit and two silent bugs.

**The limit.** A pseudo-element cannot escape an ancestor that clips. Three
recipes sit in one: `.a63-ConnectedPanel` sets `overflow: hidden` for its rounded
corners, and both `.a63-Tabs-list` and `.a63-SegmentedControl-track` set
`overflow-x: auto`, which computes `overflow-y` to `auto` as well. For those, the
target is capped at the rendered height no matter what the pseudo declares —
measured 32px for the ConnectedPanel trigger, 32px for a tab, 30px for a segment.

**The split that resolves it.** A *compact control* is small in both axes and sits
inside open flow: it keeps the ramp and expands via pseudo. A *row* is a
full-width surface where the whole row is the target, and it lives in a clipping
container by nature. A row therefore has to BE the target:

```
--a63-row-min-size   rendered floor for a full-width row
                     = --a63-control-min-size on fine pointers (desktop unchanged)
                     = 44px on touch
```

`ConnectedPanel`'s trigger adopts it and now measures 44px tall on touch.

**What stays on the ramp, deliberately.** Tabs and SegmentedControl do *not*
adopt it. The measurements in this document put compact iOS controls at 31.5pt
sitting inside a 44pt tappable row, and Apple's own segmented control is 32pt — a
blanket 44 would make our bars taller than the platform they are imitating.

**Input is blocked, not forgotten.** Fields measured 39.3–39.8pt here, above our
32px. Raising Input alone would break the rung-alignment guarantee, which requires
Button, Toggle and Input on the same size token to render at the same height; and
raising every control to 40px on touch would re-collapse the ramp that the
rendered/target split exists to protect. Resolving it means deciding whether a
field belongs on the control ramp at all.

**Why this is now measured.** `Switch` and `Slider` both sized their hit area as
`inset: calc((min-target - control-size) / -2)`. A pseudo-element is laid out
against the *padding* box, so each control's 1px border was double-counted and
both shipped a 42px target from a formula that reads as correct. No static check
could see it. `scripts/check-control-alignment.mjs` now hit-tests every control
and fails on anything under the floor; controls that cannot reach it are declared
exceptions carrying a reason, and the check also fails if a declared exception
starts passing, so the list cannot rot.
