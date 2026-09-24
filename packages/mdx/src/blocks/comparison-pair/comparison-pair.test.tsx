import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ComparisonPair } from './comparison-pair'

describe('ComparisonPair', () => {
  it('renders the default "Slow motion" label when speedControl is enabled', () => {
    render(
      <ComparisonPair speedControl>
        <ComparisonPair.Before>before</ComparisonPair.Before>
        <ComparisonPair.After>after</ComparisonPair.After>
      </ComparisonPair>
    )
    expect(screen.getByText('Slow motion')).toBeInTheDocument()
  })

  it('renders a custom slow-motion label when provided (locale override)', () => {
    render(
      <ComparisonPair slowMotionLabel="慢动作" speedControl>
        <ComparisonPair.Before>before</ComparisonPair.Before>
        <ComparisonPair.After>after</ComparisonPair.After>
      </ComparisonPair>
    )
    expect(screen.getByText('慢动作')).toBeInTheDocument()
    expect(screen.queryByText('Slow motion')).not.toBeInTheDocument()
  })
})
