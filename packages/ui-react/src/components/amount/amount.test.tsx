import { amountContract } from '@atom63/ui-foundation'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Amount } from './amount'

function amount(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-slot="amount"]') as HTMLElement
}

describe('Amount', () => {
  it('renders its slot with the default size', () => {
    const { container } = render(<Amount currency="USD" locale="en-US" value={13.25} />)
    expect(amount(container)).toHaveAttribute('data-size', amountContract.defaultSize)
    expect(amount(container)).not.toHaveAttribute('data-strong')
  })

  it('applies the given size and the strong weight', () => {
    const { container } = render(
      <Amount currency="USD" locale="en-US" size="lg" strong value={13.25} />
    )
    expect(amount(container)).toHaveAttribute('data-size', 'lg')
    expect(amount(container)).toHaveAttribute('data-strong', '')
  })

  it('draws the decimal separator and the digits after it as the fraction', () => {
    const { container } = render(<Amount currency="USD" locale="en-US" value={1234.5} />)
    const fraction = container.querySelector('[data-slot="amount-fraction"]')
    expect(fraction).toHaveTextContent(/^\.50$/)
    expect(fraction?.parentElement).toHaveTextContent(/^\$1,234\.50$/)
  })

  it('follows the locale, keeping the symbol after the fraction where the locale puts it', () => {
    const { container } = render(<Amount currency="EUR" locale="de-DE" value={1234.56} />)
    expect(container.querySelector('[data-slot="amount-fraction"]')).toHaveTextContent(/^,56$/)
    expect(amount(container)).toHaveTextContent(/1\.234,56\s€/)
  })

  it('draws no fraction for a currency without minor units', () => {
    const { container } = render(<Amount currency="JPY" locale="ja-JP" value={980} />)
    expect(container.querySelector('[data-slot="amount-fraction"]')).toBeNull()
  })

  it('reads as one label: the drawn parts are hidden from assistive technology', () => {
    const { container } = render(<Amount currency="USD" locale="en-US" value={-42.1} />)
    const drawn = amount(container).firstElementChild
    expect(drawn).toHaveAttribute('aria-hidden', 'true')
    expect(amount(container).lastElementChild).toHaveTextContent(/^-\$42\.10$/)
  })

  it('passes span props through', () => {
    const { container } = render(
      <Amount className="extra" currency="USD" id="balance" locale="en-US" value={1} />
    )
    expect(amount(container)).toHaveClass('a63-Amount', 'extra')
    expect(amount(container)).toHaveAttribute('id', 'balance')
  })
})
