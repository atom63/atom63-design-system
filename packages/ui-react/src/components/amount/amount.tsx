import { type AmountSize, amountContract } from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type AmountProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** The amount, such as `13.25`. */
  value: number
  /** An ISO 4217 currency code, such as `"USD"` or `"EUR"`. */
  currency: string
  /** Formats for this locale instead of the browser's, such as `"de-DE"`. */
  locale?: string
  /** `md` is the display text role (40px); `lg` is display-large (56px). */
  size?: AmountSize
  /** The emphasized weight of the role. */
  strong?: boolean
}

interface AmountRun {
  fraction: boolean
  text: string
}

/** The formatted amount split into runs: the decimal separator and the digits after it are the fraction. */
function amountRuns(parts: Intl.NumberFormatPart[]): AmountRun[] {
  const runs: AmountRun[] = []
  for (const part of parts) {
    const fraction = part.type === 'decimal' || part.type === 'fraction'
    const last = runs[runs.length - 1]
    if (last && last.fraction === fraction) last.text += part.value
    else runs.push({ fraction, text: part.value })
  }
  return runs
}

/*
 * A money amount in a display text role, as banking and pricing screens draw a
 * balance: "$13.25" with the fraction (".25") at half size and raised. The
 * value is formatted for the locale with Intl.NumberFormat, drawn with tabular
 * figures, and read by assistive technology as one label ("$13.25"). The web
 * counterpart of iOS AtomAmountText. For an amount at body size, such as a row
 * in a transaction list, use plain text with `tabular-nums` instead.
 */
export function Amount({
  className,
  currency,
  locale,
  size = amountContract.defaultSize,
  strong = false,
  value,
  ...props
}: AmountProps): React.ReactElement {
  const parts = new Intl.NumberFormat(locale, { currency, style: 'currency' }).formatToParts(value)
  const label = parts.map(part => part.value).join('')
  return (
    <span
      className={cn('a63-Amount', className)}
      data-size={size}
      data-slot="amount"
      data-strong={strong ? '' : undefined}
      {...props}
    >
      <span aria-hidden="true">
        {amountRuns(parts).map((run, index) =>
          run.fraction ? (
            <span className="a63-AmountFraction" data-slot="amount-fraction" key={index}>
              {run.text}
            </span>
          ) : (
            run.text
          )
        )}
      </span>
      <span className="a63-Amount-label">{label}</span>
    </span>
  )
}
