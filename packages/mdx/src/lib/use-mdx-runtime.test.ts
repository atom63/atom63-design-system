// packages/mdx/src/lib/use-mdx-runtime.test.ts
import { render } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { compileMdx } from './use-mdx-runtime'

describe('compileMdx', () => {
  it('compiles valid MDX to a renderable component', async () => {
    const Component = await compileMdx('# Hello\n\nWorld')
    const { container } = render(createElement(Component))
    expect(container.querySelector('h1')?.textContent).toBe('Hello')
    expect(container.textContent).toContain('World')
  })

  it('passes provided components through', async () => {
    const Component = await compileMdx('<Badge>hi</Badge>')
    const Badge = ({ children }: { children?: unknown }) =>
      createElement('span', { 'data-testid': 'badge' }, children as string)
    const { getByTestId } = render(createElement(Component, { components: { Badge } }))
    expect(getByTestId('badge').textContent).toBe('hi')
  })

  it('rejects on invalid MDX', async () => {
    await expect(compileMdx('<Unclosed>')).rejects.toBeInstanceOf(Error)
  })
})
