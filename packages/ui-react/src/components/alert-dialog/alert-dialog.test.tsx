import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

function Example() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogPopup variant="destructive">
        <AlertDialogHeader>
          <AlertDialogMedia>!</AlertDialogMedia>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  )
}

describe('AlertDialog', () => {
  it('renders the trigger with its slot', () => {
    render(<Example />)
    const trigger = screen.getByText('Delete', { selector: '[data-slot="alert-dialog-trigger"]' })
    expect(trigger).toHaveClass('a63-AlertDialog-trigger')
  })

  it('renders the open popup + its parts', () => {
    render(<Example />)
    const popup = document.querySelector('[data-slot="alert-dialog-popup"]')
    expect(popup).not.toBeNull()
    expect(popup).toHaveClass('a63-AlertDialog-popup')
    expect(popup).toHaveAttribute('data-variant', 'destructive')
    expect(document.querySelector('[data-slot="alert-dialog-backdrop"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="alert-dialog-media"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="alert-dialog-title"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="alert-dialog-description"]')).not.toBeNull()
  })

  it('renders action + cancel as Buttons', () => {
    render(<Example />)
    const action = document.querySelector('[data-trigger-slot="alert-dialog-action"]')
    const cancel = document.querySelector('[data-trigger-slot="alert-dialog-cancel"]')
    expect(action).not.toBeNull()
    expect(action).toHaveClass('a63-Button')
    expect(cancel).not.toBeNull()
    expect(cancel).toHaveClass('a63-Button')
  })
})
