import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SidebarProvider } from '../sidebar'
import {
  SidebarNavCollapsibleItem,
  SidebarNavGroup,
  SidebarNavLinkItem,
  SidebarNavSubLinkItem,
  SidebarNavSubList,
} from './sidebar-nav-tree'

describe('SidebarNavTree', () => {
  it('renders a nav group with a link item wrapped in a menu button', () => {
    const { container, getByText, getAllByText } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Docs">
          <SidebarNavLinkItem isActive>
            <a href="/intro">Introduction</a>
          </SidebarNavLinkItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    expect(getByText('Docs')).toBeInTheDocument()
    const button = container.querySelector('[data-slot="sidebar-menu-button"]')
    expect(button).not.toBeNull()
    expect(button).toHaveClass('a63-SidebarNavTree-item')
    expect(button).toHaveAttribute('data-active', 'true')
    // Ticker-wrapped link label is present (TextTicker duplicates it for the marquee).
    expect(getAllByText('Introduction').length).toBeGreaterThan(0)
  })

  it('renders a collapsible item with an expand toggle and a sub list', () => {
    const { getByLabelText, getAllByText } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Nav">
          <SidebarNavCollapsibleItem
            label="Projects"
            link={<a href="/projects">Projects</a>}
            onOpenChange={() => {}}
            open
          >
            <SidebarNavSubList>
              <SidebarNavSubLinkItem>
                <a href="/projects/a">Alpha</a>
              </SidebarNavSubLinkItem>
            </SidebarNavSubList>
          </SidebarNavCollapsibleItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    expect(getByLabelText('Collapse Projects')).toBeInTheDocument()
    expect(getAllByText('Alpha').length).toBeGreaterThan(0)
  })

  it('turns the whole row into a single toggle when the section has no link', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { getAllByRole, getByRole } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Nav">
          <SidebarNavCollapsibleItem label="Projects" onOpenChange={onOpenChange} open={false}>
            <SidebarNavSubList>
              <SidebarNavSubLinkItem>
                <a href="/projects/a">Alpha</a>
              </SidebarNavSubLinkItem>
            </SidebarNavSubList>
          </SidebarNavCollapsibleItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    expect(getAllByRole('button')).toHaveLength(1)

    const row = getByRole('button', { name: 'Projects' })
    expect(row).toHaveAttribute('aria-expanded', 'false')

    await user.click(row)
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything())
  })
})
