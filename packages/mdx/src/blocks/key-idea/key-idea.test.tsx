import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { KeyIdea } from './key-idea'

describe('KeyIdea', () => {
  it('renders an aside with the default label, the title and the body', () => {
    render(
      <KeyIdea title="Tokens carry intent">
        <p>Name a colour by its role, not its value.</p>
      </KeyIdea>
    )

    const aside = screen.getByRole('complementary')
    expect(aside).toHaveTextContent('Key idea')
    expect(aside).toHaveTextContent('Tokens carry intent')
    expect(aside).toHaveTextContent('Name a colour by its role, not its value.')
  })

  it('takes a custom label and omits the title when none is given', () => {
    const { container } = render(
      <KeyIdea label="Takeaway">
        <p>Body only.</p>
      </KeyIdea>
    )

    expect(screen.getByText('Takeaway')).toBeInTheDocument()
    expect(screen.queryByText('Key idea')).not.toBeInTheDocument()
    expect(container.querySelector('.mdx-insight-title')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <KeyIdea title="Tokens carry intent">
        <p>Name a colour by its role, not its value.</p>
      </KeyIdea>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
