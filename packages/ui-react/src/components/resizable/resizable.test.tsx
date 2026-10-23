import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable'

describe('Resizable', () => {
  it('renders a horizontal group with two panels and a handle', () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>left</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>right</ResizablePanel>
      </ResizablePanelGroup>
    )

    const group = container.querySelector('[data-slot="resizable-panel-group"]')
    expect(group).not.toBeNull()
    expect(group).toHaveClass('a63-Resizable-group')
    expect(group).toHaveAttribute('data-panel-group-direction', 'horizontal')

    expect(container.querySelectorAll('[data-slot="resizable-panel"]').length).toBe(2)

    const handle = container.querySelector('[data-slot="resizable-handle"]')
    expect(handle).not.toBeNull()
    expect(handle).toHaveClass('a63-Resizable-handle')
    expect(handle).toHaveAttribute('aria-label', 'Resize panels')
  })

  it('allows a specific accessible label for a handle', () => {
    const { container } = render(
      <ResizablePanelGroup>
        <ResizablePanel>sidebar</ResizablePanel>
        <ResizableHandle aria-label="Resize sidebar" />
        <ResizablePanel>content</ResizablePanel>
      </ResizablePanelGroup>
    )

    expect(container.querySelector('[data-slot="resizable-handle"]')).toHaveAttribute(
      'aria-label',
      'Resize sidebar'
    )
  })

  it('renders the grip only when withHandle is set', () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>a</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>b</ResizablePanel>
      </ResizablePanelGroup>
    )
    expect(container.querySelector('[data-slot="resizable-handle-grip"]')).not.toBeNull()
  })

  it('draws the contract variants: line by default, grip with variant="grip"', () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>a</ResizablePanel>
        <ResizableHandle aria-label="Line" />
        <ResizablePanel>b</ResizablePanel>
        <ResizableHandle aria-label="Grip" variant="grip" />
        <ResizablePanel>c</ResizablePanel>
      </ResizablePanelGroup>
    )
    const [line, grip] = container.querySelectorAll('[data-slot="resizable-handle"]')
    expect(line).toHaveAttribute('data-variant', 'line')
    expect(line?.querySelector('[data-slot="resizable-handle-grip"]')).toBeNull()
    expect(grip).toHaveAttribute('data-variant', 'grip')
    expect(grip?.querySelector('[data-slot="resizable-handle-grip"]')).not.toBeNull()
  })

  it('carries orientation onto the handle for vertical groups', () => {
    const { container } = render(
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel>top</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>bottom</ResizablePanel>
      </ResizablePanelGroup>
    )
    expect(container.querySelector('[data-slot="resizable-handle"]')).toHaveAttribute(
      'data-panel-group-direction',
      'vertical'
    )
  })
})
