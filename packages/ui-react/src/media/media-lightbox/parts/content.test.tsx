import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LightboxBackdrop, LightboxContent, LightboxStatus } from './content'
import { LightboxPortal, LightboxRoot } from './root'
import type { MediaLightboxItem } from '../types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function renderContent(onOpenChange = vi.fn()) {
  render(
    <LightboxRoot index={0} items={items} onIndexChange={vi.fn()} onOpenChange={onOpenChange} open>
      <LightboxPortal>
        <LightboxBackdrop />
        <LightboxContent>
          <LightboxStatus />
          <button type="button">inside</button>
        </LightboxContent>
      </LightboxPortal>
    </LightboxRoot>
  )
  return { onOpenChange }
}

describe('Lightbox.Content', () => {
  it('is a modal dialog named after the active item and its position', () => {
    renderContent()
    const dialog = screen.getByRole('dialog', { name: 'One — 1 of 2' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('data-slot', 'media-lightbox')
  })

  it('closes on Escape', async () => {
    const { onOpenChange } = renderContent()
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('announces the active item politely for screen readers', () => {
    renderContent()
    const status = document.querySelector('[data-slot="media-lightbox-status"]')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status?.textContent).toBe('One, 1 of 2')
  })

  it('closes when the backdrop is pressed', async () => {
    const { onOpenChange } = renderContent()
    const backdrop = document.querySelector('[data-slot="media-lightbox-backdrop"]')
    if (!backdrop) {
      throw new Error('backdrop missing')
    }
    await userEvent.click(backdrop)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
