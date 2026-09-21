# React-First Executable Design System

> **Status.** The executable stack described here is largely live as
> `@atom63/styles` + `@atom63/ui-foundation` + `@atom63/ui-react`. Treat axis
> values and package names in older sections as historical when they conflict
> with `personalizationAxes` (e.g. theme `brutalist` → live `terminal`/`retro`,
> OS attr `data-a63-os`). Canonical references:
> `packages/styles/README.md`, `docs/design-system/personalization-axes.md`.

## Purpose

Atom63 should evolve toward a React-first executable design system: React is the
canonical medium for designing, validating, documenting, and iterating product
UX, while production platform implementations remain free to use the right
runtime for their platform.

React is not required to be the production runtime for every surface. It is the
place where interaction, layout, motion, component contracts, and platform
recipes become executable and reviewable.

## Product Principle

Design once. Express consistently. Implement appropriately.

The system should preserve product intent across Web, iOS, Android, and desktop
without forcing pixel parity or one universal runtime.

## Parallel Track Rule

This architecture must be developed in parallel with the current production UI.
Existing production packages remain the source of truth until the new system is
proven:

- `@atom63/ui`
- `@atom63/tokens`
- `@atom63/theme`
- `@atom63/os63`

New work should live beside production code and avoid changing production
imports until the replacement stack is stable.

## Target Packages

### `@atom63/ui-foundation`

Platform-neutral contracts and environment definitions.

Owns:

- design environment types
- component anatomy
- component variants
- component states
- semantic token slot names
- accessibility and interaction contract descriptions
- shared type utilities for renderers

Does not own:

- React DOM implementation
- SwiftUI implementation
- CSS runtime
- app-specific behavior

### `@atom63/ui-react`

Executable React design renderer.

Owns:

- `UIProvider`
- React reference components
- Storybook-first documentation
- environment preview matrix
- platform visual recipes for React previews
- Base UI integration where web interaction behavior needs an accessible
  primitive

React renderer components may preview multiple design languages such as `web`
and `ios`, but they remain reference implementations, not the required
production runtime for every platform.

### `@atom63/ui-ios`

iOS translation package.

Starts as a contract mirror: token maps, SwiftUI-oriented names, and mapping
documentation. It does not need to be a full native package on day one.

Owns:

- iOS token translation
- SwiftUI naming conventions
- iOS component contract mapping
- platform-specific notes for touch, gestures, safe areas, focus, and motion

## Environment Model

Every preview is defined by independent environment dimensions:

```ts
type DesignLanguage = "web" | "ios";
type Mode = "light" | "dark" | "system";
type Theme = "modern" | "aqua" | "retro" | "brutalist";
type Input = "touch" | "pointer" | "keyboard";
type Density = "compact" | "comfortable";
```

Example:

```tsx
<UIProvider
  density="comfortable"
  designLanguage="ios"
  input="touch"
  mode="dark"
  theme="aqua"
>
  <Button>Continue</Button>
</UIProvider>
```

Each dimension answers a separate question:

- `designLanguage`: platform conventions
- `mode`: luminance
- `theme`: visual skin
- `input`: interaction style
- `density`: layout density

## Token Layers

The system should keep foundation tokens lean and move intent into semantic and
component contracts.

```text
Primitive tokens
  Raw values: color scales, spacing, radius, typography, motion, shadow.

Aliases
  Chosen system scales: surface ramps and accent ramps.

Foundation motion
  Shared timing/easing vocabulary: duration.fast, ease.standard.

Semantic tokens
  Intent roles: surface.page, text.primary, action.primary.

Component contracts
  Shared geometry and behavior slots: control.height.md, control.radius,
  control.focusRing.

Renderer recipes
  React web/iOS preview recipes, SwiftUI mappings, platform production styles.
```

Components should consume semantic and component contract tokens, not raw
primitive values. Themes override token values; themes should not branch
component structure.

Implementation note: the first opt-in layer lives in `@atom63/styles`. It is a
parallel package with its own `tokens/` and `contracts/` folders. It currently
uses an owned foundation copied from current `@atom63/tokens`, then adds
Atom63-owned `--a63-*` contracts for executable UI packages. This keeps
production tokens stable while preventing the new renderer work from drifting
into a disconnected token universe.

## Component Categories

### Shared Primitive

One public component with different visual recipes.

Examples:

- `Button`
- `Badge`
- `Avatar`
- `Spinner`
- `Text`

### Adaptive Component

Shared public API, but the renderer may differ internally because interaction
behavior is more platform-sensitive.

Examples:

- `TextField`
- `Search`
- `Select`

### Platform Component

Separate component because the platform convention is meaningfully different.

Examples:

- `IOSNavigationBar`
- `WebHeader`
- `DesktopSidebar`
- `AndroidBottomSheet`

Do not force one universal API when the interaction model differs.

## Platform Philosophy

Design language may affect:

- navigation
- gestures
- spacing
- focus
- transitions
- safe area handling
- interaction feedback

Theme may affect:

- colors
- gradients
- radius
- shadows
- blur
- texture
- typography personality

Mode affects light/dark semantic values.

## Button Reference Loop

The first loop should prove the whole architecture through one component.

`@atom63/ui-foundation` owns:

- `ButtonVariant`
- `ButtonSize`
- `ButtonState`
- `ButtonAnatomy`
- `ButtonTokenSlot`
- environment types

`@atom63/ui-react` owns:

- `<UIProvider />`
- `<Button />`
- CSS recipes for `designLanguage="web"` and `designLanguage="ios"`
- Storybook stories for environment switching

`@atom63/ui-ios` owns:

- SwiftUI-oriented button token mapping
- `AtomButtonStyle` naming proposal
- iOS behavior notes for touch feedback, disabled state, loading state, and
  focus/keyboard cases

## Migration Position

The new stack should not import current `@atom63/ui`. It may inspect production
patterns, but dependency flow should stay one-way during development:

```text
apps/current production -> @atom63/ui
new design-system track -> @atom63/ui-foundation + @atom63/ui-react + @atom63/ui-ios
```

When the new stack is proven, migration can happen by redirecting consumption:

```ts
// Current
import { Button } from "@atom63/ui";

// Pilot
import { Button } from "@atom63/ui-react";
```

Later, `@atom63/ui` may become a compatibility layer or re-export target, but
that should happen only after the new contracts are stable.

## Success Criteria

- Production UI remains stable while the new track is built.
- Component contracts are shared across React and iOS planning.
- React Storybook can switch design language, mode, theme, input, and density.
- Components consume semantic/component token slots instead of raw values.
- Platform fidelity is favored over pixel parity.
- The iOS path has explicit token and behavior mappings before native
  implementation begins.
- Migration is possible through import redirection or compatibility exports.
