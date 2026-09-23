import { render, renderHook, within } from '@testing-library/react'
import type * as React from 'react'
import { createPortal } from 'react-dom'
import { describe, expect, it, vi } from 'vitest'

import { PortalContainerProvider, usePortalContainer } from './portal-container'

function PortalHarness() {
  const container = usePortalContainer()

  if (container == null) return <span>inline fallback</span>

  return createPortal(<span>overlay content</span>, container)
}

describe('PortalContainer', () => {
  it('returns undefined outside a provider', () => {
    const { result } = renderHook(() => usePortalContainer())
    expect(result.current).toBeUndefined()
  })

  it('exposes the provided container node', () => {
    const node = document.createElement('div')
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PortalContainerProvider container={node}>{children}</PortalContainerProvider>
    )
    const { result } = renderHook(() => usePortalContainer(), { wrapper })
    expect(result.current).toBe(node)
  })

  it('exposes a provided shadow root', () => {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PortalContainerProvider container={shadowRoot}>{children}</PortalContainerProvider>
    )
    const { result } = renderHook(() => usePortalContainer(), { wrapper })
    expect(result.current).toBe(shadowRoot)
  })

  it('preserves an explicitly pending null container', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PortalContainerProvider container={null}>{children}</PortalContainerProvider>
    )
    const { result } = renderHook(() => usePortalContainer(), { wrapper })
    expect(result.current).toBeNull()
  })

  it('uses the nearest nested provider', () => {
    const outer = document.createElement('div')
    const inner = document.createElement('div')
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PortalContainerProvider container={outer}>
        <PortalContainerProvider container={inner}>{children}</PortalContainerProvider>
      </PortalContainerProvider>
    )
    const { result } = renderHook(() => usePortalContainer(), { wrapper })
    expect(result.current).toBe(inner)
  })

  it('updates consumers when the provider value changes', () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    const readContainer = vi.fn()

    function Consumer() {
      readContainer(usePortalContainer())
      return null
    }

    const { rerender } = render(
      <PortalContainerProvider container={first}>
        <Consumer />
      </PortalContainerProvider>
    )

    expect(readContainer).toHaveBeenLastCalledWith(first)

    rerender(
      <PortalContainerProvider container={second}>
        <Consumer />
      </PortalContainerProvider>
    )

    expect(readContainer).toHaveBeenLastCalledWith(second)
  })

  it('supports a consumer creating a portal in the provided node', () => {
    const target = document.createElement('div')
    document.body.append(target)

    const { unmount } = render(
      <PortalContainerProvider container={target}>
        <PortalHarness />
      </PortalContainerProvider>
    )

    expect(within(target).getByText('overlay content')).toBeInTheDocument()
    unmount()
    expect(target).toBeEmptyDOMElement()
    target.remove()
  })

  it('supports a consumer creating a portal in a shadow root', () => {
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    document.body.append(host)

    const { unmount } = render(
      <PortalContainerProvider container={shadowRoot}>
        <PortalHarness />
      </PortalContainerProvider>
    )

    expect(shadowRoot).toHaveTextContent('overlay content')
    unmount()
    expect(shadowRoot.childNodes).toHaveLength(0)
    host.remove()
  })

  it.each([
    ['undefined outside a provider', undefined],
    ['an explicitly null provider value', null],
  ])('lets a portal consumer handle %s', (_label, container) => {
    const content =
      container === null ? (
        <PortalContainerProvider container={null}>
          <PortalHarness />
        </PortalContainerProvider>
      ) : (
        <PortalHarness />
      )

    const { getByText } = render(content)
    expect(getByText('inline fallback')).toBeInTheDocument()
  })

  it('renders its children', () => {
    const { getByText } = render(
      <PortalContainerProvider container={null}>
        <span>portalled</span>
      </PortalContainerProvider>
    )
    expect(getByText('portalled')).toBeInTheDocument()
  })
})
