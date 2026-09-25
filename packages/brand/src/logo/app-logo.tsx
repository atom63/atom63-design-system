import type { CSSProperties } from 'react'

import { SYMBOL_SVG, WORDMARK_SVG } from './primitives'

const SYMBOL_ASPECT = 100 / 100
const WORDMARK_ASPECT = 280 / 40

const HORIZONTAL_WORDMARK_RATIO = 0.5
const HORIZONTAL_GAP_RATIO = 0.25
const VERTICAL_WORDMARK_RATIO = 0.36
const VERTICAL_GAP_RATIO = 0.24

function LogoSymbol() {
  return <path d={SYMBOL_SVG.path} fill="currentColor" />
}

function LogoWordmark() {
  return <path d={WORDMARK_SVG.path} fill="currentColor" />
}

interface PartProps {
  className?: string
  /** Inside a combined logo the wrapper carries the name, so the part is hidden. */
  decorative?: boolean
  style?: CSSProperties
}

const partA11y = (decorative?: boolean) =>
  decorative ? ({ 'aria-hidden': true } as const) : ({ role: 'img' } as const)

function SymbolSvg({ className, decorative, size, style }: PartProps & { size: number }) {
  return (
    <svg
      className={className}
      {...partA11y(decorative)}
      style={style}
      fill="none"
      height={size}
      viewBox={SYMBOL_SVG.viewBox}
      width={size * SYMBOL_ASPECT}
      xmlns="http://www.w3.org/2000/svg"
    >
      {decorative ? null : <title>ATOM63</title>}
      <LogoSymbol />
    </svg>
  )
}

function WordmarkSvg({ className, decorative, height }: PartProps & { height: number }) {
  return (
    <svg
      className={className}
      {...partA11y(decorative)}
      fill="none"
      height={height}
      viewBox={WORDMARK_SVG.viewBox}
      width={height * WORDMARK_ASPECT}
      xmlns="http://www.w3.org/2000/svg"
    >
      {decorative ? null : <title>ATOM63</title>}
      <LogoWordmark />
    </svg>
  )
}

export interface AppLogoProps {
  className?: string
  colored?: boolean
  height?: number
  variant?: 'horizontal' | 'symbol' | 'vertical' | 'wordmark'
}

export function AppLogo({
  variant = 'horizontal',
  height = 32,
  colored = false,
  className,
}: AppLogoProps) {
  // The brand's primary action color, so the symbol follows the active brand and mode.
  const symbolStyle = colored ? { color: 'var(--a63-action-primary)' } : undefined

  switch (variant) {
    case 'horizontal':
      return (
        <div
          aria-label="ATOM63"
          className={className}
          role="img"
          style={{
            alignItems: 'center',
            display: 'inline-flex',
            gap: height * HORIZONTAL_GAP_RATIO,
          }}
        >
          <SymbolSvg decorative size={height} style={symbolStyle} />
          <WordmarkSvg decorative height={height * HORIZONTAL_WORDMARK_RATIO} />
        </div>
      )

    case 'vertical':
      return (
        <div
          aria-label="ATOM63"
          className={className}
          role="img"
          style={{
            alignItems: 'center',
            display: 'inline-flex',
            flexDirection: 'column',
            gap: height * VERTICAL_GAP_RATIO,
          }}
        >
          <SymbolSvg decorative size={height} style={symbolStyle} />
          <WordmarkSvg decorative height={height * VERTICAL_WORDMARK_RATIO} />
        </div>
      )

    case 'symbol':
      return <SymbolSvg className={className} size={height} style={symbolStyle} />

    case 'wordmark':
      return <WordmarkSvg className={className} height={height} />

    default:
      return null
  }
}
