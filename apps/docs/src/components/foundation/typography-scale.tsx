import type { CSSProperties } from 'react'
import { TYPE_SCALE, TYPE_SCALE_PREVIEW_PX } from '../../foundation/token-meta'

type ScaleStep = (typeof TYPE_SCALE)[number]

function sampleStyle(size: ScaleStep): CSSProperties {
  const px = TYPE_SCALE_PREVIEW_PX[size]
  return {
    fontSize: px.fontSize,
    lineHeight: px.lineHeight,
  }
}

export function TypographyScale() {
  return (
    <div className="foundation-preview not-prose not-mdx my-6 space-y-3 rounded-xl border border-border bg-card/30 p-4">
      {[...TYPE_SCALE].reverse().map(size => (
        <div
          key={size}
          className="grid gap-1 border-b border-border py-3 last:border-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-4"
        >
          <span
            className="font-sans tracking-tight text-foreground"
            data-type-scale={size}
            style={sampleStyle(size)}
          >
            The quick brown fox
          </span>
          <div className="shrink-0 text-right font-mono text-xs text-muted-foreground">
            <div>{`text-${size}`}</div>
            <div className="text-[10px] opacity-70">{TYPE_SCALE_PREVIEW_PX[size].fontSize}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
