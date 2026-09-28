# iOS widgets plan

Status: decided, 2026-09-27 (W5 of `widgets-foundation-plan.md`; IW1–IW4 take their
recommendations). Item 3 of the handoff menu ("iOS parity"), second part.

## Where things stand

- **Web:** `@atom63/widgets` has the widget contract's renderer: units and spans (`small` 1×1,
  `medium` 2×1, `large` 2×2 cells), the presentation scale, `WidgetGrid`, `WidgetCard` and its
  parts, `WidgetSurface`, and `WidgetStateFeedback` for loading, empty and error.
- **Tokens:** `packages/styles/src/contracts/widget.css` defines 15 `--a63-widget-*` tokens:
  background color and image, foreground, border, radius, shadow, rim width, rim color and image,
  and media shadows. Every theme overrides them, often with gradients and layered shadows (retro's
  bevel, aqua's gel, terminal's glow).
- **iOS:** none of the widget tokens reach Swift (`generate-swift-tokens.mjs` maps semantic and a
  few contract colors, not the widget contract), and Atom63UI has no widget views.
  `widgets-foundation-plan.md` assumed the tokens were there; they are not.

## What WidgetKit changes

On iOS a "widget" usually means a WidgetKit home screen widget. Its families `systemSmall`,
`systemMedium` and `systemLarge` match our `small`, `medium` and `large` spans. Two WidgetKit
rules shape the design:

- The widget's background is declared with `containerBackground(_:for: .widget)`. When the person
  tints their home screen or picks the clear style, the system replaces that background with its
  own glass material.
- The system owns the widget's frame and corner radius.

So the widget *chrome* (rim, material, radius, shadow) belongs to the host, and the widget
*content* (header, title, body, states) must render without it.

## Decisions

### IW1. What the SwiftUI side is

- **Options:**
  - **A. In-app widgets whose content also runs in WidgetKit.** `AtomWidgetCard` draws the chrome
    in an app; the content views (`AtomWidgetHeader`, the state view) carry no chrome, so a
    WidgetKit extension can use them with `containerBackground`.
  - **B. In-app only.** One view that draws chrome and content together.
  - **C. WidgetKit only.**
- **Trade-offs:** A costs one split (chrome and content) and keeps the door open for home screen
  widgets without a second design. B is simpler but its views would draw a rim and radius the
  system also draws. C drops in-app boards, which the web has.
- **Recommendation: A.** A WidgetKit extension in the demo app is a later step, not part of this
  plan.

### IW2. Which widget tokens reach Swift

- **Options:**
  - **A. Colors and geometry now:** background color, foreground, border color, rim color, rim
    width and radius, generated per skin, brand and mode through the same theme graph as the other
    Swift colors. Background and rim *images* (gradients, textures) and layered shadows stay
    web-only for now, recorded as platform adaptations.
  - **B. Everything,** including gradients and multi-layer shadows, as SwiftUI gradients and
    shadow stacks.
  - **C. No widget tokens;** reuse `surfaceOverlay` and `borderSubtle`.
- **Trade-offs:** A covers what every theme needs to read as itself (color, rim, radius) and
  stays checkable by the existing Web/iOS parity test. B needs a CSS-gradient and shadow-list
  translator for four themes, which is its own project. C drifts the moment a theme changes a
  widget token.
- **Recommendation: A.**

### IW3. Sizes and layout

- **Options:**
  - **A. `AtomWidgetSize` (`small`, `medium`, `large`) with the web spans,** a mapping to
    `WidgetFamily`, and an `AtomWidgetGrid` that lays cards out on a square cell grid sized by
    the container. No presentation scale: Dynamic Type sizes the text.
  - **B. Port the web's pixel units and presentation scale.**
- **Trade-offs:** A follows the platform (WidgetKit gives the cell size; in an app the container
  does) and keeps one vocabulary with the web. B fixes sizes that iOS already decides.
- **Recommendation: A.**

### IW4. Loading, empty and error states

- **Options:** A. an `AtomWidgetStateView` with the web's three states and copy, built on
  `AtomContentStateView`'s tones and sized for a widget; B. use `AtomContentStateView` directly.
- **Trade-offs:** A keeps the web's state names and copy and fits a small tile; B is less code
  but its layout is for full screens.
- **Recommendation: A.**

## Steps

Each step is its own pull request and ends green in CI.

1. **Widget tokens in Swift** (IW2). Add the widget colors to the Swift color map and the rim width
   and radius to the generated tokens, per skin, brand and mode. *Verify:* the Web/iOS parity test
   covers the new colors in every selection.
2. **`AtomWidgetCard`, `AtomWidgetSize` and `AtomWidgetGrid`** (IW1, IW3), through
   `pnpm ds:new widget-card --ios` wiring: cross-renderer contract, catalog showcase, snapshot
   baselines and an `ios` accessibility check where a pattern applies (a card has none).
3. **`AtomWidgetStateView`** (IW4) with the web's copy, a showcase and snapshots.
4. **WidgetKit sample** (later, separate plan): a demo extension that uses the content views with
   `containerBackground`.

## Out of scope

- The web's hosted shell, title transitions and collection views (stack, poster fan): they are
  web runtime behavior, not the widget contract.
- Background and rim images and layered shadows on iOS (IW2-A), until a theme needs them there.

## Sources

- WidgetKit `containerBackground` and families:
  <https://developer.apple.com/documentation/widgetkit/widgetfamily>,
  <https://developer.apple.com/documentation/widgetkit/supporting-additional-widget-sizes>
