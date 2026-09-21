import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet'

describe('Sheet', () => {
  it('renders the popup + title with the default side when open', () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )

    const popup = document.querySelector('[data-slot="sheet-popup"]')
    expect(popup).not.toBeNull()
    expect(popup).toHaveAttribute('data-side', 'right')
    expect(popup).toHaveClass('a63-Sheet-popup')

    const title = document.querySelector('[data-slot="sheet-title"]')
    expect(title).not.toBeNull()
    expect(title).toHaveTextContent('Navigation')
  })

  it('reflects the given side (SheetContent alias === SheetPopup)', () => {
    render(
      <Sheet open>
        <SheetContent side="left">
          <SheetTitle>Menu</SheetTitle>
        </SheetContent>
      </Sheet>
    )

    expect(document.querySelector('[data-slot="sheet-popup"]')).toHaveAttribute('data-side', 'left')
    expect(document.querySelector('[data-slot="sheet-viewport"]')).toHaveAttribute(
      'data-side',
      'left'
    )
  })

  it('tracks controlled open state on the body and cleans up on unmount', () => {
    const view = render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Menu</SheetTitle>
        </SheetContent>
      </Sheet>
    )

    expect(document.body).toHaveAttribute('data-sheet-open')
    view.unmount()
    expect(document.body).not.toHaveAttribute('data-sheet-open')
  })
})
