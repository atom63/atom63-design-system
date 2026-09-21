# Component Theme Contract

> **Migration residue / do not implement from.** This document describes an earlier
> `--theme-button-*` / `@atom63/tokens` / `[data-ui-theme]` contract. The live
> system uses `--a63-*` + `[data-a63-theme]` in `@atom63/styles`, axes in
> `@atom63/ui-foundation`, and recipes in `@atom63/ui-react`. Prefer
> [theme-authoring.md](./theme-authoring.md),
> [attribute-runtime.md](./attribute-runtime.md),
> [personalization-axes.md](./personalization-axes.md),
> and `packages/styles/README.md`. Body below is historical only.

## Rule

Components own behavior, structure, accessibility, slots, variants, and size geometry. Themes own values. OS systems own platform structure.

That gives us three independent axes:

| Axis | Owns | Examples |
|------|------|----------|
| Mode | Light and dark color resolution. | `.dark`, light previews |
| Theme | Cosmetic material values. | default, aqua, retro, terminal |
| System | Platform structure and chrome. | macOS, Windows |

Themes should not become component variants. A button still exposes semantic variants like `primary`, `secondary`, and `destructive`; Aqua, Retro, and Terminal adapt those variants through tokens.

Content on primary surfaces should use `--primary-foreground`, not a mode-based light or dark guess. The appearance runtime pairs `--primary-foreground` to the selected primary palette so darker saturated accents can use a light foreground while bright accents such as `b6` can use a dark foreground.

## Component Responsibilities

A primitive component defines:

- stable `data-slot`
- semantic `data-variant`
- stable `data-size`
- accessibility behavior
- state hooks such as `:hover`, `:active`, `:focus-visible`, `disabled`, `data-loading`, and `data-pressed`
- component contract variables with default values

The component should not know which theme is active. It only reads contract variables.

## Theme Responsibilities

A theme defines:

- semantic color values such as `--primary`, `--secondary`, `--destructive`, and `--foreground`
- shared component knobs such as border style, focus treatment, and radius mapping
- component-specific contract values under theme scope
- theme-private helper recipes when a material is reused across components

Theme-private helpers are allowed when they remove duplication. For example, Aqua can define gel recipes once, then Button, Tabs, segmented controls, traffic-light buttons, and selection indicators can map their own slots to the same gel material.

When a shared helper is mode-sensitive, define the mode-specific source once and let component mappings inherit it. Aqua light mode, for example, uses a gray neutral gel source for default/secondary buttons and neutral segmented controls so ordinary controls remain visible on light surfaces without becoming primary-colored.

## OS System Responsibilities

OS systems are structural, not cosmetic themes. They own shell behavior and platform geometry:

- window control side
- dock vs taskbar behavior
- app launcher placement
- system chrome dimensions
- OS-specific frame and titlebar structure

Windows therefore lives at `@atom63/tokens/systems/windows11`, not as a normal UI theme. The legacy `@atom63/tokens/themes/windows11` path is only a compatibility shim.

## Button Contract

Button is the first primitive being redefined with this contract.

The component emits:

```tsx
<Button data-slot="button" data-variant="primary" data-size="default" />
```

The component consumes these public variables:

| Variable | Purpose |
|----------|---------|
| `--button-radius` | Final button radius for the root control. |
| `--button-icon-font-size` | Material-symbol sizing hook for icon content. |
| `--theme-button-background` | Rest background. |
| `--theme-button-hover-background` | Hover background. |
| `--theme-button-active-background` | Pressed background. |
| `--theme-button-border-color` | Rest border color. |
| `--theme-button-hover-border-color` | Hover border color. |
| `--theme-button-active-border-color` | Pressed border color. |
| `--theme-button-foreground` | Text and icon color. |
| `--theme-button-loading-foreground` | Loading indicator color while text is transparent. |
| `--theme-button-shadow` | Rest, hover, and pressed material shadow. |
| `--theme-button-text-shadow` | Text rendering aid for glossy or overlay themes. |
| `--theme-button-icon-filter` | SVG/material icon rendering aid matching the text shadow. |

The component also consumes shared control variables:

| Variable | Purpose |
|----------|---------|
| `--theme-control-border-width` | Border width shared by controls. |
| `--theme-control-border-style` | Rest border style. |
| `--theme-control-active-border-style` | Pressed border style. |
| `--theme-control-shadow` | Default control shadow fallback. |
| `--theme-focus-*` | Shared focus-visible treatment. |

## Button Variant Intent

Button variants stay semantic across all themes:

| Variant | Intent |
|---------|--------|
| `default` | Strong neutral action. |
| `primary` | Main accent action. |
| `destructive` | Filled destructive action. |
| `destructive-outline` | Destructive warning with outline-first emphasis. |
| `secondary` | Lower-emphasis filled action. |
| `outline` | Border-first action; background appears more on hover or press. |
| `ghost` | Text-first action with hover plate. |
| `link` | Inline text action. |
| `overlay` | Button for media/image surfaces where contrast must be forced. |
| `glass` | Legacy alias for overlay-style use; prefer `overlay` for new work. |

Aqua maps neutral button variants to shared gel material instead of one-off fills. In light mode, `default`, `secondary`, and `outline` hover/press states should read as gray gel with visible rim and lower edge; `overlay` remains the darker media/image-surface variant with forced light foreground and stronger text/icon shadow.

## Radius Contract

Button radius must stay connected to the shared radius ramp.

```css
[data-ui-theme="aqua"] [data-slot="button"] {
  --button-radius: var(--theme-button-radius);
}
```

Themes can set a personality default through `--theme-button-radius`, but the value should resolve to `--radius-*` so the Storybook radius selector and global radius configuration still work.

Internal highlights must derive from the button radius instead of using a fixed pill:

```css
--theme-gel-highlight-radius: max(
  0px,
  calc(var(--button-radius) - var(--theme-gel-highlight-radius-inset))
);
```

## Button Group Contract

Button Group composes Button primitives into a single grouped control. The group owns shell material, shared radius, separators, and the visual relationship between adjacent child buttons. Child buttons still use the Button primitive contract for background, foreground, border, icon filter, and shadow.

The component emits:

```tsx
<ButtonGroup data-slot="button-group" data-orientation="horizontal">
  <Button data-slot="button" data-variant="outline" data-pressed />
  <Button data-slot="button" data-variant="outline" />
</ButtonGroup>
```

The component-level public variables are:

| Variable | Purpose |
|----------|---------|
| `--button-group-radius` | Final radius for the grouped shell and child button edges. |
| `--theme-button-group-background` | Group shell/background material shown behind transparent child buttons. |
| `--theme-button-group-border-color` | Group and child divider border color. |
| `--theme-button-group-border-width` | Optional outer group border width. |
| `--theme-button-group-separator-color` | Color for explicit `ButtonGroupSeparator` slots. |
| `--theme-button-group-shadow` | Group shell/rim shadow. |
| `--theme-button-group-text-background` | `ButtonGroupText` background. |
| `--theme-button-group-text-border-color` | `ButtonGroupText` border color. |
| `--theme-button-group-text-foreground` | `ButtonGroupText` foreground. |

Expressive themes may define shared four-band material recipes for grouped button surfaces:

| Variable | Purpose |
|----------|---------|
| `--theme-button-group-surface-a1` | Resting shell top band. |
| `--theme-button-group-surface-a2` | Resting shell upper-middle band. |
| `--theme-button-group-surface-b1` | Resting shell lower-middle band. |
| `--theme-button-group-surface-b2` | Resting shell bottom band. |
| `--theme-button-group-button-hover-a1` | Hover child top band. |
| `--theme-button-group-button-hover-a2` | Hover child upper-middle band. |
| `--theme-button-group-button-hover-b1` | Hover child lower-middle band. |
| `--theme-button-group-button-hover-b2` | Hover child bottom band. |
| `--theme-button-group-button-hover-background` | Composed hover child background from the hover band variables. |
| `--theme-button-group-button-active-a1` | Pressed/selected child top band. |
| `--theme-button-group-button-active-a2` | Pressed/selected child upper-middle band. |
| `--theme-button-group-button-active-b1` | Pressed/selected child lower-middle band. |
| `--theme-button-group-button-active-b2` | Pressed/selected child bottom band. |
| `--theme-button-group-button-active-background` | Composed pressed/selected child background from the active band variables. |

For Aqua-style grouped toolbar buttons, the canonical material shape is `A1 -> A2 -> B1 -> B2` at `0% / 48% / 52% / 100%`. `A2` and `B1` intentionally sit close together to create the crisp middle break. Aqua maps neutral rest/hover as gray-light, gray, dark gray, gray; neutral selected buttons invert the neutral material with the same brighter-upper-half structure, while semantic selected buttons map the same structure to primary or destructive color and add a top inset pressed shadow.

Grouped child buttons should all use the ButtonGroup material contract, even when their semantic `Button` variant changes. Standalone Button gel, overlay, and filled styles should not leak into a grouped control. Hover is background-only and should use the shared hover background variable, with no added hover shadow or gel highlight. Prefer deriving hover bands as a small lightness bump from the resting surface bands, so hover stays coupled to the base material. The neutral active recipe is the default for `default`, `secondary`, `outline`, `ghost`, and `link` groups. Semantic variants may opt into colored active bands and active foreground values, as `primary` and destructive variants do, but inactive labels stay neutral. The shell, separators, hover border behavior, active inset shadow, and A1/A2/B1/B2 state recipe stay shared.

Y2K and Terminal reuse the same A/B recipe variables for their ButtonGroup theme passes. Y2K maps the four bands to a chunky bevel/pressed-plastic read with subtle pixel striping and inset pressed states. Terminal maps them to scanline/phosphor bands with uppercase labels, neutral inactive items, and active glow while keeping the same child button state hooks.

Button Group review happens in Storybook at `2 — UI/Button Group / All Variants And Sizes`, with additional targeted coverage in `Toolbar Icons`, `Default`, `Selected`, and form-composition stories. Keep icon groups as direct adjacent `Button` children; only use `ButtonGroupSeparator` when a visible explicit separator is intended.

The default theme ButtonGroup mapping lives in the shared component CSS because it is the baseline contract implementation. Expressive themes should override the same variables from scoped theme CSS instead of restyling child buttons from scratch.

## Contract Pass Workflow

Use this process for each UI primitive or primitive family. The point is to define the contract from the component down, then let each theme map values into that contract.

### 1. Reset The Working Surface

Before defining a new contract pass, remove or quarantine styling that came from old exploration:

- delete obsolete active theme selectors for the component
- keep legacy CSS only in archive/reference files such as `*.legacy.css`
- remove stale `--theme-<component>-*` hooks from component code when they no longer match the current contract
- preserve structural variables that are not theme values, such as layout geometry, hit targets, and OS system dimensions

Do not preserve old theme CSS just because it exists. If it encodes the wrong contract, archive it or delete it and rebuild from the component contract.

### 2. Define The Component Contract

Read the component and decide what is structural versus themeable.

The component pass should define:

- stable slots through `data-slot`
- semantic variants through props and `data-variant`
- size and density through props and `data-size`
- state hooks for hover, active, focus-visible, disabled, loading, selected, pressed, open, and orientation when relevant
- public `--theme-<component>-*` variables for values a theme should own
- component-local geometry variables only when they are required to keep internal pieces aligned

Theme CSS should not need to know implementation-only DOM details beyond the agreed slots and state attributes.

### 3. Build One Storybook Contract Bench

Each contract pass needs one clear Storybook review surface. Prefer a single contract story over several overlapping pages.

For `packages/ui` primitives, put the contract bench under `stories/ui/` with the existing `2 — UI/<Name>` structure. For OS63 windowing, the contract bench lives at `5 — OS63 Windowing/Theme Contract`.

The contract bench should cover:

- all semantic variants
- all supported sizes
- important state combinations, including forced states where hover alone is not enough
- active, selected, disabled, loading, invalid, open, and orientation states when the primitive supports them
- theme-sensitive nested content such as icons, counters, swatches, indicators, labels, and shortcut text
- responsive or density-sensitive layouts when the component can reflow

Keep separate Storybook pages only when they have a different job:

- interactive behavior demos
- store-connected examples
- stress harnesses
- real product composition previews

Remove duplicate contract sheets once the canonical contract bench exists.

### 4. Map Themes From The Contract Down

Start with the neutral/default mapping, then rebuild expressive themes one by one.

For each theme:

- scope theme CSS under `[data-ui-theme="<id>"]`
- set shared theme-private helpers only when they are reused across multiple component slots
- map component slots to public contract variables instead of styling ad hoc descendants
- keep mode-specific values in `.light` and `.dark` branches when needed
- keep radius, focus, and primary/surface palette axes connected to the global controls

Theme-private helpers are fine for reusable material recipes, such as Aqua gel. They should feed component variables rather than replace the component contract.

### 5. Document The Contract

Update this file with:

- emitted slots and key attributes
- public variables consumed by the component
- semantic variant intent
- theme-specific mapping notes that future passes should preserve
- Storybook story path used as the canonical contract bench

Update `apps/design-system/src/pages/theme-*.mdx` when the design-system app has a component page for the primitive.

### 6. Verify The Axes

Validate these axes independently:

- mode: light and dark
- theme: default, Aqua, Y2K, Terminal, and any active product theme
- system: macOS and Windows only when the primitive belongs to OS63 structure
- radius: global radius selector still changes component geometry
- primary palette: primary variant uses `--primary` and `--primary-foreground`
- surface palette: nested surfaces still read against `--background`, `--card`, `--popover`, or component surface variables

Run the smallest relevant checks first, then broaden when a pass touches shared contracts:

- `pnpm lint`
- component owner package typecheck
- `pnpm typecheck` for cross-package or Storybook contract changes
- Storybook visual review when the pass changes rendered UI substantially

## Library Rollout Order

For the current contract-definition round, completed or active primitives set the pattern:

| Primitive | Canonical contract surface |
|-----------|----------------------------|
| Button | `2 — UI/Button` stories and `apps/design-system/src/pages/theme-button.mdx` |
| Button Group | `2 — UI/Button Group` stories and `apps/design-system/src/pages/theme-button-group.mdx` |
| Tabs | `2 — UI/Tabs` stories and `apps/design-system/src/pages/theme-tabs.mdx` |
| Segment Control | `2 — UI/Segment Control` stories and `apps/design-system/src/pages/theme-segment-control.mdx` |
| Windowing | `5 — OS63 Windowing/Theme Contract` |

For the rest of the UI library, work one primitive at a time. Do not start by porting theme CSS wholesale. Start by defining the component contract and the Storybook bench, then map theme values after the contract is visible.

## Definition Of Done

A component contract pass is done when:

- the component exposes stable slots, variants, sizes, and state hooks
- themeable values are public variables with conservative defaults
- expressive themes map only through those variables or documented shared helpers
- obsolete exploratory theme CSS for that component is deleted or archived
- the canonical Storybook contract bench covers the supported variants, sizes, and states
- the design-system docs record the contract and story path
- focused verification passes

## Segment Control Contract

Segment Control uses the same component/theme split as Button, with a list shell, items, and an active indicator.

The component emits:

```tsx
<SegmentControl variant="label" size="default" activeVariant="neutral" animateBackplate />
```

Backplate motion is controlled by the primitive prop `animateBackplate`, defaulting to `true`. Set `animateBackplate={false}` to snap the active indicator between items without changing the theme material.

Active material is controlled by `activeVariant`, defaulting to `neutral`. `activeVariant="primary"` maps the active indicator to the semantic primary color while preserving the same slots and sizing contract.

The component consumes these public variables:

| Variable | Purpose |
|----------|---------|
| `--segment-shell-radius` | Outer list radius. |
| `--segment-inset` | Shell inset used to derive active radius. |
| `--segment-active-radius` | Active indicator radius. |
| `--segment-item-radius` | Item hover/focus radius. |
| `--theme-segment-list-background` | List shell background. |
| `--theme-segment-list-border-color` | List shell border color. |
| `--theme-segment-list-shadow` | List shell shadow. |
| `--theme-segment-item-foreground` | Rest item foreground. |
| `--theme-segment-item-text-shadow` | Rest item text shadow. |
| `--theme-segment-item-hover-background` | Inactive hover plate. |
| `--theme-segment-item-hover-foreground` | Inactive hover foreground. |
| `--theme-segment-active-background` | Active indicator background. |
| `--theme-segment-active-background-color` | Active indicator base color. |
| `--theme-segment-active-border-color` | Active indicator border color. |
| `--theme-segment-active-foreground` | Active item foreground. |
| `--theme-segment-active-text-shadow` | Active item text shadow. |
| `--theme-segment-active-shadow` | Active indicator shadow. |
| `--theme-segment-active-icon-filter` | Optional active icon filter. |

Variants stay structural:

| Variant | Intent |
|---------|--------|
| `label` | Text labels. Active indicator should align to selected item width. |
| `icon` | Icon, swatch, or compact symbolic controls. |

| Active variant | Intent |
|----------------|--------|
| `neutral` | Quiet selected state for ordinary segmented controls. |
| `primary` | Higher-emphasis selected state using the active theme accent. |

`primary` should use `--primary` as the active plate's main background color. Theme styling may add gloss, bevel, texture, or glow, but it should not reduce primary to only a border or shadow accent.

## Segment Control Theme Mapping

The final Segment Control pass defines three theme personalities through the same variables:

| Theme | Shell | Neutral active | Primary active |
|-------|-------|----------------|----------------|
| Aqua | Seated glossy track with soft rim. | Shared gray neutral gel in light mode, no colored text/icon shadow. | Primary gel using `--primary`, `--primary-foreground`, and matching text/icon shadow. |
| Y2K | Soft retro pressed track. | Secondary-tinted bevel with restrained edge shadow. | Primary bevel with `--primary-foreground` and small icon/text shadow. |
| Terminal | Quiet line-based track with subtle scanline/rim accent. | Faint foreground plate with low glow. | Primary phosphor plate with restrained glow. |

Segment Control review happens in Storybook at `2 — UI/Segment Control / All Variants And Sizes`. That story should remain the contract harness for size, display variant, and active variant coverage while the toolbar provides mode, theme, system, radius, primary palette, and surface palette axes.

## Windowing Contract

Windowing uses the same component/theme split, with one extra axis: OS systems own chrome structure. macOS versus Windows can move controls, change titlebar density, and choose traffic-light or caption-button behavior. Themes only map material values onto the emitted slots.

The canonical contract bench is Storybook `5 — OS63 Windowing/Theme Contract`.

The default theme establishes the neutral baseline:

| Surface | Dark/light default intent |
|---------|---------------------------|
| Frame | Card surface, semantic border, one frame-level ring, and elevation. |
| Titlebar | Muted translucent bar, foreground text, bottom separator. |
| Toolbar | Slightly quieter muted translucent bar, bottom separator. |
| Content | Background surface. Window state must not change the content or frame opacity. |
| Sidebar | Muted translucent rail with side separator; overlay mode adds scoped scrim and panel shadow. |
| Statusbar | Muted translucent bar, top separator, muted foreground. |
| Dialog | Scoped backdrop, card panel, muted footer, normal Button contract actions. |
| Banner | Inset status surface using semantic status colors. |
| Loading | Primary spinner and muted message. |

The windowing components emit these stable slots:

| Slot | Purpose |
|------|---------|
| `window-frame-surface` | Outer visible window material. |
| `window-title-bar` | Draggable titlebar/caption row. |
| `window-toolbar` | Optional app toolbar row. |
| `window-content` | App body surface and performance boundary. |
| `window-sidebar` | App sidebar rail or overlay panel. |
| `window-sidebar-section` | Sidebar grouped list section. |
| `window-sidebar-overlay` | Scoped sidebar overlay scrim. |
| `window-status-bar` | Bottom status surface. |
| `window-drawer` | Drawer overlay root. |
| `window-drawer-panel` | Drawer material panel. |
| `window-drawer-header` | Drawer header surface. |
| `window-drawer-title` | Drawer title text. |
| `window-drawer-description` | Drawer supporting text. |
| `window-drawer-content` | Drawer scrollable body. |
| `window-drawer-footer` | Drawer footer/action surface. |
| `window-action-group` | System action container. |
| `window-action-button` | Individual window action hit target. |
| `window-action-indicator` | Visible action glyph/traffic-light surface. |
| `window-dialog-backdrop` | Scoped modal scrim. |
| `window-dialog-viewport` | Scoped modal positioning layer. |
| `window-dialog-panel` | Dialog material panel. |
| `window-dialog-header` | Dialog header block. |
| `window-dialog-title` | Dialog title text. |
| `window-dialog-description` | Dialog supporting text. |
| `window-dialog-content` | Optional dialog body content. |
| `window-dialog-footer` | Dialog action/footer surface. |
| `window-banner` | Banner visibility and variant root. |
| `window-banner-surface` | Banner material. |
| `window-banner-content` | Banner icon/message layout. |
| `window-banner-icon` | Banner icon. |
| `window-banner-message` | Banner message text. |
| `window-loading` | Loading state root. |
| `window-loading-content` | Loading state content stack. |
| `window-loading-icon` | Loading spinner/icon. |
| `window-loading-message` | Loading message text. |

The frame and chrome slots consume these public variables:

| Variable | Purpose |
|----------|---------|
| `--theme-window-frame-background` | Frame material background. |
| `--theme-window-frame-border-color` | Frame border color. |
| `--theme-window-frame-ring-color` | Frame outer ring color. |
| `--theme-window-frame-shadow` | Frame elevation. |
| `--theme-window-separator-width` | Shared internal separator width. Defaults to `1px`. |
| `--theme-window-bar-background` | Shared chrome fallback background only. Prefer slot-specific row variables when authoring a theme. |
| `--theme-window-bar-border-color` | Shared chrome fallback separator only. Prefer slot-specific row variables when authoring a theme. |
| `--theme-window-titlebar-background` | Titlebar-specific background. Quiet frame chrome; should sit behind toolbar in visual emphasis. |
| `--theme-window-titlebar-border-color` | Titlebar-specific separator. Softer than toolbar when both rows stack. |
| `--theme-window-titlebar-border-width` | Titlebar bottom separator width. |
| `--theme-window-titlebar-foreground` | Titlebar foreground. |
| `--theme-window-titlebar-title-foreground` | Center title foreground. Defaults quieter than the titlebar foreground. |
| `--theme-window-toolbar-background` | Toolbar-specific background. Slightly lifted because it contains actions and fields. |
| `--theme-window-toolbar-border-color` | Toolbar-specific separator. Clear enough to separate controls from content without boxing the row. |
| `--theme-window-toolbar-border-width` | Toolbar bottom separator width. |
| `--theme-window-toolbar-foreground` | Toolbar foreground. |
| `--theme-window-statusbar-background` | Statusbar-specific background. Quiet metadata layer; usually lower emphasis than toolbar. |
| `--theme-window-statusbar-border-color` | Statusbar-specific separator. Softer than titlebar/toolbar unless the app needs a strong footer boundary. |
| `--theme-window-statusbar-border-width` | Statusbar top separator width. |
| `--theme-window-statusbar-foreground` | Statusbar foreground. |
| `--theme-window-content-background` | Window app body surface. |
| `--theme-window-field-background` | Toolbar field background. |
| `--theme-window-field-border-color` | Toolbar field border color. |
| `--theme-window-sidebar-background` | Sidebar rail/panel background. |
| `--theme-window-sidebar-border-color` | Sidebar separator color. |
| `--theme-window-sidebar-border-width` | Visible sidebar inline separator width. |
| `--theme-window-sidebar-section-border-color` | Sidebar section separator color. |
| `--theme-window-sidebar-section-border-width` | Sidebar section bottom separator width. |
| `--theme-window-sidebar-shadow` | Overlay sidebar panel elevation. |
| `--theme-window-sidebar-overlay-background` | Overlay sidebar scrim. |
| `--theme-window-sidebar-overlay-blur` | Overlay sidebar scrim blur radius. |
| `--theme-window-drawer-background` | Drawer panel material background. |
| `--theme-window-drawer-border-color` | Drawer panel border color. |
| `--theme-window-drawer-ring-color` | Floating drawer outer ring color. |
| `--theme-window-drawer-shadow` | Drawer panel elevation. |
| `--theme-window-drawer-separator-color` | Drawer header/footer separator color. |
| `--theme-window-drawer-header-border-width` | Drawer header bottom separator width. |
| `--theme-window-drawer-footer-border-width` | Drawer footer top separator width. |

Action, dialog, banner, and loading slots consume:

| Variable | Purpose |
|----------|---------|
| `--theme-window-action-background` | Window action indicator background. |
| `--theme-window-action-shadow` | Window action indicator shadow. |
| `--theme-window-action-icon-color` | Window action icon color. |
| `--theme-window-dialog-backdrop-background` | Scoped dialog scrim. |
| `--theme-window-dialog-background` | Dialog panel background. |
| `--theme-window-dialog-border-color` | Dialog panel border color. |
| `--theme-window-dialog-shadow` | Dialog panel elevation. |
| `--theme-window-dialog-title-foreground` | Dialog title color. |
| `--theme-window-dialog-description-foreground` | Dialog description color. |
| `--theme-window-dialog-footer-background` | Dialog footer background. |
| `--theme-window-dialog-footer-border-color` | Dialog footer separator color. |
| `--theme-window-banner-background` | Banner surface background. |
| `--theme-window-banner-border-color` | Banner surface border color. |
| `--theme-window-loading-icon-color` | Loading spinner/icon color. |
| `--theme-window-loading-message-foreground` | Loading message foreground. |

State and structure hooks:

| Hook | Purpose |
|------|---------|
| `data-window-focus-state="focused | inactive"` | Focus-sensitive frame border color only. |
| `data-chrome-state="focused | inactive | overview"` | Storybook contract state on preview surfaces; background, opacity, ring, and shadow remain consistent across states. |
| `data-window-size="xs | sm | md | lg | xl"` | Responsive window breakpoint for component internals. |
| `data-control-side="left | right"` | OS-owned action placement. |
| `data-titlebar-density="compact | default"` | OS-owned titlebar density. |
| `data-window-control-style="traffic | caption"` | OS-owned action visual structure. |
| `data-window-action="close | minimize | maximize | restore"` | Individual action tone mapping. |
| `data-variant` on `window-banner` | Banner semantic status variant. |

Keep `--os-window-*` variables structural. They belong to system geometry and should not be replaced by theme material tokens.

Internal separators are composition-aware. A stacked row owns only the seam that follows it: titlebar and toolbar use bottom separators, while statusbar and dialog footer use top separators. Adjacent rows should not each draw a border on the same shared edge. Sidebars draw only their visible inline separator, and hidden or collapsed sidebars must not retain a border at zero width.
