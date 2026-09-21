import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from './frame'

describe('Frame', () => {
  it('renders the tray with default variant/tray/border + slot', () => {
    const { container } = render(<Frame />)
    const el = container.querySelector('.a63-Frame')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'frame')
    // muted-background preset → tray muted; default border strong.
    expect(el).toHaveAttribute('data-variant', 'muted-background')
    expect(el).toHaveAttribute('data-frame-tray', 'muted')
    expect(el).toHaveAttribute('data-frame-panel', 'background')
    expect(el).toHaveAttribute('data-frame-border', 'strong')
  })

  it('resolves preset panel surface + honours variant/border props', () => {
    const { container } = render(
      <Frame border="subtle" variant="muted-card">
        <FramePanel />
      </Frame>
    )
    const frame = container.querySelector('.a63-Frame')
    expect(frame).toHaveAttribute('data-variant', 'muted-card')
    expect(frame).toHaveAttribute('data-frame-tray', 'muted')
    expect(frame).toHaveAttribute('data-frame-panel', 'card')
    expect(frame).toHaveAttribute('data-frame-border', 'subtle')

    const panel = container.querySelector('[data-slot="frame-panel"]')
    expect(panel).not.toBeNull()
    // muted-card preset → panel surface card; border inherited from Frame.
    expect(panel).toHaveAttribute('data-frame-surface', 'card')
    expect(panel).toHaveAttribute('data-frame-border', 'subtle')
  })

  it('lets a panel override surface + border', () => {
    const { container } = render(
      <Frame>
        <FramePanel border="off" surface="muted" />
      </Frame>
    )
    const panel = container.querySelector('[data-slot="frame-panel"]')
    expect(panel).toHaveAttribute('data-frame-surface', 'muted')
    expect(panel).toHaveAttribute('data-frame-border', 'off')
  })

  it('overrides the tray surface independently of the variant', () => {
    const { container } = render(<Frame tray="card" />)
    expect(container.querySelector('.a63-Frame')).toHaveAttribute('data-frame-tray', 'card')
  })

  it('renders every panel sub-part with its slot', () => {
    const { container } = render(
      <Frame>
        <FrameHeader>
          <FrameTitle>Title</FrameTitle>
          <FrameDescription>Desc</FrameDescription>
        </FrameHeader>
        <FramePanel>Body</FramePanel>
        <FrameFooter>Footer</FrameFooter>
      </Frame>
    )
    expect(container.querySelector('[data-slot="frame-panel-header"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="frame-panel-title"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="frame-panel-description"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="frame-panel-footer"]')).not.toBeNull()
  })
})
