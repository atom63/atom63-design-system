import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DocExampleCode } from './doc-example-code'

describe('DocExampleCode', () => {
  it('renders through the embedded CodeBlock surface', () => {
    const { container } = render(<DocExampleCode code="const answer = 63" lang="ts" />)

    const codeBlock = container.querySelector('.code-block')
    expect(codeBlock).not.toBeNull()
    expect(codeBlock).toHaveClass('doc-example-code-panel')
    expect(codeBlock).not.toHaveAttribute('data-numbered')
    expect(container.querySelector('.mdx-code-block')).toBeNull()
  })
})
