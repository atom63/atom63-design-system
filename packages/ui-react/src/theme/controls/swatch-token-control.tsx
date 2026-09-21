'use client'

import type * as React from 'react'
import { SegmentedControl, type SegmentedControlItem } from '../../components/segmented-control'
import { cn } from '../../lib/cn'
import type { PersonalizationOption } from '../core/types'

export interface SwatchTokenControlProps<T extends string> {
  className?: string
  onChange: (value: T) => void
  options: readonly PersonalizationOption<T>[]
  /** Resolve an option id to a CSS color/gradient for its swatch. */
  swatch: (id: T) => string
  value: T
}

/*
 * SwatchTokenControl — a color/surface picker over the DS SegmentedControl (icon
 * variant): each segment is a round swatch; the option name is the aria-label.
 */
export function SwatchTokenControl<T extends string>({
  className,
  onChange,
  options,
  swatch,
  value,
}: SwatchTokenControlProps<T>): React.ReactElement {
  const items: SegmentedControlItem[] = options.map(option => ({
    icon: (
      <span
        aria-hidden="true"
        className="block size-4 rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.28)] ring-1 ring-black/10 ring-inset dark:ring-white/15"
        data-slot="swatch"
        style={{ background: swatch(option.id) }}
      />
    ),
    label: option.name,
    value: option.id,
  }))
  return (
    <SegmentedControl
      className={cn('w-full', className)}
      fullWidth
      items={items}
      onValueChange={next => onChange(next as T)}
      size="lg"
      value={value}
      variant="icon"
    />
  )
}
