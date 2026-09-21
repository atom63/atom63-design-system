import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLightboxConfig, useLightboxState } from './context'
import { LightboxPortal, LightboxRoot } from './root'

function Probe() {
  const config = useLightboxConfig()
  const state = useLightboxState()
  return (
    <span data-testid="probe">{`${config.items.length}/${state.index}/${config.labels.close}`}</span>
  )
}

describe('Lightbox.Root', () => {
  it('renders no DOM of its own, only context', () => {
    const { container } = render(
      <LightboxRoot
        index={1}
        items={[{ alt: 'a', id: 'a', src: '/a.webp', title: 'A' }]}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      >
        <Probe />
      </LightboxRoot>
    )

    expect(container.firstChild).toBe(screen.getByTestId('probe'))
    expect(screen.getByTestId('probe').textContent).toBe('1/1/Close media viewer')
  })

  it('portals its children out of the render tree', () => {
    const { container } = render(
      <LightboxRoot
        index={0}
        items={[{ alt: 'a', id: 'a', src: '/a.webp', title: 'A' }]}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      >
        <LightboxPortal>
          <span data-testid="portalled" />
        </LightboxPortal>
      </LightboxRoot>
    )

    expect(container.querySelector('[data-testid="portalled"]')).toBeNull()
    expect(document.body.querySelector('[data-testid="portalled"]')).not.toBeNull()
  })

  it('renders nothing at all while closed', () => {
    const { container } = render(
      <LightboxRoot
        index={0}
        items={[{ alt: 'a', id: 'a', src: '/a.webp', title: 'A' }]}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open={false}
      >
        <LightboxPortal>
          <span data-testid="portalled" />
        </LightboxPortal>
      </LightboxRoot>
    )

    expect(container.firstChild).toBeNull()
    expect(document.body.querySelector('[data-testid="portalled"]')).toBeNull()
  })
})
