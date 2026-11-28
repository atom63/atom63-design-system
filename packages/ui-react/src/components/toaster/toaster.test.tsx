import { act, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import { UIProvider } from '../../provider'
import { PortalContainerProvider } from '../portal-container'
import { Toaster } from './toaster'

describe('Toaster', () => {
  it('mounts the themed toast host in the document portal', async () => {
    render(<Toaster position="bottom-right" />)

    const host = await screen.findByLabelText(/Notifications/)
    expect(host.tagName).toBe('SECTION')
    expect(document.body).toContainElement(host)
  })

  it('mounts inside PortalContainerProvider and uses the application font', async () => {
    const portalHost = document.createElement('div')
    document.body.append(portalHost)

    render(
      <PortalContainerProvider container={portalHost}>
        <Toaster position="bottom-right" />
      </PortalContainerProvider>
    )

    const host = await screen.findByLabelText(/Notifications/)
    expect(portalHost).toContainElement(host)
    act(() => {
      toast.info('Scoped notification', { id: 'scoped-font' })
    })
    const message = await screen.findByText('Scoped notification')
    const toaster = message.closest<HTMLElement>('[data-sonner-toaster]')
    expect(toaster?.style.fontFamily).toBe('var(--a63-font-app, var(--font-family-sans))')
    act(() => toast.dismiss('scoped-font'))
    portalHost.remove()
  })

  it('draws the inverse variant as a pill in the inverse colours', async () => {
    render(<Toaster variant="inverse" />)
    act(() => {
      toast.loading('Scheduling message…')
    })

    const message = await screen.findByText('Scheduling message…')
    const item = message.closest('li') as HTMLElement
    expect(item).toHaveClass('a63-Toast--inverse')
    expect(item.style.getPropertyValue('padding-inline')).toBe('var(--a63-space-4)')
    const list = item.closest('ol') as HTMLElement
    expect(list.style.getPropertyValue('--normal-bg')).toBe('var(--a63-action-neutral)')
    expect(list.style.getPropertyValue('--border-radius')).toBe('var(--radius-pill)')
  })

  it('stamps the contract slots on the toast, its icon and its message', async () => {
    render(<Toaster />)
    act(() => {
      toast.success('Slots stamped', { id: 'slots' })
    })

    const message = await screen.findByText('Slots stamped')
    await waitFor(() => expect(message).toHaveAttribute('data-slot', 'toast-message'))
    const item = message.closest('li') as HTMLElement
    expect(item).toHaveAttribute('data-slot', 'toast')
    expect(item.querySelector('[data-icon]')).toHaveAttribute('data-slot', 'toast-icon')
    act(() => toast.dismiss('slots'))
  })

  it('announces through a polite live region and leaves focus where it was', async () => {
    render(
      <>
        <button type="button">Keep focus</button>
        <Toaster />
      </>
    )
    const button = screen.getByRole('button', { name: 'Keep focus' })
    button.focus()

    const host = await screen.findByLabelText(/Notifications/)
    expect(host).toHaveAttribute('aria-live', 'polite')
    act(() => {
      toast.info('Saved', { id: 'focus' })
    })
    await screen.findByText('Saved')
    expect(button).toHaveFocus()
    act(() => toast.dismiss('focus'))
  })

  it('marks a dismissed toast as removed, then removes it', async () => {
    render(<Toaster />)
    act(() => {
      toast.warning('Going away', { id: 'dismissing' })
    })
    const item = (await screen.findByText('Going away')).closest('li') as HTMLElement
    await waitFor(() => expect(item).toHaveAttribute('data-mounted', 'true'))

    act(() => toast.dismiss('dismissing'))
    await waitFor(() => expect(item).toHaveAttribute('data-removed', 'true'))
    await waitFor(() => expect(screen.queryByText('Going away')).toBeNull(), { timeout: 2000 })
  })

  it('drops toast motion under prefers-reduced-motion', () => {
    render(<Toaster />)
    const sheet = [...document.querySelectorAll('style')]
      .map(style => style.textContent ?? '')
      .find(css => css.includes('[data-sonner-toaster]'))
    expect(sheet).toMatch(
      /@media \(prefers-reduced-motion\)\{[^}]*\[data-sonner-toast\][^}]*transition:none!important;animation:none!important/
    )
  })

  it('takes its direction from a right-to-left region', async () => {
    const Region = () => {
      const [node, setNode] = React.useState<HTMLDivElement | null>(null)
      return (
        <UIProvider dir="rtl">
          <div ref={setNode}>
            <PortalContainerProvider container={node}>
              <Toaster />
            </PortalContainerProvider>
          </div>
        </UIProvider>
      )
    }
    render(<Region />)
    act(() => {
      toast.info('من اليمين', { id: 'rtl' })
    })

    const list = (await screen.findByText('من اليمين')).closest('ol') as HTMLElement
    expect(list).toHaveAttribute('dir', 'rtl')
    act(() => toast.dismiss('rtl'))
  })

  it('adds the safe-area insets to the default offsets', async () => {
    render(<Toaster />)
    act(() => {
      toast.info('Offset', { id: 'offset' })
    })

    const list = (await screen.findByText('Offset')).closest('ol') as HTMLElement
    expect(list.style.getPropertyValue('--offset-bottom')).toBe(
      'calc(var(--a63-space-6) + var(--a63-safe-area-bottom, 0px))'
    )
    expect(list.style.getPropertyValue('--mobile-offset-bottom')).toBe(
      'calc(var(--a63-space-4) + var(--a63-safe-area-bottom, 0px))'
    )
    act(() => toast.dismiss('offset'))
  })

  it('renders nothing on the server and hydrates without a mismatch', async () => {
    const html = renderToString(<Toaster />)
    expect(html).toBe('')

    const root = document.createElement('div')
    root.innerHTML = html
    document.body.append(root)
    const onRecoverableError = vi.fn()
    let hydrated: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      hydrated = hydrateRoot(root, <Toaster />, { onRecoverableError })
    })
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(document.querySelector('section[aria-live="polite"]')).not.toBeNull()
    act(() => hydrated?.unmount())
    root.remove()
  })
  it('names each tone with a visually hidden status word the caller can translate', async () => {
    render(<Toaster statusLabels={{ error: 'خطأ:' }} />)
    act(() => {
      toast.error('Upload failed', { id: 'status-error' })
      toast.success('Saved', { id: 'status-success' })
    })

    const failed = (await screen.findByText('Upload failed')).closest('li') as HTMLElement
    expect(failed).toHaveAttribute('data-type', 'error')
    expect(failed.querySelector('.a63-Toast-status')).toHaveTextContent('خطأ:')
    expect(failed.querySelector('[data-icon] svg')).toHaveAttribute('aria-hidden', 'true')

    const saved = (await screen.findByText('Saved')).closest('li') as HTMLElement
    expect(saved.querySelector('.a63-Toast-status')).toHaveTextContent('Success:')

    act(() => {
      toast.dismiss('status-error')
      toast.dismiss('status-success')
    })
  })
})
