import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  LightboxCaption,
  LightboxClose,
  LightboxCounter,
  LightboxNext,
  LightboxPrevious,
} from './chrome'
import { LightboxContent } from './content'
import { LightboxPortal, LightboxRoot } from './root'
import type { MediaLightboxItem } from '../types'

const items: MediaLightboxItem[] = [
  { alt: 'One', caption: 'First light', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function renderChrome(index: number, onIndexChange = vi.fn(), onOpenChange = vi.fn()) {
  render(
    <LightboxRoot
      index={index}
      items={items}
      onIndexChange={onIndexChange}
      onOpenChange={onOpenChange}
      open
    >
      <LightboxPortal>
        <LightboxContent>
          <LightboxClose />
          <LightboxPrevious />
          <LightboxNext />
          <LightboxCounter />
          <LightboxCaption />
        </LightboxContent>
      </LightboxPortal>
    </LightboxRoot>
  )
  return { onIndexChange, onOpenChange }
}

describe('lightbox chrome parts', () => {
  it('closes from the close button', async () => {
    const { onOpenChange } = renderChrome(0)
    await userEvent.click(screen.getByRole('button', { name: 'Close media viewer' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('turns the page from previous and next', async () => {
    const { onIndexChange } = renderChrome(0)
    await userEvent.click(screen.getByRole('button', { name: 'Next media' }))
    expect(onIndexChange).toHaveBeenCalledWith(1)
  })

  it('disables previous on the first item', () => {
    renderChrome(0)
    expect(screen.getByRole('button', { name: 'Previous media' })).toBeDisabled()
  })

  it('disables next on the last item, so the gallery cannot wrap', () => {
    renderChrome(1)
    expect(screen.getByRole('button', { name: 'Next media' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next media' })).toHaveAttribute('data-disabled', '')
  })

  it('shows the position and the active caption', () => {
    renderChrome(0)
    expect(document.querySelector('[data-slot="media-lightbox-counter"]')?.textContent).toBe(
      '1 of 2'
    )
    expect(document.querySelector('[data-slot="media-lightbox-caption"]')?.textContent).toBe(
      'First light'
    )
  })

  it('renders no caption element when the item has none', () => {
    renderChrome(1)
    expect(document.querySelector('[data-slot="media-lightbox-caption"]')).toBeNull()
  })

  it('lets the caller re-shape the counter', () => {
    render(
      <LightboxRoot index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
        <LightboxPortal>
          <LightboxContent>
            <LightboxCounter>{(current, total) => `${current}／${total}`}</LightboxCounter>
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )
    expect(document.querySelector('[data-slot="media-lightbox-counter"]')?.textContent).toBe('1／2')
  })
})
