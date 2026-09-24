'use client'

import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import * as React from 'react'

import { cn } from '../../lib/cn'

export type SliderRootProps = SliderPrimitive.Root.Props

function normalizeSliderValues(
  input: number | readonly number[] | undefined,
  fallback: number
): readonly number[] {
  if (typeof input === 'number') return [input]
  return input ?? [fallback]
}

export interface SliderProps extends Omit<
  SliderRootProps,
  'value' | 'defaultValue' | 'onValueChange' | 'render'
> {
  className?: string
  /**
   * The controlled value. Pass a `number` for a single-thumb slider, or an array
   * for a ranged (multi-thumb) slider.
   */
  value?: number | readonly number[]
  defaultValue?: number | readonly number[]
  /**
   * Convenience change handler. For a single-thumb slider you receive a plain
   * `number`; for a ranged slider you receive the first thumb's value.
   */
  onValueChange?: (value: number) => void
  /** Accessible label for each thumb, especially useful for ranged sliders. */
  getThumbAriaLabel?: (index: number) => string
  'aria-label'?: string
}

/*
 * Slider — a value control (Base UI Slider). The rail is a recessed track (reads the
 * `track` archetype --a63-track-shadow); the filled indicator is the brand accent;
 * the thumb is a raised CONTROL. Faithful port of the prod `@atom63/ui` Slider:
 * exports `Slider` + `SliderValue`, renders `children` plus one Thumb per value
 * (multi-thumb), and keeps a single-value number convenience over Base UI's
 * number|number[] surface.
 */
export function Slider({
  className,
  children,
  value,
  defaultValue,
  getThumbAriaLabel,
  onValueChange,
  min = 0,
  max = 100,
  'aria-label': ariaLabel,
  ...props
}: SliderProps): React.ReactElement {
  const values = React.useMemo(
    () => normalizeSliderValues(value ?? defaultValue, min),
    [value, defaultValue, min]
  )

  return (
    <SliderPrimitive.Root
      className={cn('a63-Slider', className)}
      data-slot="slider"
      defaultValue={defaultValue}
      max={max}
      min={min}
      onValueChange={
        onValueChange ? next => onValueChange(typeof next === 'number' ? next : next[0]) : undefined
      }
      value={value}
      {...props}
    >
      {children}
      <SliderPrimitive.Control className="a63-Slider-control" data-slot="slider-control">
        <SliderPrimitive.Track className="a63-Slider-track" data-slot="slider-track">
          <SliderPrimitive.Indicator
            className="a63-Slider-indicator"
            data-slot="slider-indicator"
          />
          {Array.from({ length: values.length }, (_, index) => (
            <SliderPrimitive.Thumb
              className="a63-Slider-thumb"
              data-slot="slider-thumb"
              getAriaLabel={
                getThumbAriaLabel
                  ? () => getThumbAriaLabel(index)
                  : ariaLabel
                    ? () => (values.length > 1 ? `${ariaLabel} ${index + 1}` : ariaLabel)
                    : undefined
              }
              key={String(index)}
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

/*
 * SliderValue — the numeric read-out of the current slider value (Base UI
 * Slider.Value). Mirrors prod's SliderValue part.
 */
export function SliderValue({
  className,
  ...props
}: SliderPrimitive.Value.Props): React.ReactElement {
  return (
    <SliderPrimitive.Value
      className={cn('a63-Slider-value', className)}
      data-slot="slider-value"
      {...props}
    />
  )
}
