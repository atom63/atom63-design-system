import { SYMBOL_SVG, WORDMARK_SVG } from './primitives'

const SYMBOL_ASPECT = 100 / 100
const WORDMARK_ASPECT = 280 / 40

const HORIZONTAL_WORDMARK_RATIO = 0.5
const HORIZONTAL_GAP_RATIO = 0.25
const VERTICAL_WORDMARK_RATIO = 0.36
const VERTICAL_GAP_RATIO = 0.24

function clsx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

function LogoSymbol() {
  return <path d={SYMBOL_SVG.path} fill="currentColor" />
}

function LogoWordmark() {
  return <path d={WORDMARK_SVG.path} fill="currentColor" />
}

function SymbolSvg({ className, size }: { className?: string; size: number }) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox={SYMBOL_SVG.viewBox}
      width={size * SYMBOL_ASPECT}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>ATOM63</title>
      <LogoSymbol />
    </svg>
  )
}

function WordmarkSvg({ className, height }: { className?: string; height: number }) {
  return (
    <svg
      className={className}
      fill="none"
      height={height}
      viewBox={WORDMARK_SVG.viewBox}
      width={height * WORDMARK_ASPECT}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>ATOM63</title>
      <LogoWordmark />
    </svg>
  )
}

interface AppLogoProps {
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
  const symbolClass = colored ? 'text-primary' : undefined

  switch (variant) {
    case 'horizontal':
      return (
        <div
          className={clsx('inline-flex items-center', className)}
          style={{ gap: height * HORIZONTAL_GAP_RATIO }}
        >
          <SymbolSvg className={symbolClass} size={height} />
          <WordmarkSvg height={height * HORIZONTAL_WORDMARK_RATIO} />
        </div>
      )

    case 'vertical':
      return (
        <div
          className={clsx('inline-flex flex-col items-center', className)}
          style={{ gap: height * VERTICAL_GAP_RATIO }}
        >
          <SymbolSvg className={symbolClass} size={height} />
          <WordmarkSvg height={height * VERTICAL_WORDMARK_RATIO} />
        </div>
      )

    case 'symbol':
      return <SymbolSvg className={clsx(symbolClass, className)} size={height} />

    case 'wordmark':
      return <WordmarkSvg className={className} height={height} />

    default:
      return null
  }
}
