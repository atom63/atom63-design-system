import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CodeBlock } from './code-block'

describe('CodeBlock i18n', () => {
  it('declares standalone code blocks as wide MDX content', () => {
    const { container } = render(<CodeBlock code="const a = 1" lang="ts" />)
    expect(container.querySelector('.mdx-code-block')).toHaveAttribute('data-mdx-width', 'wide')
    expect(container.querySelector('.mdx-code-block')).toHaveAttribute(
      'data-frame-border',
      'strong'
    )
  })

  it('uses the default English copy label on the copy control', () => {
    const { container } = render(<CodeBlock code="const a = 1" lang="ts" />)
    const button = container.querySelector('button[title^="Copy code"]')
    expect(button).not.toBeNull()
  })

  it('honors a custom copyLabel', () => {
    const { container } = render(
      <CodeBlock code="const a = 1" copyLabel="Copier le code" lang="ts" />
    )
    expect(container.querySelector('button[title^="Copier le code"]')).not.toBeNull()
    expect(container.querySelector('button[title^="Copy code"]')).toBeNull()
  })

  it('can omit its copy control when a parent surface owns copying', () => {
    const { container } = render(<CodeBlock code="const a = 1" lang="ts" showCopyButton={false} />)
    expect(container.querySelector('button[title^="Copy code"]')).toBeNull()
  })

  it('accepts a custom loadingLabel without breaking rendering', () => {
    const { container } = render(
      <CodeBlock code="const a = 1" lang="ts" loadingLabel="Chargement" />
    )
    // loadingLabel is only shown while highlighting; assert the prop is accepted.
    expect(container.querySelector('button[title^="Copy code"]')).not.toBeNull()
  })

  it('uses the default code language fallback label', () => {
    render(<CodeBlock code="plain" lang="" />)
    expect(screen.getByText('code')).toBeInTheDocument()
  })

  it('honors a custom fallbackLangLabel', () => {
    render(<CodeBlock code="plain" fallbackLangLabel="snippet" lang="" />)
    expect(screen.getByText('snippet')).toBeInTheDocument()
  })
})
