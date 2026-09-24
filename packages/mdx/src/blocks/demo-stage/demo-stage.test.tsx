import { render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { DemoConfigPanel } from './demo-config-panel'
import { DemoStage } from './demo-stage'

describe('DemoStage', () => {
  it('renders as a wide framed MDX visual block', () => {
    const { container } = render(<DemoStage>Demo</DemoStage>)

    const root = container.querySelector('.demo-stage')
    expect(root).toHaveAttribute('data-mdx-width', 'wide')
    expect(root).toHaveClass('not-mdx')
    expect(container.querySelector('.mdx-demo-stage-frame')).toHaveClass('mdx-frame')
    expect(container.querySelector('.mdx-demo-stage')).toHaveClass('mdx-frame-panel')
  })

  it('renders optional header chrome', () => {
    const { container, getByText } = render(
      <DemoStage headerEnd={<button type="button">Replay</button>} headerStart="Live demo">
        Demo
      </DemoStage>
    )

    expect(container.querySelector('.mdx-demo-stage-header')).toHaveClass('mdx-frame-header')
    expect(getByText('Live demo')).toBeInTheDocument()
    expect(getByText('Replay')).toBeInTheDocument()
  })

  it('renders shared config panel trigger chrome', () => {
    const stageRef = createRef<HTMLElement>()
    const { getByRole } = render(
      <DemoConfigPanel stageRef={stageRef} title="Demo controls">
        Controls
      </DemoConfigPanel>
    )

    const trigger = getByRole('button', { name: 'Toggle tune controls' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
