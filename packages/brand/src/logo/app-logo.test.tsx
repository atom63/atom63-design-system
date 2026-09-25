import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { Atom63Logo } from '../atom63-logo'
import { AppLogo } from './app-logo'

describe('AppLogo', () => {
  it.each(['symbol', 'wordmark'] as const)('names the %s once', variant => {
    render(<AppLogo variant={variant} />)
    expect(screen.getByRole('img', { name: 'ATOM63' })).toBeInTheDocument()
  })

  it.each(['horizontal', 'vertical'] as const)(
    'names the %s lockup once and hides its parts',
    variant => {
      const { container } = render(<AppLogo variant={variant} />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(screen.getByRole('img', { name: 'ATOM63' })).toBeInTheDocument()
      for (const svg of container.querySelectorAll('svg')) {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      }
    }
  )

  it('scales the symbol and wordmark from height', () => {
    const { container } = render(<AppLogo height={40} variant="horizontal" />)
    const [symbol, wordmark] = container.querySelectorAll('svg')
    expect(symbol).toHaveAttribute('height', '40')
    expect(wordmark).toHaveAttribute('height', '20')
    expect(wordmark).toHaveAttribute('width', '140')
  })

  it('paints the symbol with the primary action token when colored', () => {
    const { container } = render(<AppLogo colored variant="horizontal" />)
    const [symbol, wordmark] = container.querySelectorAll('svg')
    expect(symbol).toHaveStyle({ color: 'var(--a63-action-primary)' })
    expect(wordmark).not.toHaveAttribute('style')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <AppLogo variant="horizontal" />
        <AppLogo variant="symbol" />
        <Atom63Logo />
      </div>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Atom63Logo', () => {
  it('keeps its aspect ratio and takes a custom name', () => {
    render(<Atom63Logo height={48} title="Home" />)
    const logo = screen.getByRole('img', { name: 'Home' })
    expect(logo).toHaveAttribute('width', '40')
  })
})
