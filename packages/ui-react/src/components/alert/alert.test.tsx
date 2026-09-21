import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Alert, AlertAction, AlertDescription, AlertIcon, AlertTitle } from './alert'

describe('Alert', () => {
  it('renders a role=alert with the default variant', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something happened.</AlertDescription>
      </Alert>
    )
    const el = screen.getByRole('alert')
    expect(el).toHaveClass('a63-Alert')
    expect(el).toHaveAttribute('data-slot', 'alert')
    expect(el).toHaveAttribute('data-variant', 'default')
  })

  it('applies a semantic variant', () => {
    render(<Alert variant="error">Boom</Alert>)
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error')
  })

  it('renders the icon, title, description, and action slots', () => {
    const { container } = render(
      <Alert>
        <AlertIcon>
          <svg aria-hidden />
        </AlertIcon>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Body</AlertDescription>
        <AlertAction>
          <button type="button">Undo</button>
        </AlertAction>
      </Alert>
    )
    expect(container.querySelector('[data-slot="alert-icon"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="alert-title"]')).toHaveTextContent('Title')
    expect(container.querySelector('[data-slot="alert-description"]')).toHaveTextContent('Body')
    expect(container.querySelector('[data-slot="alert-action"]')).toContainElement(
      screen.getByRole('button', { name: 'Undo' })
    )
  })
})
