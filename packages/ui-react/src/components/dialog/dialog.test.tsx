import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from './dialog'

function Example() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger>Open</DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        <DialogPanel>Body</DialogPanel>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('renders the trigger with its slot', () => {
    render(<Example />)
    const trigger = screen.getByText('Open')
    expect(trigger).toHaveClass('a63-Dialog-trigger')
    expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger')
  })

  it('renders the open popup + its parts', () => {
    render(<Example />)
    const popup = document.querySelector('[data-slot="dialog-popup"]')
    expect(popup).not.toBeNull()
    expect(popup).toHaveClass('a63-Dialog-popup')
    expect(popup).toHaveAttribute('data-size', 'default')
    expect(popup).toHaveAttribute('data-mobile-placement', 'bottom')
    expect(document.querySelector('[data-slot="dialog-backdrop"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="dialog-header"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="dialog-title"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="dialog-description"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="dialog-panel"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="dialog-footer"]')).not.toBeNull()
  })

  it('renders a default close button', () => {
    render(<Example />)
    expect(document.querySelector('[data-slot="dialog-close-button"]')).not.toBeNull()
  })

  it('reflects the footer variant', () => {
    render(<Example />)
    const footer = document.querySelector('[data-slot="dialog-footer"]')
    expect(footer).toHaveAttribute('data-variant', 'default')
  })

  it('marks a modal dialog with aria-modal', async () => {
    render(<Example />)
    expect(await screen.findByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('marks a focus-trapping dialog with aria-modal', async () => {
    render(
      <Dialog defaultOpen modal="trap-focus">
        <DialogPopup>
          <DialogTitle>Title</DialogTitle>
        </DialogPopup>
      </Dialog>
    )
    expect(await screen.findByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('leaves aria-modal off a non-modal dialog', async () => {
    render(
      <Dialog defaultOpen modal={false}>
        <DialogPopup>
          <DialogTitle>Title</DialogTitle>
        </DialogPopup>
      </Dialog>
    )
    expect(await screen.findByRole('dialog')).not.toHaveAttribute('aria-modal')
  })
})
