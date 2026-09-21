import type { CSSProperties } from 'react'
import { GRID_HAIRLINE_PX } from './hairline'

export const GRID_CHROME_VARS = {
  lineColor: '--a63-grid-line-color',
  guideColor: '--a63-grid-guide-color',
  crosshairColor: '--a63-grid-crosshair-color',
  hairlineWidth: '--a63-grid-hairline-width',
  lineStyle: '--a63-grid-line-style',
} as const

export type GridChromeLineStyle = 'solid' | 'dashed'
export type GridChromeTone = 'subtle' | 'default' | 'strong'

export type GridChromeCssVars = Partial<
  Record<(typeof GRID_CHROME_VARS)[keyof typeof GRID_CHROME_VARS], string>
>

export type GridChromeStyle = CSSProperties & GridChromeCssVars

const GRID_CHROME_TONE_STYLES = {
  subtle: {
    [GRID_CHROME_VARS.lineColor]: 'color-mix(in oklch, var(--a63-border-subtle) 34%, transparent)',
    [GRID_CHROME_VARS.guideColor]: 'color-mix(in oklch, var(--a63-border-subtle) 16%, transparent)',
    [GRID_CHROME_VARS.crosshairColor]:
      'color-mix(in oklch, var(--a63-border-subtle) 42%, transparent)',
  },
  default: {
    [GRID_CHROME_VARS.lineColor]: 'color-mix(in oklch, var(--a63-border-subtle) 50%, transparent)',
    [GRID_CHROME_VARS.guideColor]: 'color-mix(in oklch, var(--a63-border-subtle) 24%, transparent)',
    [GRID_CHROME_VARS.crosshairColor]:
      'color-mix(in oklch, var(--a63-border-subtle) 58%, transparent)',
  },
  strong: {
    [GRID_CHROME_VARS.lineColor]: 'var(--a63-border-control)',
    [GRID_CHROME_VARS.guideColor]: 'var(--a63-border-subtle)',
    [GRID_CHROME_VARS.crosshairColor]: 'var(--a63-border-control)',
  },
} as const satisfies Record<GridChromeTone, GridChromeCssVars>

export function gridChromeStyle({
  lineStyle,
  style,
  tone,
}: {
  lineStyle: GridChromeLineStyle
  style?: GridChromeStyle
  tone: GridChromeTone
}): GridChromeStyle {
  return {
    [GRID_CHROME_VARS.hairlineWidth]: `${GRID_HAIRLINE_PX}px`,
    [GRID_CHROME_VARS.lineStyle]: lineStyle,
    ...GRID_CHROME_TONE_STYLES[tone],
    ...style,
  }
}
