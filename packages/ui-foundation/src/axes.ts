/**
 * Personalization axes — the single source of truth for every dimension the
 * design system can be personalized along.
 *
 * Each axis declares its allowed values, default, the CSS mechanism/attribute the
 * runtime stamps, and — critically — the token groups it OWNS, each with a build
 * `status`. Read this to know what tokens exist and what still needs building or
 * hardening. The runtime value tuples + types in `environment.ts` derive from
 * here, so this stays authoritative.
 *
 * Live stampers:
 * - `UIProvider` — designLanguage, mode, theme, brand, input, density, surface
 * - `applyPersonalization` / PersonalizationController — mode, theme, brand,
 *   surface, surfaceTint, typeScale, radius, font, os, iconTheme
 */

export type AxisCategory = 'platform' | 'appearance' | 'ergonomics' | 'system'

/** Build state of a token group an axis is responsible for. */
export type TokenStatus = 'built' | 'partial' | 'planned'

export interface AxisTokenOwnership {
  /** Human label for the token group this axis drives. */
  group: string
  /** Token pattern it controls, e.g. "--a63-control-height-*". */
  tokens: string
  status: TokenStatus
  note?: string
}

export interface PersonalizationAxis {
  id: string
  label: string
  description: string
  category: AxisCategory
  /**
   * How the axis is applied in the DOM.
   * - `attribute` — discrete `data-a63-*` value
   * - `scalar` — continuous CSS custom property (e.g. `--a63-surface-tint`)
   */
  mechanism: 'attribute' | 'scalar'
  /** The attribute or custom property the runtime stamps. */
  attribute: string
  /** Allowed values (for scalars: inclusive endpoints, e.g. `0%` · `100%`). */
  values: readonly string[]
  /** Default value. */
  default: string
  /**
   * Whether a live runtime currently stamps this axis
   * (`UIProvider` and/or `PersonalizationController` / `applyPersonalization`).
   */
  runtime: boolean
  /** Token groups this axis owns — the build/harden checklist. */
  owns: readonly AxisTokenOwnership[]
}

export const personalizationAxes = {
  designLanguage: {
    id: 'designLanguage',
    label: 'Design language',
    description:
      'Platform interaction conventions: component sizing, proportions, and interaction feedback. Owns NEITHER color nor shape (those are appearance).',
    category: 'platform',
    mechanism: 'attribute',
    attribute: 'data-a63-design-language',
    values: ['web', 'ios'],
    default: 'web',
    runtime: true,
    owns: [
      {
        group: 'control sizing',
        tokens:
          '--a63-control-height-*, --a63-control-padding-inline-*, --a63-control-font-size-*, --a63-control-font-weight',
        status: 'built',
      },
      {
        group: 'interaction feedback',
        tokens: '--a63-control-press-transform, --a63-control-feedback-ease',
        status: 'built',
      },
      {
        group: 'android / desktop',
        tokens: '(same control tokens, new [data-a63-design-language] scopes)',
        status: 'planned',
        note: 'only web + ios recipes exist today — defer until a second design language ships',
      },
    ],
  },
  mode: {
    id: 'mode',
    label: 'Mode',
    description:
      'Luminance: light/dark semantic colors. "system" resolves to light/dark at runtime before stamp.',
    category: 'appearance',
    mechanism: 'attribute',
    attribute: 'data-a63-mode',
    values: ['light', 'dark', 'system'],
    default: 'light',
    runtime: true,
    owns: [
      {
        group: 'semantic colors',
        tokens: '--a63-surface-*, --a63-text-*, --a63-border-*, action *-hover',
        status: 'built',
        note: 'keys both .light/.dark class and [data-a63-mode] attribute',
      },
    ],
  },
  theme: {
    id: 'theme',
    label: 'Theme',
    description:
      'Visual skin / material character: assigns gloss, shadow, bevel, texture, blur under [data-a63-theme]. Overrides token VALUES, never component structure. Theme-private stacks OK; shared scales stay in tokens/foundation (see docs/design-system/authoring-surfaces.md). Radius, type scale, and font are separate axes.',
    category: 'appearance',
    mechanism: 'attribute',
    attribute: 'data-a63-theme',
    values: ['modern', 'aqua', 'retro', 'terminal'],
    default: 'modern',
    runtime: true,
    owns: [
      {
        group: 'control / field / overlay material',
        tokens:
          '--a63-control-*, --a63-field-*, --a63-overlay-*, --a63-surface-shadow, gloss, highlight, texture',
        status: 'built',
        note: 'modern/aqua/retro/terminal ship material overrides under [data-a63-theme]',
      },
      {
        group: 'foundation blur scale',
        tokens: '--blur-*',
        status: 'built',
        note: 'tokens/foundation/effects.css; Tailwind adapter re-references only',
      },
      {
        group: 'theme value-override files',
        tokens: 'themes/*.css under [data-a63-theme]',
        status: 'built',
        note: 'all four skins scaffolded: modern (identity), aqua (gel), terminal (CRT glow), retro (bevel)',
      },
      {
        group: 'richer per-theme semantic re-skins',
        tokens: 'aqua/terminal surface & text overrides',
        status: 'partial',
        note: 'aqua/terminal intentionally rewrite some semantic paint; inline material literals are deferred drift (docs/design-system/foundation-value-drift.md). control-shadow-active covered on modern/aqua/retro/terminal.',
      },
    ],
  },
  brand: {
    id: 'brand',
    label: 'Brand',
    description:
      'Primary/accent color ramp (personalization). Remaps the whole brand tonal scale; only primary switches, status colors stay semantic. `auto` derives from wallpaper (async --color-auto-*).',
    category: 'appearance',
    mechanism: 'attribute',
    attribute: 'data-a63-brand',
    values: ['auto', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6'],
    default: 'b1',
    runtime: true,
    owns: [
      {
        group: 'brand ramp',
        tokens: '--a63-brand-50 … --a63-brand-950',
        status: 'built',
        note: '`auto` falls back to b1 until the controller fills --color-auto-*',
      },
      {
        group: 'primary action + focus',
        tokens: '--a63-action-primary, -hover, -foreground, --a63-focus-ring',
        status: 'built',
        note: 'declared on the brand scope so derived tokens re-resolve per ramp (tokens/brand.css)',
      },
    ],
  },
  input: {
    id: 'input',
    label: 'Input',
    description: 'Pointer ergonomics: touch targets and hit areas. Independent of design language.',
    category: 'ergonomics',
    mechanism: 'attribute',
    attribute: 'data-a63-input',
    values: ['touch', 'pointer', 'keyboard'],
    default: 'pointer',
    runtime: true,
    owns: [
      { group: 'touch target', tokens: '--a63-control-min-target', status: 'built' },
      {
        group: 'hit slop / focus affordance',
        tokens: '(planned)',
        status: 'planned',
        note: 'no consumer yet; keep planned until a touch product needs extra hit area beyond min-target',
      },
    ],
  },
  density: {
    id: 'density',
    label: 'Density',
    description: 'Layout rhythm: proportional spacing scale.',
    category: 'ergonomics',
    mechanism: 'attribute',
    attribute: 'data-a63-density',
    values: ['compact', 'comfortable'],
    default: 'comfortable',
    runtime: true,
    owns: [
      {
        group: 'spacing rhythm',
        tokens: '--a63-space-unit, --a63-density-scale',
        status: 'built',
      },
    ],
  },
  surface: {
    id: 'surface',
    label: 'Surface',
    description:
      'Neutral surface palette (which greys) — the neutral counterpart to brand. Tint intensity is the sibling `surfaceTint` scalar axis.',
    category: 'appearance',
    mechanism: 'attribute',
    attribute: 'data-a63-surface',
    values: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'],
    default: 'n1',
    runtime: true,
    owns: [
      {
        group: 'surface palette',
        tokens: '--surface-light-* / --surface-dark-* (→ --a63-surface-*)',
        status: 'built',
        note: 'tokens/surface.css remaps the neutral ramp per [data-a63-surface]',
      },
    ],
  },
  surfaceTint: {
    id: 'surfaceTint',
    label: 'Surface tint',
    description:
      'Continuous brand bend on semantic surfaces/borders (0–100%). Mixes ~6 semantic tokens toward lightness-matched --a63-brand-* steps.',
    category: 'appearance',
    mechanism: 'scalar',
    attribute: '--a63-surface-tint',
    values: ['0%', '100%'],
    default: '0%',
    runtime: true,
    owns: [
      {
        group: 'semantic surface/border tint',
        tokens: '--a63-surface-*, --a63-border-* via color-mix toward --a63-brand-*',
        status: 'built',
        note: '~12 mixes in tokens/semantics.css; aqua/terminal that fully re-skin surfaces skip brand tint',
      },
    ],
  },
  typeScale: {
    id: 'typeScale',
    label: 'Type scale',
    description: 'Global typographic scale multiplier. Independent of theme material.',
    category: 'appearance',
    mechanism: 'attribute',
    attribute: 'data-a63-type-scale',
    values: ['compact', 'normal', 'comfortable', 'large'],
    default: 'normal',
    runtime: true,
    owns: [
      {
        group: 'typography scale',
        tokens: '--typography-scale → type ramp',
        status: 'built',
        note: 'tokens/type-scale.css',
      },
    ],
  },
  radius: {
    id: 'radius',
    label: 'Radius',
    description:
      'Corner-radius multiplier across the shared radius ramp. Independent of theme material.',
    category: 'appearance',
    mechanism: 'attribute',
    attribute: 'data-a63-radius',
    values: ['none', 'subtle', 'default', 'round'],
    default: 'default',
    runtime: true,
    owns: [
      {
        group: 'radius multiplier',
        tokens: '--radius-multiplier → --radius-*, --a63-radius-*',
        status: 'built',
        note: 'tokens/radius.css; themes do not override this axis today',
      },
    ],
  },
  font: {
    id: 'font',
    label: 'Font',
    description: 'Active type personality stack for UI chrome.',
    category: 'appearance',
    mechanism: 'attribute',
    attribute: 'data-a63-font',
    values: ['sans', 'serif', 'mono', 'pixel'],
    default: 'sans',
    runtime: true,
    owns: [
      {
        group: 'font family',
        tokens: '--font-family-* / active UI font mapping',
        status: 'built',
        note: 'tokens/font.css',
      },
    ],
  },
  os: {
    id: 'os',
    label: 'OS',
    description:
      'OS/device chrome frame structure: window controls, launcher geometry. Peer of theme (paint) — not a visual skin. Distinct from designLanguage (interaction proportions).',
    category: 'system',
    mechanism: 'attribute',
    attribute: 'data-a63-os',
    values: ['macos', 'windows'],
    default: 'macos',
    runtime: true,
    owns: [
      {
        group: 'window + launcher structure',
        tokens: '--a63-os-window-*, --a63-os-launcher-* (+ --os-* compat aliases)',
        status: 'built',
        note: 'os/macos.css + os/windows.css',
      },
      {
        group: 'caption / launcher chrome paint',
        tokens: '--a63-os-caption-*, --a63-os-launcher-*-background/indicator',
        status: 'built',
        note: 'platform-conventional chrome paint composed from semantics; allowed under OS axis (not theme)',
      },
    ],
  },
  iconTheme: {
    id: 'iconTheme',
    label: 'Icon theme',
    description:
      'App-icon rendering style for OS chrome (dock, launcher). Stamped as an attribute; consumed in React (os63), not by CSS token math.',
    category: 'system',
    mechanism: 'attribute',
    attribute: 'data-a63-icon-theme',
    values: ['realistic', 'color', 'neutral', 'primary'],
    default: 'realistic',
    runtime: true,
    owns: [
      {
        group: 'app icon presentation',
        tokens: '(React icon themes in @atom63/os63)',
        status: 'built',
        note: 'attribute stamped; gradients use foundation --color-*; primary theme uses --a63-action-*',
      },
    ],
  },
} as const satisfies Record<string, PersonalizationAxis>

export type AxisId = keyof typeof personalizationAxes
