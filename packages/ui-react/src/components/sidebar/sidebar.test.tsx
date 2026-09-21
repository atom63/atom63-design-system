import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from './sidebar'

describe('Sidebar', () => {
  it('renders the sidebar shell + a menu button with their slots', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Home</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )

    const sidebar = container.querySelector('[data-slot="sidebar"]')
    expect(sidebar).not.toBeNull()

    const button = container.querySelector('[data-slot="sidebar-menu-button"]')
    expect(button).not.toBeNull()
    expect(button).toHaveClass('a63-Sidebar-menu-button')
    expect(button).toHaveTextContent('Home')
    expect(button).toHaveAttribute('data-size', 'default')
    expect(button).toHaveAttribute('data-active', 'false')
  })

  it('reflects the active + size + variant data attributes on a menu button', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive size="lg" variant="outline">
                Active
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    const button = container.querySelector('[data-slot="sidebar-menu-button"]')
    expect(button).toHaveAttribute('data-active', 'true')
    expect(button).toHaveAttribute('data-size', 'lg')
    expect(button).toHaveAttribute('data-variant', 'outline')
  })

  it('renders a non-collapsible sidebar when collapsible="none"', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>content</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )

    const sidebar = container.querySelector('[data-slot="sidebar"]')
    expect(sidebar).toHaveClass('a63-Sidebar--static')
    expect(sidebar).toHaveAttribute('data-collapsible', 'none')
    expect(sidebar).toHaveAttribute('data-state', 'expanded')
    expect(sidebar).toHaveAttribute('data-variant', 'sidebar')
  })

  it('throws when useSidebar is used outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      )
    ).toThrow('useSidebar must be used within a SidebarProvider.')
    spy.mockRestore()
  })
})
