'use client'

import type * as React from 'react'
import { Slider } from '../../components/slider'

export interface RangeTokenControlProps {
  label: string
  max?: number
  min?: number
  onChange: (value: number) => void
  value: number
}

/*
 * RangeTokenControl — a labelled percentage slider (surfaceTint). Reads the DS
 * Slider primitive; shows "Off" at the minimum.
 */
export function RangeTokenControl({
  label,
  max = 100,
  min = 0,
  onChange,
  value,
}: RangeTokenControlProps): React.ReactElement {
  const valueLabel = value === min ? 'Off' : `${value}%`
  return (
    <div className="grid gap-2.5" data-slot="range-token-control">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--a63-text-primary)]">{label}</span>
        <span className="min-w-10 text-right text-xs font-medium text-[var(--a63-text-secondary)] tabular-nums">
          {valueLabel}
        </span>
      </div>
      <Slider aria-label={label} max={max} min={min} onValueChange={onChange} value={value} />
    </div>
  )
}
