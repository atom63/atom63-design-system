// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Page } from './page'

describe('Page', () => {
  it('renders the main landmark by default', () => {
    render(
      <Page className="custom" id="content">
        Content
      </Page>
    )

    const page = screen.getByRole('main')
    expect(page.tagName).toBe('MAIN')
    expect(page).toHaveAttribute('data-slot', 'page')
    expect(page).toHaveAttribute('id', 'content')
    expect(page).toHaveClass(
      'min-h-full',
      'pt-8',
      'pb-[calc(--spacing(20)+var(--a63-safe-area-bottom))]',
      'px-[max(var(--a63-safe-area-left),var(--a63-safe-area-right))]',
      'custom'
    )
    expect(page).toHaveTextContent('Content')
  })

  it('renders the given element instead of main when render is set', () => {
    const { container } = render(
      <main>
        <Page noPadding render={<div />}>
          Content
        </Page>
      </main>
    )

    const page = container.querySelector('[data-slot="page"]')
    expect(page?.tagName).toBe('DIV')
    expect(page).toHaveClass('min-h-full')
    expect(page).not.toHaveClass('pt-8')
    expect(page?.className).not.toContain('safe-area')
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })
})
