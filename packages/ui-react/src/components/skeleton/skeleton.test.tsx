import { getCrossRendererContract } from '@atom63/ui-foundation'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('renders a div with the skeleton slot + class + passed className', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />)
    const el = container.querySelector('.a63-Skeleton')
    expect(el).not.toBeNull()
    expect(el?.tagName).toBe('DIV')
    expect(el).toHaveAttribute('data-slot', 'skeleton')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).toHaveClass('h-4', 'w-20')
  })

  it('uses the shared shimmer recipe and reduced-motion fallback', () => {
    const contract = getCrossRendererContract('skeleton')

    expect(contract.motion).toEqual({
      kind: 'shimmer',
      durationToken: 'motion-skeleton-shimmer',
      easing: 'linear',
      direction: 'leading-to-trailing',
      reducedMotion: 'static',
    })
  })
})
