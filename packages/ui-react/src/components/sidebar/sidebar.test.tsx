import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarProvider,
  useSidebar,
} from './sidebar'

function OpenState() {
  return <output data-testid="open">{String(useSidebar().open)}</output>
}

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

  it('toggles on Cmd/Ctrl+B but leaves the key to text fields and editors', () => {
    const { getByTestId, getByRole } = render(
      <SidebarProvider>
        <OpenState />
        <textarea aria-label="Notes" />
        <div aria-label="Editor" contentEditable role="textbox" suppressContentEditableWarning>
          <span>text</span>
        </div>
      </SidebarProvider>
    )

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true })
    expect(getByTestId('open')).toHaveTextContent('false')

    const inTextarea = fireEvent.keyDown(getByRole('textbox', { name: 'Notes' }), {
      key: 'b',
      metaKey: true,
    })
    const inEditor = fireEvent.keyDown(getByRole('textbox', { name: 'Editor' }).firstChild!, {
      key: 'b',
      ctrlKey: true,
    })
    expect(inTextarea).toBe(true)
    expect(inEditor).toBe(true)
    expect(getByTestId('open')).toHaveTextContent('false')
  })

  it('turns the shortcut off with keyboardShortcut={false}', () => {
    const { getByTestId } = render(
      <SidebarProvider keyboardShortcut={false}>
        <OpenState />
      </SidebarProvider>
    )

    const notCancelled = fireEvent.keyDown(window, { key: 'b', ctrlKey: true })
    expect(notCancelled).toBe(true)
    expect(getByTestId('open')).toHaveTextContent('true')
  })

  it('does not write the cookie when the open state is controlled', () => {
    document.cookie = 'sidebar_state=; path=/; max-age=0'
    const onOpenChange = vi.fn()
    render(
      <SidebarProvider open onOpenChange={onOpenChange}>
        <OpenState />
      </SidebarProvider>
    )

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(document.cookie).not.toContain('sidebar_state')
  })

  describe('render', () => {
    it('hands the children to a childless render element, as Base UI does', () => {
      /* eslint-disable jsx-a11y/anchor-has-content, jsx-a11y/heading-has-content --
         the empty render elements are the point: the parts fill them with their children. */
      const { getByRole, getByText } = render(
        <SidebarProvider>
          <SidebarMenuButton render={<a href="/inbox" />}>Inbox</SidebarMenuButton>
          <SidebarMenuSubButton render={<a href="/sub" />}>Sub page</SidebarMenuSubButton>
          <SidebarGroupLabel render={<h2 />}>Workspace</SidebarGroupLabel>
        </SidebarProvider>
      )
      /* eslint-enable jsx-a11y/anchor-has-content, jsx-a11y/heading-has-content */
      expect(getByRole('link', { name: 'Inbox' })).toHaveAttribute('href', '/inbox')
      expect(getByRole('link', { name: 'Sub page' })).toHaveAttribute('href', '/sub')
      expect(getByText('Workspace').tagName.toLowerCase()).toBe('h2')
    })

    it('keeps the content of a render element that brings its own', () => {
      const { getByRole } = render(
        <SidebarProvider>
          <SidebarMenuButton render={<a href="/home">Home</a>} />
        </SidebarProvider>
      )
      expect(getByRole('link', { name: 'Home' })).toHaveAttribute(
        'data-slot',
        'sidebar-menu-button'
      )
    })

    it('still renders the child element with asChild', () => {
      const { getByRole } = render(
        <SidebarProvider>
          <SidebarMenuButton asChild>
            <a href="/docs">Docs</a>
          </SidebarMenuButton>
        </SidebarProvider>
      )
      expect(getByRole('link', { name: 'Docs' })).toHaveAttribute(
        'data-slot',
        'sidebar-menu-button'
      )
    })
  })
})
