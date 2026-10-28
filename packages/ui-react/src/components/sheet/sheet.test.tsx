import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PortalContainerProvider } from '../portal-container'
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

  it('portals into PortalContainerProvider when set', () => {
    const portalHost = document.createElement('div')
    document.body.append(portalHost)

    render(
      <PortalContainerProvider container={portalHost}>
        <Sheet open>
          <SheetContent>
            <SheetTitle>Scoped navigation</SheetTitle>
          </SheetContent>
        </Sheet>
      </PortalContainerProvider>
    )

    expect(portalHost.querySelector('[data-slot="sheet-popup"]')).not.toBeNull()
    portalHost.remove()
  })

  it('prefers an explicit portal container over PortalContainerProvider', () => {
    const contextHost = document.createElement('div')
    const explicitHost = document.createElement('div')
    document.body.append(contextHost, explicitHost)

    render(
      <PortalContainerProvider container={contextHost}>
        <Sheet open>
          <SheetContent portalProps={{ container: explicitHost }}>
            <SheetTitle>Explicit navigation</SheetTitle>
          </SheetContent>
        </Sheet>
      </PortalContainerProvider>
    )

    expect(explicitHost.querySelector('[data-slot="sheet-popup"]')).not.toBeNull()
    expect(contextHost.querySelector('[data-slot="sheet-popup"]')).toBeNull()
    contextHost.remove()
    explicitHost.remove()
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

  it('lets closeProps replace the close icon', () => {
    render(
      <Sheet open>
        <SheetContent closeProps={{ children: <span data-testid="custom-close">×</span> }}>
          <SheetTitle>Navigation</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    const close = document.querySelector('.a63-Sheet-close-button')
    expect(close).not.toBeNull()
    expect(close?.querySelector('[data-testid="custom-close"]')).not.toBeNull()
    expect(close?.querySelector('svg')).toBeNull()
  })
})
