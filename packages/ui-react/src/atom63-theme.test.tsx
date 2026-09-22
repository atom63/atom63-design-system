import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Atom63Theme } from './atom63-theme'

describe('Atom63Theme', () => {
  it('renders the default theme boundary', () => {
    render(<Atom63Theme data-testid="theme">Content</Atom63Theme>)

    const boundary = screen.getByTestId('theme')
    expect(boundary.tagName).toBe('DIV')
    expect(boundary).toHaveAttribute('data-a63-mode', 'light')
    expect(boundary).toHaveAttribute('data-a63-theme', 'modern')
    expect(boundary).toHaveClass('a63-Atom63Theme', 'light')
    expect(boundary).not.toHaveClass('dark')
  })

  it('keeps the mode class and attribute in sync when mode changes', () => {
    const { rerender } = render(
      <Atom63Theme className="app-shell dark" data-testid="theme" mode="light" />
    )

    const boundary = screen.getByTestId('theme')
    expect(boundary).toHaveClass('app-shell', 'light')
    expect(boundary).not.toHaveClass('dark')

    rerender(<Atom63Theme className="app-shell light" data-testid="theme" mode="dark" />)

    expect(boundary).toHaveAttribute('data-a63-mode', 'dark')
    expect(boundary).toHaveClass('app-shell', 'dark')
    expect(boundary).not.toHaveClass('light')
  })

  it('supports a custom wrapper and theme', () => {
    render(
      <Atom63Theme render={<main aria-label="Application" />} theme="terminal">
        Content
      </Atom63Theme>
    )

    const boundary = screen.getByRole('main', { name: 'Application' })
    expect(boundary).toHaveAttribute('data-a63-theme', 'terminal')
    expect(boundary).toHaveTextContent('Content')
  })

  it('renders on the server without browser APIs', () => {
    expect(renderToString(<Atom63Theme mode="dark">Content</Atom63Theme>)).toContain(
      'data-a63-mode="dark"'
    )
  })
})
