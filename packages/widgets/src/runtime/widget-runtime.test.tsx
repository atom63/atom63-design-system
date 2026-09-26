import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { declarations, readStylesheet } from '../test/css'
import { WidgetContentFallback } from './widget-content-fallback'
import { WidgetHostContentTransition } from './widget-host-content-transition'
import { WidgetHostErrorFallback } from './widget-host-error-fallback'
import { WidgetHostedShell } from './widget-hosted-shell'
import { WidgetHostLoadingShell } from './widget-host-loading-shell'
import { WidgetHostOptionalHeader } from './widget-host-optional-header'
import { WidgetHostTitleTransition } from './widget-host-title-transition'
import {
  getWidgetHostCrossfadeMotion,
  getWidgetHostSlideFadeMotion,
} from './widget-host-transition-config'

describe('widget runtime loading UI', () => {
  it('renders a card shell with a centered spinner during module load', () => {
    render(<WidgetHostLoadingShell size="large" />)
    expect(document.querySelector('[data-slot="widget-host-loading-shell"]')).toBeTruthy()
    expect(document.querySelector('[data-slot="widget-content-fallback"]')).toBeTruthy()
    expect(screen.queryByText('Weather')).not.toBeInTheDocument()
  })

  it('renders spinner-only content fallback for in-shell data loading', () => {
    render(<WidgetContentFallback />)
    expect(document.querySelector('[data-slot="widget-content-fallback"]')).toBeTruthy()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('crossfades hosted content without remounting the outer slot', () => {
    const { rerender } = render(
      <WidgetHostContentTransition contentKey="small">
        <div>Small body</div>
      </WidgetHostContentTransition>
    )
    expect(screen.getByText('Small body')).toBeInTheDocument()
    rerender(
      <WidgetHostContentTransition contentKey="large">
        <div>Large body</div>
      </WidgetHostContentTransition>
    )
    expect(screen.getByText('Large body')).toBeInTheDocument()
  })

  it('renders widget card chrome for runtime error fallback', () => {
    render(
      <WidgetHostErrorFallback message="Chunk failed" onRetry={() => undefined} size="large" />
    )
    expect(document.querySelector('[data-slot="widget-host-error-fallback"]')).toBeTruthy()
    expect(document.querySelector('[data-slot="widget-card"]')).toBeTruthy()
    expect(screen.getByText('Widget failed to load')).toBeInTheDocument()
    expect(screen.getByText('Chunk failed')).toBeInTheDocument()
  })

  it('crossfades widget titles without remounting the header row', () => {
    const { rerender } = render(
      <WidgetHostTitleTransition contentKey="short">
        <span>Listening</span>
      </WidgetHostTitleTransition>
    )
    expect(screen.getByText('Listening')).toBeInTheDocument()
    rerender(
      <WidgetHostTitleTransition contentKey="recent">
        <span>Recent Listening</span>
      </WidgetHostTitleTransition>
    )
    expect(screen.getByText('Recent Listening')).toBeInTheDocument()
  })

  it('renders optional header slot when a hosted size includes the title row', () => {
    render(
      <WidgetHostOptionalHeader visible>
        <div>Profile header</div>
      </WidgetHostOptionalHeader>
    )
    expect(screen.getByText('Profile header')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="widget-host-optional-header"]')).toBeTruthy()
  })

  it('stacks crossfading layers without doubling layout padding', () => {
    render(
      <WidgetHostContentTransition className="custom-slot" contentKey="medium">
        <div data-testid="widget-body">Body</div>
      </WidgetHostContentTransition>
    )

    const slot = document.querySelector('[data-slot="widget-host-content-transition"]')
    expect(slot).toHaveClass('a63-WidgetHostContentTransition', 'custom-slot')
    expect(declarations('.a63-WidgetHostContentTransition')).toMatchObject({
      position: 'relative',
      flex: '1 1 0%',
      overflow: 'hidden',
    })
    const layer = slot?.querySelector('[data-testid="widget-body"]')?.parentElement
    expect(layer).toHaveClass('a63-WidgetHostContentTransition-layer')
    expect(declarations('.a63-WidgetHostContentTransition-layer')).toMatchObject({
      position: 'absolute',
      'min-inline-size': '0',
    })
  })

  it('uses blur fade phases for hosted content crossfade', () => {
    expect(getWidgetHostCrossfadeMotion('enter', false)).toEqual({
      filter: 'blur(6px)',
      opacity: 0,
    })
    // `none`, not `blur(0px)`: a resting filter establishes a backdrop root
    // and would neutralise `backdrop-filter` inside the widget.
    expect(getWidgetHostCrossfadeMotion('active', false)).toEqual({
      filter: 'none',
      opacity: 1,
    })
    expect(getWidgetHostCrossfadeMotion('active', true)).toEqual({
      filter: 'none',
      opacity: 1,
    })
  })

  it('uses opacity-only phases for locked title copy', () => {
    expect(getWidgetHostSlideFadeMotion('enter', false)).toEqual({
      opacity: 0,
    })
    expect(getWidgetHostSlideFadeMotion('active', false)).toEqual({
      opacity: 1,
    })
    expect(getWidgetHostSlideFadeMotion('exit', false)).toEqual({
      opacity: 0,
    })
  })

  it('pins slide title layers inside the reserved box', () => {
    render(
      <WidgetHostTitleTransition contentKey="akira" variant="slide">
        <span>Akira</span>
      </WidgetHostTitleTransition>
    )
    const layer = screen.getByText('Akira').parentElement
    expect(layer).toHaveClass('a63-WidgetHostTitleTransition-layer')
    expect(layer?.parentElement).toHaveAttribute('data-variant', 'slide')
    expect(
      declarations(
        ".a63-WidgetHostTitleTransition[data-variant='slide'] > .a63-WidgetHostTitleTransition-layer"
      )
    ).toMatchObject({ position: 'absolute', inset: '0' })
  })

  it('has no axe violations in the loading and error shells', async () => {
    const { container } = render(
      <div>
        <WidgetHostLoadingShell size="small" />
        <WidgetHostErrorFallback message="Chunk failed" onRetry={() => undefined} size="medium" />
      </div>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('WidgetHostedShell layout contract', () => {
  /**
   * `data-slot="widget-card"` lands on the rim SHELL (it rides `...rest`), while
   * `className` is partitioned onto the FACE — so layout classes are asserted on
   * the shell's first child, not the slot itself.
   */
  const face = (container: HTMLElement) =>
    container.querySelector('[data-slot="widget-card"]')?.firstElementChild?.className ?? ''

  it('anchors a headered widget top and bottom, so the slack sits between', () => {
    // A widget with a header reads as two bands: title at the top, content
    // settling against the bottom. Without this the slack pools UNDER the
    // content, which reads as a broken bottom padding.
    const { container } = render(
      <WidgetHostedShell contentKey="x" header={<div>Title</div>} size="medium">
        <div>Body</div>
      </WidgetHostedShell>
    )
    expect(face(container)).toContain('a63-WidgetHostedShell-anchored')
    expect(declarations('.a63-WidgetHostedShell-anchored')['justify-content']).toBe('space-between')
  })

  it('leaves a headerless widget alone', () => {
    // Nothing to anchor against — the body owns the whole box.
    const { container } = render(
      <WidgetHostedShell contentKey="x" size="medium">
        <div>Body</div>
      </WidgetHostedShell>
    )
    expect(face(container)).not.toContain('a63-WidgetHostedShell-anchored')
  })

  it('lets a widget opt out through className', () => {
    // The anchor lives in the stylesheet's `components` layer, so a consumer
    // utility (Tailwind's `utilities` layer) outranks it in the cascade.
    const { container } = render(
      <WidgetHostedShell
        className="justify-start"
        contentKey="x"
        header={<div>T</div>}
        size="medium"
      >
        <div>Body</div>
      </WidgetHostedShell>
    )
    expect(face(container)).toContain('justify-start')
    expect(readStylesheet('styles.css')).toContain(
      "@import './primitives/widget-card.css' layer(components);"
    )
  })

  it('fills the host box from the outer shell and keeps a consumer style', () => {
    const { container } = render(
      <WidgetHostedShell contentKey="x" size="medium" style={{ opacity: 0.5 }}>
        <div>Body</div>
      </WidgetHostedShell>
    )
    expect(container.querySelector('[data-slot="widget-card"]')).toHaveStyle({
      blockSize: '100%',
      inlineSize: '100%',
      opacity: '0.5',
    })
  })
})
