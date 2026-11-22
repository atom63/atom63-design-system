import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './navigation-menu'

function Example() {
  return (
    <NavigationMenu value="products">
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#a">Analytics</NavigationMenuLink>
            <NavigationMenuLink href="#b">Automation</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function Interactive({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink active href="#a">
              Analytics
            </NavigationMenuLink>
            <NavigationMenuLink
              href="#b"
              onClick={event => {
                event.preventDefault()
                onNavigate?.()
              }}
            >
              Automation
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="company">
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#c">About</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const trigger = (name: string) => screen.getByRole('button', { name })

describe('NavigationMenu', () => {
  it('renders the root, list, item and trigger with their slots', () => {
    const { container } = render(<Example />)
    expect(container.querySelector('[data-slot="navigation-menu"]')).toHaveClass(
      'a63-NavigationMenu'
    )
    expect(container.querySelector('[data-slot="navigation-menu-list"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="navigation-menu-item"]')).not.toBeNull()
    const trigger = screen.getByText('Products')
    expect(trigger.closest('[data-slot="navigation-menu-trigger"]')).toHaveClass(
      'a63-NavigationMenu-trigger'
    )
  })

  it('renders the expanded content links', () => {
    render(<Example />)
    expect(screen.getByText('Analytics')).toHaveClass('a63-NavigationMenu-link')
    expect(document.querySelector('[data-slot="navigation-menu-content"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="navigation-menu-portal"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="navigation-menu-viewport"]')).toHaveClass(
      'a63-NavigationMenu-viewport'
    )
  })

  it('exposes the trigger style helper', () => {
    expect(navigationMenuTriggerStyle()).toBe('a63-NavigationMenu-trigger')
  })

  it('opens and closes the panel when the trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    expect(trigger('Products')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Analytics')).toBeNull()

    await user.click(trigger('Products'))
    expect(trigger('Products')).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByText('Analytics')).toBeVisible()

    await user.click(trigger('Products'))
    await waitFor(() => expect(screen.queryByText('Analytics')).toBeNull())
    expect(trigger('Products')).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the panel on hover', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.hover(trigger('Company'))
    expect(await screen.findByText('About')).toBeVisible()
    expect(trigger('Company')).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.click(trigger('Products'))
    await screen.findByText('Analytics')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Analytics')).toBeNull()
      expect(trigger('Products')).toHaveFocus()
    })
    expect(trigger('Products')).toHaveAttribute('aria-expanded', 'false')
  })

  it('moves focus between triggers with ArrowRight and ArrowLeft', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.tab()
    expect(trigger('Products')).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(trigger('Company')).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(trigger('Products')).toHaveFocus()
  })

  it('opens from the keyboard, moves focus into the panel and tabs through its links', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.tab()
    await user.keyboard('{Enter}')
    expect(trigger('Products')).toHaveAttribute('aria-expanded', 'true')
    const first = await screen.findByRole('link', { name: 'Analytics' })
    await waitFor(() => expect(first).toHaveFocus())
    await user.tab()
    expect(screen.getByRole('link', { name: 'Automation' })).toHaveFocus()
  })

  it('marks the active link with aria-current and activates links', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<Interactive onNavigate={onNavigate} />)
    await user.click(trigger('Products'))
    const active = await screen.findByRole('link', { name: 'Analytics' })
    expect(active).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Automation' })).not.toHaveAttribute('aria-current')

    await user.click(screen.getByRole('link', { name: 'Automation' }))
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })
})
