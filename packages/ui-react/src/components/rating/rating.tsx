'use client'

import { type RatingSize, ratingContract } from '@atom63/ui-foundation'
import { Star } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { RadioGroup, RadioPrimitive } from '../radio'

export type RatingProps = Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> & {
  /** The score, from 0 to `max`. Read-only ratings take halves (4.5). */
  value: number
  /** The number of stars. */
  max?: number
  /** Makes the rating an input: a radio group with one radio per star. */
  onValueChange?: (value: number) => void
  /** The accessible name: what a read-only rating says, or what an input rating asks. */
  label?: string
  disabled?: boolean
  /** Replaces the built-in star. */
  icon?: React.ReactNode
  size?: RatingSize
}

/*
 * Rating — a score out of `max` stars. Read-only by default: one image whose
 * name says the score ("4.5 out of 5"), so a screen reader does not walk five
 * stars. With `onValueChange` it becomes a radio group (Base UI), one radio per
 * star named "3 stars", so arrow keys change the value. Not a slider or a
 * like button: use those for continuous values and single toggles.
 */
export function Rating({
  className,
  value,
  max = 5,
  onValueChange,
  label,
  disabled = false,
  icon,
  size = ratingContract.defaultSize,
  ...props
}: RatingProps): React.ReactElement {
  const glyph = icon ?? <Star aria-hidden />
  const stars = Array.from({ length: max }, (_, index) => index + 1)
  const fill = (star: number) => Math.min(1, Math.max(0, value - (star - 1)))

  if (!onValueChange) {
    return (
      <div
        aria-label={label ?? `${value} out of ${max}`}
        className={cn('a63-Rating', className)}
        data-read-only=""
        data-size={size}
        data-slot="rating"
        role="img"
        {...props}
      >
        {stars.map(star => (
          <span
            className="a63-Rating-item"
            data-slot="rating-item"
            key={star}
            style={{ '--rating-fill': `${fill(star) * 100}%` } as React.CSSProperties}
          >
            <span className="a63-Rating-icon" data-slot="rating-icon">
              {glyph}
            </span>
            <span className="a63-Rating-icon a63-Rating-icon--filled" data-slot="rating-icon">
              {glyph}
            </span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <RadioGroup
      aria-label={label}
      className={cn('a63-Rating', className)}
      data-size={size}
      data-slot="rating"
      disabled={disabled}
      onValueChange={next => onValueChange(Number(next))}
      value={String(Math.round(value))}
      {...(props as Omit<React.ComponentProps<typeof RadioGroup>, 'onValueChange' | 'value'>)}
    >
      {stars.map(star => (
        <RadioPrimitive.Root
          aria-label={star === 1 ? '1 star' : `${star} stars`}
          className="a63-Rating-item"
          data-on={star <= value ? '' : undefined}
          data-slot="rating-item"
          key={star}
          value={String(star)}
        >
          <span className="a63-Rating-icon" data-slot="rating-icon">
            {glyph}
          </span>
        </RadioPrimitive.Root>
      ))}
    </RadioGroup>
  )
}
