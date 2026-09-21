import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Toaster } from './toaster'

describe('Toaster', () => {
  it('mounts the themed toast host in the document portal', async () => {
    render(<Toaster position="bottom-right" />)

    const host = await screen.findByLabelText(/Notifications/)
    expect(host.tagName).toBe('SECTION')
    expect(document.body).toContainElement(host)
  })
})
