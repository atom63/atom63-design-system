import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { ExampleContainer } from './example-container'

describe('ExampleContainer', () => {
  it('renders its title, description, example and spec', () => {
    render(
      <ExampleContainer description="Primary action" spec={<p>Spec table</p>} title="Button">
        <button type="button">Save</button>
      </ExampleContainer>
    )

    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('Primary action')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByText('Spec table')).toBeInTheDocument()
  })

  it('renders no header without a title or description', () => {
    const { container } = render(
      <ExampleContainer>
        <span>Example</span>
      </ExampleContainer>
    )

    expect(container.querySelector('header')).toBeNull()
  })

  it('breaks out to a wide figure when asked, and stays in the column otherwise', () => {
    const { container, rerender } = render(
      <ExampleContainer>
        <span>Example</span>
      </ExampleContainer>
    )
    const root = () => container.firstElementChild as HTMLElement
    expect(root().tagName).toBe('DIV')
    expect(root()).toHaveAttribute('data-mdx-width', 'column')

    rerender(
      <ExampleContainer wide>
        <span>Example</span>
      </ExampleContainer>
    )
    expect(root().tagName).toBe('FIGURE')
    expect(root()).toHaveAttribute('data-mdx-width', 'wide')
  })

  it('drops its outer margin when embedded', () => {
    const { container } = render(
      <ExampleContainer embedded>
        <span>Example</span>
      </ExampleContainer>
    )

    expect(container.firstElementChild).toHaveClass('my-0')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ExampleContainer description="Primary action" title="Button">
        <button type="button">Save</button>
      </ExampleContainer>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
