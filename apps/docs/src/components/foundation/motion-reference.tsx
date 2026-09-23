import type { CSSProperties } from 'react'
import { DURATION_ALIASES, DURATION_PRIMITIVES, EASING_CURVES } from '../../foundation/token-meta'
import { FoundationPreviewHeader, FoundationPreviewPanel } from './preview-panel'

const DURATION_VISUALS = [
  {
    alias: 'duration-instant',
    maps: '0ms',
    use: 'Reduced motion, disabled transitions',
    ms: 0,
  },
  {
    alias: 'duration-fast',
    maps: '150ms',
    use: 'Press feedback, toggles, focus rings',
    ms: 150,
  },
  {
    alias: 'duration-normal',
    maps: '250ms',
    use: 'Panels, fades, small continuity shifts',
    ms: 250,
  },
  {
    alias: 'duration-overlay',
    maps: '450ms',
    use: 'Dialogs and overlay entrances',
    ms: 450,
  },
  {
    alias: 'duration-swipe-dismiss',
    maps: '400ms',
    use: 'Swipe-dismiss continuity',
    ms: 400,
  },
  {
    alias: 'duration-slow',
    maps: '500ms',
    use: 'Page transition, larger spatial movement',
    ms: 500,
  },
  {
    alias: 'duration-slower',
    maps: '1000ms',
    use: 'Skeleton pulse, attention without urgency',
    ms: 1000,
  },
] as const

const EASING_VISUALS = [
  {
    curve: 'ease-linear',
    value: 'cubic-bezier(0, 0, 1, 1)',
    character: 'Constant velocity',
    use: 'Progress bars',
    path: 'M8 72 C26 56 42 40 72 8',
  },
  {
    curve: 'ease-fast',
    value: 'cubic-bezier(0, 0, 0, 1)',
    character: 'Immediate deceleration',
    use: 'Snapping closed',
    path: 'M8 72 C12 10 30 8 72 8',
  },
  {
    curve: 'ease-spring',
    value: 'cubic-bezier(0.13, 1.62, 0, 0.92)',
    character: 'Restrained overshoot',
    use: 'Interactive feedback',
    path: 'M8 72 C18 -12 46 -8 72 8',
  },
  {
    curve: 'ease-soft',
    value: 'cubic-bezier(1, 0, 1, 1)',
    character: 'Gradual fade',
    use: 'Background transitions',
    path: 'M8 72 C46 72 58 36 72 8',
  },
  {
    curve: 'ease-inout',
    value: 'cubic-bezier(0.63, 0.05, 0.01, 0.99)',
    character: 'Weighted both ends',
    use: 'Slides and position changes',
    path: 'M8 72 C36 72 38 8 72 8',
  },
  {
    curve: 'ease-pointtopoint',
    value: 'cubic-bezier(0.55, 0.55, 0, 1)',
    character: 'Symmetric arc',
    use: 'Known start and end points',
    path: 'M8 72 C24 48 48 32 72 8',
  },
  {
    curve: 'ease-overlay',
    value: 'cubic-bezier(0.22, 1, 0.36, 1)',
    character: 'Quick settle',
    use: 'Overlay movement',
    path: 'M8 72 C12 28 32 8 72 8',
  },
  {
    curve: 'ease-scrim',
    value: 'cubic-bezier(0.32, 0.72, 0, 1)',
    character: 'Soft deceleration',
    use: 'Scrim transitions',
    path: 'M8 72 C14 34 34 8 72 8',
  },
  {
    curve: 'ease-standard',
    value: 'cubic-bezier(0.2, 0, 0, 1)',
    character: 'Standard deceleration',
    use: 'Shared recipe motion',
    path: 'M8 72 C16 38 28 8 72 8',
  },
  {
    curve: 'ease-emphasized',
    value: 'cubic-bezier(0.3, 0, 0, 1)',
    character: 'Emphasized deceleration',
    use: 'Prominent state changes',
    path: 'M8 72 C22 46 30 8 72 8',
  },
] as const

function MotionTrack({
  className,
  delayRatio = 0.4,
  durationMs,
  easing,
}: {
  className?: string
  delayRatio?: number
  durationMs: number
  easing: string
}) {
  const delayMs = Math.round(durationMs * delayRatio)
  const style = {
    '--motion-reference-delay': durationMs > 0 ? `-${delayMs}ms` : undefined,
    '--motion-reference-distance': 'calc(100% - 0.625rem)',
    '--motion-reference-duration': durationMs > 0 ? `${durationMs}ms` : undefined,
    '--motion-reference-easing': durationMs > 0 ? easing : undefined,
  } as CSSProperties
  const trailStyle = {
    ...style,
    '--motion-reference-delay': durationMs > 0 ? `-${Math.round(durationMs * 0.72)}ms` : undefined,
  } as CSSProperties

  return (
    <div className={className ?? 'relative h-1.5 rounded-full bg-muted'}>
      <span className="absolute inset-y-0 left-0 w-px bg-border" />
      <span className="absolute inset-y-0 right-0 w-px bg-border" />
      {durationMs > 0 ? (
        <span
          className="absolute top-1/2 left-0 size-2.5 rounded-full bg-primary/30"
          data-motion-reference-dot=""
          style={trailStyle}
        />
      ) : null}
      <span
        className="absolute top-1/2 left-0 size-2.5 rounded-full bg-primary"
        data-motion-reference-dot={durationMs > 0 ? '' : undefined}
        style={style}
      />
    </div>
  )
}

function DurationScale({ durationMs }: { durationMs: number }) {
  const width = `${Math.min(durationMs / 10, 100)}%`
  const barStyle = { width } as CSSProperties

  return (
    <div className="space-y-2">
      <div className="relative h-1 rounded-full bg-muted">
        <span className="absolute inset-y-0 left-0 rounded-full bg-primary/30" style={barStyle} />
      </div>
      <MotionTrack
        className="relative h-1.5 rounded-full bg-muted/80"
        delayRatio={0.42}
        durationMs={durationMs}
        easing="cubic-bezier(0, 0, 0, 1)"
      />
    </div>
  )
}

function EasingCurve({ path }: { path: string }) {
  return (
    <svg aria-hidden="true" className="size-14 overflow-visible" viewBox="0 0 80 80">
      <path className="stroke-border" d="M8 8 V72 H72" fill="none" strokeWidth="1" />
      <path className="stroke-primary" d={path} fill="none" strokeWidth="2.5" />
      <circle className="fill-background stroke-primary" cx="8" cy="72" r="3" strokeWidth="1.5" />
      <circle className="fill-primary" cx="72" cy="8" r="3" />
    </svg>
  )
}

export function MotionReference() {
  return (
    <div className="not-prose my-6 space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-medium text-foreground">Semantic durations</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Alias</th>
              <th className="py-2 font-medium">Maps to</th>
            </tr>
          </thead>
          <tbody>
            {DURATION_ALIASES.map(({ alias, maps }) => (
              <tr key={alias} className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs">{alias}</td>
                <td className="py-2 font-mono text-xs text-muted-foreground">{maps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-foreground">Primitive durations</h3>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRIMITIVES.map(({ token, ms }) => (
            <span
              key={token}
              className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs"
            >
              {token} ({ms}ms)
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-foreground">Easing</h3>
        <div className="flex flex-wrap gap-2">
          {EASING_CURVES.map(name => (
            <span
              key={name}
              className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs"
            >
              {name}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

export function DurationAliasVisualization() {
  return (
    <FoundationPreviewPanel>
      <FoundationPreviewHeader caption="semantic aliases">Duration aliases</FoundationPreviewHeader>
      <div className="divide-y divide-border/70">
        {DURATION_VISUALS.map(({ alias, maps, ms, use }) => (
          <div
            className="grid gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[11rem_4rem_minmax(0,1fr)_12rem] sm:items-center"
            key={alias}
          >
            <code className="w-fit rounded-xs bg-muted/50 px-1 py-0.5 font-mono text-xs whitespace-nowrap text-foreground">
              {alias}
            </code>
            <span className="font-mono text-xs text-muted-foreground">{maps}</span>
            <p className="text-xs leading-5 text-muted-foreground">{use}</p>
            <DurationScale durationMs={ms} />
          </div>
        ))}
      </div>
    </FoundationPreviewPanel>
  )
}

export function EasingCurveVisualization() {
  return (
    <FoundationPreviewPanel>
      <FoundationPreviewHeader caption="raw and semantic curves">
        Easing curves
      </FoundationPreviewHeader>
      <div className="grid gap-x-6 sm:grid-cols-2">
        {EASING_VISUALS.map(({ character, curve, path, use, value }) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-3 border-t border-border/70 py-3 first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
            key={curve}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <code className="rounded-xs bg-muted/50 px-1 py-0.5 font-mono text-xs text-foreground">
                  {curve}
                </code>
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
              <p className="mt-1 text-xs text-foreground">{character}</p>
              <p className="text-xs leading-5 text-muted-foreground">{use}</p>
            </div>
            <EasingCurve path={path} />
          </div>
        ))}
      </div>
    </FoundationPreviewPanel>
  )
}
