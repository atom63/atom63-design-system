import { useEffect, useRef } from 'react'
import { useShikiHighlight } from './lib/use-shiki-highlight'

export interface MdxSourceViewProps {
  source: string
  /** 1-based, inclusive line range to highlight + scroll into view. */
  activeRange?: { startLine: number; endLine: number }
  className?: string
}

// Matches the forced `--pre` line-height and padding below, so the active-range
// band lines up with shiki's rendered lines.
const LINE_HEIGHT = '1.5em'
const PRE_PADDING = '0.75rem' // Tailwind p-3

/**
 * Read-only, syntax-highlighted view of MDX source. Presentation-only — no
 * docking/positioning. MDX is highlighted as `tsx` (JSX superset). When
 * `activeRange` is set, those lines get a subtle highlight band and are
 * scrolled into view.
 *
 * Phase-2 seam: a future editable `MdxSourceEditor` replaces this surface inside
 * the same panel shell without changing the source plumbing.
 */
export function MdxSourceView({ source, activeRange, className }: MdxSourceViewProps) {
  const html = useShikiHighlight(source, 'tsx')
  const activeRef = useRef<HTMLDivElement>(null)

  // Scroll the active band into view when the range or content changes.
  // `html` is a trigger, not read in the body: the band only has correct
  // geometry once the highlighted source has rendered.
  // html re-triggers the scroll after highlight renders
  useEffect(() => {
    if (!activeRange) return
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeRange, html])

  const overlay = activeRange ? (
    <div
      aria-hidden
      className="bg-primary/10 pointer-events-none absolute inset-x-0"
      ref={activeRef}
      style={{
        // The shiki <pre> is padded by PRE_PADDING; offset the band to match.
        top: `calc(${PRE_PADDING} + ${activeRange.startLine - 1} * ${LINE_HEIGHT})`,
        height: `calc(${activeRange.endLine - activeRange.startLine + 1} * ${LINE_HEIGHT})`,
      }}
    />
  ) : null

  return (
    <div
      className={`bg-card/40 relative h-full overflow-auto font-mono text-xs [&_code]:leading-[1.5em] [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:p-3 [&_pre]:leading-[1.5em] ${className ?? ''}`}
    >
      {overlay}
      {html ? (
        <div className="relative" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="text-muted-foreground m-0 p-3 leading-[1.5em]">{source}</pre>
      )}
    </div>
  )
}
