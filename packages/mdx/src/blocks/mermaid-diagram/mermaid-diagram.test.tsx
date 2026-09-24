import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MermaidDiagram } from './mermaid-diagram'

const chart = 'graph TD; A-->B;'

vi.mock('../../primitives/use-reduced-motion', () => ({
  useMdxReducedMotion: () => mockReducedMotion,
}))

let mockReducedMotion = false

afterEach(() => {
  mockReducedMotion = false
})

describe('MermaidDiagram', () => {
  it('renders default English labels', () => {
    render(<MermaidDiagram chart={chart} />)
    expect(screen.getByText('Mermaid diagram')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom diagram out')).toBeInTheDocument()
    expect(screen.getByLabelText('Reset diagram zoom')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom diagram in')).toBeInTheDocument()
    expect(screen.getByText('Rendering diagram...')).toBeInTheDocument()
  })

  it('applies a partial labels override while keeping other defaults', () => {
    render(
      <MermaidDiagram chart={chart} labels={{ zoomOut: '缩小', rendering: '正在渲染图表...' }} />
    )
    expect(screen.getByLabelText('缩小')).toBeInTheDocument()
    expect(screen.getByText('正在渲染图表...')).toBeInTheDocument()
    // untouched defaults remain
    expect(screen.getByLabelText('Zoom diagram in')).toBeInTheDocument()
    expect(screen.getByLabelText('Reset diagram zoom')).toBeInTheDocument()
    expect(screen.getByText('Mermaid diagram')).toBeInTheDocument()
  })

  it('accepts the animated prop and renders without throwing in jsdom', () => {
    // jsdom has no getTotalLength; the draw-in guard must skip paths safely.
    expect(() => render(<MermaidDiagram animated chart={chart} />)).not.toThrow()
    expect(screen.getByText('Rendering diagram...')).toBeInTheDocument()
  })

  it('does not attempt path animation under reduced motion', () => {
    mockReducedMotion = true
    expect(() => render(<MermaidDiagram animated chart={chart} />)).not.toThrow()
    expect(screen.getByText('Mermaid diagram')).toBeInTheDocument()
  })

  it('renders the default (non-animated) path unchanged', () => {
    expect(() => render(<MermaidDiagram chart={chart} />)).not.toThrow()
    expect(screen.getByText('Rendering diagram...')).toBeInTheDocument()
  })
})
