import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LayerStack } from './layer-stack'

const layers = [
  {
    label: 'Primitive',
    title: 'Stable materials',
    metaphor: 'Ingredients',
    description: 'Raw tokens',
    constraint: 'Choose from the pool',
  },
]

describe('LayerStack', () => {
  it('renders English column labels by default', () => {
    render(<LayerStack layers={layers} />)
    expect(screen.getByText('Metaphor')).toBeInTheDocument()
    expect(screen.getByText('System role')).toBeInTheDocument()
    expect(screen.getByText('AI constraint')).toBeInTheDocument()
  })

  it('renders custom labels when provided (locale override)', () => {
    render(
      <LayerStack
        labels={{ metaphor: '隐喻', description: '系统位置', constraint: '对 AI 的约束' }}
        layers={layers}
      />
    )
    expect(screen.getByText('隐喻')).toBeInTheDocument()
    expect(screen.getByText('系统位置')).toBeInTheDocument()
    expect(screen.getByText('对 AI 的约束')).toBeInTheDocument()
    expect(screen.queryByText('Metaphor')).not.toBeInTheDocument()
  })

  it('only renders a column label when its field is present', () => {
    render(<LayerStack layers={[{ label: 'X', title: 'Y', metaphor: 'only metaphor' }]} />)
    expect(screen.getByText('Metaphor')).toBeInTheDocument()
    expect(screen.queryByText('System role')).not.toBeInTheDocument()
  })
})
