import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { createMemoryDismissalStore } from '../core/persistence'
import type { DismissalStore } from '../core/persistence'
import { defineInformRegistry } from '../core/registry'
import type { InformContext } from '../core/types'
import { InformOutlet } from './inform-outlet'
import { InformProvider } from './inform-provider'

const context: InformContext = {
  pathname: '/',
  locale: 'en',
  now: new Date('2026-06-01T00:00:00Z'),
}

const registry = defineInformRegistry([
  {
    id: 'site-notice',
    surface: 'banner',
    severity: 'info',
    priority: 0,
    dismiss: 'persistent',
    content: { body: 'Design system work in progress.' },
  },
  {
    id: 'tip',
    surface: 'corner-flyout',
    severity: 'info',
    priority: 0,
    dismiss: 'session',
    content: { body: 'A tip.' },
  },
])

function renderRuntime(
  dismissals: DismissalStore = createMemoryDismissalStore()
): ReturnType<typeof render> {
  return render(
    <InformProvider context={context} dismissals={dismissals} registry={registry}>
      <InformOutlet />
    </InformProvider>
  )
}

describe('inform runtime', () => {
  it('renders the resolved banner after hydration', async () => {
    renderRuntime()

    expect(await screen.findByText('Design system work in progress.')).toBeInTheDocument()
  })

  it('renders the resolved flyout alongside the banner', async () => {
    renderRuntime()

    expect(await screen.findByText('A tip.')).toBeInTheDocument()
  })

  it('removes a message once dismissed and records it', async () => {
    const dismissals = createMemoryDismissalStore()
    renderRuntime(dismissals)

    await screen.findByText('A tip.')
    const [firstDismiss] = screen.getAllByRole('button', { name: 'Dismiss' })
    await userEvent.click(firstDismiss as HTMLElement)

    await waitFor(() => {
      expect(Object.keys(dismissals.read()).length).toBeGreaterThan(0)
    })
  })

  it('never renders a message that was already dismissed', async () => {
    renderRuntime(createMemoryDismissalStore({ 'site-notice:1': 1, 'tip:1': 1 }))

    await waitFor(() => {
      expect(screen.queryByText('Design system work in progress.')).not.toBeInTheDocument()
    })
    expect(screen.queryByText('A tip.')).not.toBeInTheDocument()
  })

  it('resolves function-valued content against the supplied context', async () => {
    const dynamic = defineInformRegistry([
      {
        id: 'localized',
        surface: 'banner',
        severity: 'info',
        priority: 0,
        dismiss: 'none',
        content: ctx => ({ body: `Locale is ${ctx.locale}.` }),
      },
    ])

    render(
      <InformProvider
        context={context}
        dismissals={createMemoryDismissalStore()}
        registry={dynamic}
      >
        <InformOutlet />
      </InformProvider>
    )

    expect(await screen.findByText('Locale is en.')).toBeInTheDocument()
  })

  it('throws a useful error when used outside a provider', () => {
    expect(() => render(<InformOutlet />)).toThrow(/InformProvider/)
  })

  /*
   * The documented no-flash guarantee: dismissal state is read after mount, so
   * the first paint must be empty. renderToStaticMarkup never runs effects, so
   * it sees exactly what the visitor's first frame would show. If the provider
   * ever hydrates during render, a dismissed message appears for one frame and
   * is then yanked away — this test is what stops that regressing.
   */
  it('renders nothing on the first paint, before effects run', () => {
    const markup = renderToStaticMarkup(
      <InformProvider
        context={context}
        dismissals={createMemoryDismissalStore()}
        registry={registry}
      >
        <InformOutlet />
      </InformProvider>
    )

    expect(markup).not.toContain('Design system work in progress.')
    expect(markup).not.toContain('A tip.')
  })

  it('renders only the surfaces it is asked for', async () => {
    render(
      <InformProvider
        context={context}
        dismissals={createMemoryDismissalStore()}
        registry={registry}
      >
        <InformOutlet surfaces={['banner']} />
      </InformProvider>
    )

    expect(await screen.findByText('Design system work in progress.')).toBeInTheDocument()
    expect(screen.queryByText('A tip.')).not.toBeInTheDocument()
  })

  it('lets two outlets split the surfaces between them', async () => {
    render(
      <InformProvider
        context={context}
        dismissals={createMemoryDismissalStore()}
        registry={registry}
      >
        <InformOutlet surfaces={['banner']} />
        <InformOutlet surfaces={['corner-flyout']} />
      </InformProvider>
    )

    expect(await screen.findByText('Design system work in progress.')).toBeInTheDocument()
    expect(await screen.findByText('A tip.')).toBeInTheDocument()
  })

  it('falls back to the provider context when none is passed', async () => {
    const dynamic = defineInformRegistry([
      {
        id: 'localized',
        surface: 'banner',
        severity: 'info',
        priority: 0,
        dismiss: 'none',
        content: ctx => ({ body: `Path is ${ctx.pathname}.` }),
      },
    ])

    render(
      <InformProvider
        context={{ ...context, pathname: '/work' }}
        dismissals={createMemoryDismissalStore()}
        registry={dynamic}
      >
        <InformOutlet />
      </InformProvider>
    )

    expect(await screen.findByText('Path is /work.')).toBeInTheDocument()
  })
})
