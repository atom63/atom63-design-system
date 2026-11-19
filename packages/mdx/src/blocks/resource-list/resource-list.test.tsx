import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { ResourceList } from './resource-list'

const items = [
  { name: 'Base UI', note: 'Headless primitives', url: 'https://www.base-ui.com/react' },
  { name: 'MDN', url: 'https://developer.mozilla.org/' },
]

describe('ResourceList', () => {
  it('renders nothing for an empty list', () => {
    const { container } = render(<ResourceList items={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('links each item in a new tab, with the note and the bare domain', () => {
    render(<ResourceList items={items} />)

    expect(screen.getByRole('complementary', { name: 'External resources' })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Base UI/ })
    expect(link).toHaveAttribute('href', 'https://www.base-ui.com/react')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('Headless primitives · base-ui.com')).toBeInTheDocument()
    expect(screen.getByText('developer.mozilla.org')).toBeInTheDocument()
  })

  it('hides a favicon that fails to load', () => {
    const { container } = render(<ResourceList items={[items[1] as (typeof items)[number]]} />)

    const favicon = container.querySelector('img') as HTMLImageElement
    expect(favicon).toHaveAttribute('alt', '')
    fireEvent.error(favicon)
    expect(favicon.style.display).toBe('none')
  })

  it('falls back to a placeholder and the raw text when the url does not parse', () => {
    const { container } = render(<ResourceList items={[{ name: 'Local', url: 'not a url' }]} />)

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.mdx-resource-favicon-fallback')).not.toBeNull()
    expect(screen.getByText('not a url')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<ResourceList items={items} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
