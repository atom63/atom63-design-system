'use client'

import { Label, Separator, Switch } from '@atom63/ui-react'
import { clsx } from 'clsx'
import React, { type ReactNode, useMemo, useState } from 'react'
import { ComparisonProvider } from '../../comparison-context'
import { MdxFrame, MdxFrameFooter, MdxFramePanel } from '../../foundations/frame/framed-block'

type ComparisonSide = 'before' | 'after'

// Badge text color lives in the `.mdx-comparison-badge` recipe (mdx-blocks.css).
const BADGE_STYLES: Record<ComparisonSide, string> = {
  before: 'mdx-comparison-badge',
  after: 'mdx-comparison-badge',
}

export type ComparisonPairProps = {
  children: ReactNode
  className?: string
  label?: string
  slowMotionLabel?: string
  speedControl?: boolean
}

export type ComparisonSlotProps = {
  children: ReactNode
  className?: string
  label?: string
}

function ComparisonSlot({
  children,
  className,
  label,
  side,
}: ComparisonSlotProps & { side: ComparisonSide }) {
  return (
    <section
      aria-label={label ? `${label} — ${side}` : side}
      className={clsx('relative flex min-w-0 flex-1 flex-col', className)}
    >
      {label ? (
        <div
          className={clsx(
            'flex items-center gap-1.5 px-4 pt-3',
            side === 'after' && 'md:justify-end'
          )}
        >
          <span
            aria-hidden
            className={clsx(
              'size-1.5 rounded-full',
              side === 'before' ? 'bg-red-400/60' : 'bg-emerald-400/60'
            )}
          />
          <span className={clsx('text-xs font-medium', BADGE_STYLES[side])}>{label}</span>
        </div>
      ) : null}
      <div className="flex aspect-square flex-1 items-center justify-center px-6 py-8 md:aspect-auto">
        {children}
      </div>
    </section>
  )
}

function Before({ children, className, label }: ComparisonSlotProps) {
  return (
    <ComparisonSlot className={className} label={label} side="before">
      {children}
    </ComparisonSlot>
  )
}

function After({ children, className, label }: ComparisonSlotProps) {
  return (
    <ComparisonSlot className={className} label={label} side="after">
      {children}
    </ComparisonSlot>
  )
}

function SlowMotionSwitch({
  slow,
  onToggle,
  label = 'Slow motion',
}: {
  label?: string
  onToggle: (slow: boolean) => void
  slow: boolean
}) {
  return (
    <Label
      className="mdx-comparison-switch-label flex items-center gap-2 text-xs"
      data-slot="label"
    >
      <Switch checked={slow} onCheckedChange={onToggle} />
      {label}
    </Label>
  )
}

function ComparisonPair({
  children,
  className,
  label,
  slowMotionLabel = 'Slow motion',
  speedControl = false,
}: ComparisonPairProps) {
  const ariaLabel = label
  const [slow, setSlow] = useState(false)
  const speed = slow ? 0.25 : 1
  const durationScale = useMemo(() => 1 / speed, [speed])

  return (
    <ComparisonProvider durationScale={durationScale}>
      <MdxFrame
        aria-label={ariaLabel}
        className={clsx('comparison-pair mdx-comparison-pair not-prose', className)}
        frameClassName="mdx-comparison-frame"
        spacing="media"
      >
        <MdxFramePanel className="mdx-comparison-panel overflow-hidden p-0">
          <div className="flex flex-col md:aspect-video md:flex-row">
            {React.Children.toArray(children).flatMap((child, i, arr) =>
              i < arr.length - 1
                ? [
                    child,
                    <React.Fragment key={`sep-${String(i)}`}>
                      <Separator
                        className="md:hidden"
                        orientation="horizontal"
                        variant="gradient"
                      />
                      <Separator
                        className="hidden md:block"
                        orientation="vertical"
                        variant="gradient"
                      />
                    </React.Fragment>,
                  ]
                : [child]
            )}
          </div>
        </MdxFramePanel>
        {speedControl ? (
          <MdxFrameFooter className="flex items-center px-3 py-1.5">
            <SlowMotionSwitch label={slowMotionLabel} onToggle={setSlow} slow={slow} />
          </MdxFrameFooter>
        ) : null}
      </MdxFrame>
    </ComparisonProvider>
  )
}

ComparisonPair.Before = Before
ComparisonPair.After = After

export { ComparisonPair }
