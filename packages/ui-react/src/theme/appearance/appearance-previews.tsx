'use client'

import { type CSSProperties, useId } from 'react'
import { cn } from '../../lib/cn'
import type { ColorMode, FontFamily, RadiusScale, TypeScale } from '../core/types'

/*
 * appearance-previews — the four rich preview visuals ported from the old
 * `@atom63/theme` appearance controls, with shadcn tokens translated to the DS
 * `--a63-*` layer. These are internal to the /theme submodule (fed to
 * VisualChoiceControl by AppearancePanel); not exported from the barrel.
 */

const MODE_WINDOW = {
  chromeHeight: 18,
  height: 70,
  rx: 10,
  splitX: 56,
  width: 102,
  x: 5,
  y: 5,
} as const

// Reads live DS foundation surface tokens so mode previews reflect the palette.
const MODE_PREVIEW_PALETTE = {
  dark: {
    chrome: 'var(--surface-dark-3)',
    dot: 'var(--surface-dark-9)',
    line: 'var(--surface-dark-8)',
    lineStrong: 'var(--surface-dark-11)',
    surface: 'var(--surface-dark-2)',
  },
  light: {
    chrome: 'var(--surface-light-3)',
    dot: 'var(--surface-light-9)',
    line: 'var(--surface-light-8)',
    lineStrong: 'var(--surface-light-11)',
    surface: 'var(--surface-light-2)',
  },
} as const

function ModeWindowContent({
  palette,
}: {
  palette: {
    chrome: string
    dot: string
    line: string
    lineStrong: string
    surface: string
  }
}) {
  const { x, y, width, height, chromeHeight } = MODE_WINDOW

  return (
    <>
      <rect fill={palette.surface} height={height} width={width} x={x} y={y} />
      <rect fill={palette.chrome} height={chromeHeight} width={width} x={x} y={y} />
      <circle cx={x + 12} cy={y + 9} fill={palette.dot} r={3} />
      <circle cx={x + 23} cy={y + 9} fill={palette.dot} r={3} />
      <rect fill={palette.lineStrong} height={5} rx={2.5} width={42} x={x + 13} y={y + 29} />
      <rect fill={palette.line} height={5} rx={2.5} width={62} x={x + 13} y={y + 42} />
      <rect fill="var(--a63-action-primary)" height={9} rx={4.5} width={30} x={x + 13} y={y + 54} />
    </>
  )
}

function ModeWindowOutline({ selected }: { selected: boolean }) {
  return (
    <rect
      className={
        selected
          ? 'stroke-[color-mix(in_oklch,var(--a63-action-primary)_80%,transparent)]'
          : 'stroke-[var(--a63-border-subtle)]'
      }
      fill="none"
      height={MODE_WINDOW.height}
      rx={MODE_WINDOW.rx}
      strokeWidth="1.5"
      width={MODE_WINDOW.width}
      x={MODE_WINDOW.x}
      y={MODE_WINDOW.y}
    />
  )
}

export function ModePreview({ mode, selected }: { mode: ColorMode; selected: boolean }) {
  const id = useId().replaceAll(':', '')
  const windowClipId = `${id}-window`
  const leftClipId = `${id}-left`
  const rightClipId = `${id}-right`
  const modeLabel = mode === 'system' ? 'Auto mode preview' : `${mode} mode preview`

  return (
    <svg
      aria-hidden="true"
      className="h-[4.25rem] w-full shrink-0 px-2 drop-shadow-sm"
      data-slot="appearance-mode-preview"
      fill="none"
      viewBox="0 0 112 80"
    >
      <title>{modeLabel}</title>
      <defs>
        <clipPath id={windowClipId}>
          <rect
            height={MODE_WINDOW.height}
            rx={MODE_WINDOW.rx}
            width={MODE_WINDOW.width}
            x={MODE_WINDOW.x}
            y={MODE_WINDOW.y}
          />
        </clipPath>
        {mode === 'system' ? (
          <>
            <clipPath id={leftClipId}>
              <rect
                height={MODE_WINDOW.height}
                width={MODE_WINDOW.splitX - MODE_WINDOW.x}
                x={MODE_WINDOW.x}
                y={MODE_WINDOW.y}
              />
            </clipPath>
            <clipPath id={rightClipId}>
              <rect
                height={MODE_WINDOW.height}
                width={MODE_WINDOW.x + MODE_WINDOW.width - MODE_WINDOW.splitX}
                x={MODE_WINDOW.splitX}
                y={MODE_WINDOW.y}
              />
            </clipPath>
          </>
        ) : null}
      </defs>
      <g clipPath={`url(#${windowClipId})`}>
        {mode === 'system' ? (
          <>
            <g clipPath={`url(#${leftClipId})`}>
              <ModeWindowContent palette={MODE_PREVIEW_PALETTE.light} />
            </g>
            <g clipPath={`url(#${rightClipId})`}>
              <ModeWindowContent palette={MODE_PREVIEW_PALETTE.dark} />
            </g>
            <line
              stroke="var(--a63-border-subtle)"
              strokeDasharray="2 2"
              strokeOpacity="0.85"
              strokeWidth="0.75"
              x1={MODE_WINDOW.splitX}
              x2={MODE_WINDOW.splitX}
              y1={MODE_WINDOW.y + 3}
              y2={MODE_WINDOW.y + MODE_WINDOW.height - 3}
            />
          </>
        ) : (
          <ModeWindowContent
            palette={mode === 'dark' ? MODE_PREVIEW_PALETTE.dark : MODE_PREVIEW_PALETTE.light}
          />
        )}
      </g>
      <ModeWindowOutline selected={selected} />
    </svg>
  )
}

/** Option id → the DS foundation font-family stack to preview it in. */
const FONT_FAMILY_VAR: Record<FontFamily, string> = {
  sans: 'var(--font-family-sans)',
  serif: 'var(--font-family-serif)',
  mono: 'var(--font-family-mono)',
  pixel: 'var(--font-family-pixel)',
}

export function FontPreview({ font, selected }: { font: FontFamily; selected: boolean }) {
  const style = { fontFamily: FONT_FAMILY_VAR[font] } satisfies CSSProperties

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-12 w-full items-center justify-center text-2xl leading-none transition-colors',
        selected ? 'text-[var(--a63-text-accent)]' : 'text-[var(--a63-text-primary)]'
      )}
      data-slot="appearance-font-preview"
      style={style}
    >
      Aa
    </span>
  )
}

export function TypeScalePreview({ scale, selected }: { scale: TypeScale; selected: boolean }) {
  const previewClassName = {
    compact: 'text-sm',
    comfortable: 'text-lg',
    large: 'text-xl',
    normal: 'text-base',
  }[scale]

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-12 w-full items-center justify-center gap-1',
        selected ? 'text-[var(--a63-text-accent)]' : 'text-[var(--a63-text-primary)]'
      )}
      data-slot="appearance-type-scale-preview"
    >
      <span className={cn('leading-none font-semibold', previewClassName)}>Aa</span>
      <span className="grid gap-0.5">
        <span className="block h-0.5 w-5 rounded-full bg-current opacity-50" />
        <span className="block h-0.5 w-3 rounded-full bg-current opacity-30" />
      </span>
    </span>
  )
}

export function RadiusPreview({ radius, selected }: { radius: RadiusScale; selected: boolean }) {
  // Preview radii are scaled for a wide tile so Default stays rectangular
  // and Round reads as a capsule. Literal token radii collapse on small boxes.
  const previewRadius = {
    none: '0px',
    subtle: '3px',
    default: '6px',
    round: '9999px',
  }[radius]
  const style = {
    border: '2px solid currentColor',
    borderRadius: previewRadius,
  } satisfies CSSProperties

  return (
    <span
      className={cn(
        'flex h-12 w-full items-center justify-center',
        selected ? 'text-[var(--a63-text-accent)]' : 'text-[var(--a63-text-primary)]'
      )}
      data-slot="appearance-radius-preview"
    >
      <span className="block h-4 w-12" style={style} />
    </span>
  )
}
