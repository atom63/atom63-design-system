import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FigureBlock } from './figure-block'

describe('FigureBlock', () => {
  it('renders the image and a plain string caption (back-compat)', () => {
    render(
      <FigureBlock alt="a chart" caption="Figure 1 — revenue" enableLightbox={false} src="/x.png" />
    )
    expect(screen.getByRole('img', { name: 'a chart' })).toBeInTheDocument()
    expect(screen.getByText('Figure 1 — revenue')).toBeInTheDocument()
  })

  it('renders a rich caption slot', () => {
    render(
      <FigureBlock alt="a chart" enableLightbox={false} src="/x.png">
        <FigureBlock.Caption>
          see <a href="/src">the source</a>
        </FigureBlock.Caption>
      </FigureBlock>
    )
    expect(screen.getByRole('link', { name: 'the source' })).toBeInTheDocument()
  })

  it('renders an aside slot', () => {
    render(
      <FigureBlock alt="a chart" enableLightbox={false} src="/x.png">
        <FigureBlock.Aside>Data: 2026 Q1</FigureBlock.Aside>
      </FigureBlock>
    )
    expect(screen.getByText('Data: 2026 Q1')).toBeInTheDocument()
  })
})
