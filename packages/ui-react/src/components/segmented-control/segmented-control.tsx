'use client'

import {
  type SegmentedControlSize,
  type SegmentedControlTone,
  type SegmentedControlVariant,
  segmentedControlContract,
} from '@atom63/ui-foundation'
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import * as React from 'react'

import { cn } from '../../lib/cn'

export interface SegmentedControlItem {
  disabled?: boolean
  icon?: React.ReactNode
  label: string
  value: string
}

export interface SegmentedControlProps extends Omit<
  RadioGroup.Props<string>,
  'children' | 'className' | 'defaultValue' | 'onValueChange' | 'value'
> {
  /** Animate the sliding indicator between segments (default true). */
  animateBackplate?: boolean
  /** The group's accessible name, when no visible label names it through `aria-labelledby`. */
  'aria-label'?: string
  className?: string
  /** The initially selected segment when the control is uncontrolled. */
  defaultValue?: string
  /** Stretch the track to fill its container with equal-width segments. */
  fullWidth?: boolean
  items: SegmentedControlItem[]
  onValueChange?: (value: string) => void
  ref?: React.Ref<HTMLDivElement>
  size?: SegmentedControlSize
  /** Per-segment class escape hatch merged onto every segment. */
  tabClassName?: string
  tone?: SegmentedControlTone
  /** The selected segment. Leave it out, with `defaultValue`, for an
   *  uncontrolled control. */
  value?: string
  variant?: SegmentedControlVariant
}

interface IndicatorBox {
  height: number
  left: number
  width: number
}

/*
 * SegmentedControl — a single-choice segmented track with a sliding indicator.
 * It is a radio group (Base UI RadioGroup): the root is the radiogroup and takes
 * the group's name (`aria-label` or `aria-labelledby`), each segment is a radio,
 * Tab enters at the selected segment and the arrow keys move and select. Use Tabs
 * when the choices switch content panels. Track/pill/text read the segment
 * contract (--a63-segment-*) with muted-track / overlay-pill fallbacks so light
 * mode keeps contrast. `tone` mirrors the Toggle axis (neutral | accent).
 */
export function SegmentedControl({
  animateBackplate = true,
  className,
  defaultValue,
  fullWidth,
  items,
  onValueChange,
  size = segmentedControlContract.defaultSize,
  tabClassName,
  tone = segmentedControlContract.defaultTone,
  value,
  variant = segmentedControlContract.defaultVariant,
  ...props
}: SegmentedControlProps): React.ReactElement {
  /* Base UI owns the selection; this mirrors it when uncontrolled, so the
     indicator can follow it. */
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const selected = value ?? uncontrolledValue
  const selectedIndex = items.findIndex(item => item.value === selected)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = React.useState<IndicatorBox | null>(null)

  /* Measure the selected segment against the track, as Base UI's tab indicator
     does, so the plate covers it. The plate stays hidden until it is measured,
     so it does not slide in on mount. */
  React.useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const segments = () =>
      track.querySelectorAll<HTMLElement>('[data-slot="segmented-control-item"]')
    const measure = () => {
      const segment = segments()[selectedIndex]
      if (!segment) {
        setIndicator(null)
        return
      }
      const trackRect = track.getBoundingClientRect()
      const rect = segment.getBoundingClientRect()
      const left = rect.left - trackRect.left + track.scrollLeft - track.clientLeft
      setIndicator(current =>
        current?.left === left && current.width === rect.width && current.height === rect.height
          ? current
          : { height: rect.height, left, width: rect.width }
      )
    }
    /* When the track scrolls, keep the selected segment fully in view: on
       mount, when the selection changes, and when the track or a segment
       resizes (fonts and styles can settle after mount). Only the track
       scrolls, never the page. A clipped segment is aligned to the track's
       inline start, which is also its scroll-snap position, so snapping keeps
       it there; the browser clamps the scroll at either end. */
    const reveal = () => {
      const segment = segments()[selectedIndex]
      if (!segment || track.scrollWidth <= track.clientWidth) return
      const trackRect = track.getBoundingClientRect()
      const rect = segment.getBoundingClientRect()
      const start = trackRect.left + track.clientLeft
      const end = start + track.clientWidth
      if (rect.left >= start - 0.5 && rect.right <= end + 0.5) return
      const rtl = getComputedStyle(track).direction === 'rtl'
      track.scrollBy({ behavior: 'instant', left: rtl ? rect.right - end : rect.left - start })
    }
    const update = () => {
      reveal()
      measure()
    }
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(track)
    for (const segment of segments()) observer.observe(segment)
    return () => observer.disconnect()
  }, [items, selectedIndex])

  return (
    <RadioGroup<string>
      {...props}
      className={cn('a63-SegmentedControl', className)}
      data-backplate-animation={animateBackplate ? 'on' : 'off'}
      data-full={fullWidth || undefined}
      data-size={size}
      data-slot="segmented-control"
      data-tone={tone}
      data-variant={variant}
      onValueChange={next => {
        if (next === selected) return
        if (value === undefined) setUncontrolledValue(next)
        onValueChange?.(next)
      }}
      defaultValue={defaultValue}
      value={value}
    >
      <div
        className="a63-SegmentedControl-track"
        data-slot="segmented-control-track"
        ref={trackRef}
      >
        {items.map(item => (
          <Radio.Root
            aria-label={variant === 'icon' ? item.label : undefined}
            className={cn('a63-SegmentedControl-item', tabClassName)}
            data-slot="segmented-control-item"
            disabled={item.disabled}
            key={item.value}
            nativeButton
            render={<button type="button" />}
            title={variant === 'icon' ? item.label : undefined}
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
          </Radio.Root>
        ))}
        <span
          aria-hidden
          className="a63-SegmentedControl-indicator"
          data-backplate-animation={animateBackplate ? 'on' : 'off'}
          data-slot="segmented-control-indicator"
          hidden={!indicator}
          style={
            indicator
              ? ({
                  '--segment-indicator-height': `${indicator.height}px`,
                  '--segment-indicator-left': `${indicator.left}px`,
                  '--segment-indicator-width': `${indicator.width}px`,
                } as React.CSSProperties)
              : undefined
          }
        />
      </div>
    </RadioGroup>
  )
}
