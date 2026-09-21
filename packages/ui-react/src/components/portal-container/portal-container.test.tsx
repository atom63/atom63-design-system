import { render, renderHook } from '@testing-library/react'
import type * as React from 'react'
import { describe, expect, it } from 'vitest'

import { PortalContainerProvider, usePortalContainer } from './portal-container'

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

  it('renders its children', () => {
    const { getByText } = render(
      <PortalContainerProvider container={null}>
        <span>portalled</span>
      </PortalContainerProvider>
    )
    expect(getByText('portalled')).toBeInTheDocument()
  })
})
