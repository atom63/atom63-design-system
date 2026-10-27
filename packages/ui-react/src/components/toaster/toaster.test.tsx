import { act, render, screen } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it } from 'vitest'

import { Toaster } from './toaster'

describe('Toaster', () => {
  it('mounts the themed toast host in the document portal', async () => {
    render(<Toaster position="bottom-right" />)

    const host = await screen.findByLabelText(/Notifications/)
    expect(host.tagName).toBe('SECTION')
    expect(document.body).toContainElement(host)
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
})
