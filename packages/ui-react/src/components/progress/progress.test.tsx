import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from './progress'

describe('Progress', () => {
  it('renders the root with the progress slot + class', () => {
    const { container } = render(<Progress value={40} />)
    const el = container.querySelector('.a63-Progress')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'progress')
  })

  it('renders a default track + indicator when given no children', () => {
    const { container } = render(<Progress value={50} />)
    expect(container.querySelector('.a63-Progress-track')).not.toBeNull()
    expect(container.querySelector('.a63-Progress-indicator')).not.toBeNull()
  })

  it('renders composed label/value/track children', () => {
    const { container } = render(
      <Progress value={75}>
        <ProgressLabel>Uploading</ProgressLabel>
        <ProgressValue />
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    )
    expect(container.querySelector('.a63-Progress-label')).toHaveTextContent('Uploading')
    expect(container.querySelector('.a63-Progress-value')).toHaveAttribute(
      'data-slot',
      'progress-value'
    )
    expect(container.querySelector('.a63-Progress-track')).toHaveAttribute(
      'data-slot',
      'progress-track'
    )
  })

  it('marks the track and indicator as indeterminate when value is null', () => {
    const { container } = render(<Progress value={null} />)
    expect(container.querySelector('[data-slot="progress-track"]')).toHaveAttribute(
      'data-indeterminate',
      ''
    )
    expect(container.querySelector('[data-slot="progress-indicator"]')).toHaveAttribute(
      'data-indeterminate',
      ''
    )
  })
})
