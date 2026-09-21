import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LightboxContent } from './content'
import { LightboxAppearanceToggle, LightboxDestination } from './extras'
import { LightboxPortal, LightboxRoot } from './root'
import { LightboxSlide, LightboxSlides, LightboxViewport } from './slides'
import { LightboxThumbnail, LightboxThumbnails } from './thumbnails'
import { LightboxZoomIn, LightboxZoomOut } from './zoom-controls'
import type { MediaLightboxItem } from '../types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

describe('Lightbox.Thumbnails registration', () => {
  it('makes the active Slide a tabpanel labelled by its thumbnail', () => {
    render(
      <LightboxRoot index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
        <LightboxPortal>
          <LightboxContent>
            <LightboxViewport>
              <LightboxSlides>
                {slide => (
                  <LightboxSlide key={slide.item.id}>
                    <span>{slide.item.title}</span>
                  </LightboxSlide>
                )}
              </LightboxSlides>
            </LightboxViewport>
            <LightboxThumbnails />
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )

    const activeSlide = document.querySelector('[data-slot="media-lightbox-slide"][data-active]')
    expect(activeSlide).toHaveAttribute('role', 'tabpanel')
    expect(activeSlide).toHaveAttribute('aria-labelledby', 'a63-media-lightbox-thumb-one')
  })

  it('renders a default LightboxThumbnail per item, tabbable only when active', () => {
    render(
      <LightboxRoot index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
        <LightboxPortal>
          <LightboxContent>
            <LightboxThumbnails />
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[0]).toHaveAttribute('tabindex', '0')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[1]).toHaveAttribute('tabindex', '-1')
  })

  it('lets the caller customize the tab via the children render prop', () => {
    render(
      <LightboxRoot index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
        <LightboxPortal>
          <LightboxContent>
            <LightboxThumbnails>
              {thumbnail => (
                <LightboxThumbnail aria-label={thumbnail.item.title} key={thumbnail.item.id}>
                  {thumbnail.item.title}
                </LightboxThumbnail>
              )}
            </LightboxThumbnails>
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )

    expect(screen.getByRole('tab', { name: 'One' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Two' })).toBeInTheDocument()
  })
})

describe('Lightbox.ZoomOut', () => {
  it('is disabled while the media is not zoomed', () => {
    render(
      <LightboxRoot index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
        <LightboxPortal>
          <LightboxContent>
            <LightboxZoomIn />
            <LightboxZoomOut />
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )

    const zoomOut = screen.getByRole('button', { name: 'Zoom out of One' })
    expect(zoomOut).toBeDisabled()
    expect(zoomOut).toHaveAttribute('data-disabled')
    expect(screen.getByRole('button', { name: 'Zoom into One' })).not.toBeDisabled()
  })
})

describe('Lightbox.AppearanceToggle', () => {
  function renderToggle(item: MediaLightboxItem, onAppearanceChange = vi.fn()) {
    render(
      <LightboxRoot
        index={0}
        items={[item]}
        onAppearanceChange={onAppearanceChange}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      >
        <LightboxPortal>
          <LightboxContent>
            <LightboxAppearanceToggle />
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )
    return { onAppearanceChange }
  }

  it('renders nothing when the item has no light/dark variants', () => {
    renderToggle({ alt: 'One', id: 'one', src: '/one.webp', title: 'One' })
    expect(screen.queryByRole('button', { name: /version of One/ })).toBeNull()
  })

  it('renders nothing when the item has only a light variant', () => {
    renderToggle({ alt: 'One', id: 'one', lightSrc: '/one-light.webp', title: 'One' })
    expect(screen.queryByRole('button', { name: /version of One/ })).toBeNull()
  })

  it('renders nothing when the item has only a dark variant', () => {
    renderToggle({ alt: 'One', darkSrc: '/one-dark.webp', id: 'one', title: 'One' })
    expect(screen.queryByRole('button', { name: /version of One/ })).toBeNull()
  })

  it('renders nothing when onAppearanceChange is not wired', () => {
    render(
      <LightboxRoot
        index={0}
        items={[
          {
            alt: 'One',
            darkSrc: '/one-dark.webp',
            id: 'one',
            lightSrc: '/one-light.webp',
            title: 'One',
          },
        ]}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      >
        <LightboxPortal>
          <LightboxContent>
            <LightboxAppearanceToggle />
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )
    expect(screen.queryByRole('button', { name: /version of One/ })).toBeNull()
  })

  it('renders and toggles when both variants and the callback are present', async () => {
    const { onAppearanceChange } = renderToggle({
      alt: 'One',
      darkSrc: '/one-dark.webp',
      id: 'one',
      lightSrc: '/one-light.webp',
      title: 'One',
    })
    const toggle = screen.getByRole('button', { name: 'Show light version of One' })
    await userEvent.click(toggle)
    expect(onAppearanceChange).toHaveBeenCalledWith('one', 'light')
  })
})

describe('Lightbox.Destination', () => {
  it('renders nothing when the item has no href', () => {
    render(
      <LightboxRoot
        index={0}
        items={[{ alt: 'One', id: 'one', src: '/one.webp', title: 'One' }]}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      >
        <LightboxPortal>
          <LightboxContent>
            <LightboxDestination />
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders a link to the item destination when href is present', () => {
    render(
      <LightboxRoot
        index={0}
        items={[
          { alt: 'One', href: 'https://example.com', id: 'one', src: '/one.webp', title: 'One' },
        ]}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      >
        <LightboxPortal>
          <LightboxContent>
            <LightboxDestination />
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )
    const link = screen.getByRole('link', { name: 'Open One (opens in new tab)' })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })
})
