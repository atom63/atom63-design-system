import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tabs } from './tabs'

describe('Tabs', () => {
  it('renders tabs with role="tab" (inherited from @atom63/ui-react)', () => {
    render(
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Tab value="one">One</Tabs.Tab>
          <Tabs.Tab value="two">Two</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="one">Panel one</Tabs.Panel>
        <Tabs.Panel value="two">Panel two</Tabs.Panel>
      </Tabs>
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)
    expect(screen.getByText('Panel one')).toBeInTheDocument()
  })

  it('switches panels when a different tab is clicked', () => {
    render(
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Tab value="one">One</Tabs.Tab>
          <Tabs.Tab value="two">Two</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="one">Panel one</Tabs.Panel>
        <Tabs.Panel value="two">Panel two</Tabs.Panel>
      </Tabs>
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Two' }))
    expect(screen.getByText('Panel two')).toBeInTheDocument()
  })

  it('applies not-mdx mdx-block block-spacing wrapper class', () => {
    const { container } = render(
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Tab value="one">One</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="one">Panel one</Tabs.Panel>
      </Tabs>
    )
    const root = container.querySelector('.mdx-block')
    expect(root).not.toBeNull()
    expect(root).toHaveClass('not-mdx')
  })
})
