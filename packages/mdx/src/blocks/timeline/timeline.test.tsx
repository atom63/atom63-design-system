import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Timeline } from './timeline'

describe('Timeline', () => {
  it('renders each item date, title, and content', () => {
    render(
      <Timeline>
        <Timeline.Item date="2021" title="Founded">
          The company started.
        </Timeline.Item>
        <Timeline.Item date="2023" title="Launched">
          Shipped v1.
        </Timeline.Item>
      </Timeline>
    )
    expect(screen.getByText('2021')).toBeInTheDocument()
    expect(screen.getByText('Founded')).toBeInTheDocument()
    expect(screen.getByText('The company started.')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('Launched')).toBeInTheDocument()
    expect(screen.getByText('Shipped v1.')).toBeInTheDocument()
  })

  it('renders a dot marker per item', () => {
    render(
      <Timeline>
        <Timeline.Item date="A" title="One">
          x
        </Timeline.Item>
        <Timeline.Item date="B" title="Two">
          y
        </Timeline.Item>
        <Timeline.Item date="C" title="Three">
          z
        </Timeline.Item>
      </Timeline>
    )
    expect(screen.getAllByTestId('timeline-item-dot')).toHaveLength(3)
  })

  it('renders as a list for accessibility', () => {
    const { container } = render(
      <Timeline>
        <Timeline.Item date="A" title="One">
          x
        </Timeline.Item>
      </Timeline>
    )
    const ol = container.querySelector('ol')
    expect(ol).not.toBeNull()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('applies the mdx block classes on the root', () => {
    const { container } = render(
      <Timeline>
        <Timeline.Item date="A" title="One">
          x
        </Timeline.Item>
      </Timeline>
    )
    const root = container.querySelector('.mdx-block')
    expect(root).not.toBeNull()
    expect(root).toHaveClass('not-mdx')
  })
})
