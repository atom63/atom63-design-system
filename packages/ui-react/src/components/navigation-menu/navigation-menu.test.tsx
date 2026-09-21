import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
})
