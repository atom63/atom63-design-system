import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { InformDialog } from './inform-dialog'

describe('InformDialog', () => {
  it('renders nothing when closed', () => {
    render(<InformDialog body="Body" open={false} title="Heads up" />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a modal dialog with its title and body when open', async () => {
    render(<InformDialog body="Something changed." open title="Heads up" />)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Heads up')
    expect(dialog).toHaveTextContent('Something changed.')
  })

  it('moves focus into the dialog when it opens', async () => {
    render(<InformDialog body="Body" open title="Heads up" />)

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true)
    })
  })

  it('puts the icon beside the text block, not inside the title', async () => {
    render(<InformDialog body="Body" open title="Heads up" />)

    const dialog = await screen.findByRole('dialog')
    const slot = dialog.querySelector('[data-slot="inform-icon"]')

    expect(slot).not.toBeNull()
    // Inside the header, so it shares the dialog's padding rather than sitting
    // outside it.
    expect(slot?.closest('[data-slot="dialog-header"]')).not.toBeNull()
  })

  it('dismisses on Escape', async () => {
    const onDismiss = vi.fn()
    render(<InformDialog body="Body" onDismiss={onDismiss} open title="Heads up" />)

    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  it('renders no close button when dismissal is disabled', async () => {
    render(<InformDialog body="Body" dismissable={false} open title="Heads up" />)

    await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('invokes an action', async () => {
    const onSelect = vi.fn()
    render(
      <InformDialog
        actions={[{ id: 'ok', label: 'Got it', onSelect, variant: 'primary' }]}
        body="Body"
        open
        title="Heads up"
      />
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Got it' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations', async () => {
    render(
      <InformDialog
        actions={[{ id: 'ok', label: 'Got it', onSelect: () => undefined, variant: 'primary' }]}
        body="Something changed."
        open
        severity="warning"
        title="Heads up"
      />
    )

    await screen.findByRole('dialog')
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
