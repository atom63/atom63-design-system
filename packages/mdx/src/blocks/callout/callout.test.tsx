import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Callout } from './callout'

describe('Callout', () => {
  it('renders bare children unchanged (back-compat)', () => {
    render(<Callout>just text</Callout>)
    const box = screen.getByText('just text')
    expect(box.className).toContain('callout')
  })

  it('renders named slots with slot markers', () => {
    render(
      <Callout type="warning">
        <Callout.Title>Heads up</Callout.Title>
        <Callout.Body>the details</Callout.Body>
        <Callout.Actions>
          <button type="button">Dismiss</button>
        </Callout.Actions>
      </Callout>
    )
    expect(screen.getByText('Heads up').closest('[data-slot="title"]')).not.toBeNull()
    expect(screen.getByText('the details').closest('[data-slot="body"]')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('marks its tone for the recipe, defaulting to info', () => {
    render(
      <>
        <Callout>plain</Callout>
        <Callout type="error">broken</Callout>
      </>
    )
    expect(screen.getByText('plain')).toHaveAttribute('data-tone', 'info')
    expect(screen.getByText('broken')).toHaveAttribute('data-tone', 'error')
  })
})
