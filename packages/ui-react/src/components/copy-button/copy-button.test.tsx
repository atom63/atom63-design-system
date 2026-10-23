import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'

import { CopyButton, CopyButtonFeedback } from './copy-button'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('CopyButton', () => {
  it('renders a DS button with the copy-button class + default icon-only shape', () => {
    const { getByRole } = render(<CopyButton value="hello" />)
    const button = getByRole('button')
    expect(button).toHaveClass('a63-Button', 'a63-CopyButton', 'a63-CopyButton--icon-only')
    expect(button).toHaveAttribute('aria-label', 'Copy')
    expect(button).toHaveAttribute('data-size', 'icon-sm')
    expect(button).toHaveAttribute('title', 'Copy')
  })

  it('uses the given label, not the value, in the title and drops the icon-only shape with children', () => {
    const { getByRole } = render(
      <CopyButton label="Token" value="abc-123">
        Copy token
      </CopyButton>
    )
    const button = getByRole('button')
    expect(button).toHaveAttribute('title', 'Token')
    expect(button).toHaveAttribute('data-size', 'sm')
    expect(button).not.toHaveClass('a63-CopyButton--icon-only')
  })

  it('forwards other button props and calls onClick before copying', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    const onClick = vi.fn()
    const { getByRole } = render(
      <CopyButton data-testid="copy" id="copy-id" onClick={onClick} value="secret" />
    )
    const button = getByRole('button')
    expect(button).toHaveAttribute('data-testid', 'copy')
    expect(button).toHaveAttribute('id', 'copy-id')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('secret'))
  })

  it('clears its reset timer on unmount', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const clear = vi.spyOn(globalThis, 'clearTimeout')
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    const { getByRole, unmount } = render(<CopyButton value="hello" />)
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(getByRole('button')).toHaveAttribute('data-copied'))
    clear.mockClear()
    unmount()
    expect(clear).toHaveBeenCalled()
    clear.mockRestore()
    vi.useRealTimers()
  })

  it('renders the copy icon swap wrapper', () => {
    const { container } = render(<CopyButton value="hello" />)
    expect(container.querySelector('[data-slot="copy-button-swap"]')).not.toBeNull()
    expect(container.querySelectorAll('[data-slot="copy-button-item"]')).toHaveLength(2)
  })

  it('accepts custom copied feedback text', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    const { getByRole } = render(
      <CopyButton
        copiedLabel="Story source copied"
        successMessage="Story source copied"
        value="hello"
      />
    )
    const button = getByRole('button')
    fireEvent.click(button)
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Story source copied')
    })
    expect(toast.success).toHaveBeenCalledWith('Story source copied')
  })

  it('preserves an explicit paired size', () => {
    const { getByRole } = render(
      <CopyButton size="lg" value="hello">
        Copy
      </CopyButton>
    )
    expect(getByRole('button')).toHaveAttribute('data-size', 'lg')
  })

  it('shares controlled copied feedback with custom copy flows', () => {
    const { container, rerender } = render(
      <CopyButtonFeedback copied={false}>Copy Page</CopyButtonFeedback>
    )

    const items = container.querySelectorAll('[data-slot="copy-button-item"]')
    expect(items[0]).not.toHaveAttribute('aria-hidden')
    expect(items[1]).toHaveAttribute('aria-hidden', 'true')
    rerender(<CopyButtonFeedback copied>Copy Page</CopyButtonFeedback>)
    expect(items[0]).toHaveAttribute('aria-hidden', 'true')
    expect(items[1]).not.toHaveAttribute('aria-hidden')
    expect(container.querySelector('.a63-CopyButton-check')).not.toBeNull()
    expect(container.querySelector('.a63-CopyButton-check')).toHaveAttribute('data-animate', 'true')
  })
})
