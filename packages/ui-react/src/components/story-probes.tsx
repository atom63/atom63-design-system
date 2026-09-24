/*
 * Shared Storybook probe scaffolding for every @atom63/ui-react component story.
 *
 * Extracted from the Button story so the "theme probe" and "contract probe"
 * pattern is defined ONCE and imported everywhere, instead of re-inlined per
 * file. Not part of the package build (tsup has explicit entries; this file is
 * excluded from the library typecheck) — it exists only for stories.
 *
 * - PreviewCard      — a labeled DS-token chrome card.
 * - EnvironmentShell — the component rendered 4x across web/ios x light/dark.
 * - ThemeMatrix      — the component across the 4 skins x light/dark (theme probe).
 * - ContractProbe    — the component re-skinned live by remapping DS contract
 *                      tokens at a wrapper, proving the recipe reads the contract
 *                      rather than hardcoding (contract probe).
 */
import { themes } from '@atom63/ui-foundation'
import type { CSSProperties, ReactNode } from 'react'
import { UIProvider } from '../provider'

export function PreviewCard({
  children,
  label,
  style,
}: {
  children: ReactNode
  label: string
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: '1rem',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: '0.875rem',
        padding: '1rem',
        ...style,
      }}
    >
      <div
        style={{
          color: 'var(--a63-text-secondary)',
          fontFamily: 'Geist Mono, monospace',
          fontSize: '0.75rem',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

export function EnvironmentShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer" mode="light">
        <PreviewCard label="web / light / pointer">{children}</PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="web" input="pointer" mode="dark">
        <PreviewCard label="web / dark / pointer">{children}</PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="light">
        <PreviewCard label="ios / light / touch">{children}</PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="dark">
        <PreviewCard label="ios / dark / touch">{children}</PreviewCard>
      </UIProvider>
    </div>
  )
}

/**
 * Each theme's DEFAULT radius scale — mirrors the os63 product personalization
 * defaults (`OS_THEME_REGISTRY.defaults.radiusScale` in
 * packages/os63/src/windowing/core/os-theme.ts). The "none" default is why
 * terminal/retro render square in the app even though the radius axis is still
 * user-configurable. The DS theme axis is documented to own radius, but
 * per-theme value overrides aren't built into the theme CSS yet (axes.ts
 * theme.owns radius = "partial"), so the preview supplies a representative
 * default here. Keep in sync until the DS owns it directly.
 */
type RadiusScale = 'none' | 'subtle' | 'default' | 'round'

const THEME_RADIUS_SCALE: Record<string, RadiusScale> = {
  modern: 'default',
  aqua: 'default',
  retro: 'none', // bevel — square by default
  terminal: 'none', // CRT — square by default
}

const RADIUS_MULTIPLIER: Record<RadiusScale, number> = {
  none: 0,
  subtle: 0.5,
  default: 1,
  round: 1.5,
}

/**
 * Re-emit the foundation --radius-* ramp with a concrete multiplier baked in.
 *
 * The ramp is declared once at :root as `calc(--corner-radius * k * --radius-
 * multiplier)`, so it FREEZES to the root multiplier — setting [data-a63-radius]
 * (or --radius-multiplier) on a non-root wrapper does NOT re-resolve it (proven:
 * a descendant override has no effect on a :root-declared calc). To preview a
 * theme at its default radius inside a matrix (many themes on one page, none of
 * them :root), we redeclare the ramp locally on the theme wrapper. Coefficients
 * mirror packages/styles/src/tokens/foundation/radius.css.
 */
function radiusRamp(m: number): CSSProperties {
  return {
    '--radius-multiplier': `${m}`,
    '--radius-2xs': `calc(var(--corner-radius) * 0.2 * ${m})`,
    '--radius-xs': `calc(var(--corner-radius) * 0.4 * ${m})`,
    '--radius-sm': `calc(var(--corner-radius) * 0.6 * ${m})`,
    '--radius-md': `calc(var(--corner-radius) * 0.8 * ${m})`,
    '--radius': `calc(var(--corner-radius) * 0.8 * ${m})`,
    '--radius-lg': `calc(var(--corner-radius) * ${m})`,
    '--radius-xl': `calc(var(--corner-radius) * 1.4 * ${m})`,
    '--radius-2xl': `calc(var(--corner-radius) * 1.8 * ${m})`,
    '--radius-3xl': `calc(var(--corner-radius) * 2.2 * ${m})`,
    '--radius-4xl': `calc(var(--corner-radius) * 2.6 * ${m})`,
  } as CSSProperties
}

/**
 * Theme probe — the same content across all four skins (modern/aqua/retro/
 * terminal) x light/dark, EACH at its true default radius scale (so terminal /
 * retro render square, matching the app). Pass the component in a few
 * representative states as `children`.
 */
export function ThemeMatrix({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        padding: '1rem',
      }}
    >
      {themes.map(theme => {
        const scale = THEME_RADIUS_SCALE[theme] ?? 'default'
        return (['light', 'dark'] as const).map(mode => (
          // Stamp BOTH the radius attribute (so axis-keyed rules like the menu's
          // 'none' flush density apply) AND the re-emitted ramp (so the frozen
          // :root --radius-* scale actually resolves at this non-root wrapper).
          <UIProvider
            data-a63-radius={scale}
            key={`${theme}-${mode}`}
            mode={mode}
            style={radiusRamp(RADIUS_MULTIPLIER[scale])}
            theme={theme}
          >
            <PreviewCard label={`${theme} / ${mode}`}>{children}</PreviewCard>
          </UIProvider>
        ))
      })}
    </div>
  )
}

function ProbeRow({
  children,
  label,
  style,
}: {
  children: ReactNode
  label: string
  style?: CSSProperties
}) {
  return (
    <div style={{ display: 'grid', gap: '0.375rem' }}>
      <div
        style={{
          color: 'var(--a63-text-secondary)',
          fontFamily: 'Geist Mono, monospace',
          fontSize: '0.6875rem',
        }}
      >
        {label}
      </div>
      <div style={style}>{children}</div>
    </div>
  )
}

/**
 * Contract probe — proves the component is driven by the DS contract, not
 * hardcoded values. Renders the component three ways inside the environment
 * shell: at the default contract, with the accent semantic remapped, and with
 * the component's own contract handles remapped. Pass the CSS-var overrides for
 * this component's primary contract(s).
 *
 * `semantic` defaults to remapping the accent so the effect is always visible;
 * `contract` should remap the tokens the component's recipe consumes (e.g.
 * `--a63-control-radius`/`--a63-control-shadow`, `--a63-surface-shadow`,
 * `--a63-overlay-backdrop`, `--a63-track-*`, `--a63-selection-*`, …).
 */
export function ContractProbeGrid({
  children,
  contract,
  semantic = {
    '--a63-action-primary': 'oklch(58% 0.2 155)',
    '--a63-action-primary-hover': 'oklch(52% 0.2 155)',
  } as CSSProperties,
}: {
  children: ReactNode
  contract: CSSProperties
  semantic?: CSSProperties
}) {
  return (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.875rem' }}>
        <ProbeRow label="default contract">{children}</ProbeRow>
        <ProbeRow label="semantic remap (--a63-action-*)" style={semantic}>
          {children}
        </ProbeRow>
        <ProbeRow label="contract remap" style={contract}>
          {children}
        </ProbeRow>
      </div>
    </EnvironmentShell>
  )
}

/*
 * a11y parameters for matrix stories. A matrix renders the same component once
 * per theme / environment on one page, so its landmarks (navigation, region,
 * header) repeat by design; axe's uniqueness rules would flag the matrix, not the
 * component. Every other rule still runs.
 */
export const repeatedLandmarks = {
  a11y: {
    config: {
      rules: [
        { id: 'landmark-unique', enabled: false },
        { id: 'landmark-no-duplicate-banner', enabled: false },
      ],
    },
  },
}
