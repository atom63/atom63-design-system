'use client'

import type * as React from 'react'
import { SegmentedControl, type SegmentedControlItem } from '../../components/segmented-control'
import { cn } from '../../lib/cn'
import type { PersonalizationOption } from '../core/types'

export interface SegmentedTokenControlProps<T extends string> {
  className?: string
  onChange: (value: T) => void
  options: readonly PersonalizationOption<T>[]
  value: T
}

/*
 * SegmentedTokenControl — maps a personalization axis's option catalog onto the
 * DS SegmentedControl (label variant), full-width. For discrete label axes
 * (mode/theme/type/radius/font/os/icon).
 */
export function SegmentedTokenControl<T extends string>({
  className,
  onChange,
  options,
  value,
}: SegmentedTokenControlProps<T>): React.ReactElement {
  const items: SegmentedControlItem[] = options.map(option => ({
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
      variant="label"
    />
  )
}
