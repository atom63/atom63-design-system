import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { ComparisonProvider, useComparisonContext } from './comparison-context'

describe('useComparisonContext', () => {
  it('returns durationScale 1 outside a provider', () => {
    const { result } = renderHook(() => useComparisonContext())
    expect(result.current.durationScale).toBe(1)
  })

  it('returns the provided durationScale', () => {
    function wrapper({ children }: { children: ReactNode }) {
      return <ComparisonProvider durationScale={3.33}>{children}</ComparisonProvider>
    }
    const { result } = renderHook(() => useComparisonContext(), { wrapper })
    expect(result.current.durationScale).toBe(3.33)
  })
})
