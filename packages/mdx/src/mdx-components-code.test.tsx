import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mdxComponents } from './mdx-components'

describe('MDX code block spacing', () => {
  it('lets CodeBlock own highlighted pre padding', () => {
    const Pre = mdxComponents.pre
    const { container } = render(
      <Pre data-theme="github-dark">
        <code className="language-ts">const answer = 63</code>
      </Pre>
    )

    const pre = container.querySelector('.mdx-code-block pre')
    expect(pre).toHaveClass('code-block-pre', '!p-0')
    expect(pre).not.toHaveClass('mdx-pre', 'p-4')
  })
})
