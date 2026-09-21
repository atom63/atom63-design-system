import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Lightbox } from './index'
import type { MediaLightboxItem } from '../types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

describe('lightbox composition', () => {
  it('keeps the default accessible name when a consumer only replaces the visible chrome', async () => {
    const onOpenChange = vi.fn()

    render(
      <Lightbox.Root
        index={0}
        items={items}
        onIndexChange={vi.fn()}
        onOpenChange={onOpenChange}
        open
      >
        <Lightbox.Portal>
          <Lightbox.Content>
            <Lightbox.Viewport>
              <Lightbox.Slides>
                {slide => (
                  <Lightbox.Slide key={slide.item.id}>
                    <Lightbox.Frame>
                      <Lightbox.Zoom>
                        <Lightbox.Media />
                      </Lightbox.Zoom>
                    </Lightbox.Frame>
                  </Lightbox.Slide>
                )}
              </Lightbox.Slides>
            </Lightbox.Viewport>
            <Lightbox.Close
              render={
                <button className="my-own-close" type="button">
                  收起
                </button>
              }
            />
          </Lightbox.Content>
        </Lightbox.Portal>
      </Lightbox.Root>
    )

    const close = screen.getByRole('button', { name: 'Close media viewer' })

    expect(close).toHaveClass('my-own-close')
    expect(close).toHaveTextContent('收起')

    await userEvent.click(close)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('lets a consumer override the accessible name on a custom rendered control', async () => {
    const onOpenChange = vi.fn()

    render(
      <Lightbox.Root
        index={0}
        items={items}
        onIndexChange={vi.fn()}
        onOpenChange={onOpenChange}
        open
      >
        <Lightbox.Portal>
          <Lightbox.Content>
            <Lightbox.Close
              render={
                <button aria-label="收起" className="my-own-close" type="button">
                  收起
                </button>
              }
            />
          </Lightbox.Content>
        </Lightbox.Portal>
      </Lightbox.Root>
    )

    const close = screen.getByRole('button', { name: '收起' })

    expect(close).toHaveTextContent('收起')
    expect(screen.queryByRole('button', { name: 'Close media viewer' })).toBeNull()

    await userEvent.click(close)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('applies Root label overrides to chrome parts', () => {
    render(
      <Lightbox.Root
        index={0}
        items={items}
        labels={{ close: '收起媒体查看器' }}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      >
        <Lightbox.Portal>
          <Lightbox.Content>
            <Lightbox.Close />
          </Lightbox.Content>
        </Lightbox.Portal>
      </Lightbox.Root>
    )

    expect(screen.getByRole('button', { name: '收起媒体查看器' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close media viewer' })).toBeNull()
  })

  it('degrades silently when Slides are left out', () => {
    expect(() =>
      render(
        <Lightbox.Root index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
          <Lightbox.Portal>
            <Lightbox.Content>
              <Lightbox.Caption />
            </Lightbox.Content>
          </Lightbox.Portal>
        </Lightbox.Root>
      )
    ).not.toThrow()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Media' })).toBeNull()
  })

  it('degrades silently when Zoom is left out', async () => {
    render(
      <Lightbox.Root index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
        <Lightbox.Portal>
          <Lightbox.Content>
            <Lightbox.Viewport>
              <Lightbox.Slides>
                {slide => (
                  <Lightbox.Slide key={slide.item.id}>
                    <Lightbox.Frame>
                      <Lightbox.Media />
                    </Lightbox.Frame>
                  </Lightbox.Slide>
                )}
              </Lightbox.Slides>
            </Lightbox.Viewport>
          </Lightbox.Content>
        </Lightbox.Portal>
      </Lightbox.Root>
    )

    const dialog = screen.getByRole('dialog')
    const image = screen.getByRole('img', { name: 'One' })

    expect(dialog).toBeInTheDocument()
    expect(image).toBeInTheDocument()
    expect(dialog).toHaveAttribute('data-zoomed', 'false')

    await userEvent.dblClick(image)

    expect(dialog).toHaveAttribute('data-zoomed', 'false')
    expect(document.querySelector('[data-slot="media-lightbox-zoom"]')).toBeNull()
  })

  it('tells a developer who forgot Root', () => {
    expect(() => render(<Lightbox.Close />)).toThrow(/Lightbox\.Root/)
  })
})
