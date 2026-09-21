'use client'

import {
  type SegmentedControlSize,
  type SegmentedControlTone,
  type SegmentedControlVariant,
  segmentedControlContract,
} from '@atom63/ui-foundation'
import { Tabs } from '@base-ui/react/tabs'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export interface SegmentedControlItem {
  disabled?: boolean
  icon?: React.ReactNode
  label: string
  value: string
}

export interface SegmentedControlProps {
  /** Animate the sliding indicator between segments (default true). */
  animateBackplate?: boolean
  className?: string
  /** Stretch the track to fill its container with equal-width segments. */
  fullWidth?: boolean
  items: SegmentedControlItem[]
  onValueChange: (value: string) => void
  size?: SegmentedControlSize
  /** Per-segment class escape hatch merged onto every tab. */
  tabClassName?: string
  tone?: SegmentedControlTone
  value: string
  variant?: SegmentedControlVariant
}

/*
 * SegmentedControl — a single-select segmented track with a sliding indicator
 * (Base UI Tabs). Track/pill/text read the segment contract (--a63-segment-*)
 * with muted-track / overlay-pill fallbacks so light mode keeps contrast. `tone`
 * mirrors the Toggle axis (neutral | accent).
 */
export function SegmentedControl({
  animateBackplate = true,
  className,
  fullWidth,
  items,
  onValueChange,
  size = segmentedControlContract.defaultSize,
  tabClassName,
  tone = segmentedControlContract.defaultTone,
  value,
  variant = segmentedControlContract.defaultVariant,
}: SegmentedControlProps): React.ReactElement {
  return (
    <Tabs.Root
      className={cn('a63-SegmentedControl', className)}
      data-backplate-animation={animateBackplate ? 'on' : 'off'}
      data-full={fullWidth || undefined}
      data-size={size}
      data-slot="segmented-control"
      data-tone={tone}
      data-variant={variant}
      onValueChange={next => {
        if (typeof next === 'string' && next !== value) {
          onValueChange(next)
        }
      }}
      value={value}
    >
      <Tabs.List className="a63-SegmentedControl-track" data-slot="segmented-control-track">
        {items.map(item => (
          <Tabs.Tab
            aria-label={item.label}
            className={cn('a63-SegmentedControl-item', tabClassName)}
            data-slot="segmented-control-item"
            disabled={item.disabled}
            key={item.value}
            title={item.label}
            value={item.value}
          >
            {variant === 'icon' ? (
              <span className="a63-SegmentedControl-icon" data-slot="segmented-control-icon">
                {item.icon ?? item.label}
              </span>
            ) : (
              <>
                {item.icon ? (
                  <span className="a63-SegmentedControl-icon" data-slot="segmented-control-icon">
                    {item.icon}
                  </span>
                ) : null}
                <span className="a63-SegmentedControl-label" data-slot="segmented-control-label">
                  {item.label}
                </span>
              </>
            )}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator
          className="a63-SegmentedControl-indicator"
          data-backplate-animation={animateBackplate ? 'on' : 'off'}
          data-slot="segmented-control-indicator"
        />
      </Tabs.List>
    </Tabs.Root>
  )
}
