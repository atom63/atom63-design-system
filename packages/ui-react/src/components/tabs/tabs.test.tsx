import { tabsContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Tabs, TabsList, TabsPanel, TabsTab } from './tabs'

function Example(props: { onValueChange?: (v: string) => void }) {
  return (
    <Tabs defaultValue="one" onValueChange={props.onValueChange}>
      <TabsList>
        <TabsTab value="one">One</TabsTab>
        <TabsTab value="two">Two</TabsTab>
      </TabsList>
      <TabsPanel value="one">Panel one</TabsPanel>
      <TabsPanel value="two">Panel two</TabsPanel>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('renders the list, tabs and indicator with contract defaults', () => {
    const { container } = render(<Example />)
    const list = container.querySelector('.a63-Tabs-list')
    expect(list).not.toBeNull()
    expect(list).toHaveAttribute('data-slot', 'tabs-list')
    expect(list).toHaveAttribute('data-variant', tabsContract.defaultVariant)
    expect(list).toHaveAttribute('data-size', tabsContract.defaultSize)
    expect(container.querySelectorAll('.a63-Tabs-tab')).toHaveLength(2)
    expect(container.querySelector('[data-slot="tab-indicator"]')).not.toBeNull()
  })

  it('omits the indicator for the attached variant', () => {
    const { container } = render(
      <Tabs defaultValue="one">
        <TabsList variant="attached">
          <TabsTab value="one">One</TabsTab>
        </TabsList>
      </Tabs>
    )
    expect(container.querySelector('[data-slot="tab-indicator"]')).toBeNull()
  })

  it('selects a tab on click and fires onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Example onValueChange={onValueChange} />)
    await user.click(screen.getByRole('tab', { name: 'Two' }))
    expect(onValueChange).toHaveBeenCalledWith('two', expect.anything())
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
  })

  it('applies the given size to list and tab', () => {
    const { container } = render(
      <Tabs defaultValue="one">
        <TabsList size="lg">
          <TabsTab value="one">One</TabsTab>
        </TabsList>
      </Tabs>
    )
    expect(container.querySelector('.a63-Tabs-list')).toHaveAttribute('data-size', 'lg')
    expect(container.querySelector('.a63-Tabs-tab')).toHaveAttribute('data-size', 'lg')
  })
})
