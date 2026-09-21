import { cn } from '../../lib/cn'

export type ProgressiveBlurPosition = 'both' | 'bottom' | 'top'

export interface ProgressiveBlurProps {
  /** Blur radii in px, weakest first. Each gets an equal band of the height. */
  blurLevels?: number[]
  className?: string
  /** Height of the blurred zone. Ignored for `both`, which spans the box. */
  height?: string
  position?: ProgressiveBlurPosition
}

const BOTH_GRADIENT =
  'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)'

function buildMask(position: ProgressiveBlurPosition, from: number, to: number): string {
  if (position === 'both') return BOTH_GRADIENT
  const dir = position === 'bottom' ? 'to bottom' : 'to top'
  return `linear-gradient(${dir}, rgba(0,0,0,0) ${from}%, rgba(0,0,0,1) ${to}%)`
}

/**
 * Stacked `backdrop-filter` layers, each masked to its own band, producing a
 * blur that ramps instead of switching on at an edge.
 *
 * Why a ramp: text over photography needs the busy detail behind it gone, but a
 * single blur layer (or a heavy dark scrim) announces itself as a band across
 * the image. Ramping the radius across bands keeps the photo legible where it
 * is uncovered and removes the high-frequency detail exactly where the text
 * sits, so the boundary disappears.
 *
 * Pair with a light scrim: blur flattens detail but does not darken, so it
 * cannot carry contrast on its own.
 *
 * Mount inside a `clip-path`-clipped parent, not `overflow: hidden` — the
 * latter opens a stacking context that breaks backdrop compositing on rounded
 * corners.
 */
export function ProgressiveBlur({
  className,
  height = '30%',
  position = 'bottom',
  blurLevels = [0.5, 1, 2, 4, 8, 16, 32, 64],
}: ProgressiveBlurProps) {
  const count = blurLevels.length
  const step = 100 / count

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 z-10',
        position === 'top' ? 'top-0' : position === 'bottom' ? 'bottom-0' : 'inset-y-0',
        className
      )}
      data-slot="progressive-blur"
      style={{ height: position === 'both' ? '100%' : height }}
    >
      {blurLevels.map((blur, i) => {
        const mask = buildMask(position, i * step, (i + 1) * step)

        return (
          <div
            className="absolute inset-0"
            key={`blur-${blur}`}
            style={{
              zIndex: i + 1,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}
